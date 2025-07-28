<template>
  <div class="withdrawal-crypto">
    <!-- 返回按钮 -->
    <a-button
      v-if="currentStep !== 1"
      type="text"
      class="back-button"
      @click="goBack"
    >
      <a-icon type="left" />
      Back
    </a-button>

    <!-- 第一步：选择和输入 -->
    <div v-if="currentStep === 1" class="withdrawal-form">
      <div class="form-content">
        <div class="left-section">
          <!-- 选择币种 -->
          <div class="step-item">
            <div class="step-header">
              <div class="step-icon">
                <img src="@/assets/icons/withdrawal-icon.png" style="width:100%">
              </div>
              <div class="step-content">
                <h3 class="step-title">Select Coin</h3>
                <p class="step-description">Choose the coin you want to withdraw from your available balances</p>
              </div>
            </div>

            <div class="step-body">
              <!-- 币种选择器 -->
              <div class="coin-selector">
                <!-- 下拉选择触发器 -->
                <div class="coin-dropdown-trigger" @click="toggleCoinDropdown">
                  <div v-if="cryptoAccountsLoading" class="loading-selected-coin">
                    <a-spin size="small" />
                    <span style="margin-left: 8px;">Loading coins...</span>
                  </div>
                  <div v-else class="selected-coin">
                    <div class="coin-info">
                      <div class="coin-icon">
                        <img style="width:100%" :src="getCoinIconSrc(selectedCoin.symbol, selectedCoin.id)" />
                      </div>
                      <div class="coin-details">
                        <div class="coin-name">{{ selectedCoin.symbol }}</div>
                        <div class="coin-network">{{ selectedCoin.network }}</div>
                      </div>
                    </div>
                    <div class="coin-balance">
                      <div class="balance-amount">{{ formatBalance(selectedCoin.balance) }} <span class="currency">{{ selectedCoin.symbol }}</span></div>
                      <div class="balance-usd">≈ ${{ formatBalance(selectedCoin.balanceUsd) }} <span class="currency">USD</span></div>
                    </div>
                  </div>
                  <div class="dropdown-arrow" v-if="!cryptoAccountsLoading">
                    <a-icon :type="coinDropdownVisible ? 'up' : 'down'" />
                  </div>
                </div>

                <!-- 下拉选项列表 -->
                <div v-if="coinDropdownVisible" class="coin-dropdown-menu">
                  <div v-if="cryptoAccountsLoading" class="loading-option">
                    <a-spin size="small" />
                    <span style="margin-left: 8px;">Loading coins...</span>
                  </div>
                  <div
                    v-for="coin in availableCoins"
                    :key="coin.symbol"
                    class="coin-option"
                    :class="{ active: selectedCoin.symbol === coin.symbol }"
                    @click="selectCoin(coin)"
                  >
                    <div class="coin-info">
                      <div class="coin-icon">
                        <img style="width:100%" :src="getCoinIconSrc(coin.symbol, coin.id)" />
                      </div>
                      <div class="coin-details">
                        <div class="coin-name">{{ coin.symbol }}</div>
                        <div class="coin-network">{{ coin.network }}</div>
                      </div>
                    </div>
                    <div class="coin-balance">
                      <div class="balance-amount">{{ formatBalance(coin.balance) }} <span class="currency">{{ coin.symbol }}</span></div>
                      <div class="balance-usd">≈ ${{ formatBalance(coin.balanceUsd) }} <span class="currency">USD</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入提现金额 -->
          <div class="step-item">
            <div class="step-header">
              <div class="step-icon">
                <img src="@/assets/icons/withdrawal-icon-2.png" style="width:100%">
              </div>
              <div class="step-content">
                <h3 class="step-title">Enter Withdrawal Amount</h3>
              </div>
            </div>

            <div class="step-body">
              <div class="amount-input">
                <a-input
                  v-model="withdrawalAmount"
                  size="large"
                  placeholder="1,000"
                  @input="calculateAmount"
                />
                <a-button type="link" @click="setMaxAmount" class="max-btn">MAX</a-button>
              </div>

              <div class="quick-select">
                <span class="quick-label">Quick Select</span>
                <div class="percentage-buttons">
                  <a-button
                    v-for="percent in [25, 50, 75, 100]"
                    :key="percent"
                    @click="setPercentage(percent)"
                    :class="{ active: selectedPercentage === percent }"
                  >
                    {{ percent }}%
                  </a-button>
                </div>
              </div>

              <div class="amount-info">
                <div class="info-item">
                  <span>Transaction fee：{{ getTransactionFee() }} {{ selectedCoin.symbol }}</span>
                </div>
                <div class="info-item">
                  <span>Minimum withdrawal amount：{{ getMinWithdrawal() }} {{ selectedCoin.symbol }}</span>
                </div>
                <div class="info-item">
                  <span>Estimated time for funds to arrive: approximately {{ getEstimatedTime() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 目标地址 -->
          <div class="step-item">
            <div class="step-header">
              <div class="step-icon">
                <img src="@/assets/icons/withdrawal-icon-3.png" style="width:100%">
              </div>
              <div class="step-content">
                <h3 class="step-title">Destination Address</h3>
                <p class="step-description">Enter the wallet address where you want to receive your money</p>
              </div>
            </div>

            <div class="step-body">
              <div class="address-form">
                <div class="form-item">
                  <label>Network</label>
                  <a-select v-model="selectedNetwork" placeholder="Select a Network" style="width: 100%">
                    <a-select-option
                      v-for="network in getAvailableNetworks()"
                      :key="network"
                      :value="network"
                    >
                      {{ network }}
                    </a-select-option>
                  </a-select>
                </div>

                <div class="form-item">
                  <label>Destination Address</label>
                  <a-select
                    v-model="destinationAddress"
                    placeholder="Select or enter destination address"
                    style="width: 100%"
                    show-search
                    allow-clear
                    :loading="addressListLoading"
                    option-filter-prop="children"
                    :filter-option="filterAddressOption"
                  >
                    <a-select-option
                      v-for="address in getFilteredAddresses()"
                      :key="address.id"
                      :value="address.wallet_address"
                    >
                      <div class="address-option">
                        <div class="address-info">
                          <!-- <div class="address-name">{{ address.recipient_name }}</div> -->
                          <div class="address-value">{{ formatDisplayAddress(address.wallet_address) }}</div>
                        </div>
                        <!-- <div class="address-meta">
                          <a-tag size="small" :color="address.recipient_type === '1' ? 'blue' : 'green'">
                            {{ address.recipient_type === '1' ? 'Company' : 'Personal' }}
                          </a-tag>
                          <a-tag size="small">{{ address.chain_code }}</a-tag>
                        </div> -->
                      </div>
                    </a-select-option>
                  </a-select>
                </div>
              </div>

              <div class="warning-message">
                <a-icon type="exclamation-circle" />
                <span>
                  <strong>Important:</strong>
                  <br />
                  Double-check the address and network.
                  <br />
                  Sending to wrong address or network will result in permanent loss of funds.
                </span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a-button type="primary" size="large" @click="proceedToConfirm" :disabled="!canProceed">
              Next
            </a-button>
            <div class="support-link">
              Need help? Contact our <a href="#">support team</a>
            </div>
          </div>
        </div>

        <!-- 右侧FAQ -->
        <div class="right-section">
          <div class="faq-section">
            <h3>FAQ</h3>
            <div class="faq-list">
              <div class="faq-item">
                <div class="faq-question">
                  1. Under what circumstances might my withdrawal of digital currency not arrive as expected?
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  2. How long is it expected to take for the cryptocurrency withdrawal to arrive?
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question">
                  3. How is the withdrawal fee calculated?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二步：确认订单 -->
    <div v-if="currentStep === 2" class="confirm-container">
      <h1 class="page-title">Confirm Order</h1>

      <div class="confirm-content">
        <!-- 交易摘要 -->
        <div class="transaction-summary">
          <div class="summary-row spend-receive">
            <div class="spend-section">
              <div class="label-with-icon">
                <div class="coin-icon-small">
                  <img style="width:100%" :src="getCoinIconSrc(selectedCoin.symbol, selectedCoin.id)" />
                </div>
                <span class="label">Spend</span>
              </div>
              <div class="amount">{{ withdrawalAmount }} {{ selectedCoin.symbol }}</div>
            </div>

            <div class="arrow-section">
              <a-icon type="arrow-right" />
            </div>

            <div class="receive-section" style="text-align:right">
              <div class="label-with-icon" style="justify-content:right">
                <div class="coin-icon-small">
                  <img style="width:100%" :src="getCoinIconSrc(selectedCoin.symbol, selectedCoin.id)" />
                </div>
                <span class="label">Receive</span>
              </div>
              <div class="amount">≈{{ getReceiveAmount() }} {{ selectedCoin.symbol }}</div>
            </div>
          </div>

          <div class="summary-row">
            <span class="label">Network</span>
            <span class="value">{{ selectedNetwork }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Destination Address</span>
            <span class="value address">{{ destinationAddress }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Transaction Fee</span>
            <span class="value">{{ getTransactionFee() }} {{ selectedCoin.symbol }}</span>
          </div>

          <div class="summary-row total-row">
            <span class="label">Total</span>
            <span class="value">{{ totalAmount }} {{ selectedCoin.symbol }}</span>
          </div>
        </div>

        <div class="note">
          * Note: This transaction cannot be reversed once confirmed. Please verify the destination address and network are correct.
        </div>

        <!-- 按钮组 -->
        <div class="confirm-buttons">
          <a-button size="large" class="cancel-button" @click="goBack">
            Cancel
          </a-button>
          <a-button type="primary" size="large" class="confirm-button" @click="showVerificationModal">
            Confirm
          </a-button>
        </div>
      </div>
    </div>

    <!-- 第三步：成功页面 -->
    <div v-if="currentStep === 3" class="result-container success">
      <div class="result-icon">
        <a-icon type="check-circle" />
      </div>
      <h2 class="result-title">Success</h2>
      <p class="result-message">
        Your withdrawal has been submitted to the blockchain!<br>
        The funds will be transferred to your destination address shortly.
      </p>

      <div class="transaction-details">
        <div class="detail-row">
          <span class="detail-label">Order Number</span>
          <span class="detail-value">{{ withdrawResult?.order_no || 'TXNMIYA9HUZF' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Merchant Order No</span>
          <span class="detail-value">{{ withdrawResult?.merchant_order_no || 'TXNMIYA9HUZF' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount</span>
          <span class="detail-value">{{ withdrawResult?.amount || withdrawalAmount }} {{ selectedCoin.symbol }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fee</span>
          <span class="detail-value">{{ withdrawResult?.fee || getTransactionFee() }} {{ selectedCoin.symbol }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Miner Fee</span>
          <span class="detail-value">
            {{ withdrawResult?.miner_fee || '0' }}
            {{ withdrawResult?.miner_fee_currency || selectedCoin.symbol }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value">
            <a-tag color="processing">{{ getStatusText(withdrawResult?.status) }}</a-tag>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Destination</span>
          <span class="detail-value address">
            {{ destinationAddress }}
            <a-icon type="copy" @click="copyToClipboard(destinationAddress)" />
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Network</span>
          <span class="detail-value">{{ selectedNetwork }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created Time</span>
          <span class="detail-value">{{ formatDate(withdrawResult?.created_at) }}</span>
        </div>
        <div class="detail-row total">
          <span class="detail-label">Total</span>
          <span class="detail-value">
            {{ withdrawResult?.amount || withdrawalAmount }}  {{ selectedCoin.symbol }}
          </span>
        </div>
      </div>

      <div class="next-steps">
        <h4>What's Next?</h4>
        <ul>
          <li>Your funds will arrive at the destination address within {{ getEstimatedTime() }}</li>
          <li>You can track the transaction on the blockchain explorer</li>
          <li>A confirmation email has been sent to your registered email</li>
        </ul>
      </div>

      <div class="result-buttons">
        <a-button class="result-btn" size="large" @click="makeAnotherWithdrawal">
          Make Another Withdrawal
        </a-button>
        <a-button type="link" class="contact-link" @click="viewWithdrawalHistory">
          Withdrawal History
        </a-button>
      </div>
    </div>

    <!-- 验证弹窗 -->
    <VerificationModal
      :visible="verificationModalVisible"
      :loading="verificationLoading"
      @confirm="handleVerificationConfirm"
      @cancel="handleVerificationCancel"
      @forgot-pin="handleForgotPin"
      @change="handleVerificationChange"
    />
  </div>
</template>

<script>
import { request } from '@/api/_service'
import { mapGetters } from 'vuex'
// 导入验证组件
import VerificationModal from '@/components/VerificationModal'

export default {
  name: 'WithdrawalCrypto',
  components: {
    VerificationModal
  },
  data () {
    return {
      currentStep: 1,
      cryptoAccountsLoading: true, // 初始为加载状态
      addressListLoading: false, // 地址列表加载状态
      selectedCoin: {
        symbol: 'USDT',
        balance: 0,
        balanceUsd: 0,
        network: 'TRC-20',
        id: 'USDT_TRC'
      },
      withdrawalAmount: '',
      selectedPercentage: null,
      selectedNetwork: '',
      destinationAddress: '',
      addressList: [], // 地址列表数据
      verificationModalVisible: false,
      verificationLoading: false,
      verificationData: {
        tradePin: '',
        googleCode: '',
        isComplete: false
      },
      // 币种下拉框相关数据
      coinDropdownVisible: false,
      availableCoins: [], // 从接口获取的币种数据
      cryptoAccountsData: [], // 原始接口数据
      withdrawResult: null, // 提现结果
      // 币种图标映射
      coinIconMap: {
        'USDT_TRC': require('@/assets/icons/usdt.png'),
        'USDC_TRC': require('@/assets/icons/usdc.png'),
        'USDT': require('@/assets/icons/usdt.png'),
        'USDC': require('@/assets/icons/usdc.png')
      },
      // 不同币种的配置
      coinConfigs: {
        'USDT': {
          fee: 5,
          minWithdrawal: 1000,
          estimatedTime: '5 minutes',
          networks: ['TRC-20', 'ERC-20', 'BSC']
        },
        'USDT_TRC': {
          fee: 5,
          minWithdrawal: 1000,
          estimatedTime: '5 minutes',
          networks: ['TRC-20']
        },
        'USDC_TRC': {
          fee: 3,
          minWithdrawal: 100,
          estimatedTime: '5 minutes',
          networks: ['TRC-20']
        },
        'BTC': {
          fee: 0.0005,
          minWithdrawal: 0.001,
          estimatedTime: '30 minutes',
          networks: ['Bitcoin']
        },
        'ETH': {
          fee: 0.005,
          minWithdrawal: 0.01,
          estimatedTime: '10 minutes',
          networks: ['ERC-20']
        },
        'USDC': {
          fee: 3,
          minWithdrawal: 100,
          estimatedTime: '10 minutes',
          networks: ['ERC-20', 'BSC']
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'getMainMerchant'
    ]),
    canProceed () {
      const minAmount = this.getMinWithdrawal()
      return this.withdrawalAmount &&
             this.selectedNetwork &&
             this.destinationAddress &&
             parseFloat(this.withdrawalAmount) >= minAmount
    },

    totalAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      const fee = this.getTransactionFee()
      return amount + fee
    },

    totalAmountUsd () {
      if (this.selectedCoin.symbol === 'USDT' || this.selectedCoin.symbol === 'USDC') {
        return this.totalAmount.toFixed(2)
      }
      // 对于其他币种，可以通过汇率计算USD价值
      const rate = this.selectedCoin.balanceUsd / this.selectedCoin.balance
      return (this.totalAmount * rate).toFixed(2)
    }
  },

  watch: {
    selectedCoin: {
      handler (newCoin) {
        // 当币种变化时，重置网络选择
        this.selectedNetwork = ''
        // 清空金额
        this.withdrawalAmount = ''
        this.selectedPercentage = null
      },
      deep: true
    }
  },

  async created () {
    // 页面创建时立即加载币种数据和地址列表
    await Promise.all([
      this.getCryptoAccounts(),
      this.getAddressList()
    ])
  },

  async mounted () {
    // 点击外部关闭币种下拉框
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    // 获取地址列表
    async getAddressList () {
      this.addressListLoading = true
      try {
        const res = await request({
          url: '/merchant/contact/list',
          method: 'GET'
        })

        if (res.code === 200) {
          // 转换数据格式
          this.addressList = (res.data || []).map(item => ({
            id: item.id,
            merchant_id: item.merchant_id,
            recipient_type: item.recipient_type?.toString() || '1',
            account_type: item.account_type?.toString() || '1',
            wallet_address: item.wallet_address || '',
            payment_currency: item.payment_currency || '',
            recipient_name: item.recipient_name || '',
            chain_code: item.chain_code || '',
            status: item.status !== false,
            created_at: item.created_at,
            updated_at: item.updated_at
          }))

          console.log('地址列表加载成功:', this.addressList.length, '个地址')
        } else {
          console.error('获取地址列表失败:', res.message)
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
        this.$message.error('Failed to load address list')
      } finally {
        this.addressListLoading = false
      }
    },

    // 根据当前选择的币种过滤地址
    getFilteredAddresses () {
      if (!this.selectedCoin.id) {
        return this.addressList
      }

      // 根据当前选择的币种过滤地址
      return this.addressList.filter(address => {
        return address.payment_currency === this.selectedCoin.id ||
               address.payment_currency === this.selectedCoin.symbol
      })
    },

    // 地址选项搜索过滤
    filterAddressOption (input, option) {
      const address = this.getFilteredAddresses().find(addr =>
        addr.wallet_address === option.componentOptions.propsData.value
      )
      if (!address) return false

      const searchText = input.toLowerCase()
      return (
        address.recipient_name?.toLowerCase().includes(searchText) ||
        address.wallet_address?.toLowerCase().includes(searchText)
      )
    },

    // 格式化显示地址（前6位...后4位）
    formatDisplayAddress (address) {
      if (!address || address.length <= 10) {
        return address
      }
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },

    // 获取加密货币账户列表
    async getCryptoAccounts () {
      this.cryptoAccountsLoading = true
      try {
        // 获取当前商户ID
        const merchantId = localStorage.getItem('currentMerchantId')

        const res = await request({
          url: `/merchant/crypto/v2/accounts?type=1&merchant_id=${merchantId}`,
          method: 'GET'
        })

        if (res.code === 200 && res.data) {
          this.cryptoAccountsData = res.data

          // 格式化币种数据
          this.availableCoins = res.data.map(item => {
            const balance = parseFloat(item.balance?.available || '0')
            const symbol = item.crypto_currency?.name || item.crypto_currency_id
            const network = item.crypto_currency?.chain_name || 'Unknown'

            // 计算USD价值
            let balanceUsd = balance
            if (symbol !== 'USDT' && symbol !== 'USDC') {
              // 对于非稳定币，这里需要实际的汇率数据
              // 暂时使用模拟数据
              const mockRates = {
                'BTC': 45000,
                'ETH': 2500
              }
              balanceUsd = balance * (mockRates[symbol] || 1)
            }

            return {
              symbol: symbol,
              balance: balance,
              balanceUsd: balanceUsd,
              network: network,
              id: item.crypto_currency_id,
              chainCode: item.crypto_currency?.chain_code || '',
              originalData: item
            }
          })

          // 设置默认选中第一个币种
          if (this.availableCoins.length > 0) {
            this.selectedCoin = this.availableCoins[0]
          }

          console.log('加密货币账户列表:', this.availableCoins)
        } else {
          console.error('获取加密货币账户失败:', res.message)
          this.$message.error('Failed to load crypto accounts')
        }
      } catch (error) {
        console.error('获取加密货币账户失败:', error)
        this.$message.error('Failed to load crypto accounts')
      } finally {
        this.cryptoAccountsLoading = false
      }
    },

    // 币种选择相关方法
    toggleCoinDropdown () {
      // 如果还在加载中，不允许打开下拉框
      if (this.cryptoAccountsLoading) {
        return
      }
      this.coinDropdownVisible = !this.coinDropdownVisible
    },

    selectCoin (coin) {
      this.selectedCoin = coin
      this.coinDropdownVisible = false
      // 币种变化时重置相关数据
      this.selectedNetwork = ''
      this.withdrawalAmount = ''
      this.selectedPercentage = null
    },

    handleClickOutside (event) {
      const coinSelector = this.$el.querySelector('.coin-selector')
      if (coinSelector && !coinSelector.contains(event.target)) {
        this.coinDropdownVisible = false
      }
    },

    formatBalance (balance) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 4
      }).format(balance)
    },

    getCoinIconSrc (symbol, coinId = null) {
      // 优先使用传入的coinId
      const id = coinId || this.selectedCoin.id

      // 先尝试完整ID匹配
      if (id && this.coinIconMap[id]) {
        return this.coinIconMap[id]
      }

      // 再尝试symbol匹配
      if (this.coinIconMap[symbol]) {
        return this.coinIconMap[symbol]
      }

      // 默认返回USDT图标
      return this.coinIconMap['USDT']
    },

    getTransactionFee () {
      return 0
      const coinId = this.selectedCoin.id || this.selectedCoin.symbol
      const config = this.coinConfigs[coinId] || this.coinConfigs[this.selectedCoin.symbol]
      return config ? config.fee : 0
    },

    getMinWithdrawal () {
      return 0
      const coinId = this.selectedCoin.id || this.selectedCoin.symbol
      const config = this.coinConfigs[coinId] || this.coinConfigs[this.selectedCoin.symbol]
      return config ? config.minWithdrawal : 0
    },

    getEstimatedTime () {
      const coinId = this.selectedCoin.id || this.selectedCoin.symbol
      const config = this.coinConfigs[coinId] || this.coinConfigs[this.selectedCoin.symbol]
      return config ? config.estimatedTime : '5-15 minutes'
    },

    getAvailableNetworks () {
      // 直接使用当前选中币种的网络信息
        if (this.selectedCoin.chainCode) {
          return [this.selectedCoin.chainCode]
        }

        // 如果没有链代码，从配置中获取
        const coinId = this.selectedCoin.id || this.selectedCoin.symbol
        const config = this.coinConfigs[coinId] || this.coinConfigs[this.selectedCoin.symbol]
        if (config) {
          return config.networks
        }

        return [] // 默认值
    },

    getReceiveAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      return amount.toFixed(4)
    },

    setPercentage (percent) {
      this.selectedPercentage = percent
      const amount = (this.selectedCoin.balance * percent / 100).toFixed(4)
      this.withdrawalAmount = amount
    },

    setMaxAmount () {
      this.selectedPercentage = 100
      this.withdrawalAmount = this.selectedCoin.balance.toString()
    },

    calculateAmount () {
      const amount = parseFloat(this.withdrawalAmount) || 0
      const percentage = Math.round((amount / this.selectedCoin.balance) * 100)
      this.selectedPercentage = [25, 50, 75, 100].includes(percentage) ? percentage : null
    },

    proceedToConfirm () {
      if (this.canProceed) {
        this.currentStep = 2
      }
    },

    goBack () {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    // 验证相关方法
    showVerificationModal () {
      this.verificationModalVisible = true
      this.resetVerificationData()
    },

    handleVerificationCancel () {
      this.verificationModalVisible = false
      this.resetVerificationData()
    },

    handleVerificationChange (data) {
      this.verificationData = data
    },

    async handleVerificationConfirm (data) {
      if (!data.tradePin || !data.googleCode) {
        this.$message.error('Please enter both Trade PIN and Google Authentication Code')
        return
      }

      this.verificationLoading = true

      try {
        // 获取当前商户ID
        const merchantId = localStorage.getItem('currentMerchantId')

        // 获取对应的 account_id
        const selectedAccount = this.cryptoAccountsData.find(account =>
          account.crypto_currency_id === this.selectedCoin.id
        )

        if (!selectedAccount) {
          throw new Error('Selected account not found')
        }

        // 调用提现接口
        const res = await request({
          url: '/merchant/crypto/v2/withdraw/create',
          method: 'POST',
          data: {
            account_id: selectedAccount.id,
            merchant_id: merchantId,
            dest_address: this.destinationAddress,
            amount: parseFloat(this.withdrawalAmount),
             current_password: data.tradePin, // 添加这行
    totp_code: data.googleCode // 添加这行
          }
        })

        if (res.code === 200) {
          // 保存提现结果用于显示
          this.withdrawResult = res.data
          this.verificationModalVisible = false
          this.currentStep = 3
          this.$message.success('Withdrawal request submitted successfully!')
        } else {
          throw new Error(res.message || 'Withdrawal request failed')
        }
      } catch (error) {
        // test
        console.error('提现请求失败:', error)
        this.$message.error(error.message || 'System error, please try again')
        this.resetVerificationData()
      } finally {
        this.verificationLoading = false
      }
    },

    handleForgotPin () {
      this.$message.info('Redirecting to forgot PIN page...')
      // 这里可以跳转到忘记PIN页面
    },

    resetVerificationData () {
      this.verificationData = {
        tradePin: '',
        googleCode: '',
        isComplete: false
      }
    },

    makeAnotherWithdrawal () {
      this.currentStep = 1
      this.withdrawalAmount = ''
      this.selectedNetwork = ''
      this.destinationAddress = ''
      this.selectedPercentage = null
      this.resetVerificationData()
    },

    viewWithdrawalHistory () {
      this.$message.info('跳转到提现历史页面')
    },

    copyToClipboard (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },

    // 获取状态文本
    getStatusText (status) {
      const statusMap = {
        0: 'Processing',
        1: 'Completed',
        2: 'Failed',
        3: 'Cancelled'
      }
      return statusMap[status] || 'Processing'
    },

    // 格式化日期
    formatDate (dateString) {
      if (!dateString) return new Date().toLocaleString()
      try {
        return new Date(dateString).toLocaleString()
      } catch (error) {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
.withdrawal-crypto {
  min-height: calc(100vh - 64px);
  position: relative;
}

.back-button {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 100;
  font-size: 16px;
  color: #262626;
  border: none;
  background: transparent;
}

.back-button:hover {
  color: #40a9ff;
}

/* 表单页面样式 */
.withdrawal-form {
  min-height: 600px;
  margin: 20px 0;
}

.form-content {
  display: flex;
  justify-content: space-between;
}

.left-section {
  flex: 2;
  max-width: 600px;
}

.right-section {
  flex: 1;
  max-width: 350px;
}

/* 步骤样式 - 参考充值页面 */
.step-item {
  margin-bottom: 32px;
  position: relative;

  /* 添加连接线 */
  &:not(:last-child)::after {
    content: '';
        position: absolute;
        left: 19px;
        top: 40px;
        width: 2px;
        height: calc(100% - 10px);
        background: #f0f0f0;
        z-index: 0;

  }

  .step-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;

    .step-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;
      padding-top: 4px;

      .step-title {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #262626;
      }

      .step-description {
        margin: 0;
        color: #8c8c8c;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  .step-body {
    margin-left: 64px;
  }
}

/* 币种选择器样式 */
.coin-selector {
  position: relative;
}

.coin-dropdown-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.coin-dropdown-trigger:hover {
  border-color: #11253E;
  background: #f6ffff;
}

.selected-coin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.dropdown-arrow {
  margin-left: 12px;
  color: #bfbfbf;
  transition: color 0.3s;
}

.coin-dropdown-trigger:hover .dropdown-arrow {
  color: #11253E;
}

.coin-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.loading-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #8c8c8c;
}

.loading-selected-coin {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #8c8c8c;
  flex: 1;
}

.coin-dropdown-trigger:has(.loading-selected-coin) {
  cursor: default;
}

.coin-dropdown-trigger:has(.loading-selected-coin):hover {
  border-color: #f0f0f0;
  background: white;
}

.coin-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #f5f5f5;
}

.coin-option:last-child {
  border-bottom: none;
}

.coin-option:hover {
  background: #f6ffff;
}

.coin-option.active {
  background: #e6f7ff;
}

.coin-info {
  display: flex;
  align-items: center;
}

.coin-icon {
  margin-right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin-icon-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.coin-network {
  font-size: 12px;
  color: #8c8c8c;
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  text-align: right;
}

.balance-usd {
  font-size: 12px;
  color: #8c8c8c;
  text-align: right;
}

.currency {
  font-weight: normal;
}

/* 金额输入 */
.amount-input {
  position: relative;
  margin-bottom: 20px;
}

.amount-input .ant-input {
  font-size: 24px;
  height: 60px;
  padding-right: 60px;
}

.max-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #11253E;
  font-weight: 600;
}

.quick-select {
  margin-bottom: 20px;
}

.quick-label {
  display: block;
  margin-bottom: 8px;
  color: #262626;
  font-weight: 500;
}

.percentage-buttons {
  display: flex;
  gap: 8px;
}

.percentage-buttons .ant-btn {
  flex: 1;
  height: 40px;
}

.percentage-buttons .ant-btn.active {
  background: #11253E;
  color: white;
  border-color: #11253E;
}

.amount-info {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
}

.info-item {
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

/* 地址表单 */
.address-form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #262626;
  font-weight: 500;
}

/* 地址选择框样式 */
.address-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info {
  flex: 1;
  min-width: 0;
}

.address-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 2px;
}

.address-value {
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.address-meta {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.address-meta .ant-tag {
  margin: 0;
  font-size: 10px;
  padding: 1px 4px;
  line-height: 16px;
}

.warning-message {
  display: flex;
  align-items: flex-start;
  line-height: 18px;
  padding: 20px;
  background: rgba(246, 249, 252, 1);
  border-radius: 6px;
  color: rgba(17, 37, 62, 1);
  font-size: 12px;
}

.warning-message .anticon {
  margin-right: 8px;
  margin-top: 2px;
  color: #fa8c16;
  display: none;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
}

.form-actions .ant-btn {
  width: 200px;
  height: 45px;
  font-size: 16px;
}

.support-link {
  margin-top: 16px;
  color: #8c8c8c;
  font-size: 14px;
}

.support-link a {
  color: rgba(0, 115, 230, 1);
}

/* FAQ样式 */
.faq-section {
  padding: 24px;
  max-width: 350px;
  border-radius: 8px;
  height: fit-content;
}

.faq-section h3 {
  margin: 0 0 20px 0;
  color: #262626;
  font-weight: 600;
}

.faq-item {
  margin-bottom: 16px;
}

.faq-question {
  color: #262626;
  font-size: 14px;
  line-height: 1.5;
}

/* 确认订单页面样式 */
.confirm-container {
  background: white;
  border-radius: 12px;
  padding: 20px 32px;
  margin: 0 auto;
  max-width: 600px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  text-align: left;
  margin-bottom: 32px;
}

.confirm-content .transaction-summary {
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;

    &.spend-receive {
      display: flex;
      align-items: center;
      padding: 24px 0;

      .spend-section, .receive-section {
        flex: 1;
        text-align: left;

        .label-with-icon {
          display: flex;
          align-items: center;
          justify-content: left;
          gap: 8px;
          margin-bottom: 8px;

          .label {
            font-size: 14px;
            color: #666;
          }
        }

        .amount {
          font-size: 18px;
          font-weight: 600;
          color: #262626;
        }
      }

      .arrow-section {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 20px;

        .anticon {
          font-size: 20px;
          color: #bfbfbf;
        }
      }
    }

    &.total-row {
      border-bottom: none;
      font-weight: 600;
      font-size: 16px;
    }

    .label {
      color: #666;
      font-size: 14px;
    }

    .value {
      color: #262626;
      font-size: 14px;
      font-weight: 500;
    }

    .address {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.confirm-content .note {
  color: #8c8c8c;
  font-size: 12px;
  margin: 24px 0;
  text-align: left;
}

.confirm-content .confirm-buttons {
  display: flex;
  gap: 16px;
  margin-top: 32px;

  .cancel-button, .confirm-button {
    flex: 1;
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
  }

  .cancel-button {
    background: #f5f5f5;
    border: none;
    color: #666;

    &:hover {
      background: #e8e8e8;
      color: #666;
    }
  }

  .confirm-button {
    background: #1f2937;
    border: none;

    &:hover {
      background: #374151;
    }
  }
}

/* 成功页面样式 */
.result-container {
  text-align: center;
  padding: 60px 32px;
  margin: 0 auto;
  max-width: 600px;

  .result-icon {
    margin-bottom: 24px;

    .anticon {
      font-size: 64px;
      color: #52c41a;
    }
  }

  .result-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #262626;
  }

  .result-message {
    color: #666;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .result-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    .result-btn {
      width: 100%;
    }

    .contact-link {
      color: #11253E;
      padding: 0;
    }
  }
}

.step-item:nth-child(3)::after {
  display: none !important;
}

.transaction-details {
  text-align: left;
  margin-bottom: 32px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row.total {
  border-bottom: none;
  font-weight: 600;
  font-size: 16px;
}

.detail-label {
  color: #8c8c8c;
}

.detail-value {
  color: #262626;
}

.detail-value.address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.detail-value .anticon {
  cursor: pointer;
  color: #11253E;
  margin-left: 8px;
}

.next-steps {
  text-align: left;
  margin-bottom: 32px;
  padding: 20px;
  background: #f6ffed;
  border-radius: 8px;
}

.next-steps h4 {
  margin: 0 0 12px 0;
  color: #262626;
}

.next-steps ul {
  margin: 0;
  padding-left: 20px;
  color: #52c41a;
}

.next-steps li {
  margin-bottom: 8px;
  color: #262626;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-content {
    flex-direction: column;
  }

  .confirm-buttons {
    flex-direction: column;
  }
}
</style>
