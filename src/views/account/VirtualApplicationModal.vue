<template>
  <a-modal
    :visible="visible"
    :footer="null"
    :width="500"
    :closable="false"
    :maskClosable="false"
    centered
    @cancel="handleClose"
    wrapClassName="virtual-application-modal"
  >
    <!-- 选择国家/地区页面 -->
    <div v-if="currentStep === 'country'" class="country-selection">
      <h2 class="modal-title">Country/Region of Virtual Account</h2>
      <p class="modal-subtitle">Virtual account opening is currently supported only in Hong Kong and Mexico.</p>

      <a-form :form="form" layout="vertical" class="form-content">
        <!-- 国家选择 -->
        <a-form-item class="form-item">
          <a-select
            v-decorator="['country', { initialValue: 'Hongkong' }]"
            size="large"
            placeholder="Select country"
          >
            <a-select-option value="Hongkong">
              <div class="country-option">
                <div class="country-icon hk"></div>
                Hongkong
              </div>
            </a-select-option>
            <a-select-option value="Mexico">
              <div class="country-option">
                <div class="country-icon mx"></div>
                Mexico
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 继续按钮 -->
        <div class="form-actions">
          <a-button
            type="primary"
            size="large"
            block
            @click="handleContinue"
            :loading="loading"
            class="continue-btn"
          >
            Continue
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- 填写信息页面 -->
    <div v-else-if="currentStep === 'form'" class="information-form">
      <div class="form-header">
        <h2 class="modal-title">Virtual Account Information</h2>
        <div class="step-indicator">
          <div class="step-item completed">
            <div class="step-number">✓</div>
            <span>Virtual Account Information</span>
          </div>
          <div class="step-item active">
            <div class="step-number">2</div>
            <span>Create</span>
          </div>
        </div>
      </div>

      <a-form :form="infoForm" layout="vertical" class="form-content">
        <!-- 国家/地区 -->
        <a-form-item label="Country/Region of Virtual Account" class="form-item">
          <a-select v-decorator="['region', { initialValue: 'Hongkong' }]" size="large">
            <a-select-option value="Hongkong">Hongkong</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 货币 -->
        <a-form-item label="Currency" class="form-item">
          <a-select v-decorator="['currency', { initialValue: 'HKD' }]" size="large">
            <a-select-option value="HKD">
              <div class="currency-option">
                <div class="currency-icon hkd"></div>
                HKD
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 银行名称 -->
        <a-form-item label="Name of the Bank to Apply for" class="form-item">
          <a-select
            v-decorator="['bankName', { initialValue: 'STANDARD CHARTERED BANK (HONG KONG) LIMITED' }]"
            size="large"
          >
            <a-select-option value="STANDARD CHARTERED BANK (HONG KONG) LIMITED">
              STANDARD CHARTERED BANK (HONG KONG) LIMITED
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 银行账户号码 -->
        <a-form-item label="Bank Account Number" class="form-item">
          <a-input
            v-decorator="['accountNumber', { initialValue: '47411631736' }]"
            size="large"
            placeholder="Enter bank account number"
          />
        </a-form-item>

        <!-- ACH识别码 -->
        <a-form-item label="9-Digit ACH Bank Identification Code" class="form-item">
          <a-input
            v-decorator="['achCode', { initialValue: '026073123' }]"
            size="large"
            placeholder="Enter ACH identification code"
          />
        </a-form-item>

        <!-- Fedwire识别码 -->
        <a-form-item label="9-Digit Fedwire Bank Identification Code" class="form-item">
          <a-input
            v-decorator="['fedwireCode', { initialValue: '026073100' }]"
            size="large"
            placeholder="Enter Fedwire identification code"
          />
        </a-form-item>

        <!-- SWIFT代码 -->
        <a-form-item label="SWIFT Code/BIC" class="form-item">
          <a-input
            v-decorator="['swiftCode', { initialValue: 'CMFDUS71' }]"
            size="large"
            placeholder="Enter SWIFT code"
          />
        </a-form-item>

        <!-- 银行位置 -->
        <a-form-item label="Bank location" class="form-item">
          <a-select
            v-decorator="['bankLocation', { initialValue: 'Hongkong' }]"
            size="large"
          >
            <a-select-option value="Hongkong">Hongkong</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 银行地址 -->
        <a-form-item label="Bank Address" class="form-item">
          <a-textarea
            v-decorator="['bankAddress', { initialValue: '2464 Royal Ln. Mesa, New Jersey 45463' }]"
            :rows="3"
            placeholder="Enter bank address"
          />
        </a-form-item>

        <!-- 账户昵称 -->
        <a-form-item label="Account Nickname" class="form-item">
          <div class="nickname-help">The account nickname is for identification purposes</div>
          <a-input
            v-decorator="['nickname', { initialValue: 'STANDARD CHARTERED' }]"
            size="large"
            placeholder="Enter account nickname"
          />
        </a-form-item>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <a-button size="large" @click="handleBack" class="back-btn">
            <a-icon type="left" />
            Back
          </a-button>
          <a-button
            type="primary"
            size="large"
            @click="handleSubmit"
            :loading="submitLoading"
            class="submit-btn"
          >
            Continue
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- 处理中页面 -->
    <div v-else-if="currentStep === 'processing'" class="processing-page">
      <div class="processing-content">
        <h2 class="processing-title">HKD Bank Account is being Processed!</h2>
        <p class="processing-subtitle">
          Your USD bank account is being processed. You can click on the application history to check the progress.
          Thank you for your support!
        </p>

        <div class="step-indicator-right">
          <div class="step-item completed">
            <div class="step-number">✓</div>
            <span>Virtual Account Information</span>
          </div>
          <div class="step-item completed">
            <div class="step-number">✓</div>
            <span>Create</span>
          </div>
        </div>

        <!-- 银行信息显示 -->
        <div class="bank-info-display">
          <div class="bank-header">
            <div class="bank-icon hk"></div>
            <div class="bank-details">
              <div class="bank-name">STANDARD CHARTERED</div>
              <div class="bank-subtitle">HKD Account</div>
              <span class="status-processing">Processing</span>
            </div>
          </div>

          <div class="bank-info-grid">
            <div class="info-group">
              <div class="info-item">
                <span class="info-label">Bank Name</span>
                <span class="info-value">STANDARD CHARTERED BANK (HONG KONG) LIMITED</span>
              </div>
              <div class="info-item">
                <span class="info-label">9-Digit ACH Bank Identification Code</span>
                <span class="info-value">026073123</span>
              </div>
              <div class="info-item">
                <span class="info-label">SWIFT Code/BIC</span>
                <span class="info-value">CMFDUS71</span>
              </div>
              <div class="info-item">
                <span class="info-label">Bank Address</span>
                <span class="info-value">2464 Royal Ln. Mesa, New Jersey 45463</span>
              </div>
            </div>
            <div class="info-group">
              <div class="info-item">
                <span class="info-label">Bank Account Number</span>
                <span class="info-value">47411631736</span>
              </div>
              <div class="info-item">
                <span class="info-label">9-Digit Fedwire Bank Identification Code</span>
                <span class="info-value">026073100</span>
              </div>
              <div class="info-item">
                <span class="info-label">Bank location</span>
                <span class="info-value">HongKong</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 完成按钮 -->
        <div class="processing-actions">
          <a-button type="primary" size="large" block @click="handleDone" class="done-btn">
            Done
          </a-button>
        </div>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <a-button
      v-if="currentStep !== 'form'"
      type="text"
      class="close-btn"
      @click="handleClose"
      icon="close"
    />
  </a-modal>
</template>

<script>
export default {
  name: 'VirtualApplicationModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      currentStep: 'country', // 'country' | 'form' | 'processing'
      form: this.$form.createForm(this),
      infoForm: this.$form.createForm(this),
      loading: false,
      submitLoading: false,
      formData: {}
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
    handleContinue () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          this.formData = { ...values }

          setTimeout(() => {
            this.loading = false
            this.currentStep = 'form'
          }, 1000)
        }
      })
    },

    handleSubmit () {
      this.infoForm.validateFields((err, values) => {
        if (!err) {
          this.submitLoading = true
          this.formData = { ...this.formData, ...values }

          setTimeout(() => {
            this.submitLoading = false
            this.currentStep = 'processing'
          }, 1500)
        }
      })
    },

    handleBack () {
      this.currentStep = 'country'
    },

    handleDone () {
      this.handleClose()
    },

    handleClose () {
      this.$emit('close')
    },

    resetModal () {
      this.currentStep = 'country'
      this.loading = false
      this.submitLoading = false
      this.form.resetFields()
      this.infoForm.resetFields()
      this.formData = {}
    }
  }
}
</script>

<style lang="less" scoped>
.virtual-application-modal {
  .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 0;
  }
}

.country-selection {
  padding: 32px;

  .modal-title {
    font-size: 18px;
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

      .ant-select {
        .ant-select-selection {
          border-radius: 8px;
          border-color: #d9d9d9;

          &:hover, &:focus {
            border-color: #11253E;
          }
        }
      }

      .country-option {
        display: flex;
        align-items: center;
        gap: 8px;

        .country-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;

          &.hk {
            background: #d32f2f;
          }

          &.mx {
            background: #388e3c;
          }
        }
      }
    }

    .form-actions {
      margin-top: 32px;

      .continue-btn {
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

.information-form {
  padding: 24px 32px 32px;

  .form-header {
    margin-bottom: 24px;

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 16px 0;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 24px;

      .step-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;

        .step-number {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        &.completed .step-number {
          background: #52c41a;
          color: white;
        }

        &.active .step-number {
          background: #11253E;
          color: white;
        }
      }
    }
  }

  .form-content {
    .form-item {
      margin-bottom: 16px;

      .ant-form-item-label {
        padding-bottom: 6px;

        label {
          font-weight: 500;
          color: #262626;
          font-size: 13px;
        }
      }

      .nickname-help {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 6px;
      }

      .currency-option {
        display: flex;
        align-items: center;
        gap: 8px;

        .currency-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;

          &.hkd {
            background: #d32f2f;
          }
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;

      .back-btn {
        background: white;
        border-color: #d9d9d9;
        color: #262626;
        height: 40px;
        border-radius: 6px;

        &:hover {
          border-color: #11253E;
          color: #11253E;
        }
      }

      .submit-btn {
        background: #1f2937;
        border-color: #1f2937;
        height: 40px;
        border-radius: 6px;
        flex: 1;

        &:hover, &:focus {
          background: #374151;
          border-color: #374151;
        }
      }
    }
  }
}

.processing-page {
  padding: 32px;
  text-align: center;

  .processing-content {
    .processing-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 8px 0;
    }

    .processing-subtitle {
      font-size: 14px;
      color: #8c8c8c;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .step-indicator-right {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;

      .step-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;

        .step-number {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #52c41a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }
      }
    }

    .bank-info-display {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: left;

      .bank-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .bank-icon {
          width: 32px;
          height: 32px;
          background: #d32f2f;
          border-radius: 50%;
          margin-right: 12px;

          &.hk {
            background: #d32f2f;
          }
        }

        .bank-details {
          .bank-name {
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 2px;
          }

          .bank-subtitle {
            font-size: 12px;
            color: #8c8c8c;
            margin-bottom: 4px;
          }

          .status-processing {
            background: #fff7e6;
            color: #fa8c16;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
          }
        }
      }

      .bank-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        .info-group {
          .info-item {
            margin-bottom: 12px;

            .info-label {
              display: block;
              font-size: 11px;
              color: #8c8c8c;
              margin-bottom: 2px;
            }

            .info-value {
              font-size: 12px;
              color: #262626;
              word-break: break-word;
            }
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

        &:hover, &:focus {
          background: #374151;
          border-color: #374151;
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
  .virtual-application-modal {
    .ant-modal {
      max-width: calc(100vw - 32px);
      margin: 16px;
    }
  }

  .country-selection,
  .information-form,
  .processing-page {
    padding: 24px 16px;
  }

  .bank-info-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}
</style>
