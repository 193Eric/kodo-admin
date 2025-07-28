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
          <div class="account-card" @mouseenter="showDigitalActions = true" @mouseleave="showDigitalActions = false">
            <!-- 货币信息头部 -->
            <div class="currency-header">
              <div class="currency-info">
                <div class="currency-icon">
                  <span class="icon-text">T</span>
                </div>
                <span class="currency-name">USDT</span>
              </div>
              <div class="network-info">
                <span class="network-label">TRC20</span>
                <a-icon type="copy" class="copy-icon" />
              </div>
            </div>

            <!-- 余额显示 -->
            <div class="balance-display">
              <h1 class="balance-amount">12,345.67</h1>

              <div class="balance-change-info">
                <div class="change-left">
                  <div class="received-amount">+1,280.98</div>
                  <div class="received-label">Received today</div>
                </div>
                <div class="change-right">
                  <div class="percentage-change">
                    <a-icon type="arrow-up" />
                    <span>+0.2828%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons" v-if="showDigitalActions">
              <a-button type="primary" size="small" icon="download">
                Deposit
              </a-button>
              <a-button size="small" icon="upload" style="margin-left: 8px;">
                Withdrawal
              </a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="virtual" tab="Virtual Account">
        <!-- Virtual Account 内容 -->
        <div class="account-display-area">
          <!-- 没有账户时显示 -->
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
      showDigitalActions: false,
      showVirtualActions: false,
      showInstitutionActions: false,
      showApplicationModal: false,
      showVirtualApplicationModal: false,
      showInstitutionApplicationModal: false,
      hasVirtualAccount: true, // 控制Virtual Account是否显示已有账户
      hasInstitutionAccount: true // 控制Institution Account是否显示已有账户
    }
  },
  computed: {
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
      this.showDigitalActions = false
      this.showVirtualActions = false
      this.showInstitutionActions = false
    }
  },
  methods: {
    handleApplyClick () {
      if (this.activeTab === 'digital') {
        this.showApplicationModal = true
      } else if (this.activeTab === 'virtual') {
        this.showVirtualApplicationModal = true
      } else if (this.activeTab === 'institution') {
        this.showInstitutionApplicationModal = true
      }
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

  // Digital Account 卡片样式
  .account-card {
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
    border-radius: 8px;
    padding: 24px;
    width: 320px;
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
      margin-bottom: 24px;

      .currency-info {
        display: flex;
        align-items: center;

        .currency-icon {
          width: 32px;
          height: 32px;
          background: #26a67a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;

          .icon-text {
            color: white;
            font-weight: bold;
            font-size: 16px;
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
          margin-right: 4px;
        }

        .copy-icon {
          cursor: pointer;
          font-size: 12px;

          &:hover {
            color: #11253E;
          }
        }
      }
    }

    .balance-display {
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
            color: #52c41a;
            font-size: 12px;
            display: flex;
            align-items: center;

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

    .account-card,
    .virtual-account-card,
    .institution-account-card {
      width: 100%;
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
