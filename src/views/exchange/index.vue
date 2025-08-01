<template>
  <div class="exchange-page">
    <!-- 返回按钮 -->
    <a-button
      v-if="currentStep !== 'exchange'"
      type="text"
      class="back-button"
      @click="goBack"
    >
      <a-icon type="left" />
      Back
    </a-button>

    <!-- Exchange History按钮 -->
    <a-button
      v-if="currentStep === 'exchange'"
      type="default"
      class="history-button"
      @click="goToExchangeHistory"
    >
      <a-icon type="history" />
      Exchange History
    </a-button>

    <!-- 兑换表单页面 -->
    <div v-if="currentStep === 'exchange'" class="exchange-container">
      <h1 class="page-title">Exchange</h1>
      <a-form :form="form" @submit="handleSubmit" class="exchange-form">
        <!-- Spend 部分 -->
        <div class="exchange-section">
          <div class="currency-input-container" ref="spendContainer">
            <div class="main-input-group" :class="{ 'focused': spendDropdownVisible }">
              <div class="input-label">Spend</div>
              <a-input
                v-decorator="[
                  'spendAmount',
                  {
                    rules: [{ required: true, message: 'Please enter amount' }],
                    initialValue: spendAmount
                  }
                ]"
                size="large"
                placeholder="0"
                class="amount-input"
                :value="spendAmount"
                @input="onSpendAmountChange"
              />

              <div class="currency-selector" @click="toggleSpendDropdown">
                <div v-if="cryptoAccountsLoading" class="loading-selected-currency">
                  <a-spin size="small" />
                  <span style="margin-left: 8px;">Loading...</span>
                </div>
                <div v-else class="selected-currency">
                  <div :class="['currency-icon', `${spendCurrency.toLowerCase()}-icon`]">
                    <img style="width:26px;" :src="getCurrencySymbol(spendCurrency)" />
                  </div>
                  <span class="currency-code">{{ spendCurrency }}</span>
                </div>
                <a-icon v-if="!cryptoAccountsLoading" type="down" class="dropdown-arrow" :class="{ 'rotated': spendDropdownVisible }" />
              </div>
            </div>

            <!-- 自定义下拉框 -->
            <div v-if="spendDropdownVisible" class="custom-dropdown">
              <div v-if="cryptoAccountsLoading" class="loading-option">
                <a-spin size="small" />
                <span style="margin-left: 8px;">Loading currencies...</span>
              </div>
              <div
                v-for="currency in spendCurrencies"
                :key="currency.code"
                class="dropdown-item"
                :class="{ 'selected': currency.code === spendCurrency }"
                @click="selectSpendCurrency(currency.code)"
              >
                <div class="currency-icon">
                  <img style="width:26px;" :src="getCurrencySymbol(currency.code)" />
                </div>
                <div class="currency-details">
                  <span class="currency-code">{{ currency.code }}</span>
                  <span class="currency-name">{{ currency.name }}</span>
                </div>
              </div>
            </div>

            <!-- 余额信息 -->
            <div class="balance-info">
              <span class="balance-text">
                Balance: {{ formatBalance(currentBalance) }}
              </span>
              <a class="sell-all-link" @click="sellAll">Sell all</a>
            </div>
          </div>
        </div>

        <!-- 汇率和手续费信息 -->
        <div class="exchange-info">
          <div class="rate-info">
            <a-icon type="percentage" class="info-icon" />
            <span class="rate-text">{{ exchangeRateText }}</span>
          </div>
          <div class="fee-info">
            <a-icon type="calculator" class="info-icon" />
            <span class="fee-text">{{ exchangeFee }}% Exchange fee</span>
          </div>
        </div>

        <!-- Receive 部分 -->
        <div class="exchange-section">
          <div class="currency-input-container" ref="receiveContainer">
            <div class="main-input-group" :class="{ 'focused': receiveDropdownVisible }">
              <div class="input-label">Receive</div>
              <a-input
                v-model="receiveAmount"
                size="large"
                placeholder="0"
                class="amount-input"
                disabled
              />

              <div class="currency-selector" @click="toggleReceiveDropdown">
                <div v-if="fiatAccountsLoading" class="loading-selected-currency">
                  <a-spin size="small" />
                  <span style="margin-left: 8px;">Loading...</span>
                </div>
                <div v-else class="selected-currency">
                  <div :class="['currency-icon', `${receiveCurrency.toLowerCase()}-icon`]">
                    <img style="width:26px;" :src="getCurrencySymbol(receiveCurrency)" />
                  </div>
                  <span class="currency-code">{{ receiveCurrency }}</span>
                </div>
                <a-icon v-if="!fiatAccountsLoading" type="down" class="dropdown-arrow" :class="{ 'rotated': receiveDropdownVisible }" />
              </div>
            </div>

            <!-- 自定义下拉框 -->
            <div v-if="receiveDropdownVisible" class="custom-dropdown">
              <div v-if="fiatAccountsLoading" class="loading-option">
                <a-spin size="small" />
                <span style="margin-left: 8px;">Loading currencies...</span>
              </div>
              <div
                v-for="currency in receiveCurrencies"
                :key="currency.code"
                class="dropdown-item"
                :class="{ 'selected': currency.code === receiveCurrency }"
                @click="selectReceiveCurrency(currency.code)"
              >
                <div class="currency-icon">
                  <img style="width:26px;" :src="getCurrencySymbol(currency.code)" />
                </div>
                <div class="currency-details">
                  <span class="currency-code">{{ currency.code }}</span>
                  <span class="currency-name">{{ currency.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 账户选择 - 新的设计 -->
        <div class="account-section">
          <div class="section-header">
            <label class="section-label">Deposit into Account</label>
          </div>

          <!-- 账户选择容器 -->
          <div class="account-selection-container" ref="accountContainer">
            <!-- 主选择框 -->
            <div class="account-main-selector" :class="{ 'focused': accountDropdownVisible }" @click="toggleAccountDropdown">
              <div class="selector-content">
                <span class="selector-text" :class="{ 'placeholder': !selectedAccount }">
                  {{ selectedAccount ? selectedAccount.name : 'Select an Account' }}
                </span>
                <a-icon type="down" class="dropdown-arrow" :class="{ 'rotated': accountDropdownVisible }" />
              </div>
            </div>

            <!-- 下拉选项列表 -->
            <div v-if="accountDropdownVisible" class="account-options-list">
              <!-- 可用账户选项 -->
              <div
                v-for="account in availableAccounts"
                :key="account.id"
                class="account-option-item"
                :class="{ 'selected': selectedAccountId === account.id }"
                @click="selectAccount(account)"
              >
                <div class="account-item-content">
                  <div class="account-main-info">
                    <span class="account-name">{{ account.name }}</span>
                  </div>
                  <div class="account-number">{{ account.number }}</div>
                </div>
                <div v-if="selectedAccountId === account.id" class="selected-indicator">
                  <a-icon type="check" />
                </div>
              </div>

              <!-- 添加地址按钮 -->
              <div class="add-address-option" v-if="availableAccounts.length > 0" @click="goToAddAddress">
                <a-icon type="plus" class="add-icon" />
                <span class="add-text">Add an address</span>
              </div>
            </div>
          </div>

          <!-- 如果没有可用账户，显示空状态 -->
          <div v-if="availableAccounts.length === 0" class="empty-address-state">
            <div class="empty-icon">
              <div class="search-icon">
                <img style="width:64px" src="@/assets/icons/Search.png"></img>
              </div>
            </div>
            <div class="empty-text">You don't have any addresses yet</div>
            <a-button type="primary" class="add-address-btn" @click="goToAddAddress">
              <a-icon type="plus" />
              Add an Address
            </a-button>
          </div>

          <!-- 隐藏的表单字段 -->
          <a-input
            v-decorator="[
              'depositAccount',
              {
                rules: [{ required: true, message: 'Please select an account' }],
                initialValue: selectedAccountId
              }
            ]"
            style="display: none"
            :value="selectedAccountId"
          />
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <a-button
            type="primary"
            htmlType="submit"
            size="large"
            block
            class="exchange-button"
            :disabled="!canExchange"
          >
            Next
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- 确认订单页面 -->
    <div v-if="currentStep === 'confirm'" class="confirm-container">
      <h1 class="page-title">Confirm Order</h1>

      <div class="confirm-content">
        <!-- 交易摘要 -->
        <div class="transaction-summary">
          <div class="summary-row spend-receive">
            <div class="spend-section">
              <div class="label-with-icon">
                <img style="width:20px;" :src="getCurrencySymbol(spendCurrency)" />
                <span class="label">Spend</span>
              </div>
              <div class="amount">{{ spendAmount }} {{ spendCurrency }}</div>
            </div>

            <div class="arrow-section">
              <a-icon type="arrow-right" />
            </div>

            <div class="receive-section" style="text-align:right">
              <div class="label-with-icon" style="justify-content:right" >
                <img style="width:20px;" :src="getCurrencySymbol(receiveCurrency)" />
                <span class="label">Receive</span>
              </div>
              <div class="amount">{{ receiveAmount }} {{ receiveCurrency }}</div>
            </div>
          </div>

          <div class="summary-row">
            <span class="label">Exchange Rate</span>
            <span class="value">{{ exchangeRateText }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Exchange Fee</span>
            <span class="value">{{ exchangeFee }}%</span>
          </div>

          <div class="summary-row">
            <span class="label">Deposit into Account</span>
            <span class="value">{{ selectedAccount ? selectedAccount.name : '' }}</span>
          </div>

          <div class="summary-row total-row">
            <span class="label">Total</span>
            <span class="value">{{ receiveAmount }} {{ receiveCurrency }}</span>
          </div>
        </div>

        <div class="note">
          * Note: Please ensure that the receiving account supports transfers in this currency.
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

    <!-- 成功页面 -->
    <div v-if="currentStep === 'success'" class="result-container success">
      <div class="result-icon">
        <a-icon type="check-circle" />
      </div>
      <h2 class="result-title">Success</h2>
      <p class="result-message">
        Your exchange order has been successfully processed!<br>
        The funds will be transferred to your account shortly.
      </p>

      <!-- 订单详情 -->
      <div v-if="orderInfo" class="order-details">
        <div class="detail-row">
          <span class="detail-label">Order Number</span>
          <span class="detail-value">{{ orderInfo.orderNo }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Exchange Amount</span>
          <span class="detail-value">{{ orderInfo.cryptoAmount }} {{ spendCurrency }} → {{ orderInfo.fiatAmount }} {{ receiveCurrency }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Exchange Rate</span>
          <span class="detail-value">{{ orderInfo.exchangeRate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fee</span>
          <span class="detail-value">{{ orderInfo.cryptoFee }} {{ spendCurrency }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created At</span>
          <span class="detail-value">{{ formatDateTime(orderInfo.createdAt) }}</span>
        </div>
      </div>

      <div class="result-buttons">
        <a-button class="result-btn" size="large" @click="goHome">
          Back
        </a-button>
        <a-button type="link" class="contact-link" @click="goToExchangeHistory">
          Exchange History
        </a-button>
      </div>
    </div>

    <!-- 失败页面 -->
    <div v-if="currentStep === 'failed'" class="result-container failed">
      <div class="result-icon">
        <a-icon type="close-circle" />
      </div>
      <h2 class="result-title">Failed</h2>
      <p class="result-message">
        Sorry, your order has failed to process. Please try again.<br>
        If you have any questions, please contact us.
      </p>
      <div class="result-buttons">
        <a-button class="result-btn" size="large" @click="goHome">
          Back
        </a-button>
        <a-button type="link" class="contact-link">
          Contact Us
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
// 导入验证组件和API请求服务
import VerificationModal from '@/components/VerificationModal'
import { request } from '@/api/_service'

export default {
  name: 'ExchangePage',
  components: {
    VerificationModal
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false,
      currentStep: 'exchange', // exchange, confirm, success, failed
      verificationModalVisible: false,
      verificationLoading: false,
      verificationData: {
        tradePin: '',
        googleCode: '',
        isComplete: false
      },
      spendAmount: '',
      receiveAmount: '',
      spendCurrency: '',
      receiveCurrency: '',
      spendDropdownVisible: false,
      receiveDropdownVisible: false,
      accountDropdownVisible: false,
      selectedAccountId: null,

      // 报价相关数据
      quoteLoading: false,
      quoteData: null,
      exchangeRate: 1,
      exchangeFee: 0,
      priceKey: null,

      // 加密货币账户相关数据
      cryptoAccountsLoading: true,
      cryptoAccountsData: [], // 原始API数据
      balances: {}, // 余额数据，格式：{ 'USDT_TRC': 49.80000000, ... }
      spendCurrencies: [], // 数字货币列表

      // 法币账户相关数据
      fiatAccountsLoading: true,
      fiatAccountsData: [], // 原始法币API数据
      receiveCurrencies: [], // 法币列表
      availableAccounts: [], // 可用的银行账户列表

      // 订单信息
      orderInfo: null,

      // 币种图标映射
      coinIconMap: {
        'USDT-TRC': require('@/assets/icons/usdt.png'),
        'USDC-TRC': require('@/assets/icons/usdc.png'),
        'USDT': require('@/assets/icons/usdt.png'),
        'USDC': require('@/assets/icons/usdc.png'),
        'BTC': require('@/assets/icons/btc.png'),
        'USD': require('@/assets/icons/usd.png'),
        'EUR': require('@/assets/icons/eur.png')
      }
    }
  },

  computed: {
    currentBalance () {
      return this.balances[this.spendCurrency] || 0
    },

    selectedAccount () {
      return this.availableAccounts.find(account => account.id === this.selectedAccountId)
    },

    exchangeRateText () {
      if (!this.quoteData) {
        return 'Select currencies to get exchange rate'
      }
      // 显示格式：1USD = 0.9993USDT_TRC (这里应该显示扣除手续费后的实际汇率)
      return `1${this.receiveCurrency} = ${this.exchangeRate}${this.spendCurrency}`
    },

    canExchange () {
      const amount = parseFloat(this.spendAmount.replace(/,/g, ''))
      return amount > 0 && amount <= this.currentBalance && this.exchangeRate > 0 && this.selectedAccountId
    }
  },

  async created () {
    // 并行加载数字货币和法币数据
    await Promise.all([
      this.getCryptoAccounts(),
      this.getFiatAccounts()
    ])

    // 数据加载完成后，如果两个下拉框都有默认选中值，则获取报价
    this.$nextTick(() => {
      if (this.spendCurrency && this.receiveCurrency &&
          this.spendCurrencies.length > 0 && this.receiveCurrencies.length > 0) {
        this.getExchangeQuote()
      }
    })
  },

  mounted () {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    // 获取加密货币账户列表
    async getCryptoAccounts () {
      this.cryptoAccountsLoading = true
      try {
        const merchantId = localStorage.getItem('currentMerchantId')

        const res = await request({
          url: `/merchant/crypto/v2/accounts?type=1&merchant_id=${merchantId}`,
          method: 'GET'
        })

        if (res.code === 200 && res.data) {
          this.cryptoAccountsData = res.data

          // 从API数据解析数字货币 - 新的数据结构
          this.spendCurrencies = []
          this.balances = {}

          res.data.forEach(cryptoAcc => {
            const symbol = cryptoAcc.crypto_currency_id
            const balance = parseFloat(cryptoAcc.balance?.available || '0')
            const name = cryptoAcc.crypto_currency?.name || symbol

            this.spendCurrencies.push({
              code: symbol,
              name: name,
              balance: balance,
              network: cryptoAcc.crypto_currency?.chain_name || 'Unknown',
              chainCode: cryptoAcc.crypto_currency?.chain_code || '',
              originalData: cryptoAcc
            })

            // 更新余额数据
            this.balances[symbol] = balance
          })

          console.log('解析后的数字货币列表:', this.spendCurrencies)
          console.log('解析后的余额数据:', this.balances)

          // 设置默认选中第一个币种（如果当前选中的币种不在列表中）
          if (this.spendCurrencies.length > 0) {
            const currentExists = this.spendCurrencies.find(c => c.code === this.spendCurrency)
            if (!currentExists) {
              this.spendCurrency = this.spendCurrencies[0].code
            }
          }

          console.log('加密货币账户列表加载成功:', this.spendCurrencies.length, '个币种')
        } else {
          console.error('获取加密货币账户失败:', res.message)
          this.$message.error('Failed to load crypto accounts')
          // this.loadDefaultCryptoData()
        }
      } catch (error) {
        console.error('获取加密货币账户失败:', error)
        this.$message.error('Failed to load crypto accounts')
        // this.loadDefaultCryptoData()
      } finally {
        this.cryptoAccountsLoading = false
      }
    },

    // 获取法币账户列表
    async getFiatAccounts () {
      this.fiatAccountsLoading = true
      try {
        const merchantId = localStorage.getItem('currentMerchantId')

        const res = await request({
          url: `/merchant/fiat/v2/accounts?type=1&merchant_id=${merchantId}`,
          method: 'GET'
        })

        if (res.code === 200 && res.data) {
          this.fiatAccountsData = res.data

          // 从法币接口数据解析法币
          this.receiveCurrencies = res.data.map(account => {
            const fiatCurrency = account.fiat_currency
            return {
              code: account.fiat_currency_id,
              name: fiatCurrency ? fiatCurrency.name : account.fiat_currency_id,
              symbol: fiatCurrency ? fiatCurrency.symbol : '',
              originalData: account
            }
          })

          // 设置默认选中第一个法币（如果当前选中的法币不在列表中）
          if (this.receiveCurrencies.length > 0) {
            const currentExists = this.receiveCurrencies.find(c => c.code === this.receiveCurrency)
            if (!currentExists) {
              this.receiveCurrency = this.receiveCurrencies[0].code
            }
          }

          console.log('法币账户列表加载成功:', this.receiveCurrencies.length, '个法币')

          // 如果法币有选择项，调用银行地址接口
          if (this.receiveCurrencies.length > 0) {
            await this.getBankAddresses()
          } else {
            this.availableAccounts = []
          }
        } else {
          console.error('获取法币账户失败:', res.message)
          this.$message.error('Failed to load fiat accounts')
          // this.loadDefaultFiatData()
        }
      } catch (error) {
        console.error('获取法币账户失败:', error)
        this.$message.error('Failed to load fiat accounts')
        // this.loadDefaultFiatData()
      } finally {
        this.fiatAccountsLoading = false
      }
    },

    // 获取银行地址列表
    async getBankAddresses () {
      try {
        const res = await request({
          url: '/merchant/bank/list',
          method: 'GET',
          params: {
            account_name: '' // 获取所有银行账户
          }
        })

        if (res.code === 200 && res.data) {
          // 将银行账户数据转换为可用账户格式
          this.availableAccounts = res.data
            .filter(bank => bank.status === 1) // 只选择状态正常的银行账户
            .map(bank => ({
              id: bank.id,
              name: bank.account_name,
              number: bank.account_number,
              currency: bank.currency,
              balance: '0.00', // 银行账户没有余额显示
              bankName: bank.bank_name,
              originalData: bank
            }))

          // 设置默认选中第一个账户
          if (this.availableAccounts.length > 0 && !this.selectedAccountId) {
            this.selectedAccountId = this.availableAccounts[0].id
          }

          console.log('银行账户列表加载成功:', this.availableAccounts.length, '个账户')
        } else {
          console.error('获取银行账户失败:', res.message)
          this.availableAccounts = []
        }
      } catch (error) {
        console.error('获取银行账户失败:', error)
        this.availableAccounts = []
      }
    },

    // 获取报价
    async getExchangeQuote () {
      // 检查必要条件
      if (!this.spendCurrency || !this.receiveCurrency) {
        this.quoteData = null
        this.exchangeRate = 1
        this.exchangeFee = 0
        this.calculateReceiveAmount()
        return
      }

      // 找到对应的crypto_account_id
      const selectedCrypto = this.spendCurrencies.find(c => c.code === this.spendCurrency)
      if (!selectedCrypto) {
        console.error('找不到对应的数字货币账户')
        return
      }

      this.quoteLoading = true
      try {
        const merchantId = localStorage.getItem('currentMerchantId')

        const params = {
          amount: 100, // 写死为100
          country: 'HK', // 可以根据实际需要调整
          crypto_account_id: selectedCrypto.originalData.id,
          crypto_currency_id: this.spendCurrency,
          exchange_type: 1, // 1=加密货币兑换法币
          fiat_currency_id: this.receiveCurrency,
          merchant_id: merchantId
        }

        // 如果有缓存的price_key，加上它
        if (this.priceKey) {
          params.price_key = this.priceKey
        }

        console.log('获取报价参数:', params)

        const res = await request({
          url: '/merchant/exchange/v2/quote',
          method: 'GET',
          params: params
        })

        if (res.code === 200 && res.data) {
          this.quoteData = res.data
          this.exchangeRate = parseFloat(res.data.base_rate)
          this.exchangeFee = parseFloat(res.data.fee_percentage)
          this.priceKey = res.data.price_key

          // 有了汇率后，重新计算当前输入金额对应的接收金额
          this.calculateReceiveAmount()

          console.log('报价获取成功:', res.data)
        } else {
          console.error('获取报价失败:', res.message)
          this.$message.error('Failed to get exchange quote')
        }
      } catch (error) {
        console.error('获取报价失败:', error)
        this.$message.error('Failed to get exchange quote')
      } finally {
        this.quoteLoading = false
      }
    },

    // 加载默认数字货币数据（API失败时的备用方案）
    loadDefaultCryptoData () {
      this.spendCurrencies = [
        { code: 'USDT_TRC', name: 'Tether (TRC-20)' },
        { code: 'USDC_TRC', name: 'USD Coin (TRC-20)' },
        { code: 'BTC', name: 'Bitcoin' }
      ]
      this.balances = {
        'USDT_TRC': 49.80000000,
        'USDC_TRC': 0.00000000,
        'BTC': 0.025
      }
    },

    // 加载默认法币数据（API失败时的备用方案）
    loadDefaultFiatData () {
      // this.receiveCurrencies = [
      //   { code: 'USD', name: '美元' }
      // ]
      // 清空银行账户列表
      this.availableAccounts = []
    },

    // 获取法币币种名称
    getFiatCurrencyName (code) {
      const nameMap = {
        'USD': 'US Dollar',
        'EUR': 'Euro',
        'CNY': 'Chinese Yuan',
        'HKD': 'Hong Kong Dollar'
      }
      return nameMap[code] || code
    },

    getCurrencySymbol (currency) {
      // 先尝试完整匹配
      if (this.coinIconMap[currency]) {
        return this.coinIconMap[currency]
      }

      // 再尝试基础符号匹配
      const baseSymbol = currency.split('_')[0] // 例如 'USDT_TRC' -> 'USDT'
      if (this.coinIconMap[baseSymbol]) {
        return this.coinIconMap[baseSymbol]
      }

      // 默认返回USDT图标
      // return this.coinIconMap['USDT']
    },

    // 页面导航
    goBack () {
      if (this.currentStep === 'confirm') {
        this.currentStep = 'exchange'
      } else if (this.currentStep === 'success' || this.currentStep === 'failed') {
        this.currentStep = 'exchange'
      }
    },

    goHome () {
      this.currentStep = 'exchange'
      // 重置表单数据
      this.spendAmount = ''
      this.receiveAmount = ''
      this.orderInfo = null
      this.resetVerificationData()
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

    handleVerificationConfirm (data) {
      if (!data.tradePin || !data.googleCode) {
        this.$message.error('Please enter both Trade PIN and Google Authentication Code')
        return
      }

      this.verificationLoading = true

      // 调用换汇接口
      this.submitExchangeOrder(data)
    },

    // 提交换汇订单
    async submitExchangeOrder (verificationData) {
      try {
        // 准备提交参数
        const selectedCrypto = this.spendCurrencies.find(c => c.code === this.spendCurrency)
        const selectedFiat = this.receiveCurrencies.find(c => c.code === this.receiveCurrency)

        if (!selectedCrypto || !selectedFiat) {
          this.$message.error('Currency information error')
          this.verificationLoading = false
          return
        }

        const params = {
          bank_id: this.selectedAccountId.toString(), // 提现银行ID
          crypto_account_id: selectedCrypto.originalData.id, // 商户数币账户ID
          current_password: verificationData.tradePin, // 操作密码（交易PIN）
          exchange_type: '1', // 1=加密货币兑换法币
          fiat_account_id: selectedFiat.originalData.id.toString(), // 商户法币账户ID - 转为字符串
          fiat_currency_id: this.receiveCurrency, // 平台法币ID
          price_key: this.priceKey || '', // 报价缓存Key
          totp_code: verificationData.googleCode // 谷歌验证码
        }

        console.log('提交换汇参数:', params)

        const res = await request({
          url: '/merchant/exchange/v2/create',
          method: 'POST',
          data: params
        })

        this.verificationLoading = false

        if (res.code === 200 && res.data) {
          this.verificationModalVisible = false
          this.currentStep = 'success'

          // 保存订单信息用于成功页面显示
          this.orderInfo = {
            orderNo: res.data.order_no,
            merchantOrderNo: res.data.merchant_order_no,
            cryptoAmount: res.data.crypto_amount,
            fiatAmount: res.data.fiat_amount,
            exchangeRate: res.data.exchange_rate,
            cryptoFee: res.data.crypto_fee,
            fiatFee: res.data.fiat_fee,
            status: res.data.status,
            expiredAt: res.data.expired_at,
            createdAt: res.data.created_at
          }

          this.$message.success('Exchange order created successfully')
          console.log('换汇订单创建成功:', res.data)
        } else {
          this.$message.error(res.message || 'Exchange order failed')
          this.resetVerificationData()
        }
      } catch (error) {
        this.verificationLoading = false
        console.error('换汇订单创建失败:', error)
        this.$message.error('Exchange order failed, please try again')
        this.resetVerificationData()
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

    // 下拉框控制
    toggleSpendDropdown () {
      // 如果还在加载中，不允许打开下拉框
      if (this.cryptoAccountsLoading) {
        return
      }
      this.spendDropdownVisible = !this.spendDropdownVisible
      this.receiveDropdownVisible = false
      this.accountDropdownVisible = false
    },

    toggleReceiveDropdown () {
      // 如果还在加载中，不允许打开下拉框
      if (this.fiatAccountsLoading) {
        return
      }
      this.receiveDropdownVisible = !this.receiveDropdownVisible
      this.spendDropdownVisible = false
      this.accountDropdownVisible = false
    },

    selectSpendCurrency (currency) {
      this.spendCurrency = currency
      this.spendDropdownVisible = false
      // 币种变更时重新获取报价
      this.getExchangeQuote()
      console.log('选中数字货币:', currency, '余额:', this.currentBalance)
    },

    selectReceiveCurrency (currency) {
      this.receiveCurrency = currency
      this.receiveDropdownVisible = false
      // 币种变更时重新获取报价
      this.getExchangeQuote()
      console.log('选中法币:', currency)
    },

    handleClickOutside (event) {
      if (this.$refs.spendContainer && !this.$refs.spendContainer.contains(event.target)) {
        this.spendDropdownVisible = false
      }
      if (this.$refs.receiveContainer && !this.$refs.receiveContainer.contains(event.target)) {
        this.receiveDropdownVisible = false
      }
      if (this.$refs.accountContainer && !this.$refs.accountContainer.contains(event.target)) {
        this.accountDropdownVisible = false
      }
    },

    toggleAccountDropdown () {
      // 总是允许打开下拉框，即使没有账户也可以显示添加按钮
      this.accountDropdownVisible = !this.accountDropdownVisible
      this.spendDropdownVisible = false
      this.receiveDropdownVisible = false
    },

    selectAccount (account) {
      this.selectedAccountId = account.id
      this.accountDropdownVisible = false
      this.form.setFieldsValue({
        depositAccount: account.id
      })
    },

    onSpendAmountChange (e) {
      const value = e.target.value.replace(/,/g, '')
      if (!isNaN(value) && value !== '') {
        this.spendAmount = this.formatNumber(value)

        // 强制更新表单字段显示
        this.$nextTick(() => {
          this.form.setFieldsValue({
            spendAmount: this.spendAmount
          })
        })

        // 金额变更时重新计算接收金额（不调用接口）
        this.calculateReceiveAmount()
      } else if (value === '') {
        this.spendAmount = ''
        this.receiveAmount = ''
      }
    },

    calculateReceiveAmount () {
      // 根据当前汇率和手续费计算接收金额
      const amount = parseFloat(this.spendAmount.replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0 && this.exchangeRate && this.exchangeFee !== null) {
        const feeAmount = amount * (this.exchangeFee / 100)
        const netAmount = amount - feeAmount
        const convertedAmount = netAmount * this.exchangeRate
        this.receiveAmount = this.formatNumber(convertedAmount.toFixed(6))
      } else {
        this.receiveAmount = ''
      }
    },

    formatNumber (num) {
      return parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      })
    },

    formatBalance (balance) {
      return this.formatNumber(balance)
    },

    // Sell All 功能
    sellAll () {
      const fullBalance = this.currentBalance.toString()
      this.spendAmount = this.formatNumber(fullBalance)

      // 强制更新表单字段
      this.$nextTick(() => {
        this.form.setFieldsValue({
          spendAmount: this.spendAmount
        })
        // 触发表单字段更新事件
        this.form.validateFields(['spendAmount'], { force: true })
      })

      // 重新计算接收金额（不调用接口）
      this.calculateReceiveAmount()
    },

    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.currentStep = 'confirm'
        }
      })
    },

    goToExchangeHistory () {
      this.$router.push('/exchange/history')
    },

    // 跳转到添加地址页面
    goToAddAddress () {
      this.accountDropdownVisible = false // 关闭下拉框
      this.$router.push('/withdraw')
    },

    // 格式化日期时间
    formatDateTime (dateTimeStr) {
      if (!dateTimeStr) return ''
      const date = new Date(dateTimeStr)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style lang="less">
.main-input-group .ant-input[disabled]{
  background: #fff !important;
}
</style>

<style lang="less" scoped>
.exchange-page {
  min-height: calc(100vh - 64px);
  position: relative;
}

.result-btn {
  width: 100%;
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

  &:hover {
  }
}

.history-button {
  position: absolute;
  right: 120px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d9d9d9;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  text-align: left;
  margin-bottom: 32px;
}

.exchange-container, .confirm-container {
  background: white;
  border-radius: 12px;
  padding: 20px 32px;
  margin: 0 auto;
  max-width: 510px;
}

.confirm-container {
  max-width: 600px;
}

/* 原有样式保持不变 */
.exchange-section {
  margin-bottom: 32px;
}

.currency-input-container {
  position: relative;
}

.main-input-group {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
  transition: all 0.3s ease;
  position: relative;
  min-height: 100px;

  &.focused {
    border-color: #11253E;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  .input-label {
    font-size: 14px;
    color: #666;
    text-align: left;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .amount-input {
    border: none;
    box-shadow: none;
    padding: 0;
    font-size: 28px;
    font-weight: 600;
    padding-right: 130px;

    /deep/ .ant-input {
      border: none;
      box-shadow: none;
      padding: 0;
      font-size: 28px;
      font-weight: 600;
      color: #262626;

      &::placeholder {
        color: #bfbfbf;
      }

      &:focus {
        box-shadow: none;
      }
    }
  }

  .currency-selector {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    transition: all 0.2s ease;

    &:hover {
      // background: #e6f7ff;
    }

    .selected-currency, .loading-selected-currency {
      display: flex;
      align-items: center;
      gap: 8px;

      .currency-code {
        font-weight: 600;
        color: #262626;
        font-size: 14px;
      }
    }

    .loading-selected-currency {
      color: #8c8c8c;
      font-size: 12px;
    }

    .dropdown-arrow {
      color: #bfbfbf;
      transition: transform 0.3s ease;
      font-size: 12px;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    &:hover {
    }
  }
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;

  .loading-option {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #8c8c8c;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f5f5f5;
    }

    &.selected {
      background-color: #e6f7ff;

      .currency-code {
        color: #11253E;
        font-weight: 600;
      }
    }

    .currency-details {
      display: flex;
      flex-direction: column;

      .currency-code {
        font-weight: 600;
        color: #262626;
        font-size: 14px;
        line-height: 1.2;
      }

      .currency-name {
        color: #8c8c8c;
        font-size: 12px;
        line-height: 1.2;
      }
    }
  }
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 4px;

  .balance-text {
    color: #8c8c8c;
    font-size: 14px;
  }

  .sell-all-link {
    color: #11253E;
    font-size: 14px;
    text-decoration: none;

    &:hover {
      color: #40a9ff;
      text-decoration: underline;
    }
  }
}

.currency-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.custom-dropdown {
  .currency-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}

.exchange-info {
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 32px;

  .rate-info,
  .fee-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-icon {
      color: #8c8c8c;
      font-size: 14px;
    }

    .rate-text,
    .fee-text {
      color: #8c8c8c;
      font-size: 14px;
    }
  }
}

/* 新的账户选择部分样式 */
.account-section {
  margin-bottom: 32px;

  .section-header {
    text-align: left;
    margin-bottom: 16px;

    .section-label {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
  }
}

/* 账户选择容器 */
.account-selection-container {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  overflow: visible;
}

/* 主选择框 */
.account-main-selector {
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.focused {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    border-radius: 12px;
  }

  &:hover {
    background-color: #fafafa;
  }

  .selector-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .selector-text {
      font-size: 16px;
      color: #262626;
      font-weight: 500;

      &.placeholder {
        color: #bfbfbf;
        font-weight: 400;
      }
    }

    .dropdown-arrow {
      color: #bfbfbf;
      transition: transform 0.3s ease;
      font-size: 12px;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
}

/* 下拉选项列表 */
.account-options-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

/* 账户选项项 */
.account-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;

  &:last-of-type {
    border-bottom: 1px solid #e0e0e0;
  }

  &:hover {
    background-color: #f5f5f5;
  }

  &.selected {
    // background-color: #e6f7ff;

    .account-name {

      font-weight: 600;
    }
  }

  .account-item-content {
    flex: 1;

    .account-main-info {
      margin-bottom: 4px;

      .account-name {
        font-size: 16px;
        font-weight: 500;
        color: #262626;
        line-height: 1.2;
      }
    }

    .account-number {
      font-size: 14px;
      color: #8c8c8c;
      line-height: 1.2;
    }
  }

  .selected-indicator {
    font-size: 16px;
    margin-left: 12px;
  }
}

/* 添加地址选项 */
.add-address-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #1890ff;
  font-weight: 500;

  &:hover {
    background-color: #f0f9ff;
  }

  .add-icon {
    font-size: 16px;
  }

  .add-text {
    font-size: 16px;
  }
}

/* 空状态样式 */
.empty-address-state {
  text-align: center;
  padding: 20px 20px;
  box-shadow: 0px 1px 10px 0px rgba(211, 215, 219, 0.5);
  border-radius: 8px;
  // background: #fafafa;
  margin-top: 16px;
}

.empty-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.search-icon {
  opacity: 0.5;
}

.empty-text {
  color: #8c8c8c;
  font-size: 16px;
  margin-bottom: 20px;
}

.add-address-btn {
  background: #1f2937;
  border-color: #1f2937;
  color: white;
  height: 40px;
  padding: 0 24px;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    background: #374151;
    border-color: #374151;
  }

  .anticon {
    margin-right: 8px;
  }
}

.submit-section {
  .exchange-button {
    height: 56px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    border: none;

    &:disabled {
      background: #bfbfbf;
      color: white;
    }
  }
}

/* 确认订单页面样式 */
.confirm-content {
  .transaction-summary {
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
    }
  }

  .note {
    color: #8c8c8c;
    font-size: 12px;
    margin: 24px 0;
    text-align: left;
  }

  .confirm-buttons {
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
    }
  }
}

/* 订单详情样式 */
.order-details {
  text-align: left;
  margin: 24px 0;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.detail-value {
  color: #262626;
  font-size: 14px;
  font-weight: 400;
  text-align: right;
  word-break: break-all;
}

/* 结果页面样式 */
.result-container {
  text-align: center;
  padding: 60px 32px;
  margin: 0 auto;
  max-width: 600px;

  .result-icon {
    margin-bottom: 24px;

    .anticon {
      font-size: 64px;
    }
  }

  .result-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
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

    .contact-link {
      color: #11253E;
      padding: 0;
    }
  }

  &.success {
    .result-icon .anticon {
      color: #52c41a;
    }

    .result-title {
      color: #262626;
    }
  }

  &.failed {
    .result-icon .anticon {
      color: #ff4d4f;
    }

    .result-title {
      color: #262626;
    }
  }
}
</style>
