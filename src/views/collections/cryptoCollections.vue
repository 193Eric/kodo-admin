<template>
  <div class="crypto-collections">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">Crypto Collections</h1>
      <a-button type="link" class="history-btn">
        <a-icon type="history" />
        Collection History
      </a-button>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model="activeTab" class="collection-tabs">
      <a-tab-pane key="single" tab="Single Collection" />
      <a-tab-pane key="batch" tab="Batch Collection" />
      <a-tab-pane key="digital" tab="数币收单" />
    </a-tabs>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧步骤区域 -->
      <div class="steps-section">
        <!-- 步骤1：选择币种和网络 -->
        <div class="step-item">
          <div class="step-number-container">
            <div class="step-number">1</div>
            <div style="height:156px" class="step-line"></div>
          </div>
          <div class="step-content">
            <h3 class="step-title">Select Coin & Network</h3>
            <p class="step-desc">Choose the cryptocurrency you want to collection</p>

            <!-- 币种选择 -->
            <div class="form-item">
              <label class="form-label">Coin for Collection</label>
              <a-select
                v-model="selectedCoin"
                placeholder="Select coin"
                class="coin-select"
                @change="handleCoinChange"
              >
                <a-select-option value="USDT">
                  <span class="coin-option">
                    <div class="coin-icon usdt">
                      <img style="width:100%" src="@/assets/icons/usdt.png" />
                    </div>
                    USDT
                  </span>
                </a-select-option>
                <a-select-option value="USDC">
                  <span class="coin-option">
                    <div class="coin-icon usdc">
                      <img style="width:100%" src="@/assets/icons/usdc.png" />
                    </div>
                    USDC
                  </span>
                </a-select-option>
                <a-select-option value="BTC">
                  <span class="coin-option">
                    <div class="coin-icon btc">
                      <img style="width:100%" src="@/assets/icons/btc.png" />
                    </div>
                    BTC
                  </span>
                </a-select-option>
                <a-select-option value="ETH">
                  <span class="coin-option">
                    <div class="coin-icon eth">
                      <!-- <img style="width:100%" src="@/assets/icons/eth.png" /> -->
                    </div>
                    ETH
                  </span>
                </a-select-option>
              </a-select>
            </div>

            <!-- 网络选择 -->
            <div class="form-item">
              <label class="form-label">Network</label>
              <a-select
                v-model="selectedNetwork"
                placeholder="Select network"
                class="network-select"
                @change="handleNetworkChange"
              >
                <a-select-option
                  v-for="network in availableNetworks"
                  :key="network.value"
                  :value="network.value"
                >
                  {{ network.label }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>

        <!-- 步骤2：输入金额 -->
        <div class="step-item">
          <div class="step-number-container">
            <div class="step-number">2</div>
            <div :style="{ height: collectionMethod === 'payment-link' ? '240px' : '120px' }" class="step-line"></div>
          </div>
          <div class="step-content">
            <h3 class="step-title">Enter Amount</h3>

            <div class="form-item">
              <a-input-number
                v-model="amount"
                :min="0"
                :precision="2"
                :formatter="value => `${value} ${selectedCoin}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/[^\d.]/g, '')"
                placeholder="Enter amount"
                class="amount-input"
                @change="handleAmountChange"
              />
            </div>
          </div>
        </div>

        <!-- 步骤3：选择收款方式 -->
        <div class="step-item">
          <div class="step-number-container">
            <div class="step-number">3</div>
          </div>
          <div class="step-content">
            <h3 class="step-title">Select Collection Method</h3>

            <!-- 收款方式选择 -->
            <div class="collection-methods">
              <div
                class="method-option"
                :class="{ 'active': collectionMethod === 'static-address' }"
                @click="collectionMethod = 'static-address'"
              >
                <a-icon type="lock" class="method-icon" />
                <span class="method-text">Static Address</span>
                <div class="method-check" v-if="collectionMethod === 'static-address'">
                  <a-icon type="check" />
                </div>
              </div>

              <div
                class="method-option"
                :class="{ 'active': collectionMethod === 'payment-link' }"
                @click="collectionMethod = 'payment-link'"
              >
                <a-icon type="link" class="method-icon" />
                <span class="method-text">Payment Link</span>
                <div class="method-check" v-if="collectionMethod === 'payment-link'">
                  <a-icon type="check" />
                </div>
              </div>
            </div>

            <!-- Payment Link 额外选项 -->
            <div v-if="collectionMethod === 'payment-link'" class="payment-link-options">
              <!-- 备注 -->
              <div class="form-item">
                <label class="form-label">Remark</label>
                <a-input
                  v-model="remark"
                  placeholder="Project payment"
                  class="remark-input"
                />
                <div class="remark-tags">
                  <a-tag
                    v-for="tag in remarkTags"
                    :key="tag"

                    class="remark-tag"
                    @click="remark = tag"
                  >
                    {{ tag }}
                  </a-tag>
                </div>
              </div>

              <!-- 过期时间 -->
              <div class="form-item">
                <label class="form-label">Expiry Time</label>
                <a-select
                  v-model="expiryTime"
                  placeholder="Select expiry time"
                  class="expiry-select"
                >
                  <a-select-option value="1h">1h</a-select-option>
                  <a-select-option value="6h">6h</a-select-option>
                  <a-select-option value="24h">24h</a-select-option>
                  <a-select-option value="7d">7d</a-select-option>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧显示区域 -->
      <div class="display-section">
        <!-- Static Address 模式 -->
        <div v-if="collectionMethod === 'static-address'" class="address-card">
          <h3 class="card-title">Static Address</h3>

          <!-- 二维码 -->
          <div class="qr-code-container">
            <div ref="qrcode" class="qr-code"></div>
          </div>

          <!-- 网络信息 -->
          <div class="network-info">
            <span class="network-text">Network: {{ selectedNetwork }}</span>
            <span class="divider">|</span>
            <span class="last-tx">Last tx: {{ lastTxTime }}</span>
          </div>

          <!-- 地址信息 -->
          <div class="address-info">
            <label class="address-label">Address</label>
            <div class="address-text">{{ walletAddress }}</div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <a-button
              type="primary"
              size="large"
              block
              class="copy-btn"
              @click="copyAddress"
            >
              <a-icon type="copy" />
              Copy Address
            </a-button>

            <a-button
              type="link"
              class="download-btn"
              @click="downloadQRCode"
            >
              <a-icon type="download" />
              Download QR Code
            </a-button>
          </div>
        </div>

        <!-- Payment Link 模式 -->
        <div v-if="collectionMethod === 'payment-link'" class="payment-card">
          <h3 class="card-title">Payment Link</h3>

          <!-- 二维码 -->
          <div class="qr-code-container">
            <div ref="paymentQrcode" class="qr-code"></div>
          </div>

          <!-- 网络信息 -->
          <div class="network-info">
            <span class="network-text">Network: {{ selectedNetwork }}</span>
            <span class="divider">|</span>
            <span class="amount-text">{{ amount }}{{ selectedCoin }}</span>
          </div>

          <!-- 链接信息 -->
          <div class="link-info">
            <div class="link-row">
              <span class="link-label">URL</span>
              <span class="expiry-badge">{{ expiryTime }}</span>
            </div>
            <div class="link-text">{{ paymentUrl }}</div>
            <div class="link-desc">"{{ remark || 'Project payment' }}"</div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <a-button
              type="primary"
              size="large"
              block
              class="copy-btn"
              @click="copyPaymentLink"
            >
              <a-icon type="copy" />
              Copy Link
            </a-button>

            <a-button
              type="link"
              class="download-btn"
              @click="downloadQRCode"
            >
              <a-icon type="download" />
              Download QR Code
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'CryptoCollections',
  data () {
    return {
      activeTab: 'single',
      selectedCoin: 'USDT',
      selectedNetwork: 'TRC-20',
      amount: 1000,
      collectionMethod: 'static-address', // 'static-address' 或 'payment-link'
      remark: 'Project payment',
      expiryTime: '24h',
      lastTxTime: '2 hours ago',
      walletAddress: '0x8920d5a7f23e1234567890abcdef1234567890C3A1',
      paymentUrl: 'pay.crypto.com/invoice/123',

      remarkTags: ['Project payment', 'Final payment', 'Deposit', 'Bonus'],

      // 网络配置
      networkOptions: {
        USDT: [
          { label: 'TRC-20', value: 'TRC-20' },
          { label: 'ERC-20', value: 'ERC-20' },
          { label: 'BEP-20', value: 'BEP-20' }
        ],
        USDC: [
          { label: 'ERC-20', value: 'ERC-20' },
          { label: 'BEP-20', value: 'BEP-20' },
          { label: 'Polygon', value: 'POLYGON' }
        ],
        BTC: [
          { label: 'Bitcoin', value: 'BTC' }
        ],
        ETH: [
          { label: 'Ethereum', value: 'ETH' }
        ]
      }
    }
  },

  computed: {
    availableNetworks () {
      return this.networkOptions[this.selectedCoin] || []
    },

    qrCodeContent () {
      if (this.collectionMethod === 'static-address') {
        // 静态地址二维码只包含地址信息
        return this.walletAddress
      } else {
        // 支付链接二维码包含完整的支付URL
        return this.paymentUrl
      }
    }
  },

  mounted () {
    this.generateQRCode()
  },

  watch: {
    qrCodeContent () {
      this.generateQRCode()
    },

    collectionMethod () {
      this.generateQRCode()
    }
  },

  methods: {
    handleCoinChange (value) {
      // 切换币种时重置网络选择
      const networks = this.networkOptions[value]
      if (networks && networks.length > 0) {
        this.selectedNetwork = networks[0].value
      }
      this.updateWalletAddress()
      this.updatePaymentUrl()
    },

    handleNetworkChange () {
      this.updateWalletAddress()
      this.updatePaymentUrl()
    },

    handleAmountChange () {
      this.updatePaymentUrl()
    },

    updateWalletAddress () {
      // 模拟根据币种和网络生成不同的钱包地址
      const addresses = {
        'USDT-TRC-20': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        'USDT-ERC-20': '0x8920d5a7f23e1234567890abcdef1234567890C3A1',
        'USDT-BEP-20': '0x8920d5a7f23e1234567890abcdef1234567890C3A1',
        'USDC-ERC-20': '0x8920d5a7f23e1234567890abcdef1234567890C3A1',
        'USDC-BEP-20': '0x8920d5a7f23e1234567890abcdef1234567890C3A1',
        'USDC-POLYGON': '0x8920d5a7f23e1234567890abcdef1234567890C3A1',
        'BTC-BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'ETH-ETH': '0x8920d5a7f23e1234567890abcdef1234567890C3A1'
      }

      const key = `${this.selectedCoin}-${this.selectedNetwork}`
      this.walletAddress = addresses[key] || addresses['USDT-TRC-20']
    },

    updatePaymentUrl () {
      // 模拟生成支付链接
      const invoiceId = Math.random().toString(36).substr(2, 9)
      this.paymentUrl = `pay.crypto.com/invoice/${invoiceId}`
    },

    async generateQRCode () {
      try {
        const canvas = await QRCode.toCanvas(this.qrCodeContent, {
          width: 160,
          margin: 2,
          color: {
            dark: '#11253E',
            light: '#FFFFFF'
          }
        })

        // 清空之前的二维码
        const container = this.collectionMethod === 'static-address'
          ? this.$refs.qrcode
          : this.$refs.paymentQrcode

        if (container) {
          container.innerHTML = ''
          container.appendChild(canvas)
        }
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    },

    async copyAddress () {
      try {
        await navigator.clipboard.writeText(this.walletAddress)
        this.$message.success('地址已复制到剪贴板')
      } catch (error) {
        this.fallbackCopy(this.walletAddress)
      }
    },

    async copyPaymentLink () {
      try {
        await navigator.clipboard.writeText(this.paymentUrl)
        this.$message.success('支付链接已复制到剪贴板')
      } catch (error) {
        this.fallbackCopy(this.paymentUrl)
      }
    },

    fallbackCopy (text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      this.$message.success('已复制到剪贴板')
    },

    downloadQRCode () {
      const container = this.collectionMethod === 'static-address'
        ? this.$refs.qrcode
        : this.$refs.paymentQrcode

      const canvas = container?.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        const filename = this.collectionMethod === 'static-address'
          ? `${this.selectedCoin}-${this.selectedNetwork}-Address-QRCode.png`
          : `${this.selectedCoin}-${this.selectedNetwork}-Payment-QRCode.png`

        link.download = filename
        link.href = canvas.toDataURL()
        link.click()
        this.$message.success('二维码已下载')
      }
    }
  }
}
</script>

<style scoped>
.crypto-collections {
  min-height: 100vh;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.history-btn {
  font-size: 14px;
  color: #11253e;
}

.history-btn:hover {
  color: #1a3554;
}

.history-btn >>> .anticon {
  margin-right: 8px;
}

.collection-tabs {
  background: white;
  border-radius: 8px;
  padding: 0 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.collection-tabs >>> .ant-tabs-bar {
  border-bottom: 1px solid #f0f0f0;
}

.collection-tabs >>> .ant-tabs-tab {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  display: flex;
  gap: 24px;
}

.steps-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step-item {
  display: flex;
  margin-bottom: 16px;
  position: relative;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  flex-shrink: 0;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #11253e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  position: relative;
  z-index: 2;
  border: 1px solid #e8e8e8;
}

.step-line {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  background-color: #e8e8e8;
  transition: height 0.3s ease;
}

.step-item:last-child .step-line {
  display: none;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px 0;
}

.step-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 16px 0;
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
  font-weight: 500;
}

.coin-select,
.network-select {
  width: 300px;
}

.coin-option {
  display: flex;
  align-items: center;
}

.coin-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  overflow: hidden;
}

.coin-icon.usdt {
  background-color: #26a17b;
}

.coin-icon.usdc {
  background-color: #2775ca;
}

.coin-icon.btc {
  background-color: #f7931a;
}

.coin-icon.eth {
  background-color: #627eea;
}

.amount-input {
  width: 300px;
  margin: 10px 0;
}

.amount-input >>> .ant-input-number-input {
  font-size: 16px;
  font-weight: 500;
}

/* 收款方式选择 */
.collection-methods {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.method-option {
  flex: 1;
  max-width: 140px;
  height: 80px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: #fafafa;
}

.method-option:hover {
  border-color: #d1d5db;
  background: #f5f5f5;
}

.method-option.active {
  border-color: #11253e;
  background: #f0f7ff;
}

.method-icon {
  font-size: 20px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.method-option.active .method-icon {
  color: #11253e;
}

.method-text {
  font-size: 12px;
  color: #595959;
  font-weight: 500;
}

.method-option.active .method-text {
  color: #11253e;
}

.method-check {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #11253e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Payment Link 选项 */
.payment-link-options {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.remark-input {
  width: 300px;
  margin-bottom: 8px;
}

.remark-tags {
  display: flex;
  color: #000;;
  gap: 8px;
  flex-wrap: wrap;
}

.remark-tag {
  cursor: pointer;
  margin: 0;
}

.expiry-select {
  width: 300px;
}

/* 右侧显示区域 */
.display-section {
  width: 360px;
}

.address-card,
.payment-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 24px 0;
  text-align: center;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.qr-code {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.network-info {
  text-align: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 24px;
}

.network-text,
.amount-text {
  font-weight: 500;
}

.divider {
  margin: 0 8px;
}

.address-info,
.link-info {
  margin-bottom: 24px;
}

.address-label {
  display: block;
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
  font-weight: 500;
}

.address-text,
.link-text {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
  font-size: 13px;
  color: #262626;
  word-break: break-all;
  line-height: 1.4;
}

.link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.link-label {
  font-size: 14px;
  color: #595959;
  font-weight: 500;
}

.expiry-badge {
  background: #f0f0f0;
  color: #595959;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.link-desc {
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 8px;
  font-style: italic;
}

.copy-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  background-color: #11253e;
  border-color: #11253e;
}

.copy-btn:hover {
  background-color: #1a3554;
  border-color: #1a3554;
}

.copy-btn >>> .anticon {
  margin-right: 8px;
}

.download-btn {
  width: 100%;
  color: #11253e;
}

.download-btn:hover {
  color: #1a3554;
}

.download-btn >>> .anticon {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .crypto-collections {
    padding: 16px;
  }

  .main-content {
    flex-direction: column;
  }

  .display-section {
    width: 100%;
  }

  .collection-methods {
    flex-direction: column;
  }

  .method-option {
    max-width: none;
    height: 60px;
    flex-direction: row;
    padding: 0 16px;
  }

  .method-icon {
    margin-bottom: 0;
    margin-right: 8px;
  }
}
</style>
