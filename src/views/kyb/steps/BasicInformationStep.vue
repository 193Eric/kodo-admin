<template>
  <div class="step-content">
    <h1 class="step-title">Basic Information</h1>

    <a-form :form="form" layout="vertical" class="step-form">
      <a-form-item label="Company Name">
        <a-input
          v-decorator="['company_name', {
            rules: [{ required: true, message: 'Please enter company name!' }],
            initialValue: formData.company_name
          }]"
          size="large"
          placeholder="Enter company name"
        />
      </a-form-item>

      <a-form-item label="Registration Number">
        <a-input
          v-decorator="['registration_number', {
            rules: [{ required: true, message: 'Please enter registration number!' }],
            initialValue: formData.registration_number
          }]"
          size="large"
          placeholder="Enter registration number"
        />
      </a-form-item>

      <a-form-item label="Registration Date">
        <a-date-picker
          v-decorator="['registration_date', {
            rules: [{ required: true, message: 'Please select registration date!' }],
            initialValue: getDateValue()
          }]"
          size="large"
          style="width: 100%"
          placeholder="Select registration date"
        />
      </a-form-item>

      <a-form-item label="Registered Address">
        <a-textarea
          v-decorator="['registered_address', {
            rules: [{ required: true, message: 'Please enter address!' }],
            initialValue: formData.registered_address
          }]"
          :rows="3"
          placeholder="Enter registered address"
        />
      </a-form-item>

      <a-form-item label="Business Scope">
        <a-textarea
          v-decorator="['business_scope', {
            rules: [{ required: true, message: 'Please enter business scope!' }],
            initialValue: formData.business_scope
          }]"
          :rows="3"
          placeholder="Describe your business scope"
        />
      </a-form-item>

      <a-form-item label="Website Address">
        <a-input
          v-decorator="['website', {
            rules: [{ required: true, message: 'Please enter website address!' }],
            initialValue: formData.website
          }]"
          size="large"
          placeholder="https://www.example.com"
        />
      </a-form-item>
    </a-form>

    <div class="step-actions">
      <a-button @click="handleBack" size="large" class="back-btn">
        <a-icon type="left" />
        Back
      </a-button>
      <a-button type="default" @click="handleSaveDraft" size="large" class="draft-btn" :loading="savingDraft">
        Save as draft
      </a-button>
      <a-button type="primary" @click="handleNext" size="large" :loading="loading">
        Continue
      </a-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'BasicInformationStep',
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  watch: {
    // 监听formData的变化，重新设置表单值
    formData: {
      handler (newVal) {
        if (newVal && this.form) {
          this.$nextTick(() => {
            this.updateFormFields()
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false,
      savingDraft: false
    }
  },
  mounted () {
    // 组件挂载后设置表单值
    this.$nextTick(() => {
      this.updateFormFields()
    })
  },
  methods: {
    // 更新表单字段值
    updateFormFields () {
      if (!this.form || !this.formData) return

      const fieldsValue = {
        company_name: this.formData.company_name || '',
        registration_number: this.formData.registration_number || '',
        registration_date: this.getDateValue(),
        registered_address: this.formData.registered_address || '',
        business_scope: this.formData.business_scope || '',
        website: this.formData.website || ''
      }

      this.form.setFieldsValue(fieldsValue)
    },

    // 获取日期值
    getDateValue () {
      if (this.formData.registration_date) {
        // 如果是字符串，转换为moment对象
        if (typeof this.formData.registration_date === 'string') {
          return moment(this.formData.registration_date)
        }
        // 如果已经是moment对象，直接返回
        if (this.formData.registration_date && typeof this.formData.registration_date.format === 'function') {
          return this.formData.registration_date
        }
      }
      return null
    },

    handleNext () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true

          // 模拟加载过程
          setTimeout(() => {
            this.loading = false
            this.$emit('next', 'basic', values)
          }, 500)
        }
      })
    },

    handleBack () {
      // 先保存当前表单数据再返回
      this.form.validateFields((err, values) => {
        // 不管是否有错误都先保存当前数据到父组件
        if (values) {
          this.updateParentFormData(values)
        }
        this.$emit('back')
      })
    },

    handleSaveDraft () {
      this.savingDraft = true

      this.form.validateFields((err, values) => {
        // 不管验证是否通过都保存草稿
        try {
          // 首先更新父组件的formData
          this.updateParentFormData(values || {})

          // 触发父组件的saveDraft方法
          this.$emit('saveDraft')

          this.$message.success('Draft saved successfully!')
        } catch (error) {
          console.error('Save draft error:', error)
          this.$message.error('Failed to save draft!')
        } finally {
          this.savingDraft = false
        }
      })
    },

    // 更新父组件的formData
    updateParentFormData (values) {
      // 通过emit方式更新父组件数据
      const updateData = { ...values }

      // 确保所有字段都有值，避免undefined
      const fieldNames = ['company_name', 'registration_number', 'registration_date', 'registered_address', 'business_scope', 'website']
      fieldNames.forEach(field => {
        if (updateData[field] === undefined) {
          updateData[field] = this.formData[field] || ''
        }
      })

      // 发送更新事件到父组件
      this.$emit('updateFormData', updateData)
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
