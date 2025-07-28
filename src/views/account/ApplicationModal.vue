<template>
  <a-modal
    :visible="visible"
    :footer="null"
    :width="500"
    :closable="false"
    :maskClosable="false"
    centered
    @cancel="handleClose"
    wrapClassName="application-modal"
  >
    <!-- 申请表单页面 -->
    <div v-if="currentStep === 'form'" class="application-form">
      <h2 class="modal-title">Digital Account Opening Information</h2>
      <p class="modal-subtitle">Digital account opening is currently supported only in TRC-20 and ERC-20 networks.</p>

      <a-form :form="form" layout="vertical" class="form-content">
        <!-- 货币选择 -->
        <a-form-item label="Currency" class="form-item">
          <a-select
            v-decorator="['currency', { initialValue: 'USDC' }]"
            size="large"
            placeholder="Select currency"
          >
            <a-select-option value="USDC">
              <div class="currency-option">
                <div class="currency-icon usdc"></div>
                USDC
              </div>
            </a-select-option>
            <a-select-option value="USDT">
              <div class="currency-option">
                <div class="currency-icon usdt"></div>
                USDT
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 网络选择 -->
        <a-form-item label="Network" class="form-item">
          <a-select
            v-decorator="['network', { initialValue: 'TRC-20' }]"
            size="large"
            placeholder="Select network"
          >
            <a-select-option value="TRC-20">TRC-20</a-select-option>
            <a-select-option value="ERC-20">ERC-20</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 确认按钮 -->
        <div class="form-actions">
          <a-button
            type="primary"
            size="large"
            block
            @click="handleConfirm"
            :loading="loading"
            class="confirm-btn"
          >
            Confirm Application
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- 处理中页面 -->
    <div v-else-if="currentStep === 'processing'" class="processing-page">
      <div class="processing-content">
        <!-- 加载图标 -->
        <div class="loading-icon">
          <a-spin size="large" />
        </div>

        <h2 class="processing-title">USDC Account is being Processed!</h2>

        <!-- 处理信息 -->
        <div class="processing-info">
          <div class="info-row">
            <span class="info-label">Network</span>
            <span class="info-value">{{ formData.network }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Currency</span>
            <span class="info-value">{{ formData.currency }}</span>
          </div>
        </div>

        <!-- 提示信息 -->
        <div class="tips-section">
          <h4>What's Next?</h4>
          <ul class="tips-list">
            <li>Your account application has been submitted for review.</li>
            <li>You can click on application history to check the progress of your account activation.</li>
            <li>The result of this account activation review will be sent to your registered email.</li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="processing-actions">
          <a-button type="primary" size="large" block @click="handleDone" class="done-btn">
            Done
          </a-button>
          <a-button type="link" @click="handleViewHistory" class="history-link">
            Application History
          </a-button>
        </div>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <a-button
      v-if="currentStep === 'processing'"
      type="text"
      class="close-btn"
      @click="handleClose"
      icon="close"
    />
  </a-modal>
</template>

<script>
export default {
  name: 'ApplicationModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      currentStep: 'form', // 'form' | 'processing'
      form: this.$form.createForm(this),
      loading: false,
      formData: {
        currency: 'USDC',
        network: 'TRC-20'
      }
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.resetModal()
      }
    }
  },
  methods: {
    handleConfirm () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          this.formData = { ...values }

          // 模拟API调用
          setTimeout(() => {
            this.loading = false
            this.currentStep = 'processing'
          }, 1500)
        }
      })
    },

    handleDone () {
      this.handleClose()
    },

    handleViewHistory () {
      // 这里可以跳转到申请历史页面
      this.$message.info('跳转到申请历史页面')
      this.handleClose()
    },

    handleClose () {
      this.$emit('close')
    },

    resetModal () {
      this.currentStep = 'form'
      this.loading = false
      this.form.resetFields()
      this.formData = {
        currency: 'USDC',
        network: 'TRC-20'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.application-modal {
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 0;
  }
}

.application-form {
  padding: 32px;

  .modal-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 8px 0;
    text-align: center;
  }

  .modal-subtitle {
    font-size: 14px;
    color: #8c8c8c;
    text-align: center;
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .form-content {
    .form-item {
      margin-bottom: 24px;

      .ant-form-item-label {
        padding-bottom: 8px;

        label {
          font-weight: 500;
          color: #262626;
        }
      }

      .ant-select {
        .ant-select-selection {
          border-radius: 8px;
          border-color: #d9d9d9;

          &:hover, &:focus {
            border-color: #11253E;
          }
        }
      }

      .currency-option {
        display: flex;
        align-items: center;
        gap: 8px;

        .currency-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;

          &.usdc {
            background: #2775ca;
          }

          &.usdt {
            background: #26A57F;
          }
        }
      }
    }

    .form-actions {
      margin-top: 32px;

      .confirm-btn {
        background: #1f2937;
        border-color: #1f2937;
        border-radius: 8px;
        height: 48px;
        font-size: 16px;
        font-weight: 500;

        &:hover, &:focus {
          background: #374151;
          border-color: #374151;
        }
      }
    }
  }
}

.processing-page {
  padding: 48px 32px 32px;
  text-align: center;

  .processing-content {
    .loading-icon {
      margin-bottom: 24px;

      .ant-spin {
        .ant-spin-dot {
          i {
            background-color: #11253E;
          }
        }
      }
    }

    .processing-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 32px 0;
    }

    .processing-info {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        &:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }

        .info-label {
          font-size: 14px;
          color: #8c8c8c;
        }

        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
        }
      }
    }

    .tips-section {
      text-align: left;
      margin-bottom: 32px;

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 12px 0;
      }

      .tips-list {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: #8c8c8c;
        line-height: 1.6;

        li {
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .processing-actions {
      .done-btn {
        background: #1f2937;
        border-color: #1f2937;
        border-radius: 8px;
        height: 48px;
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;

        &:hover, &:focus {
          background: #374151;
          border-color: #374151;
        }
      }

      .history-link {
        color: #11253E;
        font-size: 14px;
        padding: 0;

        &:hover, &:focus {
          color: #40a9ff;
        }
      }
    }
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #bfbfbf;
  border: none;
  background: transparent;

  &:hover, &:focus {
    color: #8c8c8c;
    background: transparent;
  }
}

// 响应式设计
@media (max-width: 576px) {
  .application-modal {
    .ant-modal {
      max-width: calc(100vw - 32px);
      margin: 16px;
    }
  }

  .application-form,
  .processing-page {
    padding: 24px 16px;
  }

  .processing-page {
    .processing-content {
      .tips-section {
        .tips-list {
          padding-left: 16px;
        }
      }
    }
  }
}
</style>
