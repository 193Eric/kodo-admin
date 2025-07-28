<template>
  <div class="step-content">
    <h1 class="step-title">Business Questionnaire</h1>
    <p class="step-description">
      * If there is no need to apply for an API gateway, this page does not need to be filled in, and can be
      submitted directly.
    </p>

    <a-form :form="form" layout="vertical" class="step-form">
      <a-form-item label="Primary customer type (Optional)">
        <a-select
          v-decorator="['primaryCustomerType', { initialValue: formData.primaryCustomerType }]"
          size="large"
          placeholder="Select customer type"
        >
          <a-select-option value="B2B">Business to Business (B2B)</a-select-option>
          <a-select-option value="B2C">Business to Consumer (B2C)</a-select-option>
          <a-select-option value="Mixed">Mixed</a-select-option>
          <a-select-option value="G2B">Government to Business (G2B)</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Description of the business model between the company and its customers and the flow of funds with counterparties (Optional)">
        <a-textarea
          v-decorator="['businessModel', { initialValue: formData.businessModel }]"
          :rows="4"
          placeholder="Describe your business model"
        />
      </a-form-item>

      <a-form-item label="Number of employees (Optional)">
        <a-input
          v-decorator="['numberOfEmployees', { initialValue: formData.numberOfEmployees }]"
          size="large"
          placeholder="Enter number of employees"
        />
      </a-form-item>

      <a-form-item label="Contact information (name, contact phone number and e-mail address) (Optional)">
        <a-textarea
          v-decorator="['contactInfo', { initialValue: formData.contactInfo }]"
          :rows="3"
          placeholder="Enter contact information"
        />
      </a-form-item>

      <a-form-item label="Initial source of wealth (source of total assets for the subject as a whole) (Optional)">
        <a-select
          v-decorator="['initialWealth', { initialValue: formData.initialWealth }]"
          size="large"
          placeholder="Select wealth source"
        >
          <a-select-option value="Business Income">Business Income</a-select-option>
          <a-select-option value="Investment">Investment</a-select-option>
          <a-select-option value="Inheritance">Inheritance</a-select-option>
          <a-select-option value="Savings">Savings</a-select-option>
          <a-select-option value="Other">Other</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Ongoing source of wealth and income (Optional)">
        <a-select
          v-decorator="['ongoingWealth', { initialValue: formData.ongoingWealth }]"
          size="large"
          placeholder="Select ongoing wealth source"
        >
          <a-select-option value="Business Revenue">Business Revenue</a-select-option>
          <a-select-option value="Investment Returns">Investment Returns</a-select-option>
          <a-select-option value="Salary">Salary</a-select-option>
          <a-select-option value="Rental Income">Rental Income</a-select-option>
          <a-select-option value="Other">Other</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Anticipated source of funds (source of funds to be recharged to ePay) (optional)">
        <a-select
          v-decorator="['fundsSource', { initialValue: formData.fundsSource }]"
          size="large"
          placeholder="Select funds source"
        >
          <a-select-option value="Company Account">Company Account</a-select-option>
          <a-select-option value="Personal Account">Personal Account</a-select-option>
          <a-select-option value="Investment Account">Investment Account</a-select-option>
          <a-select-option value="Business Partner">Business Partner</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Total income for the year (United States dollars) (optional)">
        <a-input
          v-decorator="['totalIncome', { initialValue: formData.totalIncome }]"
          size="large"
          placeholder="Enter total annual income"
        />
      </a-form-item>

      <a-form-item label="Purpose of business relationship with XXXXX (optional)">
        <a-textarea
          v-decorator="['businessPurpose', { initialValue: formData.businessPurpose }]"
          :rows="3"
          placeholder="Describe business purpose"
        />
      </a-form-item>

      <!-- File upload sections -->
      <div class="upload-section">
        <h3>Proof of store or website ownership (optional)</h3>
        <div class="upload-wrapper">
          <a-upload-dragger
            :file-list="localFileList.storeProof"
            @change="handleFileChange('storeProof', $event)"
            :before-upload="beforeUpload"
            :multiple="true"
            :show-upload-list="true"
            class="custom-upload"
          >
            <div class="upload-content">
              <a-icon type="cloud-upload" class="upload-icon" />
              <p class="upload-text">Drag & drop or <span class="upload-link">click to choose files</span></p>
              <p class="upload-hint">Supported files: .JPG/PNG/PDF, up to 12 MB</p>
            </div>
          </a-upload-dragger>
        </div>
      </div>

      <div class="upload-section">
        <h3>E-commerce back-office shopping screenshot voucher (optional)</h3>
        <div class="upload-wrapper">
          <a-upload-dragger
            :file-list="localFileList.ecommerceProof"
            @change="handleFileChange('ecommerceProof', $event)"
            :before-upload="beforeUpload"
            :multiple="true"
            :show-upload-list="true"
            class="custom-upload"
          >
            <div class="upload-content">
              <a-icon type="cloud-upload" class="upload-icon" />
              <p class="upload-text">Drag & drop or <span class="upload-link">click to choose files</span></p>
              <p class="upload-hint">Supported files: .JPG/PNG/PDF, up to 12 MB</p>
            </div>
          </a-upload-dragger>
        </div>
      </div>
    </a-form>

    <div class="step-actions">
      <a-button @click="handleBack" size="large" class="back-btn">
        <a-icon type="left" />
        Back
      </a-button>
      <a-button type="default" @click="handleSaveDraft" size="large" class="draft-btn">
        Save as draft
      </a-button>
      <a-button type="primary" @click="handleNext" size="large" :loading="loading">
        Continue
      </a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OperationalStep',
  props: {
    formData: {
      type: Object,
      required: true
    },
    fileList: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false,
      localFileList: { ...this.fileList }
    }
  },
  watch: {
    fileList: {
      handler (newFileList) {
        this.localFileList = { ...newFileList }
      },
      deep: true
    },
    formData: {
      handler (newFormData) {
        // 当formData变化时，更新表单字段
        this.$nextTick(() => {
          const fieldsValue = {}

          // 只设置有值的字段
          if (newFormData.primaryCustomerType) {
            fieldsValue.primaryCustomerType = newFormData.primaryCustomerType
          }
          if (newFormData.businessModel !== undefined) {
            fieldsValue.businessModel = newFormData.businessModel
          }
          if (newFormData.numberOfEmployees !== undefined) {
            fieldsValue.numberOfEmployees = newFormData.numberOfEmployees
          }
          if (newFormData.contactInfo !== undefined) {
            fieldsValue.contactInfo = newFormData.contactInfo
          }
          if (newFormData.initialWealth) {
            fieldsValue.initialWealth = newFormData.initialWealth
          }
          if (newFormData.ongoingWealth) {
            fieldsValue.ongoingWealth = newFormData.ongoingWealth
          }
          if (newFormData.fundsSource) {
            fieldsValue.fundsSource = newFormData.fundsSource
          }
          if (newFormData.totalIncome !== undefined) {
            fieldsValue.totalIncome = newFormData.totalIncome
          }
          if (newFormData.businessPurpose !== undefined) {
            fieldsValue.businessPurpose = newFormData.businessPurpose
          }

          this.form.setFieldsValue(fieldsValue)
        })
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleNext () {
      // OperationalStep 大部分字段都是可选的，所以不需要严格验证
      this.form.validateFields((err, values) => {
        // 即使有一些验证错误，也允许继续（因为大部分字段是可选的）
        this.loading = true

        setTimeout(() => {
          this.loading = false
          this.$emit('next', 'operational', values || {})
        }, 2000)
      })
    },

    handleBack () {
      this.$emit('back')
    },

    handleSaveDraft () {
      this.form.validateFields((err, values) => {
        // 不管是否有错误都保存草稿
        const draftData = {
          ...values,
          fileList: this.localFileList,
          step: 'operational',
          timestamp: new Date().toISOString()
        }

        try {
          const existingDraft = JSON.parse(localStorage.getItem('businessVerificationDraft') || '{}')
          const updatedDraft = {
            ...existingDraft,
            formData: { ...existingDraft.formData, ...values },
            fileList: { ...existingDraft.fileList, ...this.localFileList },
            currentStep: 'operational',
            timestamp: new Date().toISOString()
          }
          localStorage.setItem('businessVerificationDraft', JSON.stringify(updatedDraft))
          this.$message.success('Draft saved successfully!')
        } catch (error) {
          this.$message.error('Failed to save draft!')
        }

        this.$emit('saveDraft', draftData)
      })
    },

    beforeUpload (file) {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      if (!isValidType) {
        this.$message.error('Please upload JPG, PNG or PDF files only!')
        return false
      }

      const isValidSize = file.size / 1024 / 1024 < 12
      if (!isValidSize) {
        this.$message.error('File must be smaller than 12MB!')
        return false
      }

      return false // 阻止自动上传
    },

    handleFileChange (field, info) {
      this.localFileList[field] = info.fileList
      this.$emit('fileChange', field, info.fileList)
    }
  }
}
</script>

<style lang="less" scoped>
.step-content {
  .step-title {
    font-size: 28px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 16px 0;
  }

  .step-description {
    font-size: 14px;
    color: #8c8c8c;
    margin: 0 0 32px 0;
    line-height: 1.6;
  }

  .step-form {
    margin-bottom: 40px;

    .ant-form-item {
      margin-bottom: 24px;

      .ant-form-item-label {
        padding-bottom: 8px;

        label {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
        }
      }
    }

    .upload-section {
      margin-bottom: 32px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 16px 0;
      }

      .upload-wrapper {
        .custom-upload {
          // 重置 ant-design 的默认样式
          :deep(.ant-upload-drag) {
            border: 2px dashed #d9d9d9;
            border-radius: 8px;
            background: #fafafa;
            padding: 40px 20px;
            transition: all 0.3s ease;

            &:hover {
              border-color: #11253E;
              background: #f0f9ff;
            }

            .ant-upload-drag-container {
              text-align: center;
            }
          }

          // 上传内容样式
          .upload-content {
            .upload-icon {
              font-size: 48px;
              color: #bfbfbf;
              margin-bottom: 16px;
              display: block;
            }

            .upload-text {
              margin: 0 0 8px 0;
              font-size: 16px;
              color: #262626;

              .upload-link {
                color: #11253E;
                text-decoration: underline;
                cursor: pointer;

                &:hover {
                  color: #40a9ff;
                }
              }
            }

            .upload-hint {
              font-size: 14px;
              color: #8c8c8c;
              margin: 0;
            }
          }

          // 文件列表样式
          :deep(.ant-upload-list) {
            margin-top: 16px;

            .ant-upload-list-item {
              padding: 8px 16px;
              border: 1px solid #f0f0f0;
              border-radius: 6px;
              margin-bottom: 8px;
              background: white;

              &:hover {
                background: #fafafa;
              }

              .ant-upload-list-item-info {
                .ant-upload-list-item-name {
                  color: #262626;
                  font-size: 14px;
                }
              }

              .ant-upload-list-item-actions {
                .anticon {
                  color: #8c8c8c;

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
  }

  .step-actions {
    display: flex;
    gap: 16px;

    .back-btn {
      background: white;
      border-color: #d9d9d9;
      color: #262626;
      height: 40px;

      &:hover {
        border-color: #11253E;
        color: #11253E;
      }
    }

    .draft-btn {
      background: white;
      border-color: #d9d9d9;
      color: #262626;
      height: 40px;

      &:hover {
        border-color: #11253E;
        color: #11253E;
      }
    }

    .ant-btn-primary {
      background: #1f2937;
      border-color: #1f2937;
      height: 40px;
      padding: 0 32px;

      &:hover, &:focus {
        background: #374151;
        border-color: #374151;
      }
    }
  }
}

@media (max-width: 768px) {
  .step-content {
    .step-form .upload-section .upload-wrapper .custom-upload {
      :deep(.ant-upload-drag) {
        padding: 24px 16px;
      }

      .upload-content {
        .upload-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .upload-text {
          font-size: 14px;
        }

        .upload-hint {
          font-size: 12px;
        }
      }
    }

    .step-actions {
      flex-direction: column;
      gap: 12px;

      .ant-btn {
        width: 100%;
      }
    }
  }
}
</style>
