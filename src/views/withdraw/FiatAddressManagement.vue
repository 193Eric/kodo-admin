<template>
  <div class="fiat-address-management">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-filters">
        <a-input
          v-model="filters.search"
          placeholder="Search recipient or account number..."
          style="width: 200px; margin-right: 16px"
          allow-clear
          :loading="searchLoading"
          @input="handleSearch"
          @pressEnter="handleSearch"
        >
          <a-icon slot="prefix" type="search" />
        </a-input>

        <a-select
          v-model="filters.currency"
          placeholder="Currency"
          style="width: 120px; margin-right: 16px"
          allow-clear
        >
          <a-select-option value="USD">USD</a-select-option>
          <a-select-option value="EUR">EUR</a-select-option>
          <a-select-option value="GBP">GBP</a-select-option>
        </a-select>

        <a-button @click="handleReset">
          Reset
        </a-button>
      </div>

      <div class="action-buttons">
        <a-button type="primary" @click="handleNewAddress">
          <a-icon type="plus" />
          New Address
        </a-button>
      </div>
    </div>

    <!-- 法币地址表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredData"
      :row-key="record => record.id"
      :pagination="pagination"
      :loading="tableLoading"
      @change="handleTableChange"
    >
      <template slot="accountNumber" slot-scope="text">
        <span class="masked-account">{{ text }}</span>
      </template>

      <template slot="status" slot-scope="text, record">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <template slot="operation" slot-scope="text, record">
        <a-space>
          <a-popconfirm
            v-if="!record.is_default && record.status === 1"
            title="是否确认设为默认提现账户?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleSetDefault(record)"
          >
            <a-button type="link" size="small">设为默认</a-button>
          </a-popconfirm>

          <a-button type="link" size="small" @click="handleView(record)">
            <a-icon type="eye" />
          </a-button>

          <a-popconfirm
            title="是否确认删除该银行卡?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" size="small" danger>
              <a-icon type="delete" />
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal
      :title="modalType === 'add' ? '添加银行卡' : '编辑银行卡'"
      :visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="800px"
      :body-style="{ padding: '24px' }"
    >
      <!-- 提示信息 -->
      <a-alert
        message="请确保提交的账号户是您的实名账户，以免影响正常提现"
        type="warning"
        show-icon
        style="margin-bottom: 24px"
      />

      <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <!-- 商户类型 -->
        <a-form-item label="商户类型">
          <a-select
            v-decorator="[
              'merchant_type',
              {
                rules: [{ required: true, message: '请选择商户类型!' }],
                initialValue: '1'
              }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请选择商户类型"
          >
            <a-select-option value="1">个人</a-select-option>
            <a-select-option value="2">企业</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 账户名称 -->
        <a-form-item label="账户名称">
          <a-input
            v-decorator="[
              'account_name',
              { rules: [{ required: true, message: '请输入账户名称!' }] }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请输入账户名称"
          />
        </a-form-item>

        <!-- 银行名称 -->
        <a-form-item label="银行名称">
          <a-input
            v-decorator="[
              'bank_name',
              { rules: [{ required: true, message: '请输入银行名称!' }] }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请输入银行名称"
          />
        </a-form-item>

        <!-- 银行代码SWIFT/BIC -->
        <a-form-item label="银行代码(SWIFT/BIC)">
          <a-input
            v-decorator="['bank_code']"
            :disabled="!!currentRecord?.id"
            placeholder="请输入银行代码"
          />
        </a-form-item>

        <!-- 支行名称 -->
        <a-form-item label="支行名称">
          <a-input
            v-decorator="['bank_branch']"
            :disabled="!!currentRecord?.id"
            placeholder="请输入支行名称"
          />
        </a-form-item>

        <!-- 账号 -->
        <a-form-item label="账户">
          <a-input
            v-decorator="[
              'account_number',
              { rules: [{ required: true, message: '请输入账户号码!' }] }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请输入账户号码"
          />
        </a-form-item>

        <!-- 账户类型 -->
        <a-form-item label="账户类型">
          <a-select
            v-decorator="[
              'account_type',
              {
                rules: [{ required: true, message: '请选择账户类型!' }],
                initialValue: '1'
              }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请选择账户类型"
          >
            <a-select-option value="1">对公</a-select-option>
            <a-select-option value="2">对私</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 币种 -->
        <a-form-item label="账户币种">
          <a-select
            v-decorator="[
              'currency',
              {
                rules: [{ required: true, message: '请选择币种!' }],
                initialValue: 'USD'
              }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请选择币种"
          >
            <a-select-option value="USD">USD</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 国家名称 -->
        <a-form-item label="国家名称">
          <a-input
            v-decorator="[
              'country_name',
              { rules: [{ required: true, message: '请输入国家名称!' }] }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请输入国家名称，如：US-美国"
          />
        </a-form-item>

        <!-- 开户行地址 -->
        <a-form-item label="开户行地址">
          <a-input
            v-decorator="[
              'address',
              { rules: [{ required: true, message: '请输入开户行地址!' }] }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请输入开户行地址"
          />
        </a-form-item>

        <!-- 城市 -->
        <a-form-item label="城市">
          <a-input
            v-decorator="[
              'city',
              { rules: [{ required: true, message: '请输入城市!' }] }
            ]"
            :disabled="!!currentRecord?.id"
            placeholder="请输入城市"
          />
        </a-form-item>

        <!-- 州/省 -->
        <a-form-item label="州/省">
          <a-input
            v-decorator="['state']"
            :disabled="!!currentRecord?.id"
            placeholder="请输入州/省（选填）"
          />
        </a-form-item>

        <!-- 邮编 -->
        <a-form-item label="邮编">
          <a-input
            v-decorator="['postal_code']"
            :disabled="!!currentRecord?.id"
            placeholder="请输入邮编"
          />
        </a-form-item>

        <!-- 关联的KYB记录的ID -->
        <a-form-item label="KYB记录ID">
          <a-input
            v-decorator="['kyb_id']"
            disabled
            placeholder="自动关联"
          />
        </a-form-item>

        <!-- 上传银行证明 -->
        <a-form-item label="上传银行证明">
          <div class="upload-container">
            <a-upload-dragger
              :file-list="[]"
              :before-upload="beforeUpload"
              :custom-request="handleUpload"
              :show-upload-list="false"
              multiple
              class="square-upload-area"
              :disabled="!!currentRecord?.id"
            >
              <div class="upload-content">
                <p><a-icon type="inbox" style="font-size: 24px; color: #1890ff; margin-bottom: 8px;" /></p>
                <p>点击或拖拽文件到这里上传</p>
                <p class="upload-hint">支持 .PDF、.JPG、.JPEG、.PNG、.BMP 格式</p>
              </div>
            </a-upload-dragger>

            <!-- 文件列表显示在下方 -->
            <div class="file-list-container" v-if="fileList.length > 0">
              <div class="file-list">
                <div
                  v-for="(file, index) in fileList"
                  :key="file.uid || index"
                  class="file-item"
                >
                  <div class="file-info">
                    <a-icon
                      :type="file.status === 'uploading' ? 'loading' : 'paper-clip'"
                      :style="{ color: file.status === 'done' ? '#52c41a' : file.status === 'error' ? '#ff4d4f' : '#1890ff' }"
                    />
                    <span class="file-name">{{ file.name }}</span>
                  </div>
                  <div class="file-actions">
                    <a-progress
                      v-if="file.status === 'uploading' && file.percent"
                      :percent="file.percent"
                      size="small"
                      style="margin-right: 8px; width: 100px;"
                    />
                    <a-icon
                      type="delete"
                      class="delete-icon"
                      @click="handleRemoveFile(file)"
                      :disabled="!!currentRecord?.id"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="upload-tips">
            <p>为了确保顺利打款，请上传以下内容：</p>
            <p><strong>1.银行帐号 Full Name</strong></p>
            <p><strong>2.您的银行卡号 Account Number</strong></p>
            <p><strong>3.您的地址 Address</strong></p>
            <p>支持多张照片（.PDF、.JPG、.JPEG、.PNG、.BMP）5个文件总大小不超过10M</p>
          </div>
        </a-form-item>

        <!-- 谷歌验证码 -->
        <a-form-item v-if="userInfo.is_2fa_enabled === 1 && !currentRecord?.id" label="谷歌验证码">
          <a-input
            v-decorator="[
              'totp_code',
              { rules: [{ required: true, message: '请输入6位谷歌验证码!' }] }
            ]"
            placeholder="请输入6位数字"
            maxlength="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情模态框 -->
    <a-modal
      title="银行卡详情"
      :visible="viewModalVisible"
      :footer="null"
      @cancel="viewModalVisible = false"
      width="600px"
    >
      <div v-if="currentRecord" class="detail-content">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="商户类型">
            {{ currentRecord.merchant_type === '1' ? '个人' : '企业' }}
          </a-descriptions-item>
          <a-descriptions-item label="账户名称">
            {{ currentRecord.account_name }}
          </a-descriptions-item>
          <a-descriptions-item label="银行名称">
            {{ currentRecord.bank_name }}
          </a-descriptions-item>
          <a-descriptions-item label="银行代码">
            {{ currentRecord.bank_code || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="支行名称">
            {{ currentRecord.bank_branch || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="账户号码">
            {{ currentRecord.account_number }}
          </a-descriptions-item>
          <a-descriptions-item label="账户类型">
            {{ currentRecord.account_type === '1' ? '对公' : '对私' }}
          </a-descriptions-item>
          <a-descriptions-item label="币种">
            {{ currentRecord.currency }}
          </a-descriptions-item>
          <a-descriptions-item label="国家名称">
            {{ currentRecord.country_name }}
          </a-descriptions-item>
          <a-descriptions-item label="地址">
            {{ currentRecord.address }}
          </a-descriptions-item>
          <a-descriptions-item label="城市">
            {{ currentRecord.city }}
          </a-descriptions-item>
          <a-descriptions-item label="州/省">
            {{ currentRecord.state || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="邮编">
            {{ currentRecord.postal_code || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="银行证明文件" v-if="currentRecord.proof_files?.length">
            <div class="file-preview">
              <a v-for="(file, index) in currentRecord.proof_files" :key="index" :href="file" target="_blank" class="file-link">
                文件{{ index + 1 }}
              </a>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import _ from 'lodash'

export default {
  name: 'FiatAddressManagement',
  data () {
    return {
      searchLoading: false,
      tableLoading: false,
      filters: {
        search: '',
        currency: undefined
      },
      addressData: [], // 银行卡数据
      userInfo: { is_2fa_enabled: 0 }, // 用户信息
      kyb_info: {}, // KYB信息
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      columns: [
        {
          title: '币种',
          dataIndex: 'currency',
          width: 80
        },
        {
          title: '账户名',
          dataIndex: 'account_name',
          width: 180
        },
        {
          title: '银行名称',
          dataIndex: 'bank_name',
          width: 120
        },
        {
          title: '账户号码',
          dataIndex: 'account_number',
          scopedSlots: { customRender: 'accountNumber' },
          width: 180
        },
        {
          title: '银行卡状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          width: 100
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'operation' },
          width: 200,
          fixed: 'right'
        }
      ],

      // 模态框相关
      modalVisible: false,
      modalLoading: false,
      modalType: 'add', // 'add' | 'edit'
      form: this.$form.createForm(this),
      currentRecord: null,
      viewModalVisible: false,

      // 文件上传
      fileList: []
    }
  },

  computed: {
    // 过滤后的数据
    filteredData () {
      let data = [...this.addressData]

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        data = data.filter(item =>
          item.account_name?.toLowerCase().includes(searchTerm) ||
          item.account_number?.toLowerCase().includes(searchTerm)
        )
      }

      if (this.filters.currency) {
        data = data.filter(item =>
          item.currency === this.filters.currency
        )
      }

      this.pagination.total = data.length
      return data
    }
  },

  created () {
    this.getBankCards()
    this.getKYBInfo()
    this.getUserInfo()
  },

  methods: {
    // 获取用户信息
    getUserInfo () {
      // 从vuex或其他地方获取用户信息
      this.userInfo = { is_2fa_enabled: 0 }
    },

    // 获取KYB信息
    async getKYBInfo () {
      try {
        const res = await request({
          url: '/merchant/kyb/info',
          method: 'GET'
        })
        if (res.code === 200) {
          this.kyb_info = res.data || {}
        }
      } catch (error) {
        console.error(error)
      }
    },

    // 防抖处理的搜索方法
    handleSearch: _.debounce(function () {
      this.getBankCards()
    }, 300),

    // 获取银行卡列表
    async getBankCards () {
      if (this.searchLoading) return

      this.searchLoading = true
      this.tableLoading = true

      try {
        // 同时发起两个请求
        const [resByNo, resByName] = await Promise.all([
          request({
            url: '/merchant/bank/list',
            method: 'GET',
            params: {
              account_name: this.filters.search || ''
            }
          }),
          request({
            url: '/merchant/bank/list',
            method: 'GET',
            params: {
              account_number: this.filters.search || ''
            }
          })
        ])

        // 合并结果并去重
        if (resByNo.code === 200 && resByName.code === 200) {
          const mergedData = [
            ...(resByNo.data || []),
            ...(resByName.data || [])
          ]

          // 通过id去重
          this.addressData = _.uniqBy(mergedData, 'id')
          this.pagination.total = this.addressData.length
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取数据失败')
      } finally {
        this.searchLoading = false
        this.tableLoading = false
      }
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colorMap = {
        0: 'orange',
        1: 'green',
        '-1': 'red'
      }
      return colorMap[status] || 'default'
    },

    // 获取状态文本
    getStatusText (status) {
      const statusMap = {
        0: '待审核',
        1: '正常',
        '-1': '已禁用'
      }
      return statusMap[status] || '未知'
    },

    // 重置搜索
    handleReset () {
      this.filters = {
        search: '',
        currency: undefined
      }
      this.getBankCards()
    },

    // 新增地址
    async handleNewAddress () {
      this.modalType = 'add'
      this.currentRecord = null

      // 加载KYB信息
      await this.getKYBInfo()

      if (!this.kyb_info.id) {
        this.$message.error('请先完成KYB认证')
        return
      }

      this.modalVisible = true
      this.fileList = []

      this.$nextTick(() => {
        this.form.resetFields()
        this.form.setFieldsValue({
          kyb_id: this.kyb_info.id,
          merchant_type: '1', // 默认个人
          account_type: '1',
          currency: 'USD'
        })
      })
    },

    // 查看详情
    async handleView (record) {
      try {
        const res = await request({
          url: `/merchant/bank/${record.id}`,
          method: 'GET'
        })
        if (res.code === 200) {
          this.currentRecord = res.data
          this.viewModalVisible = true
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取详情失败')
      }
    },

    // 设为默认
    async handleSetDefault (record) {
      try {
        const res = await request({
          url: `/merchant/bank/${record.id}/default`,
          method: 'POST'
        })
        if (res.code === 200) {
          this.$message.success('设置成功')
          this.getBankCards()
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error(error)
        this.$message.error('设置失败')
      }
    },

    // 删除地址
    handleDelete (record) {
      this.$confirm({
        title: '确认删除',
        content: `是否确认删除该银行卡？`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            const res = await request({
              url: `/merchant/bank/${record.id}/delete`,
              method: 'GET'
            })
            this.$message.success('删除成功')
            this.getBankCards()
          } catch (error) {
            console.error(error)
            this.$message.error('删除失败')
          }
        }
      })
    },

    // 模态框确认
    handleModalOk () {
      this.form.validateFields(async (err, values) => {
        if (!err) {
          // 验证必填字段
          const requiredFields = ['merchant_type', 'account_name', 'bank_name', 'account_number', 'account_type', 'currency', 'country_name', 'address', 'city']
          const missingFields = requiredFields.filter(field => !values[field])

          if (missingFields.length > 0) {
            this.$message.error('请填写完整信息')
            return
          }

          if (this.userInfo.is_2fa_enabled === 1 && (!values.totp_code || values.totp_code.length !== 6)) {
            this.$message.error('请输入6位谷歌验证码')
            return
          }

          this.modalLoading = true

          try {
            // 准备提交数据 - 修正格式
            const submitData = {
              merchant_type: parseInt(values.merchant_type), // 转为数字
              account_name: values.account_name,
              bank_name: values.bank_name,
              bank_code: values.bank_code || '', // 可选字段
              account_number: values.account_number,
              postal_code: values.postal_code || '', // 可选字段
              kyb_id: values.kyb_id,
              country_name: values.country_name, // 改为 country_name
              residence_address: values.address, // 改为 residence_address
              // proof_files 改为数组格式
              proof_files: this.fileList
                .filter(file => file.status === 'done' && (file.response?.data || file.url))
                .map(file => file.response?.data || file.url)
            }

            // 如果有谷歌验证码，添加到提交数据中
            if (values.totp_code) {
              submitData.totp_code = values.totp_code
            }

            console.log('提交数据:', submitData) // 调试用

            const res = await request({
              url: '/merchant/bank/submit',
              method: 'POST',
              data: submitData
            })

            if (res.code === 200) {
              this.$message.success('添加成功')
              this.modalVisible = false
              this.form.resetFields()
              this.fileList = []
              this.getBankCards()
            } else {
              this.$message.error(res.message || '提交失败')
            }
          } catch (error) {
            console.error(error)
            this.$message.error('提交失败')
          } finally {
            this.modalLoading = false
          }
        }
      })
    },

    // 模态框取消
    handleModalCancel () {
      this.modalVisible = false
      this.form.resetFields()
      this.fileList = []
    },

    // 表格分页变更
    handleTableChange (pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
    },

    // 文件上传前校验
    beforeUpload (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/bmp']
      const isValidType = validTypes.includes(file.type)
      if (!isValidType) {
        this.$message.error('只支持JPG/JPEG/PNG/PDF/BMP格式!')
        return false
      }

      const isValidSize = file.size / 1024 / 1024 < 5 // 5MB
      if (!isValidSize) {
        this.$message.error('文件大小不能超过5MB!')
        return false
      }

      return true
    },

    // 自定义上传
    async handleUpload (info) {
      const { file, onSuccess, onError, onProgress } = info

      // 添加文件到列表（上传中状态）
      const newFile = {
        uid: file.uid,
        name: file.name,
        status: 'uploading',
        percent: 0,
        originFileObj: file
      }
      this.fileList.push(newFile)

      try {
        if (onProgress) onProgress({ percent: 10 })

        const fileTypeMap = {
          'image/jpeg': 'bank_proof',
          'image/jpg': 'bank_proof',
          'image/png': 'bank_proof',
          'image/bmp': 'bank_proof',
          'application/pdf': 'bank_proof'
        }

        const fileType = fileTypeMap[file.type]
        if (!fileType) {
          const fileIndex = this.fileList.findIndex(f => f.uid === file.uid)
          if (fileIndex > -1) {
            this.fileList[fileIndex].status = 'error'
          }
          onError(new Error('不支持的文件类型'))
          return
        }

        // 更新进度
        const fileIndex = this.fileList.findIndex(f => f.uid === file.uid)
        if (fileIndex > -1) {
          this.fileList[fileIndex].percent = 50
        }
        if (onProgress) onProgress({ percent: 50 })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_type', fileType)

        const response = await request({
          url: '/merchant/upload',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // 完成上传
        if (fileIndex > -1) {
          this.fileList[fileIndex].percent = 100
        }
        if (onProgress) onProgress({ percent: 100 })

        if (response.code === 200) {
          if (fileIndex > -1) {
            this.fileList[fileIndex].status = 'done'
            this.fileList[fileIndex].response = response
            this.fileList[fileIndex].url = response.data
          }

          const responseData = {
            ...response,
            data: response.data
          }

          onSuccess(responseData, file)
          this.$message.success(`${file.name} 上传成功!`)
        } else {
          throw new Error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('Upload error:', error)

        const fileIndex = this.fileList.findIndex(f => f.uid === file.uid)
        if (fileIndex > -1) {
          this.fileList[fileIndex].status = 'error'
        }

        onError(error)
        this.$message.error(`上传失败: ${error.message}`)
      }
    },

    // 删除文件
    handleRemoveFile (file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.fileList.splice(index, 1)
        this.$message.success('文件删除成功')
      }
    }
  }
}
</script>

<style scoped>
.fiat-address-management {
  padding: 24px;
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.search-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 脱敏账号样式 */
.masked-account {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #595959;
}

/* 上传容器样式 */
.upload-container {
  margin-bottom: 16px;
}

.square-upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.square-upload-area:hover {
  border-color: #1890ff;
  background: #f6f6f6;
}

.square-upload-area >>> .ant-upload-drag {
  border: none !important;
  background: transparent !important;
  padding: 16px !important;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.square-upload-area >>> .ant-upload-drag-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-content {
  text-align: center;
  padding: 20px;
}

.upload-content p {
  margin: 8px 0;
  color: #262626;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px !important;
  color: #8c8c8c !important;
  margin: 4px 0 0 0 !important;
}

.square-upload-area >>> .ant-upload-list {
  display: none;
}

/* 文件列表容器样式 */
.file-list-container {
  margin-top: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fff;
}

.file-list {
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
  transition: all 0.3s;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-name {
  margin-left: 8px;
  color: #262626;
  font-size: 14px;
  word-break: break-all;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-icon {
  color: #ff4d4f;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  transition: all 0.3s;
}

.delete-icon:hover {
  background: #fff1f0;
  color: #ff7875;
}

.delete-icon[disabled] {
  color: #bfbfbf;
  cursor: not-allowed;
}

.delete-icon[disabled]:hover {
  background: transparent;
}

/* 文件上传提示 */
.upload-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.upload-tips p {
  margin: 4px 0;
}

/* 文件预览 */
.file-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-link {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #1890ff;
  text-decoration: none;
  font-size: 12px;
}

.file-link:hover {
  background: #e6f7ff;
}

/* 详情内容样式 */
.detail-content {
  padding: 16px 0;
}

/* 表格样式 */
.ant-table >>> .ant-table-thead > tr > th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
  font-weight: 600;
}

.ant-table >>> .ant-table-tbody > tr > td {
  border-bottom: 1px solid #f0f0f0;
}

.ant-table >>> .ant-table-tbody > tr:hover > td {
  background: #f5f5f5;
}
</style>
