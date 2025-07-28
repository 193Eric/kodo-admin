<template>
  <div class="step-content">
    <h1 class="step-title">Proof of Business Registration</h1>

    <a-form :form="form" layout="vertical" class="step-form">
      <!-- Company Registration Certificate -->
      <div class="upload-section">
        <h3>Company Registration Certificate *</h3>
        <p class="upload-description">
          Please upload your company registration certificate (PDF/PNG/JPEG, up to 5MB)
        </p>
        <a-upload-dragger
          v-decorator="['cr_certificate_url', {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!this.uploadedUrls.cr_certificate_url || this.uploadedUrls.cr_certificate_url.length === 0) {
                  callback('Please upload company registration certificate!')
                } else {
                  callback()
                }
              }
            }]
          }]"
          :file-list="localFileList.cr_certificate_url || []"
          @change="handleFileChange('cr_certificate_url', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequest(info, 'cr_certificate', 'cr_certificate_url')"
          :multiple="false"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
          </div>
        </a-upload-dragger>
      </div>

      <!-- Business Registration Certificate -->
      <div class="upload-section">
        <h3>Business Registration Certificate *</h3>
        <p class="upload-description">
          Please upload your business registration certificate
        </p>
        <a-upload-dragger
          v-decorator="['br_certificate_url', {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!this.uploadedUrls.br_certificate_url || this.uploadedUrls.br_certificate_url.length === 0) {
                  callback('Please upload business registration certificate!')
                } else {
                  callback()
                }
              }
            }]
          }]"
          :file-list="localFileList.br_certificate_url || []"
          @change="handleFileChange('br_certificate_url', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequest(info, 'br_certificate', 'br_certificate_url')"
          :multiple="false"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
          </div>
        </a-upload-dragger>
      </div>

      <!-- Annual Returns/Incorporation Forms -->
      <div class="upload-section">
        <h3>Annual Returns *</h3>
        <p class="upload-description">
          Please upload your annual returns documentation
        </p>
        <a-upload-dragger
          v-decorator="['annual_return_url', {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!this.uploadedUrls.annual_return_url || this.uploadedUrls.annual_return_url.length === 0) {
                  callback('Please upload annual returns!')
                } else {
                  callback()
                }
              }
            }]
          }]"
          :file-list="localFileList.annual_return_url || []"
          @change="handleFileChange('annual_return_url', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequest(info, 'annual_return', 'annual_return_url')"
          :multiple="false"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
          </div>
        </a-upload-dragger>
      </div>

      <!-- 新增: Deadline for Documentation -->
      <div class="form-section deadline-section">
        <h3>Deadline for Documentation (Enterprises)</h3>

        <!-- Is it valid for a long time -->
        <div class="form-item">
          <label class="form-label">Is it valid for a long time?</label>
          <a-form-item>
            <a-radio-group
              v-decorator="['is_long_term', {
                initialValue: formData.is_long_term !== undefined ? formData.is_long_term : 1,
                rules: [{ required: true, message: 'Please select an option!' }]
              }]"
              @change="handleLongTermChange"
            >
              <a-radio :value="1">Yes</a-radio>
              <a-radio :value="0">No</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>

        <!-- Date Picker - 只在选择No时显示 -->
        <div class="form-item" v-if="!isLongTerm">
          <label class="form-label">Select Deadline for Documentation</label>
          <a-form-item>
            <a-date-picker
              v-decorator="['certificate_effective_date', {
                rules: [{ required: !isLongTerm, message: 'Please select deadline for documentation!' }],
                initialValue: getCertificateDateValue()
              }]"
              placeholder="YY / MM /DD"
              format="YY/MM/DD"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </a-form-item>
        </div>
      </div>

      <!-- Company Constitution -->
      <div class="upload-section">
        <h3>Company Constitution *</h3>
        <p class="upload-description">
          Please upload your company constitution document
        </p>
        <a-upload-dragger
          v-decorator="['company_constitution_url', {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!this.uploadedUrls.company_constitution_url || this.uploadedUrls.company_constitution_url.length === 0) {
                  callback('Please upload company constitution!')
                } else {
                  callback()
                }
              }
            }]
          }]"
          :file-list="localFileList.company_constitution_url || []"
          @change="handleFileChange('company_constitution_url', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequest(info, 'company_constitution', 'company_constitution_url')"
          :multiple="false"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
          </div>
        </a-upload-dragger>
      </div>

      <!-- Company Registration Certificate to Date -->
      <div class="upload-section">
        <h3>Company Registration Certificate to Date *</h3>
        <p class="upload-description">
          Please upload your company registration certificate showing current status
        </p>
        <a-upload-dragger
          v-decorator="['company_registr_certificate', {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!this.uploadedUrls.company_registr_certificate || this.uploadedUrls.company_registr_certificate.length === 0) {
                  callback('Please upload company registration certificate to date!')
                } else {
                  callback()
                }
              }
            }]
          }]"
          :file-list="localFileList.company_registr_certificate || []"
          @change="handleFileChange('company_registr_certificate', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequest(info, 'company_registr', 'company_registr_certificate')"
          :multiple="false"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
          </div>
        </a-upload-dragger>
      </div>

      <!-- Proof of Equity Structure -->
      <div class="upload-section">
        <h3>Proof of Equity Structure *</h3>
        <p class="upload-description">
          Please upload proof of your company's equity structure
        </p>
        <a-upload-dragger
          v-decorator="['proof_of_equity_structure', {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!this.uploadedUrls.proof_of_equity_structure || this.uploadedUrls.proof_of_equity_structure.length === 0) {
                  callback('Please upload proof of equity structure!')
                } else {
                  callback()
                }
              }
            }]
          }]"
          :file-list="localFileList.proof_of_equity_structure || []"
          @change="handleFileChange('proof_of_equity_structure', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequest(info, 'equity_structure', 'proof_of_equity_structure')"
          :multiple="false"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
          </div>
        </a-upload-dragger>
      </div>

      <!-- Other Files - 多文件上传 -->
      <div class="upload-section">
        <h3>Other Files</h3>
        <p class="upload-description">
          Please upload any other required documents (Optional, multiple files supported)
        </p>
        <a-upload-dragger
          v-decorator="['other_files']"
          :file-list="localFileList.other_files || []"
          @change="handleMultipleFileChange('other_files', $event)"
          :before-upload="beforeUpload"
          :customRequest="(info) => customRequestMultiple(info, 'other_files', 'other_files')"
          :multiple="true"
          class="upload-area"
        >
          <div class="upload-content">
            <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
            <p>Drag & drop or <a>click to browse files</a></p>
            <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB each, multiple files allowed</p>
          </div>
        </a-upload-dragger>
      </div>
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
import { request } from '@/api/_service'
import moment from 'moment'

export default {
  name: 'ProofStep',
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
  watch: {
    // 监听formData的变化，重新设置表单值和文件状态
    formData: {
      handler (newFormData) {
        if (newFormData && this.form) {
          this.$nextTick(() => {
            this.updateFormFields()
            this.updateFileListsFromFormData()
          })
        }
      },
      deep: true,
      immediate: true
    },
    fileList: {
      handler (newFileList) {
        this.localFileList = { ...this.localFileList, ...newFileList }
      },
      deep: true
    }
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false,
      savingDraft: false,
      isLongTerm: true, // 默认选择 Yes
      localFileList: {
        cr_certificate_url: [],
        br_certificate_url: [],
        annual_return_url: [],
        company_constitution_url: [],
        company_registr_certificate: [],
        proof_of_equity_structure: [],
        other_files: []
      },
      // 修改uploadedUrls，所有字段初始化为数组
      uploadedUrls: {
        cr_certificate_url: [],
        br_certificate_url: [],
        annual_return_url: [],
        company_constitution_url: [],
        company_registr_certificate: [],
        proof_of_equity_structure: [],
        other_files: []
      }
    }
  },
  mounted () {
    // 组件挂载后立即设置表单值和文件状态
    this.$nextTick(() => {
      this.updateFormFields()
      this.updateFileListsFromFormData()
    })
  },
  methods: {
    // 更新表单字段值
    updateFormFields () {
      if (!this.form || !this.formData) return

      // 设置 is_long_term 的值
      const isLongTermValue = this.formData.is_long_term !== undefined ? this.formData.is_long_term : 1
      this.isLongTerm = isLongTermValue === 1

      const fieldsValue = {
        is_long_term: isLongTermValue,
        certificate_effective_date: this.getCertificateDateValue()
      }

      this.form.setFieldsValue(fieldsValue)
    },

    // 从formData更新文件列表和已上传的URL
    updateFileListsFromFormData () {
      const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                         'company_constitution_url', 'company_registr_certificate',
                         'proof_of_equity_structure', 'other_files']

      fileFields.forEach(fieldName => {
        const fieldData = this.formData[fieldName]

        // 处理不同格式的数据，确保转换为数组
        let urlArray = []
        if (fieldData) {
          if (typeof fieldData === 'string' && fieldData.trim()) {
            // 兼容旧的字符串格式
            urlArray = [fieldData]
          } else if (Array.isArray(fieldData)) {
            urlArray = fieldData.filter(url => url && typeof url === 'string')
          }
        }

        // 更新uploadedUrls
        this.uploadedUrls[fieldName] = [...urlArray]

        // 更新localFileList用于显示
        if (urlArray.length > 0) {
          this.localFileList[fieldName] = urlArray.map((url, index) => ({
            uid: `${fieldName}-${index}`,
            name: this.getFileNameFromUrl(url),
            status: 'done',
            url: url,
            response: {
              code: 200,
              data: url
            }
          }))
        } else {
          this.localFileList[fieldName] = []
        }
      })
    },

    // 获取证书有效期日期值
    getCertificateDateValue () {
      if (this.formData.certificate_effective_date) {
        if (typeof this.formData.certificate_effective_date === 'string') {
          return moment(this.formData.certificate_effective_date)
        }
        if (this.formData.certificate_effective_date && typeof this.formData.certificate_effective_date.format === 'function') {
          return this.formData.certificate_effective_date
        }
      }
      return null
    },

    // 处理长期有效性选择变化
    handleLongTermChange (e) {
      this.isLongTerm = e.target.value === 1
      // 如果选择了"Yes"，清空日期选择器的值
      if (this.isLongTerm) {
        this.form.setFieldsValue({
          certificate_effective_date: undefined
        })
      }
    },

    // 禁用过去的日期
    disabledDate (current) {
      return current && current < moment().startOf('day')
    },

    async handleNext () {
      this.form.validateFields(async (err, values) => {
        if (!err) {
          // 检查所有必填文件是否都已上传
          const requiredFields = [
            'cr_certificate_url',
            'br_certificate_url',
            'annual_return_url',
            'company_constitution_url',
            'company_registr_certificate',
            'proof_of_equity_structure'
          ]

          const missingFiles = requiredFields.filter(field =>
            !this.uploadedUrls[field] || this.uploadedUrls[field].length === 0
          )

          if (missingFiles.length > 0) {
            const fieldNames = {
              'cr_certificate_url': 'Company Registration Certificate',
              'br_certificate_url': 'Business Registration Certificate',
              'annual_return_url': 'Annual Returns',
              'company_constitution_url': 'Company Constitution',
              'company_registr_certificate': 'Company Registration Certificate to Date',
              'proof_of_equity_structure': 'Proof of Equity Structure'
            }

            const missingNames = missingFiles.map(field => fieldNames[field]).join(', ')
            this.$message.error(`Please upload the following required files: ${missingNames}`)
            return
          }

          this.loading = true

          try {
            // 处理日期格式
            const processedValues = { ...values }
            if (processedValues.certificate_effective_date) {
              processedValues.certificate_effective_date = moment(processedValues.certificate_effective_date).format('YYYY-MM-DD')
            }

            // 合并上传的文件URL和表单值，确保所有文件字段为数组
            const finalValues = {
              ...processedValues,
              ...this.uploadedUrls
            }

            setTimeout(() => {
              this.loading = false
              this.$emit('next', 'proof', finalValues)
            }, 500)
          } catch (error) {
            this.loading = false
            this.$message.error('Validation failed!')
          }
        }
      })
    },

    handleBack () {
      // 先保存当前表单数据再返回
      this.form.validateFields((err, values) => {
        const updateData = this.getCurrentFormData(values || {})
        this.updateParentFormData(updateData)
        this.$emit('back')
      })
    },

    handleSaveDraft () {
      this.savingDraft = true

      this.form.validateFields((err, values) => {
        try {
          // 获取当前表单数据
          const updateData = this.getCurrentFormData(values || {})

          // 更新父组件的formData
          this.updateParentFormData(updateData)

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

    // 获取当前表单数据
    getCurrentFormData (values) {
      // 处理日期格式
      const processedValues = { ...values }
      if (processedValues.certificate_effective_date) {
        processedValues.certificate_effective_date = moment(processedValues.certificate_effective_date).format('YYYY-MM-DD')
      }

      // 合并表单值和已上传的文件URL，确保文件字段为数组
      return {
        ...processedValues,
        ...this.uploadedUrls
      }
    },

    // 更新父组件的formData
    updateParentFormData (updateData) {
      // 确保所有字段都有值，避免undefined，文件字段确保为数组
      const fileFields = ['cr_certificate_url', 'br_certificate_url', 'annual_return_url',
                         'company_constitution_url', 'company_registr_certificate',
                         'proof_of_equity_structure', 'other_files']

      const allFields = [...fileFields, 'is_long_term', 'certificate_effective_date']

      allFields.forEach(field => {
        if (updateData[field] === undefined) {
          if (fileFields.includes(field)) {
            // 文件字段默认为数组
            updateData[field] = Array.isArray(this.formData[field]) ? this.formData[field] : []
          } else if (field === 'is_long_term') {
            updateData[field] = this.formData[field] !== undefined ? this.formData[field] : 1
          } else {
            updateData[field] = this.formData[field] || ''
          }
        }
      })

      // 发送更新事件到父组件
      this.$emit('updateFormData', updateData)
    },

    beforeUpload (file) {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      if (!isValidType) {
        this.$message.error('Please upload JPG, PNG or PDF files only!')
        return false
      }

      const isValidSize = file.size / 1024 / 1024 < 5
      if (!isValidSize) {
        this.$message.error('File must be smaller than 5MB!')
        return false
      }

      return true
    },

    // 单文件上传请求 - 修改为保存数组格式
    async customRequest (info, fileType, fieldName) {
      const { file, onSuccess, onError, onProgress } = info

      try {
        onProgress({ percent: 10 })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_type', fileType)

        onProgress({ percent: 50 })

        const response = await request({
          url: '/merchant/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        onProgress({ percent: 100 })

        if (response.code === 200) {
          // 保存上传的URL为数组格式（单文件情况下数组只有一个元素）
          this.uploadedUrls[fieldName] = [response.data]

          const responseData = {
            ...response,
            data: response.data
          }

          onSuccess(responseData, file)
          this.$message.success(`${file.name} uploaded successfully!`)

          // 手动触发表单验证更新
          this.$nextTick(() => {
            this.form.validateFields([fieldName], { force: true })
          })
        } else {
          throw new Error(response.message || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        onError(error)
        this.$message.error(`Upload failed: ${error.message}`)
      }
    },

    // 多文件上传请求 - 确保数组格式
    async customRequestMultiple (info, fileType, fieldName) {
      const { file, onSuccess, onError, onProgress } = info

      try {
        onProgress({ percent: 10 })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_type', fileType)

        onProgress({ percent: 50 })

        const response = await request({
          url: '/merchant/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        onProgress({ percent: 100 })

        if (response.code === 200) {
          // 对于多文件上传，将URL添加到数组中
          if (!Array.isArray(this.uploadedUrls[fieldName])) {
            this.uploadedUrls[fieldName] = []
          }
          this.uploadedUrls[fieldName].push(response.data)

          const responseData = {
            ...response,
            data: response.data
          }

          onSuccess(responseData, file)
          this.$message.success(`${file.name} uploaded successfully!`)
        } else {
          throw new Error(response.message || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        onError(error)
        this.$message.error(`Upload failed: ${error.message}`)
      }
    },

    // 从URL中提取文件名
    getFileNameFromUrl (url) {
      if (!url) return 'document'
      const parts = url.split('/')
      const fileName = parts[parts.length - 1] || 'document'
      return fileName.includes('.') ? fileName : `${fileName}.pdf`
    },

    // 单文件变化处理 - 修改为数组格式
    handleFileChange (field, info) {
      const { fileList, file } = info

      // 更新本地文件列表 - 确保每个字段只保留一个文件
      this.localFileList[field] = fileList.slice(-1)

      // 如果文件上传成功，获取响应中的URL，保存为数组格式
      if (file.status === 'done' && file.response && file.response.code === 200) {
        this.uploadedUrls[field] = [file.response.data]
        this.$nextTick(() => {
          this.form.validateFields([field], { force: true })
        })
      }

      // 如果文件被移除，清除对应的URL数组
      if (file.status === 'removed') {
        this.uploadedUrls[field] = []
        this.localFileList[field] = []
        this.$nextTick(() => {
          this.form.validateFields([field], { force: true })
        })
      }

      this.$emit('fileChange', field, this.localFileList[field])
    },

    // 多文件变化处理 - 确保数组格式
    handleMultipleFileChange (field, info) {
      const { fileList, file } = info

      // 更新本地文件列表
      this.localFileList[field] = [...fileList]

      // 如果文件上传成功，URL已经在customRequestMultiple中添加到数组了
      if (file.status === 'done' && file.response && file.response.code === 200) {
        // URL already added in customRequestMultiple
      }

      // 如果文件被移除，从URL数组中移除对应的URL
      if (file.status === 'removed') {
        if (!Array.isArray(this.uploadedUrls[field])) {
          this.uploadedUrls[field] = []
        }

        // 根据文件列表重建URL数组
        this.uploadedUrls[field] = this.localFileList[field]
          .filter(f => f.status === 'done' && f.response && f.response.data)
          .map(f => f.response.data)
      }

      this.$emit('fileChange', field, this.localFileList[field])
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

    .upload-section {
      margin-bottom: 32px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 8px 0;

        &::after {
          content: '';
        }
      }

      .upload-description {
        font-size: 14px;
        color: #8c8c8c;
        margin: 0 0 16px 0;
        line-height: 1.5;
      }

      .upload-area {
        /deep/ .ant-upload {
          width: 100%;
        }

        /deep/ .ant-upload-drag {
          border: 2px dashed #d9d9d9;
          border-radius: 6px;
          padding: 32px 16px;
          background: #fafafa;
          transition: all 0.3s ease;

          &:hover {
            border-color: #11253E;
            background: #f6f6f6;
          }

          .ant-upload-drag-container {
            .upload-content {
              p {
                margin: 8px 0;
                color: #262626;
                font-size: 14px;

                a {
                  color: #11253E;
                  text-decoration: underline;
                  cursor: pointer;

                  &:hover {
                    color: #40a9ff;
                  }
                }
              }

              .upload-hint {
                font-size: 12px;
                color: #8c8c8c;
                margin: 4px 0 0 0;
              }
            }
          }
        }

        /deep/ .ant-upload-list {
          margin-top: 16px;
          .anticon-paper-clip{
            top:10px;
          }
          .ant-upload-list-item-card-actions{
            top:10px;
          }

          .ant-upload-list-item {
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            margin-bottom: 8px;
            height:40px;
            padding: 8px 12px;
            display: flex;
            align-items: center;

            .ant-upload-list-item-info {
              flex: 1;
              height: 25px;
              display: flex;
              align-items: center;

              .ant-upload-list-item-name {
                color: #262626;
                font-size: 14px;
                margin-left: 8px;
                flex: 1;
                word-break: break-all;
              }

              .anticon {
                color: #52c41a;
                font-size: 16px;
                margin-right: 8px;
              }
            }

            .ant-upload-list-item-actions {
              display: flex;
              align-items: center;
            }

            &:hover {
              background: #f5f5f5;
            }
          }

          .ant-upload-list-item-done {
            .ant-upload-list-item-info {
              .anticon-paper-clip {
                color: #52c41a;
              }
            }
          }
        }
      }
    }

    // 新增：deadline section 样式
    .form-section {
      margin-bottom: 32px;

      &.deadline-section {
        border: 2px solid #ff4d4f;
        border-radius: 8px;
        padding: 24px;
        background: #ffffff;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
          margin: 0 0 20px 0;
        }

        .form-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 8px;
          }

          /deep/ .ant-form-item {
            margin-bottom: 0;

            .ant-form-item-control-wrapper {
              .ant-form-item-control {
                .ant-radio-group {
                  .ant-radio-wrapper {
                    font-size: 14px;
                    color: #262626;
                    margin-right: 24px;

                    .ant-radio {
                      .ant-radio-inner {
                        border-color: #d9d9d9;

                        &:hover {
                          border-color: #11253E;
                        }
                      }

                      &.ant-radio-checked {
                        .ant-radio-inner {
                          border-color: #11253E;
                          background-color: #11253E;

                          &:after {
                            background-color: #ffffff;
                          }
                        }
                      }
                    }
                  }
                }

                .ant-calendar-picker {
                  width: 100%;

                  .ant-calendar-picker-input {
                    height: 40px;
                    border-color: #d9d9d9;
                    border-radius: 4px;
                    padding: 0 12px;
                    font-size: 14px;

                    &:hover, &:focus {
                      border-color: #11253E;
                    }

                    &::placeholder {
                      color: #bfbfbf;
                    }
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
  .step-content .step-actions {
    flex-direction: column;
    gap: 12px;

    .ant-btn {
      width: 100%;
    }
  }

  .step-content .step-form .form-section.deadline-section {
    padding: 16px;

    .form-item {
      .form-label {
        font-size: 13px;
      }

      /deep/ .ant-radio-group .ant-radio-wrapper {
        margin-right: 16px;
        font-size: 13px;
      }
    }
  }
}
</style>
