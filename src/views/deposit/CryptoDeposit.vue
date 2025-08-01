<template>
  <div class="deposit-crypto">
    <!-- Step 1: Select Coin -->
    <div class="step-item">
      <div class="step-header">
        <div class="step-number active">1</div>
        <div class="step-content">
          <h3 class="step-title">Select Coin</h3>
          <p class="step-description">Choose the cryptocurrency you want to deposit</p>
        </div>
      </div>

      <div class="step-body">
        <a-select
          v-model="crypto.selectedCoin"
          placeholder="Select a coin"
          style="width: 100%"
          size="large"
          @change="handleCoinChange"
          :loading="!accountsData.length"
        >
          <a-select-option
            v-for="account in accountsData"
            :key="account.crypto_currency_id"
            :value="account.crypto_currency_id"
          >
            <div class="coin-option">
              <div class="coin-icon">
                <img
                  style="width:100%"
                  :src="getCoinIcon(account.crypto_currency_id)"
                  :alt="getCoinName(account.crypto_currency_id)"
                  @error="handleImageError"
                />
              </div>
              <div class="coin-info">
                <div class="coin-name">{{ getCoinName(account.crypto_currency_id) }}</div>
                <div class="coin-full-name">{{ getCoinFullName(account.crypto_currency_id) }}</div>
              </div>
            </div>
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- Step 2: Select Network -->
    <div class="step-item">
      <div class="step-header">
        <div class="step-number" :class="{ active: crypto.selectedCoin, completed: crypto.selectedCoin }">2</div>
        <div class="step-content">
          <h3 class="step-title">Select Network</h3>
          <p class="step-description">
            Please select the same network as on the platform you are sending your assets to for coin filling.
            <a href="#" class="learn-more">Learn more →</a>
          </p>
        </div>
      </div>

      <div class="step-body" v-if="crypto.selectedCoin">
        <a-select
          v-model="crypto.selectedNetwork"
          placeholder="Select a network"
          style="width: 100%"
          size="large"
          @change="handleNetworkChange"
          :loading="isCreatingAddress"
        >
          <a-select-option v-for="network in availableNetworks" :key="network.value" :value="network.value">
            {{ network.label }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- Step 3: Deposit Address -->
    <div class="step-item">
      <div class="step-header">
        <div class="step-number" :class="{ active: crypto.selectedNetwork && crypto.walletAddress, completed: crypto.selectedNetwork && crypto.walletAddress }">3</div>
        <div class="step-content">
          <h3 class="step-title">Deposit Address</h3>
          <p class="step-description" v-if="crypto.selectedNetwork">Send cryptocurrency directly to your merchant wallet address</p>
        </div>
      </div>

      <div class="step-body" v-if="crypto.selectedNetwork && crypto.walletAddress">
        <div class="address-container">
          <div class="qr-section">
            <div class="qr-code">
              <div class="qr-placeholder" v-if="!qrCodeDataUrl">
                <div class="qr-mock"></div>
              </div>
              <img v-else :src="qrCodeDataUrl" alt="QR Code" />
            </div>
          </div>

          <div class="address-section">
            <div class="address-title">{{ getCoinName(crypto.selectedCoin) }} wallet address</div>
            <div class="address-input-group">
              <a-input
                :value="crypto.walletAddress"
                readonly
                size="large"
                class="address-input"
              />
              <a-button
                type="default"
                size="large"
                class="copy-btn"
                @click="copyAddress"
              >
                <a-icon type="copy" />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Awaiting Deposit Credited -->
    <div class="step-item">
      <div class="step-header">
        <div class="step-number" :class="{ active: crypto.selectedNetwork && crypto.walletAddress, completed: crypto.selectedNetwork && crypto.walletAddress }">4</div>
        <div class="step-content">
          <h3 class="step-title">Awaiting Deposit Credited</h3>
          <p class="step-description" v-if="crypto.selectedNetwork && crypto.walletAddress">
            After the deposit operation is completed, the platform will notify you of the status of your deposit order via email and SMS, so please keep an eye on it.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import { request } from '@/api/_service'
import { mapGetters } from 'vuex'

export default {
  name: 'CryptoDeposit',
  data () {
    return {
      isCreatingAddress: false,
      qrCodeDataUrl: '',
      crypto: {
        selectedCoin: '',
        selectedNetwork: '',
        walletAddress: ''
      },
      // 存储账户信息
      accountsData: [],
      // 网络选项 - 动态生成或者保持部分硬编码
      networkOptions: {
        // 'USDT_TRC': [
        //   { value: 'USDT-TRC20', label: 'TRC20' }
        // ],
        // 'USDC_TRC': [
        //   { value: 'USDC-TRC20', label: 'TRC20' }
        // ]
      },
      // 币种图标映射 - 参考第二个页面的方式
      coinIconMap: {
        'USDT-TRC': require('@/assets/icons/usdt.png'),
        'USDC-TRC': require('@/assets/icons/usdc.png'),
        'USDT': require('@/assets/icons/usdt.png'),
        'USDC': require('@/assets/icons/usdc.png'),
        'BTC': require('@/assets/icons/btc.png')
        // 'ETH': require('@/assets/icons/eth.png'),
        // 'TRX': require('@/assets/icons/trx.png')
      },
      // 币种全名映射
      coinFullNames: {
        'USDT': 'Tether',
        'USDT_TRC': 'Tether',
        'USDC': 'USD Coin',
        'USDC_TRC': 'USD Coin',
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'TRX': 'Tron'
      },
      // URL参数
      urlParams: {
        coinId: '',
        coinSymbol: '',
        network: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'getMainMerchant'
    ]),
    availableNetworks () {
      return this.crypto.selectedCoin ? this.networkOptions[this.crypto.selectedCoin] || [] : []
    }
  },
  async mounted () {
    // 获取URL参数
    this.getUrlParams()

    // 页面加载时获取账户信息
    await this.fetchAccountsInfo()

    // 如果有URL参数，自动选中对应币种
    this.autoSelectCoinFromUrl()
  },
  methods: {
    // 获取URL参数
    getUrlParams () {
      const query = this.$route.query
      this.urlParams = {
        coinId: query.coinId || '',
        coinSymbol: query.coinSymbol || '',
        network: query.network || ''
      }
      console.log('Deposit page URL params:', this.urlParams)
    },

    // 根据URL参数自动选中币种
    autoSelectCoinFromUrl () {
      if (!this.urlParams.coinId || !this.accountsData.length) {
        return
      }

      // 查找匹配的账户
      const targetAccount = this.accountsData.find(account =>
        account.crypto_currency_id === this.urlParams.coinId
      )

      if (targetAccount) {
        console.log('Auto selecting coin from URL:', targetAccount.crypto_currency_id)
        this.crypto.selectedCoin = targetAccount.crypto_currency_id

        // 自动选择网络（如果有）
        this.$nextTick(() => {
          const networks = this.availableNetworks
          if (networks.length > 0) {
            // 优先选择URL中指定的网络，否则选择第一个
            const targetNetwork = networks.find(net =>
              net.label === this.urlParams.network ||
              net.value.includes(this.urlParams.network)
            )
            if (targetNetwork) {
              this.crypto.selectedNetwork = targetNetwork.value
              this.handleNetworkChange(targetNetwork.value)
            } else if (networks.length === 1) {
              // 如果只有一个网络选项，自动选中
              this.crypto.selectedNetwork = networks[0].value
              this.handleNetworkChange(networks[0].value)
            }
          }
        })
      }
    },

    // 获取账户信息
    async fetchAccountsInfo () {
      try {
        const response = await request({
          url: `/merchant/crypto/v2/accounts?type=1&merchant_id=${localStorage.getItem('currentMerchantId')}`,
          method: 'GET'
        })

        if (response.code === 200 && response.data) {
          this.accountsData = response.data
          console.log('Accounts info loaded:', this.accountsData)

          // 动态生成网络选项
          this.generateNetworkOptions()

          // 账户数据加载完成后，尝试自动选中币种
          this.autoSelectCoinFromUrl()
        } else {
          console.error('Failed to load accounts info:', response.message)
        }
      } catch (error) {
        console.error('Failed to fetch accounts info:', error)
      }
    },

    // 根据账户数据动态生成网络选项
    generateNetworkOptions () {
      const options = {}
      this.accountsData.forEach(account => {
        const currencyId = account.crypto_currency_id
        // 这里可以根据实际的数据结构来设置网络选项
        // 假设每个币种都有对应的网络信息，可以从 account 对象中获取
        if (currencyId.includes('TRC')) {
          options[currencyId] = [{ value: `${this.getCoinName(currencyId)}-TRC20`, label: 'TRC20' }]
        } else if (currencyId.includes('ERC')) {
          options[currencyId] = [{ value: `${this.getCoinName(currencyId)}-ERC20`, label: 'ERC20' }]
        } else {
          // 默认网络选项
          // options[currencyId] = [{ value: `${this.getCoinName(currencyId)}-MAIN`, label: 'Main Network' }]
        }
      })

      // 合并动态生成的选项和硬编码的选项
      this.networkOptions = { ...this.networkOptions, ...options }
    },

    // 获取币种图标 - 参考第二个页面的实现
    getCoinIcon (cryptoCurrencyId) {
      console.log(cryptoCurrencyId, 123123)
      // 先尝试完整匹配
      if (this.coinIconMap[cryptoCurrencyId]) {
        return this.coinIconMap[cryptoCurrencyId]
      }

      // 再尝试基础符号匹配
      const baseSymbol = this.getCoinName(cryptoCurrencyId)
      if (this.coinIconMap[baseSymbol]) {
        return this.coinIconMap[baseSymbol]
      }

      // 默认返回USDT图标
      return this.coinIconMap['USDT']
    },

    // 获取币种名称
    getCoinName (cryptoCurrencyId) {
      if (!cryptoCurrencyId) return ''
      // 提取币种名称，比如 USDT_TRC -> USDT
      return cryptoCurrencyId.split('_')[0]
    },

    // 获取币种全名
    getCoinFullName (cryptoCurrencyId) {
      const coinName = this.getCoinName(cryptoCurrencyId)
      return this.coinFullNames[cryptoCurrencyId] || this.coinFullNames[coinName] || coinName
    },

    // 图片加载失败处理
    handleImageError (event) {
      // 图片加载失败时，使用默认的USDT图标
      event.target.src = this.coinIconMap['USDT']
    },

    handleCoinChange (value) {
      this.crypto.selectedCoin = value
      this.crypto.selectedNetwork = ''
      this.crypto.walletAddress = ''
      this.qrCodeDataUrl = ''
    },

    async handleNetworkChange (value) {
      this.crypto.selectedNetwork = value
      await this.createDepositAddress()
    },

    // 创建充值地址
    async createDepositAddress () {
      if (!this.crypto.selectedCoin || !this.crypto.selectedNetwork) return

      this.isCreatingAddress = true
      try {
        // 获取选中币种对应的账户ID
        const selectedAccount = this.accountsData.find(account => account.crypto_currency_id === this.crypto.selectedCoin)
        let accountId = ''
        let merchantId = ''

        if (selectedAccount) {
          accountId = selectedAccount.id
        }

        // 从localStorage获取用户信息
        if (localStorage.getItem('currentMerchantId')) {
          try {
            merchantId = localStorage.getItem('currentMerchantId') || ''
          } catch (parseError) {
            console.error('Failed to parse userInfo from localStorage:', parseError)
          }
        }

        // 调用创建充值地址接口
        const response = await request({
          url: '/merchant/crypto/v2/deposit/create',
          method: 'POST',
          data: {
            gateway_currency_id: selectedAccount.gateway_currency_id,
            account_id: accountId,
            merchant_id: merchantId
          }
        })

        if (response.code === 200) {
          this.crypto.walletAddress = response.data.wallet_address || response.data.address
          await this.generateQRCode()
          this.$message.success('Address created successfully')
        } else {
          this.$message.error(response.message || response.msg || 'Failed to create address')
        }
      } catch (error) {
        console.error('Create address failed:', error)
        this.$message.warning('Using fallback address')
      } finally {
        this.isCreatingAddress = false
      }
    },

    // 生成二维码
    async generateQRCode () {
      if (!this.crypto.walletAddress) return

      try {
        const url = await QRCode.toDataURL(this.crypto.walletAddress, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        this.qrCodeDataUrl = url
      } catch (error) {
        console.error('Generate QR code failed:', error)
        this.$message.error('Failed to generate QR code')
      }
    },

    copyAddress () {
      if (this.crypto.walletAddress) {
        navigator.clipboard.writeText(this.crypto.walletAddress).then(() => {
          this.$message.success('Address copied to clipboard')
        }).catch(() => {
          this.$message.error('Failed to copy address')
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 通用步骤样式
.step-item {
  margin-bottom: 32px;
  position: relative;

  // 添加连接线
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 11px;
    top: 60px;
    width: 2px;
    height: calc(100% - 32px);
    background: #f0f0f0;
    z-index: 0;
  }

  .step-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;

    .step-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #f0f0f0;
      color: #bfbfbf;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      margin-right: 16px;
      flex-shrink: 0;
      margin-top: 4px;

      &.active, &.completed {
        background: #11253E;
        color: #fff;
      }
    }

    .step-content {
      flex: 1;

      .step-title {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }

      .step-description {
        margin: 0;
        color: #8c8c8c;
        font-size: 14px;
        line-height: 1.5;

        .learn-more {
          color: #11253E;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .step-body {
    margin-left: 40px;
  }
}

// 币种选项样式
.coin-option {
  display: flex;
  align-items: center;
  gap: 12px;

  .coin-icon {
    width: 24px;
    height: 24px;
    display: flex;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .coin-info {
    .coin-name {
      font-weight: 600;
      color: #262626;
    }

    .coin-full-name {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}

// 选择框选中项样式覆盖
/deep/ .ant-select-selection-selected-value {
  display: flex !important;
  align-items: center !important;

  .coin-option {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;

    .coin-info {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;

      .coin-name {
        margin-right: 0 !important;
        font-weight: 600;
      }

      .coin-full-name {
        color: #8c8c8c;
        font-size: 12px;
      }
    }
  }
}

// 修复下拉选项样式
/deep/ .ant-select-dropdown {
  .ant-select-dropdown-menu-item {
    padding: 12px 16px;

    .coin-option {
      .coin-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
    }
  }
}

// 地址容器样式
.address-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;

  .qr-section {
    .qr-code {
      width: 120px;
      height: 120px;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;

      .qr-mock {
        width: 80px;
        height: 80px;
        background:
          repeating-linear-gradient(
            0deg,
            #000 0px, #000 4px,
            transparent 4px, transparent 8px
          ),
          repeating-linear-gradient(
            90deg,
            #000 0px, #000 4px,
            transparent 4px, transparent 8px
          );
      }

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }

  .address-section {
    flex: 1;

    .address-title {
      margin-bottom: 12px;
      font-weight: 600;
      color: #262626;
    }

    .address-input-group {
      display: flex;
      gap: 8px;

      .address-input {
        flex: 1;
        font-family: monospace;
        font-size: 13px;
      }

      .copy-btn {
        flex-shrink: 0;
      }
    }
  }
}

// 下拉菜单样式
/deep/ .ant-select-dropdown {
  .ant-select-dropdown-menu-item {
    padding: 12px 16px;
  }
}

// 响应式样式
@media (max-width: 768px) {
  .address-container {
    flex-direction: column;
    gap: 16px;

    .qr-section .qr-code {
      width: 100px;
      height: 100px;
      margin: 0 auto;
    }
  }
}
</style>
