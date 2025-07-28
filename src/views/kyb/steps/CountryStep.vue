<template>
  <div class="step-content">
    <h1 class="step-title">Country/Region of Incorporation</h1>
    <p class="step-subtitle">The physical location where the company is officially established or incorporated</p>

    <a-form :form="form" layout="vertical" class="step-form">
      <a-form-item>
        <a-select
          v-decorator="['country_code', {
            rules: [{ required: true, message: 'Please select a country!' }],
            initialValue: formData.country_code
          }]"
          size="large"
          placeholder="Select country"
        >
          <a-select-option value="HK">
            <div class="country-option">
              <span class="flag">🇭🇰</span>
              Hong Kong
            </div>
          </a-select-option>
          <a-select-option value="US">
            <div class="country-option">
              <span class="flag">🇺🇸</span>
              United States
            </div>
          </a-select-option>
          <a-select-option value="SG">
            <div class="country-option">
              <span class="flag">🇸🇬</span>
              Singapore
            </div>
          </a-select-option>
          <a-select-option value="CO">
            <div class="country-option">
              <span class="flag">🇨🇴</span>
              Colombia
            </div>
          </a-select-option>
          <a-select-option value="BR">
            <div class="country-option">
              <span class="flag">🇧🇷</span>
              Brazil
            </div>
          </a-select-option>
          <a-select-option value="MX">
            <div class="country-option">
              <span class="flag">🇲🇽</span>
              Mexico
            </div>
          </a-select-option>
          <a-select-option value="VN">
            <div class="country-option">
              <span class="flag">🇻🇳</span>
              Vietnam
            </div>
          </a-select-option>
          <a-select-option value="AR">
            <div class="country-option">
              <span class="flag">🇦🇷</span>
              Argentina
            </div>
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <div class="step-actions">
      <a-button type="primary" size="large" @click="handleNext" :loading="loading">
        Continue
      </a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CountryStep',
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
  mounted () {
    // 组件挂载后立即设置表单值
    this.$nextTick(() => {
      this.setFormValues()
    })
  },
  watch: {
    formData: {
      handler () {
        // 当formData变化时，重新设置表单值
        this.$nextTick(() => {
          this.setFormValues()
        })
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 统一的表单值设置方法
    setFormValues () {
      const countryCode = this.formData.country_code || 'HK'
      this.form.setFieldsValue({
        country_code: countryCode
      })
    },

    handleNext () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true

          setTimeout(() => {
            this.loading = false
            this.$emit('next', 'country', values)
          }, 200)
        }
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
    margin: 0 0 16px 0;
  }

  .step-subtitle {
    font-size: 14px;
    color: #8c8c8c;
    margin: 0 0 40px 0;
    line-height: 1.6;
  }

  .step-form {
    margin-bottom: 40px;

    .ant-form-item {
      margin-bottom: 24px;
    }

    .country-option {
      display: flex;
      align-items: center;
      gap: 8px;

      .flag {
        font-size: 16px;
      }
    }
  }

  .step-actions {
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
</style>
