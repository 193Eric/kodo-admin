<template>
  <div class="step-content">
    <h1 class="step-title">Ultimate Beneficial Owner(s)</h1>
    <p class="step-description">
      Ultimate Beneficial Owners (UBOs) include the direct controlling individual shareholder and the ultimate
      individual controller of the direct holding entity. If there are no individuals with more than 25% ultimate
      ownership, provide information of the individual with the largest percentage of ultimate ownership.
    </p>

    <div class="ubo-section">
      <div v-if="!hasUBOData" class="add-ubo-container">
        <a-button type="dashed" @click="showAddUBOModal" block class="add-ubo-btn">
          <a-icon type="plus" />
          Add UBO
        </a-button>
      </div>

      <div v-else class="ubo-display">
        <div class="ubo-item">
          <div class="ubo-info">
            <h4>{{ getDisplayName() }}</h4>
            <p>{{ getDisplayInfo() }}</p>
          </div>
          <a-button type="link" @click="editUBO">Edit</a-button>
        </div>
      </div>
    </div>

    <div class="step-actions">
      <a-button @click="handleBack" size="large" class="back-btn">
        <a-icon type="left" />
        Back
      </a-button>
      <a-button type="default" @click="handleSaveDraft" size="large" class="draft-btn" :loading="savingDraft">
        Save as draft
      </a-button>
      <a-button type="primary" @click="handleNext" size="large" :loading="loading">
        Submit
      </a-button>
    </div>

    <!-- Add UBO Modal -->
    <a-modal
      :visible="showUBOModal"
      :footer="null"
      :width="700"
      :title="editingUBOIndex >= 0 ? 'Edit Ultimate Beneficial Owner' : 'Add Ultimate Beneficial Owner'"
      @cancel="hideUBOModal"
    >
      <a-form :form="uboForm" layout="vertical">
        <div class="name-row">
          <a-form-item label="First name" class="name-field">
            <a-input
              v-decorator="['beneficiary_name', {
                rules: [{ required: true, message: 'Please enter First name!' }],
                initialValue: formData.beneficiary_name
              }]"
              placeholder="First name"
            />
          </a-form-item>
          <a-form-item label="Last name" class="name-field">
            <a-input
              v-decorator="['beneficiary_surname', {
                rules: [{ required: true, message: 'Please enter Last name!' }],
                initialValue: formData.beneficiary_surname
              }]"
              placeholder="Last name"
            />
          </a-form-item>
        </div>

        <a-form-item label="Citizenship">
          <a-select
            v-decorator="['nationality', {
              rules: [{ required: true, message: 'Please select Citizenship!' }],
              initialValue: formData.nationality
            }]"
            placeholder="Select or search Citizenship"
            show-search
            :filter-option="filterCountryOption"
            allowClear
          >
            <a-select-option v-for="country in countryList" :key="country.code" :value="country.code">
              {{ country.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Document Type">
          <a-select
            v-decorator="['legal_person_id_type', {
              rules: [{ required: true, message: 'Please select document type!' }],
              initialValue: formData.legal_person_id_type
            }]"
            placeholder="Select document type"
          >
            <a-select-option value="1">身份证 (ID Card)</a-select-option>
            <a-select-option value="2">护照 (Passport)</a-select-option>
            <a-select-option value="3">驾照 (Driver's License)</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Document File" class="upload-form-item">
          <a-upload-dragger
            v-decorator="['id_no', {
              rules: [{
                required: true,
                validator: (rule, value, callback) => {
                  if (!this.currentUploadedUrls || this.currentUploadedUrls.length === 0) {
                    callback('Please upload document file!')
                  } else {
                    callback()
                  }
                }
              }]
            }]"
            :file-list="currentFileList"
            @change="handleFileChange"
            :before-upload="beforeUpload"
            :customRequest="customRequest"
            :multiple="false"
            class="upload-area"
          >
            <div class="upload-content">
              <p><a-icon type="inbox" style="font-size: 24px; color: #11253E; margin-bottom: 8px;" /></p>
              <p>Drag & drop or <a>click to browse files</a></p>
              <p class="upload-hint">Supported files: .PDF/PNG/JPEG, up to 5 MB</p>
            </div>
          </a-upload-dragger>
        </a-form-item>

        <div class="modal-actions">
          <a-button @click="hideUBOModal">Cancel</a-button>
          <a-button type="primary" @click="handleAddUBO" :loading="uboLoading">
            {{ editingUBOIndex >= 0 ? 'Update' : 'Confirm' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import { countryList } from './countries'

export default {
  name: 'UBOStep',
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  watch: {
    // 监听formData的变化，确保数据同步
    formData: {
      handler (newFormData) {
        if (newFormData && this.showUBOModal) {
          // 如果模态框打开并且有新数据，更新表单值
          this.$nextTick(() => {
            this.updateModalFormFields()
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      loading: false,
      uboLoading: false,
      savingDraft: false,
      showUBOModal: false,
      editingUBOIndex: -1,
      uboForm: this.$form.createForm(this),
      currentFileList: [],
      // 修改为数组格式
      currentUploadedUrls: [],
      countryList
    }
  },
  computed: {
    // 检查是否有UBO数据
    hasUBOData () {
      return !!(this.formData.beneficiary_name && this.formData.beneficiary_surname)
    }
  },
  mounted () {
    // 组件挂载后检查是否有文件数据需要恢复
    this.$nextTick(() => {
      if (this.formData.id_no) {
        // 处理不同格式的id_no数据，确保转换为数组
        this.currentUploadedUrls = this.convertToUrlArray(this.formData.id_no)
      }
    })
  },
  methods: {
    // 将不同格式的数据转换为URL数组
    convertToUrlArray (data) {
      if (!data) return []

      if (typeof data === 'string' && data.trim()) {
        // 兼容旧的字符串格式
        return [data]
      } else if (Array.isArray(data)) {
        return data.filter(url => url && typeof url === 'string')
      }

      return []
    },

    // 更新模态框表单字段值
    updateModalFormFields () {
      if (!this.uboForm || !this.formData) return

      const fieldsValue = {
        beneficiary_name: this.formData.beneficiary_name || '',
        beneficiary_surname: this.formData.beneficiary_surname || '',
        nationality: this.formData.nationality || '',
        legal_person_id_type: this.formData.legal_person_id_type || '',
        id_no: this.formData.id_no || []
      }

      this.uboForm.setFieldsValue(fieldsValue)
    },

    handleNext () {
      // 检查是否已添加UBO
      if (!this.hasUBOData) {
        this.$message.error('Please add Ultimate Beneficial Owner information!')
        return
      }

      this.loading = true

      setTimeout(() => {
        this.loading = false
        // 发送空对象，因为UBO数据已经在formData中了
        this.$emit('next', 'ubo', {})
      }, 500)
    },

    handleBack () {
      // 先保存当前数据再返回
      const currentData = this.getCurrentUBOData()
      this.updateParentFormData(currentData)
      this.$emit('back')
    },

    handleSaveDraft () {
      this.savingDraft = true

      try {
        // 获取当前UBO数据
        const currentData = this.getCurrentUBOData()

        // 更新父组件的formData
        this.updateParentFormData(currentData)

        // 触发父组件的saveDraft方法
        this.$emit('saveDraft')

        this.$message.success('Draft saved successfully!')
      } catch (error) {
        console.error('Save draft error:', error)
        this.$message.error('Failed to save draft!')
      } finally {
        this.savingDraft = false
      }
    },

    // 获取当前UBO数据 - 确保id_no为数组格式
    getCurrentUBOData () {
      return {
        beneficiary_name: this.formData.beneficiary_name || '',
        beneficiary_surname: this.formData.beneficiary_surname || '',
        nationality: this.formData.nationality || '',
        legal_person_id_type: this.formData.legal_person_id_type || '',
        id_no: this.convertToUrlArray(this.formData.id_no) // 确保为数组格式
      }
    },

    // 更新父组件的formData
    updateParentFormData (updateData) {
      // 确保所有UBO字段都有值，避免undefined
      const uboFields = ['beneficiary_name', 'beneficiary_surname', 'nationality', 'legal_person_id_type', 'id_no']

      uboFields.forEach(field => {
        if (updateData[field] === undefined) {
          if (field === 'id_no') {
            // id_no字段默认为空数组
            updateData[field] = this.convertToUrlArray(this.formData[field])
          } else {
            updateData[field] = this.formData[field] || ''
          }
        }
      })

      // 发送更新事件到父组件
      this.$emit('updateFormData', updateData)
    },

    showAddUBOModal () {
      this.showUBOModal = true
      this.editingUBOIndex = -1
      this.uboForm.resetFields()
      this.currentFileList = []
      this.currentUploadedUrls = []

      // 如果有现有数据，设置表单初始值
      this.$nextTick(() => {
        this.updateModalFormFields()
      })
    },

    hideUBOModal () {
      this.showUBOModal = false
      this.editingUBOIndex = -1
      this.uboForm.resetFields()
      this.currentFileList = []
      this.currentUploadedUrls = []
    },

    editUBO () {
      this.editingUBOIndex = 0 // 表示编辑状态
      this.showUBOModal = true

      // 设置当前文件信息 - 处理数组格式
      const idNoUrls = this.convertToUrlArray(this.formData.id_no)
      if (idNoUrls.length > 0) {
        this.currentUploadedUrls = [...idNoUrls]
        this.currentFileList = idNoUrls.map((url, index) => ({
          uid: `id-${index}`,
          name: this.getFileNameFromUrl(url),
          status: 'done',
          url: url,
          response: {
            code: 200,
            data: url
          }
        }))
      } else {
        this.currentFileList = []
        this.currentUploadedUrls = []
      }

      this.$nextTick(() => {
        this.updateModalFormFields()
      })
    },

    handleAddUBO () {
      this.uboForm.validateFields((err, values) => {
        if (!err) {
          // 确保文件已上传
          if (!this.currentUploadedUrls || this.currentUploadedUrls.length === 0) {
            this.$message.error('Please upload document file!')
            return
          }

          this.uboLoading = true

          // 确保id_no为数组格式
          const uboData = {
            ...values,
            id_no: [...this.currentUploadedUrls] // 保存为数组格式
          }

          setTimeout(() => {
            // 发送UBO数据到父组件，更新formData但不跳转到下一步
            this.$emit('updateUBO', uboData)

            // 同时通过updateFormData事件更新
            this.updateParentFormData(uboData)

            if (this.editingUBOIndex >= 0) {
              this.$message.success('UBO updated successfully!')
            } else {
              this.$message.success('UBO added successfully!')
            }

            this.uboLoading = false
            this.hideUBOModal()
          }, 500)
        }
      })
    },

    getDisplayName () {
      const firstName = this.formData.beneficiary_name || ''
      const lastName = this.formData.beneficiary_surname || ''

      if (!firstName && !lastName) {
        return 'Unknown User'
      }

      return `${firstName} ${lastName}`.trim()
    },

    getDisplayInfo () {
      const countryName = this.getCountryName(this.formData.nationality)
      const docTypeName = this.getDocumentTypeName(this.formData.legal_person_id_type)

      const parts = []

      if (countryName && countryName !== this.formData.nationality) {
        parts.push(countryName)
      } else if (this.formData.nationality) {
        parts.push(this.formData.nationality)
      }

      if (docTypeName && docTypeName !== 'Unknown') {
        parts.push(docTypeName)
      }

      return parts.length > 0 ? parts.join(' - ') : 'No information available'
    },

    getCountryName (code) {
      if (!code) return ''
      const country = this.countryList.find(c => c.code === code)
      return country ? country.name : code
    },

    getDocumentTypeName (type) {
      const typeMap = {
        '1': '身份证',
        '2': '护照',
        '3': '驾照'
      }
      return typeMap[type] || 'Unknown'
    },

    getFileNameFromUrl (url) {
      if (!url) return 'document'
      const parts = url.split('/')
      const fileName = parts[parts.length - 1] || 'document'
      return fileName.includes('.') ? fileName : `${fileName}.pdf`
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

    // 修改上传请求，保存为数组格式
    async customRequest (info) {
      const { file, onSuccess, onError, onProgress } = info

      try {
        onProgress({ percent: 10 })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_type', 'id_document')

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
          this.currentUploadedUrls = [response.data]

          const responseData = {
            ...response,
            data: response.data
          }

          onSuccess(responseData, file)
          this.$message.success(`${file.name} uploaded successfully!`)

          // 手动触发表单验证更新
          this.$nextTick(() => {
            this.uboForm.validateFields(['id_no'], { force: true })
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

    // 修改文件变化处理，确保数组格式
    handleFileChange (info) {
      const { fileList, file } = info

      // 只保留最后一个文件
      this.currentFileList = fileList.slice(-1)

      // 如果文件上传成功，保存为数组格式
      if (file.status === 'done' && file.response && file.response.code === 200) {
        this.currentUploadedUrls = [file.response.data]
        // 手动触发表单验证更新
        this.$nextTick(() => {
          this.uboForm.validateFields(['id_no'], { force: true })
        })
      }

      // 如果文件被移除，清空数组
      if (file.status === 'removed') {
        this.currentUploadedUrls = []
        this.currentFileList = []
        // 手动触发表单验证更新
        this.$nextTick(() => {
          this.uboForm.validateFields(['id_no'], { force: true })
        })
      }
    },

    filterCountryOption (input, option) {
      // 获取选项的文本内容进行过滤
      const text = option.componentOptions.children[0].text.toLowerCase()
      return text.includes(input.toLowerCase())
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

  .ubo-section {
    margin-bottom: 40px;

    .add-ubo-container {
      padding: 32px;
      border: 2px dashed #d9d9d9;
      border-radius: 6px;
      text-align: center;

      .add-ubo-btn {
        height: 48px;
        font-size: 16px;
        border-color: #11253E;
        color: #11253E;

        &:hover {
          border-color: #40a9ff;
          color: #40a9ff;
        }
      }
    }

    .ubo-display {
      .ubo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 6px;

        .ubo-info {
          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #262626;
            margin: 0 0 4px 0;
          }

          p {
            font-size: 14px;
            color: #8c8c8c;
            margin: 0;
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

.name-row {
  display: flex;
  gap: 16px;

  .name-field {
    flex: 1;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.upload-form-item {
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
        height: 40px;
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

@media (max-width: 768px) {
  .step-content .step-actions {
    flex-direction: column;
    gap: 12px;

    .ant-btn {
      width: 100%;
    }
  }

  .name-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
