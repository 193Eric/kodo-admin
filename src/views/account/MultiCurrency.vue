<template>
  <div class="multi-currency-account">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">Multi-currency acct</h1>
      <a-button type="link" class="history-btn">
        <a-icon type="file-text" />
        Application History
      </a-button>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model="activeTab" class="account-tabs">
      <a-tab-pane key="digital" tab="Digital Accounts">
        <!-- Digital Accounts 内容 -->
        <div class="account-display-area">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <a-spin size="large" />
          </div>

          <!-- 账户卡片列表 -->
          <div v-else-if="accountsData.length > 0" class="accounts-grid">
            <div
              v-for="account in accountsData"
              :key="account.id"
              class="account-card"
              @mouseenter="setActiveCard(account.id)"
              @mouseleave="setActiveCard(null)"
            >
              <!-- 货币信息头部 -->
              <div class="currency-header">
                <div class="currency-info">
                  <div class="currency-icon">
                    <img
                      :src="getCoinIcon(account.crypto_currency_id)"
                      :alt="getCoinName(account.crypto_currency_id)"
                      @error="handleImageError"
                    />
                  </div>
                  <span class="currency-name">{{ getCoinName(account.crypto_currency_id) }}</span>
                </div>
                <div class="network-info">
                  <span class="network-label">{{ getNetworkLabel(account.crypto_currency_id) }}</span>
                </div>
              </div>

              <!-- 钱包地址 -->
              <div class="wallet-address-section" v-if="account.wallet_address">
                <div class="address-label">Wallet Address</div>
                <div class="address-input-group">
                  <div class="address-display">{{ formatAddress(account.wallet_address) }}</div>
                  <a-button
                    type="link"
                    size="small"
                    @click="copyAddress(account.wallet_address)"
                    class="copy-address-btn"
                  >
                    <a-icon type="copy" />
                  </a-button>
                </div>
              </div>

              <!-- 余额显示 -->
              <div class="balance-display">
                <h1 class="balance-amount">{{ formatBalance(account.balance.available) }}</h1>

                <div class="balance-change-info">
                  <div class="change-left">
                    <div class="received-amount">+{{ formatBalance(account.today_stats.deposit) }}</div>
                    <div class="received-label">Received today</div>
                  </div>
                  <div class="change-right">
                    <div class="percentage-change" :class="getPercentageClass(account)">
                      <a-icon :type="getPercentageIcon(account)" />
                      <span>{{ getPercentageChange(account) }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons" v-if="activeCardId === account.id">
                <a-button
                  type="primary"
                  size="small"
                  icon="download"
                  @click="goToDeposit(account)"
                >
                  Deposit
                </a-button>
                <a-button
                  size="small"
                  icon="upload"
                  style="margin-left: 8px;"
                  @click="goToWithdraw(account)"
                >
                  Withdrawal
                </a-button>
              </div>
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="empty-state">
            <a-empty description="No digital accounts found" />
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="virtual" tab="Virtual Account">
        <h2 style="margin-left: 20px;margin-top:10px; ">Coming soon</h2>
        <!-- Virtual Account 内容 -->
        <div v-if="false" class="account-display-area">
          <div v-if="!hasVirtualAccount" class="virtual-welcome-banner">
            <div class="banner-content">
              <div class="banner-text">
                <h2 class="banner-title">Open Virtual Account</h2>
                <p class="banner-description">
                  Global payments and receipts, directly to your multi-currency account in your name.
                  Click "Apply for Virtual Account" to start your cross-border payment business.
                </p>
                <div class="banner-actions">
                  <a-button
                    type="primary"
                    size="large"
                    @click="showVirtualApplicationModal = true"
                  >
                    Apply for Virtual Account
                  </a-button>
                  <a-button type="link" size="large">
                    Learn more
                  </a-button>
                </div>
              </div>
              <div class="banner-cards">
                <div class="region-card">
                  <div class="region-icon hk">
                    <span>*</span>
                  </div>
                  <div class="region-info">
                    <div class="region-name">Hong Kong</div>
                    <div class="region-desc">Mainstream multi-currency account</div>
                  </div>
                </div>
                <div class="region-card">
                  <div class="region-icon mx">
                    <a-icon type="file-text" />
                  </div>
                  <div class="region-info">
                    <div class="region-name">Mexico</div>
                    <div class="region-desc">MXN Mexican Peso</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 有账户时显示 -->
          <div v-else class="virtual-account-card" @mouseenter="showVirtualActions = true" @mouseleave="showVirtualActions = false">
            <!-- 银行信息头部 -->
            <div class="bank-header">
              <div class="bank-info">
                <div class="bank-name">FINXLEAP PARTNERS</div>
                <div class="account-number-row">
                  <span class="account-number">47411631737</span>
                  <span class="status-tag">Actived</span>
                </div>
              </div>
              <div class="account-actions">
                <a-icon type="user" class="account-icon" />
              </div>
            </div>

            <!-- 余额显示 -->
            <div class="balance-display">
              <h1 class="balance-amount">HKD 32,382.00</h1>

              <div class="region-info-bottom">
                <div class="region-icon hk-small">
                  <span>*</span>
                </div>
                <div class="region-details">
                  <div class="region-name">Hong Kong</div>
                  <div class="region-type">Multi-Currency</div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons" v-if="showVirtualActions">
              <a-button type="primary" size="small" icon="download">
                Deposit
              </a-button>
              <a-button size="small" icon="upload" style="margin-left: 8px;">
                Withdrawal
              </a-button>
              <a-button size="small" style="margin-left: 8px;">
                View Details
              </a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="institution" tab="Institution Account">
        <!-- Institution Account 内容 -->
        <div class="account-display-area">
          <!-- 没有账户时显示 -->
          <div v-if="!hasInstitutionAccount" class="institution-welcome-banner">
            <div class="banner-content">
              <div class="banner-text">
                <h2 class="banner-title">Open Institution Account</h2>
                <p class="banner-description">
                  Global payments and receipts, directly to your multi-currency account in your name.
                  Click "Apply for Virtual Account" to start your cross-border payment business.
                </p>
                <div class="banner-actions">
                  <a-button
                    type="primary"
                    size="large"
                    @click="showInstitutionApplicationModal = true"
                  >
                    Apply for Institution Account
                  </a-button>
                  <a-button type="link" size="large">
                    Learn more
                  </a-button>
                </div>
              </div>
              <div class="banner-cards">
                <div class="country-card">
                  <div class="country-icon hk">
                    <span>*</span>
                  </div>
                  <div class="country-info">
                    <div class="country-name">Hong Kong</div>
                    <div class="country-desc">Multi-Currency</div>
                  </div>
                </div>
                <div class="country-card">
                  <div class="country-icon co">
                    <span>🇨🇴</span>
                  </div>
                  <div class="country-info">
                    <div class="country-name">Colombian</div>
                    <div class="country-desc">COP Colombian Peso</div>
                  </div>
                  <div class="processing-tag">Processing</div>
                </div>
                <div class="country-card">
                  <div class="country-icon br">
                    <span>🇧🇷</span>
                  </div>
                  <div class="country-info">
                    <div class="country-name">Brazil</div>
                    <div class="country-desc">BRL Brazilian Real</div>
                  </div>
                </div>
                <div class="country-card">
                  <div class="country-icon ar">
                    <span>🇦🇷</span>
                  </div>
                  <div class="country-info">
                    <div class="country-name">Argentina</div>
                    <div class="country-desc">ARS Argentina Peso</div>
                  </div>
                </div>
                <div class="country-card">
                  <div class="country-icon pe">
                    <span>🇵🇪</span>
                  </div>
                  <div class="country-info">
                    <div class="country-name">Peru</div>
                    <div class="country-desc">PEN Peruvian</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 有账户时显示 -->
          <div v-else class="institution-account-card">
            <!-- 机构信息头部 -->
            <div class="institution-header">
              <div class="institution-info">
                <div class="institution-name">TechCorp Ltd.</div>
                <div class="account-number-row">
                  <span class="account-number">47411631737</span>
                  <span class="status-tag">Actived</span>
                </div>
              </div>
              <div class="account-actions">
                <a-icon type="bank" class="account-icon" />
              </div>
            </div>

            <!-- 余额显示 -->
            <div class="balance-display">
              <h1 class="balance-amount">COP 10,382.00</h1>

              <div class="country-info-bottom">
                <div class="country-icon co-small">
                  <span>🇨🇴</span>
                </div>
                <div class="country-details">
                  <div class="country-name">Colombian</div>
                  <div class="currency-type">Colombian Peso</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 底部说明和申请按钮区域 - 根据当前tab显示不同内容 -->
    <div class="bottom-section">
      <div class="section-content">
        <div class="info-text">
          <h3 class="section-title">{{ currentTabTitle }}</h3>
          <p class="section-description">
            Global payments and receipts, directly to your multi-currency account in your name.
            Click "Apply for {{ currentTabTitle === 'Digital Accounts' ? 'Digital Account' : currentTabTitle === 'Virtual Account' ? 'Virtual Account' : 'Institution Account' }}" to start your cross-border payment business.
          </p>
        </div>
        <a-button
          type="primary"
          size="large"
          @click="handleApplyClick"
          class="apply-button"
        >
          <a-icon type="plus" />
          Apply for {{ currentTabTitle === 'Digital Accounts' ? 'Digital Account' : currentTabTitle === 'Virtual Account' ? 'Virtual Account' : 'Institution Account' }}
        </a-button>
      </div>
    </div>

    <!-- 申请弹窗 -->
    <ApplicationModal
      :visible="showApplicationModal"
      @close="showApplicationModal = false"
    />

    <!-- Virtual Account申请弹窗 -->
    <VirtualApplicationModal
      :visible="showVirtualApplicationModal"
      @close="showVirtualApplicationModal = false"
    />

    <!-- Institution Account申请弹窗 -->
    <InstitutionApplicationModal
      :visible="showInstitutionApplicationModal"
      @close="showInstitutionApplicationModal = false"
    />
  </div>
</template>

<script>
import ApplicationModal from './ApplicationModal.vue'
import VirtualApplicationModal from './VirtualApplicationModal.vue'
import InstitutionApplicationModal from './InstitutionApplicationModal.vue'
import { request } from '@/api/_service'
import { mapGetters } from 'vuex'

export default {
  name: 'MultiCurrencyAccount',
  components: {
    ApplicationModal,
    VirtualApplicationModal,
    InstitutionApplicationModal
  },
  data () {
    return {
      activeTab: 'digital',
      activeCardId: null, // 当前鼠标悬停的卡片ID
      showVirtualActions: false,
      showInstitutionActions: false,
      showApplicationModal: false,
      showVirtualApplicationModal: false,
      showInstitutionApplicationModal: false,
      hasVirtualAccount: true, // 控制Virtual Account是否显示已有账户
      hasInstitutionAccount: true, // 控制Institution Account是否显示已有账户

      // 新增的数据
      loading: false,
      accountsData: [], // 账户数据

      // 币种图标映射
      coinIconMap: {
        'USDT-TRC': require('@/assets/icons/usdt.png'),
        'USDC-TRC': require('@/assets/icons/usdc.png'),
        'USDT_TRC': require('@/assets/icons/usdt.png'),
        'USDC_TRC': require('@/assets/icons/usdc.png'),
        'USDT': require('@/assets/icons/usdt.png'),
        'USDC': require('@/assets/icons/usdc.png'),
        'BTC': require('@/assets/icons/btc.png')
      }
    }
  },
  computed: {
    ...mapGetters([
      'getMainMerchant'
    ]),
    currentTabTitle () {
      switch (this.activeTab) {
        case 'digital':
          return 'Digital Accounts'
        case 'virtual':
          return 'Virtual Account'
        case 'institution':
          return 'Institution Account'
        default:
          return 'Digital Accounts'
      }
    }
  },
  watch: {
    activeTab () {
      // 切换标签时重置所有操作按钮状态
      this.activeCardId = null
      this.showVirtualActions = false
      this.showInstitutionActions = false
    }
  },
  async mounted () {
    // 页面加载时获取账户信息
    await this.fetchAccountsInfo()
  },
  methods: {
    // 获取账户信息
    async fetchAccountsInfo () {
      this.loading = true
      try {
        const response = await request({
          url: `/merchant/crypto/v2/accounts?type=1&merchant_id=${localStorage.getItem('currentMerchantId')}`,
          method: 'GET'
        })

        if (response.code === 200 && response.data) {
          this.accountsData = response.data
          console.log('Accounts info loaded:', this.accountsData)
        } else {
          console.error('Failed to load accounts info:', response.message)
          this.$message.error(response.message || 'Failed to load accounts info')
        }
      } catch (error) {
        console.error('Failed to fetch accounts info:', error)
        this.$message.error('Failed to fetch accounts info')
      } finally {
        this.loading = false
      }
    },

    // 设置当前激活的卡片
    setActiveCard (cardId) {
      this.activeCardId = cardId
    },

    // 获取币种图标
    getCoinIcon (cryptoCurrencyId) {
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

    // 获取网络标签
    getNetworkLabel (cryptoCurrencyId) {
      if (cryptoCurrencyId.includes('TRC')) {
        return 'TRC20'
      } else if (cryptoCurrencyId.includes('ERC')) {
        return 'ERC20'
      } else if (cryptoCurrencyId.includes('BSC')) {
        return 'BSC'
      }
      return 'MAIN'
    },

    // 格式化余额显示
    formatBalance (balance) {
      if (!balance) return '0.00'
      const num = parseFloat(balance)
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // 计算百分比变化
    getPercentageChange (account) {
      const available = parseFloat(account.balance.available) || 0
      const todayDeposit = parseFloat(account.today_stats.deposit) || 0

      if (available === 0) return '0.00'

      const percentage = (todayDeposit / available) * 100
      return Math.abs(percentage).toFixed(4)
    },

    // 获取百分比变化的样式类
    getPercentageClass (account) {
      const todayDeposit = parseFloat(account.today_stats.deposit) || 0
      return todayDeposit >= 0 ? 'positive' : 'negative'
    },

    // 获取百分比变化的图标
    getPercentageIcon (account) {
      const todayDeposit = parseFloat(account.today_stats.deposit) || 0
      return todayDeposit >= 0 ? 'arrow-up' : 'arrow-down'
    },

    // 格式化地址显示（显示前6位和后4位）
    formatAddress (address) {
      if (!address) return ''
      if (address.length <= 10) return address
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },

    // 复制地址
    copyAddress (address) {
      if (address) {
        navigator.clipboard.writeText(address).then(() => {
          this.$message.success('Address copied to clipboard')
        }).catch(() => {
          this.$message.error('Failed to copy address')
        })
      }
    },

    // 图片加载失败处理
    handleImageError (event) {
      // 图片加载失败时，使用默认的USDT图标
      event.target.src = this.coinIconMap['USDT']
    },

    handleApplyClick () {
      if (this.activeTab === 'digital') {
        this.showApplicationModal = true
      } else if (this.activeTab === 'virtual') {
        this.showVirtualApplicationModal = true
      } else if (this.activeTab === 'institution') {
        this.showInstitutionApplicationModal = true
      }
    },

    // 跳转到充值页面
    goToDeposit (account) {
      this.$router.push({
        path: '/deposit',
        query: {
          coinId: account.crypto_currency_id,
          coinSymbol: this.getCoinName(account.crypto_currency_id),
          network: this.getNetworkLabel(account.crypto_currency_id)
        }
      })
    },

    // 跳转到提现页面
    goToWithdraw (account) {
      this.$router.push({
        path: '/withdraw',
        query: {
          coinId: account.crypto_currency_id,
          coinSymbol: this.getCoinName(account.crypto_currency_id),
          network: this.getNetworkLabel(account.crypto_currency_id)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.multi-currency-account {
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .page-title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
      color: #262626;
    }

    .history-btn {
      color: #595959;
      padding: 4px 0;
      font-size: 14px;

      .anticon {
        margin-right: 4px;
      }

      &:hover {
        color: #11253E;
      }
    }
  }

  .account-tabs {
    margin-bottom: 24px;

    /deep/ .ant-tabs-bar {
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 0;
    }

    /deep/ .ant-tabs-tab {
      font-size: 14px;
      color: #8c8c8c;
      padding: 12px 0;
      margin-right: 32px;

      &.ant-tabs-tab-active {
        color: #262626;
        font-weight: 500;
      }
    }

    /deep/ .ant-tabs-ink-bar {
      background: #11253E;
    }
  }

  .account-display-area {
    flex: 1;
    margin-bottom: 24px;
    padding-top: 32px;
  }

  // 加载状态
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  // 账户网格布局
  .accounts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  // Digital Account 卡片样式
  .account-card {
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
    border-radius: 8px;
    padding: 24px;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .currency-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .currency-info {
        display: flex;
        align-items: center;

        .currency-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .currency-name {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
      }

      .network-info {
        display: flex;
        align-items: center;
        color: #8c8c8c;
        font-size: 12px;

        .network-label {
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
      }
    }

    // 钱包地址部分
    .wallet-address-section {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);

      .address-label {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }

      .address-input-group {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .address-display {
          font-family: monospace;
          font-size: 13px;
          color: #262626;
          background: rgba(255, 255, 255, 0.3);
          padding: 4px 8px;
          border-radius: 4px;
          flex: 1;
          margin-right: 8px;
        }

        .copy-address-btn {
          padding: 4px 8px;
          height: auto;
          min-width: auto;

          &:hover {
            color: #11253E;
          }
        }
      }
    }

    .balance-display {
      margin-bottom: 16px;

      .balance-amount {
        font-size: 28px;
        font-weight: 600;
        color: #11253E;
        margin: 0 0 16px 0;
        line-height: 1.2;
      }

      .balance-change-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .change-left {
          .received-amount {
            font-size: 14px;
            color: #262626;
            font-weight: 500;
            margin-bottom: 2px;
          }

          .received-label {
            font-size: 12px;
            color: #8c8c8c;
          }
        }

        .change-right {
          .percentage-change {
            font-size: 12px;
            display: flex;
            align-items: center;

            &.positive {
              color: #52c41a;
            }

            &.negative {
              color: #ff4d4f;
            }

            .anticon {
              margin-right: 2px;
              font-size: 10px;
            }
          }
        }
      }
    }

    .action-buttons {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);

      .ant-btn {
        height: 32px;
        font-size: 12px;
        border-radius: 4px;

        &.ant-btn-primary {
          background: #1f2937;
          border-color: #1f2937;

          &:hover {
            background: #374151;
            border-color: #374151;
          }
        }
      }
    }
  }

  // 空状态样式
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  // Virtual Account 欢迎横幅样式
  .virtual-welcome-banner {
    background: linear-gradient(135deg, #ff6b35 0%, #7b68ee 100%);
    border-radius: 12px;
    padding: 40px;
    color: white;

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .banner-text {
        flex: 1;
        margin-right: 40px;

        .banner-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: white;
        }

        .banner-description {
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px 0;
          opacity: 0.9;
        }

        .banner-actions {
          display: flex;
          gap: 16px;

          .ant-btn {
            height: 40px;
            border-radius: 6px;

            &.ant-btn-primary {
              background: white;
              border-color: white;
              color: #1f2937;

              &:hover {
                background: #f5f5f5;
                border-color: #f5f5f5;
              }
            }

            &.ant-btn-link {
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
              background: transparent;

              &:hover {
                color: white;
                border-color: white;
                background: rgba(255, 255, 255, 0.1);
              }
            }
          }
        }
      }

      .banner-cards {
        display: flex;
        gap: 16px;

        .region-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 20px;
          width: 180px;
          backdrop-filter: blur(10px);

          .region-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            font-weight: bold;

            &.hk {
              background: #d32f2f;
              color: white;
            }

            &.mx {
              background: #388e3c;
              color: white;
            }
          }

          .region-info {
            .region-name {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .region-desc {
              font-size: 12px;
              opacity: 0.8;
            }
          }
        }
      }
    }
  }

  // Virtual Account 卡片样式
  .virtual-account-card {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 24px;
    width: 400px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .bank-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .bank-info {
        .bank-name {
          font-size: 14px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 4px;
        }

        .account-number-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .account-number {
            font-size: 12px;
            color: #8c8c8c;
          }

          .status-tag {
            background: #f6ffed;
            color: #52c41a;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
        }
      }

      .account-actions {
        .account-icon {
          color: #bfbfbf;
          font-size: 16px;
        }
      }
    }

    .balance-display {
      margin-bottom: 20px;

      .balance-amount {
        font-size: 28px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 16px 0;
        line-height: 1.2;
      }

      .region-info-bottom {
        display: flex;
        align-items: center;

        .region-icon.hk-small {
          width: 24px;
          height: 24px;
          background: #d32f2f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .region-details {
          .region-name {
            font-size: 14px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 2px;
          }

          .region-type {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }
    }

    .action-buttons {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;

      .ant-btn {
        height: 32px;
        font-size: 12px;
        border-radius: 4px;

        &.ant-btn-primary {
          background: #1f2937;
          border-color: #1f2937;

          &:hover {
            background: #374151;
            border-color: #374151;
          }
        }
      }
    }
  }

  // Institution Account 欢迎横幅样式
  .institution-welcome-banner {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #7b2cbf 100%);
    border-radius: 12px;
    padding: 40px;
    color: white;

    .banner-content {
      .banner-text {
        margin-bottom: 32px;

        .banner-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: white;
        }

        .banner-description {
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 24px 0;
          opacity: 0.9;
        }

        .banner-actions {
          display: flex;
          gap: 16px;

          .ant-btn {
            height: 40px;
            border-radius: 6px;

            &.ant-btn-primary {
              background: white;
              border-color: white;
              color: #1f2937;

              &:hover {
                background: #f5f5f5;
                border-color: #f5f5f5;
              }
            }

            &.ant-btn-link {
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
              background: transparent;

              &:hover {
                color: white;
                border-color: white;
                background: rgba(255, 255, 255, 0.1);
              }
            }
          }
        }
      }

      .banner-cards {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .country-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 16px;
          width: 160px;
          backdrop-filter: blur(10px);
          position: relative;

          .processing-tag {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #fa8c16;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 500;
          }

          .country-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-size: 16px;

            &.hk {
              background: #d32f2f;
              color: white;
              font-weight: bold;
            }

            &.co, &.br, &.ar, &.pe {
              background: rgba(255, 255, 255, 0.2);
            }
          }

          .country-info {
            .country-name {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .country-desc {
              font-size: 11px;
              opacity: 0.8;
              line-height: 1.3;
            }
          }
        }
      }
    }
  }

  // Institution Account 卡片样式
  .institution-account-card {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 24px;
    width: 400px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .institution-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .institution-info {
        .institution-name {
          font-size: 14px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 4px;
        }

        .account-number-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .account-number {
            font-size: 12px;
            color: #8c8c8c;
          }

          .status-tag {
            background: #f6ffed;
            color: #52c41a;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
        }
      }

      .account-actions {
        .account-icon {
          color: #bfbfbf;
          font-size: 16px;
        }
      }
    }

    .balance-display {
      .balance-amount {
        font-size: 28px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 16px 0;
        line-height: 1.2;
      }

      .country-info-bottom {
        display: flex;
        align-items: center;

        .country-icon.co-small {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          font-size: 12px;
        }

        .country-details {
          .country-name {
            font-size: 14px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 2px;
          }

          .currency-type {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }
    }
  }

  // 底部区域样式
  .bottom-section {
    margin-top: auto;
    padding: 24px 0;
    border-top: 1px solid #f0f0f0;

    .section-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 60px;

      .info-text {
        flex: 1;
        margin-right: 40px;

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #262626;
          margin: 0 0 8px 0;
        }

        .section-description {
          font-size: 14px;
          color: #8c8c8c;
          line-height: 1.6;
          margin: 0;
          max-width: 600px;
        }
      }

      .apply-button {
        background: #1f2937;
        border-color: #1f2937;
        height: 40px;
        padding: 0 20px;
        font-size: 14px;
        border-radius: 6px;
        white-space: nowrap;
        flex-shrink: 0;

        &:hover, &:focus {
          background: #374151;
          border-color: #374151;
        }

        .anticon {
          margin-right: 6px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .multi-currency-account {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .accounts-grid {
      grid-template-columns: 1fr;
    }

    .virtual-welcome-banner .banner-content {
      flex-direction: column;
      gap: 24px;

      .banner-text {
        margin-right: 0;
      }

      .banner-cards {
        width: 100%;
        justify-content: center;
      }
    }

    .bottom-section .section-content {
      flex-direction: column;
      gap: 16px;

      .info-text {
        margin-right: 0;
      }

      .apply-button {
        width: 100%;
      }
    }
  }
}
</style>
