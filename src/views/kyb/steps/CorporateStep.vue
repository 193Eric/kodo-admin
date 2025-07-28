<template>
  <div class="step-content">
    <h1 class="step-title">Corporate Background Information</h1>

    <a-form :form="form" layout="vertical" class="step-form">
      <a-form-item label="Country/region of main operations">
        <a-select
          v-decorator="['mainOperationsCountry', {
            rules: [{ required: true, message: 'Please select country!' }],
            initialValue: formData.mainOperationsCountry
          }]"
          size="large"
          placeholder="Select country"
        >
          <a-select-option value="America">America</a-select-option>
          <a-select-option value="Canada">Canada</a-select-option>
          <a-select-option value="UK">United Kingdom</a-select-option>
          <a-select-option value="Germany">Germany</a-select-option>
          <a-select-option value="France">France</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Primary Customer Acquisition Methods (Optional)">
        <a-select
          v-decorator="['customerAcquisition', {
            initialValue: formData.customerAcquisition
          }]"
          size="large"
          placeholder="Select method"
        >
          <a-select-option value="Online Marketing">Online Marketing</a-select-option>
          <a-select-option value="Referrals">Referrals</a-select-option>
          <a-select-option value="Direct Sales">Direct Sales</a-select-option>
          <a-select-option value="Social Media">Social Media</a-select-option>
          <a-select-option value="Traditional Advertising">Traditional Advertising</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="If customers are acquired through a third-party platform, please provide the name of the third-party platform (Optional)">
        <a-textarea
          v-decorator="['thirdPartyPlatform', { initialValue: formData.thirdPartyPlatform }]"
          :rows="2"
          placeholder="Enter platform details"
        />
      </a-form-item>

      <a-form-item label="Types of products/services expected to be used">
        <a-textarea
          v-decorator="['productsServices', {
            rules: [{ required: true, message: 'Please describe products/services!' }],
            initialValue: formData.productsServices
          }]"
          :rows="3"
          placeholder="Describe products and services"
        />
      </a-form-item>

      <a-form-item label="Is the company planning to enable API gateway payments?">
        <p class="field-hint">If you answered "Yes", please complete all information in Module 6 (Operational questionnaire).</p>
        <a-select
          v-decorator="['apiGateway', {
            rules: [{ required: true, message: 'Please select an option!' }],
            initialValue: formData.apiGateway
          }]"
          size="large"
          placeholder="Select option"
        >
          <a-select-option value="Yes">Yes</a-select-option>
          <a-select-option value="No">No</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="If yes to the above, please select (optional)">
        <a-select
          v-decorator="['apiGatewayRegion', { initialValue: formData.apiGatewayRegion }]"
          size="large"
          placeholder="Select region"
        >
          <a-select-option value="America">America</a-select-option>
          <a-select-option value="Europe">Europe</a-select-option>
          <a-select-option value="Asia">Asia</a-select-option>
          <a-select-option value="Global">Global</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Please list 3-5 major counterparties (if any) for this business (Optional)">
        <a-textarea
          v-decorator="['counterparties', { initialValue: formData.counterparties }]"
          :rows="3"
          placeholder="List major counterparties"
        />
      </a-form-item>

      <a-form-item label="Total projected monthly transactions (in United States dollars)">
        <a-select
          v-decorator="['monthlyTransactions', {
            rules: [{ required: true, message: 'Please select transaction volume!' }],
            initialValue: formData.monthlyTransactions
          }]"
          size="large"
          placeholder="Select transaction volume"
        >
          <a-select-option value="Under $10,000">Under $10,000</a-select-option>
          <a-select-option value="$10,000 - $50,000">$10,000 - $50,000</a-select-option>
          <a-select-option value="$50,000 - $100,000">$50,000 - $100,000</a-select-option>
          <a-select-option value="$100,000 - $500,000">$100,000 - $500,000</a-select-option>
          <a-select-option value="Over $500,000">Over $500,000</a-select-option>
        </a-select>
      </a-form-item>
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
  name: 'CorporateStep',
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false
    }
  },
  watch: {
    formData: {
      handler (newFormData) {
        // 当formData变化时，更新表单字段
        this.$nextTick(() => {
          const fieldsValue = {}

          // 只设置有值的字段
          if (newFormData.mainOperationsCountry) {
            fieldsValue.mainOperationsCountry = newFormData.mainOperationsCountry
          }
          if (newFormData.customerAcquisition) {
            fieldsValue.customerAcquisition = newFormData.customerAcquisition
          }
          if (newFormData.thirdPartyPlatform !== undefined) {
            fieldsValue.thirdPartyPlatform = newFormData.thirdPartyPlatform
          }
          if (newFormData.productsServices) {
            fieldsValue.productsServices = newFormData.productsServices
          }
          if (newFormData.apiGateway) {
            fieldsValue.apiGateway = newFormData.apiGateway
          }
          if (newFormData.apiGatewayRegion) {
            fieldsValue.apiGatewayRegion = newFormData.apiGatewayRegion
          }
          if (newFormData.counterparties !== undefined) {
            fieldsValue.counterparties = newFormData.counterparties
          }
          if (newFormData.monthlyTransactions) {
            fieldsValue.monthlyTransactions = newFormData.monthlyTransactions
          }

          this.form.setFieldsValue(fieldsValue)
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    // 组件挂载后立即设置表单值
    this.$nextTick(() => {
      this.initializeForm()
    })
  },
  methods: {
    initializeForm () {
      const fieldsValue = {}

      if (this.formData.mainOperationsCountry) {
        fieldsValue.mainOperationsCountry = this.formData.mainOperationsCountry
      }
      if (this.formData.customerAcquisition) {
        fieldsValue.customerAcquisition = this.formData.customerAcquisition
      }
      if (this.formData.thirdPartyPlatform !== undefined) {
        fieldsValue.thirdPartyPlatform = this.formData.thirdPartyPlatform
      }
      if (this.formData.productsServices) {
        fieldsValue.productsServices = this.formData.productsServices
      }
      if (this.formData.apiGateway) {
        fieldsValue.apiGateway = this.formData.apiGateway
      }
      if (this.formData.apiGatewayRegion) {
        fieldsValue.apiGatewayRegion = this.formData.apiGatewayRegion
      }
      if (this.formData.counterparties !== undefined) {
        fieldsValue.counterparties = this.formData.counterparties
      }
      if (this.formData.monthlyTransactions) {
        fieldsValue.monthlyTransactions = this.formData.monthlyTransactions
      }

      this.form.setFieldsValue(fieldsValue)
    },

    handleNext () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true

          setTimeout(() => {
            this.loading = false
            this.$emit('next', 'corporate', values)
          }, 1500)
        }
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
          step: 'corporate',
          timestamp: new Date().toISOString()
        }

        try {
          const existingDraft = JSON.parse(localStorage.getItem('businessVerificationDraft') || '{}')
          const updatedDraft = {
            ...existingDraft,
            formData: { ...existingDraft.formData, ...values },
            currentStep: 'corporate',
            timestamp: new Date().toISOString()
          }
          localStorage.setItem('businessVerificationDraft', JSON.stringify(updatedDraft))
          this.$message.success('Draft saved successfully!')
        } catch (error) {
          this.$message.error('Failed to save draft!')
        }

        this.$emit('saveDraft', draftData)
      })
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
    margin: 0 0 32px 0;
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

    .field-hint {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 8px;
      line-height: 1.4;
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
  .step-content .step-actions {
    flex-direction: column;
    gap: 12px;

    .ant-btn {
      width: 100%;
    }
  }
}
</style>
