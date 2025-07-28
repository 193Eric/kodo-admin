<template>
  <div class="create-digital-payout-flow">
    <!-- 主要内容区域 -->
    <div class="flow-main">
      <!-- 左侧内容区域 -->
      <div class="flow-content">
        <!-- 步骤1: 选择收款人 -->
        <div v-if="currentStep === 1" class="step-content">
          <h3 class="step-title">Who will you be paying</h3>
          <p class="step-description">Please select a recipient.</p>

          <!-- 搜索框 -->
          <div class="search-section">
            <a-input
              v-model="searchQuery"
              placeholder="Search recipient name, network, currency, address"
              size="large"
              class="search-input"
            >
              <a-icon slot="suffix" type="search" />
            </a-input>
          </div>

          <!-- 收款人账户列表 -->
          <div class="recipient-section">
            <h4 class="section-title">Recipient Account</h4>
            <div class="recipient-list">
              <div
                v-for="recipient in filteredRecipients"
                :key="recipient.id"
                class="recipient-item"
                :class="{ selected: selectedRecipient?.id === recipient.id }"
                @click="selectRecipient(recipient)"
              >
                <div class="recipient-avatar">{{ recipient.name.substring(0, 2).toUpperCase() }}</div>
                <div class="recipient-info">
                  <div class="recipient-name">{{ recipient.name }}</div>
                  <div class="recipient-address">{{ recipient.address }}</div>
                </div>
                <div class="recipient-networks">
                  <a-tag
                    v-for="network in recipient.networks"
                    :key="network"
                    size="small"
                    :color="getNetworkColor(network)"
                  >
                    {{ network }}
                  </a-tag>
                </div>
                <a-icon type="right" class="arrow-icon" />
              </div>
            </div>

            <!-- 显示更多 -->
            <div class="show-more">
              <a-button type="link" @click="showAllRecipients">
                Show All (25) <a-icon type="down" />
              </a-button>
            </div>

            <!-- 添加新收款人 -->
            <div class="add-recipient">
              <h4 class="section-title">Add New Recipient</h4>
              <a-button type="dashed" block size="large" @click="showAddRecipientModal">
                <a-icon type="plus" />
                Add a Single Recipient
              </a-button>
            </div>
          </div>
        </div>

        <!-- 步骤2: 转账详情 -->
        <div v-if="currentStep === 2" class="step-content">
          <h3 class="step-title">Transfer Details</h3>
          <p class="step-description">Please enter the transfer amount and the purpose of the transfer.</p>

          <div class="transfer-form">
            <!-- 支付金额 -->
            <div class="form-section">
              <h4 class="section-title">Payout</h4>
              <div class="amount-input-container">
                <a-input-number
                  v-model="payoutAmount"
                  :min="0"
                  :precision="2"
                  size="large"
                  class="amount-input"
                  placeholder="0.00"
                  @change="calculateReceiveAmount"
                />
                <div class="currency-selector">
                  <div class="currency-item">
                    <div class="coin-icon usdt"></div>
                    <span>USDT</span>
                    <a-icon type="down" />
                  </div>
                </div>
              </div>
              <div class="amount-options">
                <a-button size="small" @click="setMaxAmount">Max</a-button>
                <a-button size="small" @click="setMinAmount">Min</a-button>
              </div>
              <div class="balance-info">
                Available Balance {{ availableBalance.toLocaleString() }} USDT
              </div>
            </div>

            <!-- 汇率转换图标 -->
            <div class="conversion-icon">
              <div class="icon-circle">
                <span class="conversion-text">FJ</span>
              </div>
            </div>

            <!-- 收款金额 -->
            <div class="form-section">
              <h4 class="section-title">Payee Received</h4>
              <div class="received-amount-container">
                <div class="received-amount">{{ receivedAmount.toLocaleString() }}</div>
                <div class="currency-info">
                  <div class="coin-icon usdt"></div>
                  <span>USDT</span>
                </div>
              </div>
              <div class="fee-info">
                <div class="fee-line">Transaction fee：{{ transactionFee }} USDT</div>
                <div class="fee-line">Minimum payout amount：{{ minimumAmount }} USDT</div>
                <div class="fee-line">Estimated time for funds to arrive: {{ estimatedTime }}</div>
              </div>
            </div>

            <!-- 支付用途 -->
            <div class="form-section">
              <h4 class="section-title">Payment Purpose</h4>
              <a-select
                v-model="paymentPurpose"
                placeholder="Select payment purpose"
                size="large"
                class="purpose-select"
              >
                <a-select-option value="project">Project Payment</a-select-option>
                <a-select-option value="service">Service Payment</a-select-option>
                <a-select-option value="goods">Goods Payment</a-select-option>
                <a-select-option value="other">Other</a-select-option>
              </a-select>
            </div>
          </div>
        </div>

        <!-- 步骤3: 确认订单 -->
        <div v-if="currentStep === 3" class="step-content">
          <h3 class="step-title">Confirm Order</h3>

          <div class="confirm-details">
            <!-- 转账金额总览 -->
            <div class="amount-overview">
              <div class="payout-section">
                <div class="amount-badge payout">
                  <div class="badge-icon"></div>
                  <span class="badge-text">Payout</span>
                </div>
                <div class="amount-value">{{ payoutAmount.toLocaleString() }} USDT</div>
              </div>

              <div class="arrow-icon">
                <a-icon type="arrow-right" />
              </div>

              <div class="received-section">
                <div class="amount-badge received">
                  <div class="badge-icon"></div>
                  <span class="badge-text">Payee Received</span>
                </div>
                <div class="amount-value">{{ receivedAmount.toLocaleString() }} USDT</div>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="detail-rows">
              <div class="detail-row">
                <span class="detail-label">Transaction Fee</span>
                <span class="detail-value">{{ transactionFee }} USDT</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Account</span>
                <span class="detail-value">{{ selectedRecipient?.name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total amount remitted</span>
                <span class="detail-value">{{ payoutAmount.toLocaleString() }} USDT</span>
              </div>
            </div>

            <!-- 提示信息 -->
            <div class="notice">
              <a-icon type="info-circle" />
              <span>Note: Please ensure that the receiving account supports transfers in this currency.</span>
            </div>
          </div>
        </div>

        <!-- 步骤4: 处理中 -->
        <div v-if="currentStep === 4" class="step-content processing-step" style="max-width: none;">
          <div class="processing-container">
            <!-- 处理中动画 -->
            <div class="processing-animation">
              <div class="clock-icon">
                <a-icon type="clock-circle" spin />
              </div>
            </div>

            <h3 class="processing-title">Processing</h3>
            <p class="processing-description">Your payout is being processed.</p>

            <!-- 处理详情 -->
            <div class="processing-details">
              <div class="detail-row">
                <span class="detail-label">Payout Amount</span>
                <span class="detail-value">{{ payoutAmount.toLocaleString() }} USDT</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Fee</span>
                <span class="detail-value">{{ transactionFee }} USDT</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Received</span>
                <span class="detail-value">{{ receivedAmount.toLocaleString() }} USDT</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Account</span>
                <span class="detail-value">{{ selectedRecipient?.name }}</span>
              </div>
            </div>

            <!-- 后续步骤说明 -->
            <div class="next-steps">
              <h4 class="next-steps-title">What's Next?</h4>
              <ul class="next-steps-list">
                <li>Your funds will arrive at the destination address within 1-3 days</li>
                <li>You can click on the payout history to check the progress</li>
                <li>A confirmation email has been sent to your registered email</li>
              </ul>
            </div>

            <a-button type="primary" size="large" @click="completePayout">
              Done
            </a-button>

            <a-button type="link" @click="goToPayoutHistory" class="history-link">
              Payout History
            </a-button>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div v-if="currentStep >= 2 && currentStep <= 3" class="flow-footer">
          <a-button
            v-if="currentStep > 1"
            size="large"
            @click="goToPreviousStep"
            class="back-btn"
          >
            <a-icon type="left" />
            Back
          </a-button>
          <a-button
            type="primary"
            size="large"
            @click="goToNextStep"
            :disabled="!canProceed"
            class="continue-btn"
          >
            {{ currentStep === 3 ? 'Confirm' : 'Continue' }}
          </a-button>
        </div>
      </div>

      <!-- 右侧步骤指示器 -->
      <div class="steps-sidebar" v-if="currentStep !== 4">
        <div class="steps-indicator">
          <div class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-content">
              <span class="step-text">Select a Recipient</span>
              <div v-if="currentStep > 1 && selectedRecipient" class="step-detail">
                {{ selectedRecipient.name }}
              </div>
            </div>
          </div>

          <div class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-content">
              <span class="step-text">Transfer Details</span>
              <div v-if="currentStep > 2 && payoutAmount > 0" class="step-detail">
                {{ payoutAmount.toLocaleString() }} USDT
              </div>
            </div>
          </div>

          <div class="step-item" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <div class="step-content">
              <span class="step-text">Confirm Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateDigitalPayoutFlow',
  data () {
    return {
      currentStep: 1,
      searchQuery: '',
      selectedRecipient: null,
      payoutAmount: 0,
      paymentPurpose: '',
      availableBalance: 100000000.08,
      transactionFee: 5,
      minimumAmount: 1000,
      estimatedTime: '0-3 working days',

      recipients: [
        {
          id: 1,
          name: 'Abstergo Ltd.',
          address: 'TPRgvk...JoCSck',
          networks: ['TRC-20']
        },
        {
          id: 2,
          name: 'Biffco Enterprises Ltd.',
          address: 'TPRgvk...JoCSck',
          networks: ['TRC-20']
        },
        {
          id: 3,
          name: 'BlockChain Merchants',
          address: 'TPRgvk...JoCSck',
          networks: ['TRC-20', 'ERC-20']
        },
        {
          id: 4,
          name: 'Crypto Vendor Ltd',
          address: 'TPRgvk...JoCSck',
          networks: ['TRC-20']
        },
        {
          id: 5,
          name: 'Global Trade Partners',
          address: 'TPRgvk...JoCSck',
          networks: ['TRC-20']
        }
      ]
    }
  },

  computed: {
    filteredRecipients () {
      if (!this.searchQuery) return this.recipients.slice(0, 5)

      return this.recipients.filter(recipient =>
        recipient.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        recipient.address.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },

    receivedAmount () {
      return Math.max(0, this.payoutAmount - this.transactionFee)
    },

    canProceed () {
      switch (this.currentStep) {
        case 1:
          return !!this.selectedRecipient
        case 2:
          return this.payoutAmount > 0 && this.paymentPurpose
        case 3:
          return true
        default:
          return false
      }
    }
  },

  methods: {
    selectRecipient (recipient) {
      this.selectedRecipient = recipient
      // 选中收款人后自动跳转到下一步
      setTimeout(() => {
        this.currentStep = 2
      }, 300) // 稍微延迟一下，让用户看到选中效果
    },

    calculateReceiveAmount () {
      // 自动计算收款金额
    },

    setMaxAmount () {
      this.payoutAmount = this.availableBalance
      this.calculateReceiveAmount()
    },

    setMinAmount () {
      this.payoutAmount = this.minimumAmount
      this.calculateReceiveAmount()
    },

    goToNextStep () {
      if (this.canProceed && this.currentStep < 4) {
        this.currentStep++

        if (this.currentStep === 4) {
          // 模拟处理延迟
          setTimeout(() => {
            // 可以在这里调用 API
          }, 2000)
        }
      }
    },

    goToPreviousStep () {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    completePayout () {
      this.$emit('complete')
    },

    goToPayoutHistory () {
      this.$emit('close')
      this.$router.push('/payout-history')
    },

    showAllRecipients () {
      console.log('Show all recipients')
    },

    showAddRecipientModal () {
      console.log('Show add recipient modal')
    },

    getNetworkColor (network) {
      const colors = {
        'ERC-20': 'blue',
        'TRC-20': 'green',
        'BEP-20': 'orange',
        'Bitcoin': 'gold'
      }
      return colors[network] || 'default'
    }
  }
}
</script>

<style lang="less" scoped>
.create-digital-payout-flow {
  background: white;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.flow-main {
  display: flex;
  flex: 1;
  min-height: 600px;
}

.flow-content {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;

  .step-content {
    flex: 1;
    max-width: 600px;

    .step-title {
      font-size: 24px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 8px 0;
    }

    .step-description {
      font-size: 14px;
      color: #8c8c8c;
      margin: 0 0 32px 0;
    }
  }
}

.steps-sidebar {
  width: 280px;
  background: #fafafa;
  border-left: 1px solid #f0f0f0;
  padding: 32px 24px;

  .steps-indicator {
    position: sticky;
    top: 32px;

    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 32px;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 15px;
        top: 32px;
        width: 1px;
        height: 40px;
        background: #e8e8e8;
      }

      &.active::after,
      &.completed::after {
        background: #11253e;
      }

      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f5f5f5;
        color: #8c8c8c;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        margin-right: 12px;
        flex-shrink: 0;
      }

      &.active .step-number {
        background: #11253e;
        color: white;
      }

      &.completed .step-number {
        background: #52c41a;
        color: white;
      }

      .step-content {
        flex: 1;
        min-width: 0;

        .step-text {
          font-size: 14px;
          color: #8c8c8c;
          font-weight: 500;
          display: block;
          margin-bottom: 4px;
        }

        .step-detail {
          font-size: 12px;
          color: #11253e;
          font-weight: 600;
          word-break: break-all;
        }
      }

      &.active .step-content .step-text,
      &.completed .step-content .step-text {
        color: #262626;
      }
    }
  }
}

// 步骤1样式
.search-section {
  margin-bottom: 32px;

  .search-input {
    border-radius: 8px;
  }
}

.recipient-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 16px 0;
  }

  .recipient-list {
    margin-bottom: 16px;

    .recipient-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
        background: #fafafa;
      }

      &.selected {
        border-color: #11253e;
        background: #f0f7ff;
      }

      .recipient-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #11253e;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-right: 16px;
      }

      .recipient-info {
        flex: 1;
        margin-right: 16px;

        .recipient-name {
          font-size: 16px;
          font-weight: 500;
          color: #262626;
          margin-bottom: 4px;
        }

        .recipient-address {
          font-size: 14px;
          color: #8c8c8c;
          font-family: monospace;
        }
      }

      .recipient-networks {
        display: flex;
        gap: 4px;
        margin-right: 16px;
      }

      .arrow-icon {
        color: #8c8c8c;
      }
    }
  }

  .show-more {
    text-align: center;
    margin-bottom: 32px;
  }

  .add-recipient {
    .section-title {
      margin-bottom: 12px;
    }
  }
}

// 步骤2样式
.transfer-form {
  .form-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 16px 0;
    }

    .amount-input-container {
      display: flex;
      align-items: center;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      padding: 8px 16px;
      margin-bottom: 8px;

      .amount-input {
        flex: 1;
        border: none;
        font-size: 24px;
        font-weight: 600;

        /deep/ .ant-input-number {
          border: none;
          box-shadow: none;
          font-size: 24px;
          font-weight: 600;
        }
      }

      .currency-selector {
        margin-left: 16px;

        .currency-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: #f5f5f5;
          cursor: pointer;

          .coin-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;

            &.usdt {
              background: #26a17b;
            }
          }
        }
      }
    }

    .amount-options {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .balance-info {
      font-size: 14px;
      color: #8c8c8c;
    }

    .received-amount-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;

      .received-amount {
        font-size: 24px;
        font-weight: 600;
        color: #262626;
      }

      .currency-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .coin-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;

          &.usdt {
            background: #26a17b;
          }
        }
      }
    }

    .fee-info {
      .fee-line {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }
    }

    .purpose-select {
      width: 100%;
    }
  }

  .conversion-icon {
    display: flex;
    justify-content: center;
    margin: 16px 0;

    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #11253e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
  }
}

// 步骤3样式
.confirm-details {
  .amount-overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding: 24px;
    background: #f9fafb;
    border-radius: 12px;

    .payout-section,
    .received-section {
      text-align: center;

      .amount-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        justify-content: center;

        .badge-icon {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        &.payout .badge-icon {
          background: #52c41a;
        }

        &.received .badge-icon {
          background: #1890ff;
        }

        .badge-text {
          font-size: 14px;
          color: #8c8c8c;
          font-weight: 500;
        }
      }

      .amount-value {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
      }
    }

    .arrow-icon {
      font-size: 20px;
      color: #8c8c8c;
    }
  }

  .detail-rows {
    margin-bottom: 24px;

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
        font-weight: 600;
      }

      .detail-label {
        color: #8c8c8c;
      }

      .detail-value {
        color: #262626;
        font-weight: 500;
      }
    }
  }

  .notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 6px;
    font-size: 14px;
    color: #389e0d;
  }
}

// 步骤4样式
.processing-step {
  text-align: center;

  .processing-container {
    max-width: 400px;
    margin: 0 auto;

    .processing-animation {
      margin-bottom: 24px;

      .clock-icon {
        font-size: 48px;
        color: #1890ff;
      }
    }

    .processing-title {
      font-size: 24px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 8px 0;
    }

    .processing-description {
      color: #8c8c8c;
      margin-bottom: 32px;
    }

    .processing-details {
      text-align: left;
      margin-bottom: 32px;

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        .detail-label {
          color: #8c8c8c;
        }

        .detail-value {
          color: #262626;
          font-weight: 500;
        }
      }
    }

    .next-steps {
      text-align: left;
      margin-bottom: 32px;

      .next-steps-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 12px 0;
      }

      .next-steps-list {
        margin: 0;
        padding-left: 20px;

        li {
          font-size: 14px;
          color: #8c8c8c;
          margin-bottom: 8px;
          line-height: 1.5;
        }
      }
    }

    .history-link {
      margin-top: 16px;
      color: #1890ff;
    }
  }
}

.flow-footer {
  display: flex;
  justify-content: space-between;
  padding: 24px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .continue-btn {
    background: #11253e;
    border-color: #11253e;
    min-width: 120px;

    &:hover:not(:disabled) {
      background: #1a3554;
      border-color: #1a3554;
    }

    &:disabled {
      background: #d9d9d9;
      border-color: #d9d9d9;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .flow-main {
    flex-direction: column;
  }

  .steps-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #f0f0f0;
    padding: 20px;

    .steps-indicator {
      display: flex;
      justify-content: center;
      position: static;

      .step-item {
        margin-bottom: 0;
        margin-right: 24px;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &:not(:last-child)::after {
          display: none;
        }

        .step-content {
          margin-top: 8px;

          .step-text {
            font-size: 12px;
          }

          .step-detail {
            display: none;
          }
        }
      }
    }
  }

  .flow-content {
    padding: 20px;
  }

  .confirm-details {
    .amount-overview {
      flex-direction: column;
      gap: 16px;

      .arrow-icon {
        transform: rotate(90deg);
      }
    }
  }
}
</style>
