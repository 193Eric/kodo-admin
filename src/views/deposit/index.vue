<template>
  <div class="deposit-container">
    <!-- 页面头部 -->
    <div class="deposit-header">
      <h2 class="deposit-title">Deposit</h2>
      <a-button type="link" class="history-btn">
        <a-icon type="history" />
        Deposit History
      </a-button>
    </div>

    <!-- Tab切换和内容区域 -->
    <div class="deposit-content">
      <div class="content-wrapper">
        <!-- 左侧主要内容 -->
        <div class="main-content">
          <a-tabs v-model="activeTab" @change="handleTabChange">
            <!-- 加密货币充值 -->
            <a-tab-pane key="crypto" tab="Deposit Crypto">
              <CryptoDeposit />
            </a-tab-pane>

            <!-- 法币充值 -->
            <a-tab-pane key="fiat" tab="Deposit Fiat">
              <div class="deposit-fiat">
                <!-- Step 1: Select Currency -->
                <div class="step-item">
                  <div class="step-header">
                    <div class="step-number active">1</div>
                    <div class="step-content">
                      <h3 class="step-title">Select Currency</h3>
                      <p class="step-description">Choose the currency you want to deposit</p>
                    </div>
                  </div>

                  <div class="step-body">
                    <a-select
                      v-model="fiat.selectedCurrency"
                      placeholder="Select a currency"
                      style="width: 100%"
                      size="large"
                      @change="handleCurrencyChange"
                    >
                      <a-select-option value="USD">
                        <div class="currency-option">
                          <div class="currency-icon usd">
                            <img style="width:100%" src="@/assets/icons/usd.png" />
                          </div>
                          <div class="currency-info">
                            <div class="currency-name">USD</div>
                            <div class="currency-full-name">US Dollars</div>
                          </div>
                        </div>
                      </a-select-option>
                      <!-- <a-select-option value="HKD">
                        <div class="currency-option">
                          <div class="currency-icon hkd">
                            <img style="width:100%" src="@/assets/icons/hkd.png" />
                          </div>
                          <div class="currency-info">
                            <div class="currency-name">HKD</div>
                            <div class="currency-full-name">HongKong dollar</div>
                          </div>
                        </div>
                      </a-select-option> -->
                      <a-select-option value="EUR">
                        <div class="currency-option">
                          <div class="currency-icon eur">
                            <img style="width:100%" src="@/assets/icons/eur.png" />
                          </div>
                          <div class="currency-info">
                            <div class="currency-name">EUR</div>
                            <div class="currency-full-name">Euro</div>
                          </div>
                        </div>
                      </a-select-option>
                      <a-select-option value="RUB">
                        <div class="currency-option">
                          <div class="currency-icon rub">
                            <img style="width:100%" src="@/assets/icons/rub.png" />
                          </div>
                          <div class="currency-info">
                            <div class="currency-name">RUB</div>
                            <div class="currency-full-name">Russian Rouble</div>
                          </div>
                        </div>
                      </a-select-option>
                    </a-select>
                  </div>
                </div>

                <!-- Step 2: Bank Account Details -->
                <div class="step-item">
                  <div class="step-header">
                    <div class="step-number" :class="{ active: fiat.selectedCurrency, completed: fiat.selectedCurrency }">2</div>
                    <div class="step-content">
                      <h3 class="step-title">Bank Account Details</h3>
                      <p class="step-description" v-if="fiat.selectedCurrency">
                        Please transfer funds to the following account to top up.
                      </p>
                    </div>
                  </div>

                  <div class="step-body" v-if="fiat.selectedCurrency">
                    <!-- 没有可用虚拟账户的情况 -->
                    <div v-if="!hasVirtualAccount" class="no-account-container">
                      <div class="no-account-icon">
                        <a-icon type="file-search" style="font-size: 48px; color: #d9d9d9;" />
                      </div>
                      <p class="no-account-text">
                        Sorry, there is no available virtual account right now. If you wish to top up with fiat currency to digital currency, click to "View Guide".
                      </p>
                      <a-button type="primary" size="large" class="view-guide-btn" @click="viewGuide">
                        View Guide
                      </a-button>
                    </div>

                    <!-- 有银行账户信息的情况 -->
                    <div v-else class="bank-details-container">
                      <div class="bank-details">
                        <div class="detail-row">
                          <span class="detail-label">Account Name</span>
                          <span class="detail-value">{{ bankDetails.accountName }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">Account Country/Region</span>
                          <span class="detail-value">{{ bankDetails.country }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">Account Currency</span>
                          <span class="detail-value">{{ bankDetails.currency }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">Bank Name</span>
                          <span class="detail-value">{{ bankDetails.bankName }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">Bank Account Number</span>
                          <span class="detail-value">{{ bankDetails.accountNumber }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">9-Digit ACH Bank Identification Code</span>
                          <span class="detail-value">{{ bankDetails.achCode }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">9-Digit Fedwire Bank Identification Code</span>
                          <span class="detail-value">{{ bankDetails.fedwireCode }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">SWIFT Code/BIC</span>
                          <span class="detail-value">{{ bankDetails.swiftCode }}</span>
                        </div>

                        <div class="detail-row">
                          <span class="detail-label">Bank Address</span>
                          <span class="detail-value">{{ bankDetails.bankAddress }}</span>
                        </div>
                      </div>

                      <div class="copy-section">
                        <a-button type="default" size="large" block @click="copyAccountDetails">
                          <a-icon type="copy" />
                          Copy Account Details
                        </a-button>
                      </div>

                      <div class="important-notice">
                        <h4>Important Notice</h4>
                        <ul>
                          <li>Minimum deposit amount: {{ bankDetails.minDeposit }}</li>
                          <li>Before making a payment, please double-check that the address is correct.</li>
                          <li>Be aware of transfer fees! Payment does not include fees.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Awaiting Deposit Credited -->
                <div class="step-item">
                  <div class="step-header">
                    <div class="step-number" :class="{ active: fiat.selectedCurrency, completed: fiat.selectedCurrency }">3</div>
                    <div class="step-content">
                      <h3 class="step-title">Awaiting Deposit Credited</h3>
                      <p class="step-description" v-if="fiat.selectedCurrency">
                        After the deposit operation is completed, the platform will notify you of the status of your deposit order via email and SMS, so please keep an eye on it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <!-- 右侧FAQ -->
        <div class="faq-section">
          <h3 class="faq-title">FAQ</h3>
          <div class="faq-list">
            <div class="faq-item" v-for="(item, index) in currentFaqList" :key="index">
              <span class="faq-number">{{ index + 1 }}.</span>
              <span class="faq-text">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoDeposit from './CryptoDeposit.vue'
import { request } from '@/api/_service'

export default {
  name: 'Deposit',
  components: {
    CryptoDeposit
  },
  data () {
    return {
      activeTab: 'crypto',
      // 法币相关数据
      fiat: {
        selectedCurrency: ''
      },
      // FAQ数据
      cryptoFaq: [
        'How to deposit crypto?',
        'How long is it expected to take for the cryptocurrency deposit to be credited?',
        'Deposit hasn\'t arrived?'
      ],
      fiatFaq: [
        'How to deposit?',
        'How long is it expected to take for the currency deposit to be credited?',
        'Deposit hasn\'t arrived?'
      ],
      // 法币配置
      currencyConfig: {
        USD: { hasVirtualAccount: false },
        HKD: { hasVirtualAccount: true },
        EUR: { hasVirtualAccount: false },
        RUB: { hasVirtualAccount: false }
      },
      // 银行详情
      bankDetailsData: {
        HKD: {
          accountName: 'STANDARD CHARTERED',
          country: 'HongKong',
          currency: 'Multi-Currency',
          bankName: 'STANDARD CHARTERED BANK (HONG KONG) LIMITED',
          accountNumber: '026073123',
          achCode: 'CMFDUS71',
          fedwireCode: '026073100',
          swiftCode: 'John Smith',
          bankAddress: '2464 Royal Ln. Mesa, New Jersey 45463',
          minDeposit: '10,000 HKD'
        }
      }
    }
  },
  computed: {
    currentFaqList () {
      return this.activeTab === 'crypto' ? this.cryptoFaq : this.fiatFaq
    },
    hasVirtualAccount () {
      return this.fiat.selectedCurrency && this.currencyConfig[this.fiat.selectedCurrency]?.hasVirtualAccount
    },
    bankDetails () {
      return this.fiat.selectedCurrency && this.hasVirtualAccount
        ? this.bankDetailsData[this.fiat.selectedCurrency]
        : null
    }
  },
  methods: {
    handleTabChange (key) {
      this.activeTab = key
    },

    // 法币相关方法
    handleCurrencyChange (value) {
      this.fiat.selectedCurrency = value
    },

    viewGuide () {
      this.$message.info('Opening deposit guide...')
    },

    copyAccountDetails () {
      if (this.bankDetails) {
        const details = Object.entries(this.bankDetails)
          .map(([key, value]) => `${this.formatLabel(key)}: ${value}`)
          .join('\n')

        navigator.clipboard.writeText(details).then(() => {
          this.$message.success('Account details copied to clipboard')
        }).catch(() => {
          this.$message.error('Failed to copy account details')
        })
      }
    },

    formatLabel (key) {
      const labelMap = {
        accountName: 'Account Name',
        country: 'Account Country/Region',
        currency: 'Account Currency',
        bankName: 'Bank Name',
        accountNumber: 'Bank Account Number',
        achCode: '9-Digit ACH Bank Identification Code',
        fedwireCode: '9-Digit Fedwire Bank Identification Code',
        swiftCode: 'SWIFT Code/BIC',
        bankAddress: 'Bank Address'
      }
      return labelMap[key] || key
    }
  }
}
</script>

<style lang="less" scoped>
.deposit-container {
  padding: 24px;
  background: #fff;
  min-height: 100vh;

  .deposit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .deposit-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }

    .history-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #8c8c8c;

      &:hover {
        color: #11253E;
      }
    }
  }

  .deposit-content {
    .content-wrapper {
      display: flex;
      gap: 48px;

      .main-content {
        flex: 1;
        max-width: 600px;

        /deep/ .ant-tabs-tab {
          font-size: 16px;
          font-weight: 500;

          &.ant-tabs-tab-active {
            color: #11253E;
          }
        }

        /deep/ .ant-tabs-ink-bar {
          background: #11253E;
        }
      }

      .faq-section {
        width: 300px;
        flex-shrink: 0;

        .faq-title {
          margin: 0 0 24px 0;
          font-size: 18px;
          font-weight: 600;
          color: #262626;
        }

        .faq-list {
          .faq-item {
            margin-bottom: 16px;
            display: flex;
            gap: 8px;
            line-height: 1.5;

            .faq-number {
              color: #8c8c8c;
              font-weight: 500;
            }

            .faq-text {
              color: #595959;
              cursor: pointer;

              &:hover {
                color: #11253E;
              }
            }
          }
        }
      }
    }
  }
}

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
.currency-option {
  display: flex;
  align-items: center;
  gap: 12px;

  .currency-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;

    &.usd {
      background: #6b73ff;
    }

    &.hkd {
      background: #ff4d4f;
    }

    &.eur {
      background: #003399;
    }

    &.rub {
      background: #d46b08;
    }
  }

  .currency-info {
    .currency-name {
      font-weight: 600;
      color: #262626;
    }

    .currency-full-name {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}

// 选择框选中项样式覆盖
/deep/ .ant-select-selection-selected-value {
  display: flex !important;
  align-items: center !important;

  .currency-option {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;

    .currency-info {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;

      .currency-name {
        margin-right: 0 !important;
        font-weight: 600;
      }

      .currency-full-name {
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

    .currency-option {
      .currency-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
    }
  }
}

// 无账户容器样式
.no-account-container {
  text-align: center;
  padding: 48px 24px;
  background: #fafafa;
  border-radius: 8px;

  .no-account-icon {
    margin-bottom: 16px;
  }

  .no-account-text {
    margin-bottom: 24px;
    color: #8c8c8c;
    font-size: 14px;
    line-height: 1.5;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .view-guide-btn {
    min-width: 120px;
  }
}

// 银行详情容器样式
.bank-details-container {
  .bank-details {
    background: #fafafa;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;

    .detail-row {
      display: flex;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        width: 280px;
        flex-shrink: 0;
        color: #8c8c8c;
        font-size: 14px;
      }

      .detail-value {
        flex: 1;
        color: #262626;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }

  .copy-section {
    margin-bottom: 24px;
  }

  .important-notice {
    background: #fff7e6;
    border: 1px solid #ffd591;
    border-radius: 8px;
    padding: 16px;

    h4 {
      margin: 0 0 12px 0;
      color: #d48806;
      font-size: 14px;
      font-weight: 600;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        color: #d48806;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
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
  .deposit-container {
    padding: 16px;

    .deposit-content .content-wrapper {
      flex-direction: column;
      gap: 24px;

      .faq-section {
        width: 100%;
      }
    }
  }

  .bank-details .detail-row {
    flex-direction: column;
    gap: 4px;

    .detail-label {
      width: auto;
    }
  }
}
</style>
