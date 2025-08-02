<template>
  <div class="business-verification">
    <!-- 首页 -->
    <div v-if="currentStep === 'home'" class="verification-home">
      <div class="container">
        <h1 class="page-title">Business Verification</h1>

        <div class="content-wrapper">
          <div class="main-content">
            <div class="privileges-section">
              <h2>Privileges after Verification</h2>
              <ul class="privileges-list">
                <li>Safe and efficient corporate financial services</li>
                <li>Supporting currencies from over 200 countries/regions</li>
                <li>Comprehensive API services</li>
              </ul>
              <a-button type="primary" size="large" @click="startVerification" class="verify-btn">
                Verify now
              </a-button>
            </div>

            <div class="preparation-section">
              <h2>You need to prepare</h2>
              <a-button type="link" class="requirements-link">
                <a-icon type="file-text" />
                Requirements checklist
              </a-button>
            </div>
          </div>

          <div class="faq-section">
            <h2>FAQ</h2>
            <div class="faq-list">
              <div class="faq-item">1. How can I know my company's type?</div>
              <div class="faq-item">2. What can I get after verification?</div>
              <div class="faq-item">3. How to Apply for Business Verification?</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 多步骤表单 -->
    <div v-else class="verification-form">
      <div class="container">
        <div class="form-wrapper" :class="{ 'no-sidebar': currentStep === 'country' }">
          <!-- 左侧表单内容 -->
          <div class="form-content">
            <!-- 步骤1: Country/Region of Incorporation -->
            <CountryStep
              v-if="currentStep === 'country'"
              :formData="formData"
              :key="'country-' + formDataVersion"
              @next="handleStepNext"
              @back="handleBack"
              @updateFormData="handleUpdateFormData"
            />

            <!-- 步骤2: Basic Information -->
            <BasicInformationStep
              v-if="currentStep === 'basic'"
              :formData="formData"
              :key="'basic-' + formDataVersion"
              @next="handleStepNext"
              @back="handleBack"
              @saveDraft="saveDraft"
              @updateFormData="handleUpdateFormData"
            />

            <!-- 步骤3: Proof of Business Registration -->
            <ProofStep
              v-if="currentStep === 'proof'"
              :formData="formData"
              :fileList="fileList"
              :key="'proof-' + formDataVersion"
              @next="handleStepNext"
              @back="handleBack"
              @saveDraft="saveDraft"
              @fileChange="handleFileChange"
              @updateFormData="handleUpdateFormData"
            />

            <!-- 步骤4: Ultimate Beneficial Owner(s) -->
            <UBOStep
              v-if="currentStep === 'ubo'"
              :formData="formData"
              :key="'ubo-' + formDataVersion"
              @next="handleStepNext"
              @back="handleBack"
              @saveDraft="saveDraft"
              @updateUBO="updateUBO"
              @updateFormData="handleUpdateFormData"
            />
          </div>

          <!-- 右侧进度条 - 只在非country步骤显示 -->
          <div v-if="currentStep !== 'country'" class="progress-sidebar">
            <div class="progress-container">
              <div
                class="progress-item" :class="{
                  completed: isStepCompleted('country'),
                  active: isStepActive('country'),
                  accessible: isStepAccessible('country')
                }">
                <div class="step-indicator">
                  <a-icon v-if="isStepCompleted('country')" type="check" class="check-icon" />
                  <span v-else class="step-number">1</span>
                </div>
                <span class="step-label">Country/Region of Incorporation</span>
              </div>

              <div
                class="progress-item" :class="{
                  completed: isStepCompleted('basic'),
                  active: isStepActive('basic'),
                  accessible: isStepAccessible('basic')
                }">
                <div class="step-indicator">
                  <a-icon v-if="isStepCompleted('basic')" type="check" class="check-icon" />
                  <span v-else class="step-number">2</span>
                </div>
                <span class="step-label">Basic Information</span>
              </div>

              <div
                class="progress-item" :class="{
                  completed: isStepCompleted('proof'),
                  active: isStepActive('proof'),
                  accessible: isStepAccessible('proof')
                }">
                <div class="step-indicator">
                  <a-icon v-if="isStepCompleted('proof')" type="check" class="check-icon" />
                  <span v-else class="step-number">3</span>
                </div>
                <span class="step-label">Proof of Business Registration</span>
              </div>

              <div
                class="progress-item" :class="{
                  completed: isStepCompleted('ubo'),
                  active: isStepActive('ubo'),
                  accessible: isStepAccessible('ubo')
                }">
                <div class="step-indicator">
                  <a-icon v-if="isStepCompleted('ubo')" type="check" class="check-icon" />
                  <span v-else class="step-number">4</span>
                </div>
                <span class="step-label">Ultimate Beneficial Owner(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { request } from '@/api/_service'
import CountryStep from './steps/CountryStep.vue'
import BasicInformationStep from './steps/BasicInformationStep.vue'
import ProofStep from './steps/ProofStep.vue'
import UBOStep from './steps/UBOStep.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'BusinessVerification',
  components: {
    CountryStep,
    BasicInformationStep,
    ProofStep,
    UBOStep
  },

  async mounted () {
    // 检查是否有ID参数，如果有则获取并回填数据
    const kybId = this.$route.query.id
    console.log(this.$route.query.id, 123123)
    if (kybId) {
      await this.loadKYBData(kybId)
    } else {
      // 页面加载时检查是否有草稿
      this.loadDraft()
    }
  },

  computed: {
    ...mapGetters([
      'getMainMerchant'
    ])
  },

  data () {
    return {
      currentStep: 'home', // 'home', 'country', 'basic', 'proof', 'ubo'

      // 完成的步骤
      completedSteps: [],

      // 用于强制刷新子组件的版本号
      formDataVersion: 0,

      // 表单数据 - 预定义所有字段确保响应式，文件字段都改为数组
      formData: {
        // 基础字段
        is_sub: 0,
        merchant_id: '',

        // 国家步骤
        country_code: '',

        // 基础信息步骤
        company_name: '',
        registration_number: '',
        registration_date: null,
        registered_address: '',
        business_scope: '',
        website: '',

        // 文件上传步骤 - 所有文件字段改为数组格式
        cr_certificate_url: [],
        br_certificate_url: [],
        annual_return_url: [],
        company_constitution_url: [],
        company_registr_certificate: [],
        proof_of_equity_structure: [],
        other_files: [], // 多文件数组

        // 时间相关字段
        is_long_term: 1,
        certificate_effective_date: '',

        // UBO字段 - id_no改为数组格式
        beneficiary_name: '',
        beneficiary_surname: '',
        nationality: '',
        legal_person_id_type: '',
        id_no: []
      },

      // 保留兼容性的文件列表（用于显示，实际数据存储在formData中）
      fileList: {
        certificateOfIncorporation: [],
        businessRegistrationCertificate: [],
        annualReturns: [],
        articlesOfIncorporation: [],
        otherDocuments: [],
        storeProof: [],
        ecommerceProof: []
      }
    }
  },

  methods: {
    /**
     * 从接口加载KYB数据并回填
     */
    async loadKYBData (kybId) {
      try {
        this.$message.loading('Loading data...', 0)

        const response = await request({
          url: `/merchant/kyb/${kybId}`,
          method: 'get'
        })

        this.$message.destroy()

        if (response.code === 200 && response.data) {
          await this.fillFormWithKYBData(response.data)
          this.$message.success('Data loaded successfully!')

          // 如果当前在首页，跳转到第一步开始编辑
          if (this.currentStep === 'home') {
            this.currentStep = 'country'
          }
        } else {
          throw new Error(response.message || 'Failed to load data')
        }
      } catch (error) {
        this.$message.destroy()
        console.error('Load KYB data error:', error)
        this.$message.error(`Failed to load data: ${error.message}`)

        // 加载失败时加载草稿作为备选
        this.loadDraft()
      }
    },

    /**
     * 将接口返回的KYB数据填充到表单中
     */
    async fillFormWithKYBData (data) {
      try {
        // 创建新的formData对象
        const newFormData = { ...this.formData }

        // 基础信息映射
        if (data.country_code) newFormData.country_code = data.country_code
        if (data.company_name) newFormData.company_name = data.company_name
        if (data.registration_number) newFormData.registration_number = data.registration_number
        if (data.registered_address) newFormData.registered_address = data.registered_address
        if (data.business_scope) newFormData.business_scope = data.business_scope
        if (data.website) newFormData.website = data.website

        // 处理日期字段
        if (data.registration_date) {
          newFormData.registration_date = moment(data.registration_date)
        }

        // 处理长期有效性和证书有效期
        if (data.is_long_term !== undefined) {
          newFormData.is_long_term = data.is_long_term
        }
        if (data.certificate_effective_date) {
          newFormData.certificate_effective_date = data.certificate_effective_date
        }

        // UBO信息映射
        if (data.beneficiary_name) newFormData.beneficiary_name = data.beneficiary_name
        if (data.beneficiary_surname) newFormData.beneficiary_surname = data.beneficiary_surname
        if (data.nationality) newFormData.nationality = data.nationality
        if (data.legal_person_id_type) newFormData.legal_person_id_type = data.legal_person_id_type.toString()

        // 处理文件字段 - 将JSON字符串转换为数组
        const fileFields = [
          'cr_certificate_url',
          'br_certificate_url',
          'annual_return_url',
          'company_constitution_url',
          'company_registr_certificate',
          'proof_of_equity_structure',
          'other_files',
          'id_no'
        ]

        fileFields.forEach(fieldName => {
          const fieldData = data[fieldName]
          if (fieldData) {
            try {
              // 尝试解析JSON字符串
              if (typeof fieldData === 'string') {
                const parsedData = JSON.parse(fieldData)
                if (Array.isArray(parsedData)) {
                  newFormData[fieldName] = parsedData.filter(url => url && typeof url === 'string')
                } else {
                  newFormData[fieldName] = []
                }
              } else if (Array.isArray(fieldData)) {
                newFormData[fieldName] = fieldData.filter(url => url && typeof url === 'string')
              } else {
                newFormData[fieldName] = []
              }
            } catch (parseError) {
              console.warn(`Failed to parse ${fieldName}:`, parseError)
              newFormData[fieldName] = []
            }
          } else {
            newFormData[fieldName] = []
          }
        })

        // 设置merchant_id
        if (data.merchant_id) {
          newFormData.merchant_id = data.merchant_id
        }

        // 更新formData - 这里使用直接赋值而不是合并，确保完全替换
        this.formData = newFormData

        // 根据数据完整性标记已完成的步骤
        this.markCompletedStepsFromData(newFormData)

        // 增加版本号以触发子组件更新
        this.formDataVersion++

        // 延迟一下确保子组件能收到更新
        await this.$nextTick()

        console.log('KYB data filled successfully:', newFormData)
      } catch (error) {
        console.error('Fill form data error:', error)
        throw new Error('Failed to process data')
      }
    },

    /**
     * 根据数据完整性标记已完成的步骤
     */
    markCompletedStepsFromData (formData) {
      this.completedSteps = []

      // 检查国家步骤
      if (formData.country_code) {
        this.completedSteps.push('country')
      }

      // 检查基础信息步骤
      if (formData.company_name && formData.registration_number &&
          formData.registration_date && formData.registered_address &&
          formData.business_scope && formData.website) {
        this.completedSteps.push('basic')
      }

      // 检查文件上传步骤
      const requiredFileFields = [
        'cr_certificate_url',
        'br_certificate_url',
        'annual_return_url',
        'company_constitution_url',
        'company_registr_certificate',
        'proof_of_equity_structure'
      ]

      const hasAllRequiredFiles = requiredFileFields.every(field =>
        formData[field] && Array.isArray(formData[field]) && formData[field].length > 0
      )

      if (hasAllRequiredFiles) {
        this.completedSteps.push('proof')
      }

      // 检查UBO步骤
      if (formData.beneficiary_name && formData.beneficiary_surname &&
          formData.nationality && formData.legal_person_id_type &&
          formData.id_no && Array.isArray(formData.id_no) && formData.id_no.length > 0) {
        this.completedSteps.push('ubo')
      }

      console.log('Completed steps marked:', this.completedSteps)
    },

    startVerification () {
      this.currentStep = 'country'
    },

    isStepCompleted (step) {
      return this.completedSteps.includes(step)
    },

    isStepActive (step) {
      return this.currentStep === step
    },

    isStepAccessible (step) {
      const steps = ['country', 'basic', 'proof', 'ubo']
      const stepIndex = steps.indexOf(step)
      const currentStepIndex = steps.indexOf(this.currentStep)

      // 当前步骤和之前的步骤都是可访问的
      return stepIndex <= currentStepIndex || this.isStepCompleted(step)
    },

    markStepCompleted (step) {
      if (!this.completedSteps.includes(step)) {
        this.completedSteps.push(step)
      }
    },

    // 处理子组件的数据更新
    handleUpdateFormData (updateData) {
      // 深度合并更新数据，处理文件数组字段
      Object.keys(updateData).forEach(key => {
        // 如果是文件字段，确保为数组格式
        const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                           'company_constitution_url', 'company_registr_certificate',
                           'proof_of_equity_structure', 'other_files', 'id_no'] // 添加id_no到文件字段列表

        if (fileFields.includes(key)) {
          // 确保文件字段是数组格式
          let value = updateData[key]
          if (typeof value === 'string' && value) {
            // 兼容旧的字符串格式，转换为数组
            value = [value]
          } else if (!Array.isArray(value)) {
            value = []
          }
          this.$set(this.formData, key, value)
        } else {
          this.$set(this.formData, key, updateData[key])
        }
      })

      // 增加版本号以触发子组件重新渲染
      this.formDataVersion++

      // 自动保存草稿
      this.$nextTick(() => {
        this.saveDraft()
      })
    },

    handleBack () {
      const steps = ['country', 'basic', 'proof', 'ubo']
      const currentIndex = steps.indexOf(this.currentStep)

      if (currentIndex > 0) {
        const previousStep = steps[currentIndex - 1]
        this.currentStep = previousStep

        // 保持已完成步骤的状态，只是切换当前步骤
        // 这样用户可以自由在已完成的步骤间前后切换
      }
    },

    saveDraft (stepData = null) {
      try {
        // 如果有步骤数据，先更新到formData
        if (stepData) {
          Object.assign(this.formData, stepData)
        }

        const draftData = {
          currentStep: this.currentStep,
          completedSteps: [...this.completedSteps],
          formData: { ...this.formData },
          timestamp: new Date().toISOString()
        }

        // 处理日期字段的序列化
        if (draftData.formData.registration_date) {
          if (typeof draftData.formData.registration_date === 'string') {
            draftData.formData.registration_date = draftData.formData.registration_date
          } else if (draftData.formData.registration_date.format) {
            draftData.formData.registration_date = draftData.formData.registration_date.format('YYYY-MM-DD')
          }
        }
        if (draftData.formData.certificate_effective_date) {
          if (typeof draftData.formData.certificate_effective_date === 'string') {
            draftData.formData.certificate_effective_date = draftData.formData.certificate_effective_date
          } else if (draftData.formData.certificate_effective_date.format) {
            draftData.formData.certificate_effective_date = draftData.formData.certificate_effective_date.format('YYYY-MM-DD')
          }
        }

        // 确保所有文件字段都是数组格式进行存储
        const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                           'company_constitution_url', 'company_registr_certificate',
                           'proof_of_equity_structure', 'other_files', 'id_no'] // 添加id_no

        fileFields.forEach(field => {
          if (draftData.formData[field]) {
            if (typeof draftData.formData[field] === 'string') {
              draftData.formData[field] = [draftData.formData[field]]
            } else if (!Array.isArray(draftData.formData[field])) {
              draftData.formData[field] = []
            }
          } else {
            draftData.formData[field] = []
          }
        })

        localStorage.setItem('businessVerificationDraft', JSON.stringify(draftData))
        console.log('Draft saved:', draftData)
      } catch (error) {
        console.error('Save draft error:', error)
      }
    },

    loadDraft () {
      // 如果URL中有ID参数，不加载草稿
      const kybId = this.$route.query.id
      if (kybId) {
        return
      }

      try {
        const savedDraft = localStorage.getItem('businessVerificationDraft')
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft)

          // 直接恢复数据，不弹窗确认
          if (draftData.currentStep && draftData.currentStep !== 'home') {
            this.currentStep = draftData.currentStep
          }
          if (draftData.completedSteps) {
            this.completedSteps = [...draftData.completedSteps]
          }
          if (draftData.formData) {
            // 合并表单数据
            const formData = { ...this.formData, ...draftData.formData }

            // 处理日期字段的反序列化
            if (formData.registration_date && typeof formData.registration_date === 'string') {
              formData.registration_date = moment(formData.registration_date)
            }
            if (formData.certificate_effective_date && typeof formData.certificate_effective_date === 'string') {
              formData.certificate_effective_date = moment(formData.certificate_effective_date)
            }

            // 确保所有文件字段都是数组格式
            const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                               'company_constitution_url', 'company_registr_certificate',
                               'proof_of_equity_structure', 'other_files', 'id_no'] // 添加id_no

            fileFields.forEach(field => {
              if (formData[field]) {
                if (typeof formData[field] === 'string') {
                  // 兼容旧格式，字符串转数组
                  formData[field] = [formData[field]]
                } else if (!Array.isArray(formData[field])) {
                  formData[field] = []
                }
              } else {
                formData[field] = []
              }
            })

            this.formData = formData
          }

          // 增加版本号以触发子组件更新
          this.formDataVersion++

          console.log('Draft loaded automatically:', draftData)
        }
      } catch (error) {
        console.error('Load draft error:', error)
        localStorage.removeItem('businessVerificationDraft')
      }
    },

    handleStepNext (stepName, data) {
      // 更新表单数据，确保文件字段为数组格式
      const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                         'company_constitution_url', 'company_registr_certificate',
                         'proof_of_equity_structure', 'other_files', 'id_no'] // 添加id_no

      Object.keys(data).forEach(key => {
        if (fileFields.includes(key)) {
          let value = data[key]
          if (typeof value === 'string' && value) {
            value = [value]
          } else if (!Array.isArray(value)) {
            value = []
          }
          this.formData[key] = value
        } else {
          this.formData[key] = data[key]
        }
      })

      // 标记步骤完成
      this.markStepCompleted(stepName)

      // 保存草稿
      this.saveDraft()

      // 跳转到下一步
      const steps = ['country', 'basic', 'proof', 'ubo']
      const currentIndex = steps.indexOf(stepName)

      if (currentIndex < steps.length - 1) {
        this.currentStep = steps[currentIndex + 1]
      } else {
        // 最后一步，提交验证
        this.submitVerification()
      }
    },

    async submitVerification () {
      try {
        // 准备提交的数据
        var submitData = {
          ...this.formData,
          is_sub: this.$route.query.is_sub || 0,
          merchant_id: this.getMainMerchant.merchant_id || ''
        }

        // 处理文件字段，确保为JSON字符串格式的数组
        const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                           'company_constitution_url', 'company_registr_certificate',
                           'proof_of_equity_structure', 'other_files', 'id_no'] // 添加id_no

        fileFields.forEach(field => {
          if (submitData[field] && Array.isArray(submitData[field]) && submitData[field].length > 0) {
            // 将数组转换为JSON字符串格式，如接口要求的格式
            submitData[field] = JSON.stringify(submitData[field])
          } else {
            // 如果数组为空，则删除该字段或设置为空数组的JSON字符串
            delete submitData[field]
          }
        })

        // 处理日期格式
        if (submitData.registration_date) {
          if (typeof submitData.registration_date === 'string') {
            submitData.registration_date = submitData.registration_date
          } else if (submitData.registration_date.format) {
            submitData.registration_date = submitData.registration_date.format('YYYY-MM-DD')
          }
        }
        if (submitData.certificate_effective_date) {
          if (typeof submitData.certificate_effective_date === 'string') {
            submitData.certificate_effective_date = submitData.certificate_effective_date
          } else if (submitData.certificate_effective_date.format) {
            submitData.certificate_effective_date = submitData.certificate_effective_date.format('YYYY-MM-DD')
          }
        }

        // 调用提交接口
        const response = await request({
          url: '/merchant/kyb/v2/submit',
          method: 'post',
          data: submitData
        })

        if (response.code === 200) {
          // 提交成功后清除草稿
          localStorage.removeItem('businessVerificationDraft')

          this.$message.success('Business Verification submitted successfully!')

          console.log('Final form data:', submitData)
          setTimeout(() => {
            this.$router.push('/overview')
            window.location.reload()
          }, 1000)
        } else {
          throw new Error(response.message || 'Submission failed')
        }
      } catch (error) {
        console.error('Submit verification error:', error)
        this.$message.error(error.message || 'Failed to submit verification. Please try again.')
      }
    },

    // 更新UBO信息到formData
    updateUBO (uboData) {
      Object.assign(this.formData, uboData)
      this.saveDraft()
    },

    // 保留这个方法用于兼容性
    handleFileChange (field, fileList) {
      this.fileList[field] = fileList
    }
  }
}
</script>

<style lang="less" scoped>
.business-verification {
  min-height: 100vh;
  background: #fafafa;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

// 首页样式
.verification-home {
  padding: 60px 0;

  .page-title {
    font-size: 32px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 48px 0;
  }

  .content-wrapper {
    display: flex;
    gap: 80px;

    .main-content {
      flex: 1;
      max-width: 600px;

      .privileges-section {
        margin-bottom: 80px;

        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #262626;
          margin: 0 0 24px 0;
        }

        .privileges-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;

          li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 12px;
            color: #595959;
            line-height: 1.6;

            &::before {
              content: '•';
              position: absolute;
              left: 0;
              color: #11253E;
              font-weight: bold;
            }
          }
        }

        .verify-btn {
          background: #1f2937;
          border-color: #1f2937;
          height: 48px;
          padding: 0 32px;
          font-size: 16px;
          font-weight: 500;

          &:hover, &:focus {
            background: #374151;
            border-color: #374151;
          }
        }
      }

      .preparation-section {
        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #262626;
          margin: 0 0 16px 0;
        }

        .requirements-link {
          color: #000;
          padding: 0;
          font-size: 14px;

          .anticon {
            margin-right: 6px;
          }

          &:hover {
            color: #000;
          }
        }
      }
    }

    .faq-section {
      width: 300px;

      h2 {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 24px 0;
      }

      .faq-list {
        .faq-item {
          padding: 12px 0;
          color: #595959;
          font-size: 14px;
          line-height: 1.5;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }
  }
}

// 表单页面样式
.verification-form {
  padding: 40px 0;

  .form-wrapper {
    display: flex;
    gap: 80px;

    // 当没有侧边栏时，让内容居中
    &.no-sidebar {
      justify-content: center;

      .form-content {
        max-width: 600px;
      }
    }

    .form-content {
      flex: 1;
      max-width: 700px;
    }

    // 右侧进度条
    .progress-sidebar {
      width: 275px;
      flex-shrink: 0;

      .progress-container {
        position: sticky;
        top: 40px;

        .progress-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          position: relative;

          // 连接线 - 垂直虚线
          &:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 10px;
            top: 40px;
            bottom: -16px;
            width: 2px;
            background: repeating-linear-gradient(
              to bottom,
              #d9d9d9 0,
              #d9d9d9 4px,
              transparent 4px,
              transparent 8px
            );
          }

          // 已完成步骤的连接线为绿色
          &.completed::after {
            background: repeating-linear-gradient(
              to bottom,
              #11253E 0,
              #11253E 4px,
              transparent 4px,
              transparent 8px
            );
          }

          // 激活状态的指示器
          &.active .step-indicator {
            background: #2c3e50;
            color: white;
            border-color: #2c3e50;
          }

          // 已完成状态的指示器
          &.completed .step-indicator {
            background: #fff;
            color: #000;
            border-color: #11253E;
          }

          // 可访问但未激活的状态
          &.accessible:not(.active):not(.completed) .step-indicator {
            border-color: #d9d9d9;
            color: #8c8c8c;
            background: white;
          }

          // 不可访问状态
          &:not(.accessible) {
            opacity: 0.4;

            .step-indicator {
              background: #f5f5f5;
              border-color: #e8e8e8;
              color: #bfbfbf;
            }

            .step-label {
              color: #bfbfbf;
            }
          }

          .step-indicator {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 2px solid #d9d9d9;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            color: #000;
            flex-shrink: 0;
            position: relative;
            z-index: 1;

            .check-icon {
              font-size: 14px;
            }
          }

          .step-label {
            font-size: 12px;
            color: #000;
            line-height: 1.4;
            font-weight: 500;
          }

          // 非激活和非完成状态的标签颜色
          &:not(.active):not(.completed) .step-label {
            color: #8c8c8c;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .verification-home .content-wrapper {
    flex-direction: column;
    gap: 40px;
  }

  .verification-form .form-wrapper {
    flex-direction: column;
    gap: 40px;

    &.no-sidebar {
      justify-content: flex-start;
    }

    .progress-sidebar {
      width: 100%;

      .progress-container {
        position: static;
        display: flex;
        overflow-x: auto;
        padding: 14px;
        gap: 24px;

        .progress-item {
          flex-direction: column;
          align-items: center;
          min-width: 120px;
          text-align: center;
          padding: 8px;

          &::after {
            display: none;
          }

          .step-indicator {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .step-label {
            font-size: 12px;
            margin-top: 8px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .business-verification .container {
    padding: 0 16px;
  }

  .verification-home {
    padding: 40px 0;

    .page-title {
      font-size: 24px;
    }
  }

  .verification-form {
    padding: 24px 0;
  }
}
</style>
