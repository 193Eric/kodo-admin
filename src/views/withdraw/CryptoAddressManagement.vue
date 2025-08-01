<template>
  <div class="crypto-address-management">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-filters">
        <a-input
          v-model="filters.search"
          placeholder="Search recipient..."
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
          <a-select-option v-for="currency in availableCurrencies" :key="currency.value" :value="currency.value">
            {{ currency.label }}
          </a-select-option>
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

    <!-- 数字货币地址表格 -->
    <a-table
      :columns="columns"
      :data-source="filteredData"
      :row-key="record => record.id"
      :pagination="pagination"
      :loading="tableLoading"
      @change="handleTableChange"
    >
      <template slot="recipientType" slot-scope="text, record">
        <a-tag :color="record.recipient_type === '1' ? 'blue' : 'green'">
          {{ record.recipient_type === '1' ? 'Company' : 'Personal' }}
        </a-tag>
      </template>

      <template slot="network" slot-scope="text, record">
        <a-tag>{{ record.chain_code }}</a-tag>
      </template>

      <template slot="address" slot-scope="text">
        <div class="address-cell">
          <span class="address-text">{{ text }}</span>
          <a-icon type="copy" class="copy-icon" @click="handleCopyAddress(text)" />
        </div>
      </template>

      <template slot="operation" slot-scope="text, record">
        <a-space>
          <a-button type="link" size="small" @click="handleView(record)">
            <a-icon type="eye" />
          </a-button>
          <a-button type="link" size="small" @click="handleEdit(record)">
            <a-icon type="edit" />
          </a-button>
          <a-button type="link" size="small" @click="handleDelete(record)" danger>
            <a-icon type="delete" />
          </a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal
      :title="modalType === 'add' ? 'Add New Crypto Address' : 'Edit Crypto Address'"
      :visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="600px"
    >
      <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <!-- 收款人类型 -->
        <a-form-item label="Recipient Type">
          <a-radio-group
            v-decorator="[
              'recipient_type',
              {
                rules: [{ required: true, message: 'Please select recipient type!' }],
                initialValue: '1'
              }
            ]"
          >
            <a-radio value="1">Company</a-radio>
            <a-radio value="2">Personal</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 收款人姓名 -->
        <a-form-item label="Recipient Name">
          <a-input
            v-decorator="[
              'recipient_name',
              { rules: [{ required: true, message: 'Please input recipient name!' }] }
            ]"
            placeholder="Enter recipient name"
          />
        </a-form-item>

        <!-- 收款币种 -->
        <a-form-item label="Currency">
          <a-select
            v-decorator="[
              'payment_currency',
              { rules: [{ required: true, message: 'Please select currency!' }] }
            ]"
            placeholder="Select currency"
            @change="handleCurrencyChange"
            :loading="cryptoAccountsLoading"
          >
            <a-select-option v-for="currency in cryptoCurrencyOptions" :key="currency.id" :value="currency.id">
              {{ currency.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 收款网络 -->
        <a-form-item label="Network">
          <a-select
            v-decorator="[
              'chain_code',
              { rules: [{ required: true, message: 'Please select network!' }] }
            ]"
            placeholder="Select network"
          >
            <a-select-option v-for="network in networkOptions" :key="network.code" :value="network.code">
              {{ network.code }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 钱包地址 -->
        <a-form-item label="Wallet Address">
          <a-input
            v-decorator="[
              'wallet_address',
              { rules: [{ required: true, message: 'Please input wallet address!' }] }
            ]"
            placeholder="Enter wallet address"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看详情模态框 -->
    <a-modal
      title="Crypto Address Details"
      :visible="viewModalVisible"
      :footer="null"
      @cancel="viewModalVisible = false"
      width="600px"
    >
      <div v-if="currentRecord" class="detail-content">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="Recipient Name">
            {{ currentRecord.recipient_name }}
          </a-descriptions-item>
          <a-descriptions-item label="Recipient Type">
            <a-tag :color="currentRecord.recipient_type === '1' ? 'blue' : 'green'">
              {{ currentRecord.recipient_type === '1' ? 'Company' : 'Personal' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Currency">
            {{ currentRecord.payment_currency }}
          </a-descriptions-item>
          <a-descriptions-item label="Network">
            <a-tag>{{ currentRecord.chain_code }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Wallet Address">
            <div class="address-detail">
              <span class="address-text">{{ currentRecord.wallet_address }}</span>
              <a-icon type="copy" class="copy-icon" @click="handleCopyAddress(currentRecord.wallet_address)" />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="Account Type">
            {{ currentRecord.account_type === '1' ? 'Wallet' : 'Bank' }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="currentRecord.status ? 'green' : 'red'">
              {{ currentRecord.status ? 'Active' : 'Inactive' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Created Time">
            {{ formatDate(currentRecord.created_at) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import _ from 'lodash'
import { mapGetters } from 'vuex'

export default {
  name: 'CryptoAddressManagement',
  data () {
    return {
      searchLoading: false,
      tableLoading: false,
      cryptoAccountsLoading: false, // 加载币种数据的状态
      filters: {
        search: '',
        currency: undefined
      },
      addressData: [], // 数字货币地址数据
      cryptoList: [], // 加密货币账户列表
      cryptoCurrencyOptions: [], // 从接口获取的币种选项
      networkOptions: [], // 网络选项
      // 币种图标映射
      coinIconMap: {
        'USDT-TRC': require('@/assets/icons/usdt.png'),
        'USDC-TRC': require('@/assets/icons/usdc.png'),
        'USDT': require('@/assets/icons/usdt.png'),
        'USDC': require('@/assets/icons/usdc.png')
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      columns: [
        {
          title: 'Recipient Type',
          dataIndex: 'recipient_type',
          scopedSlots: { customRender: 'recipientType' },
          width: 120
        },
        {
          title: 'Recipient Name',
          dataIndex: 'recipient_name',
          width: 160
        },
        {
          title: 'Wallet Address',
          dataIndex: 'wallet_address',
          scopedSlots: { customRender: 'address' },
          width: 300
        },
        {
          title: 'Network',
          dataIndex: 'chain_code',
          scopedSlots: { customRender: 'network' },
          width: 120
        },
        {
          title: 'Currency',
          dataIndex: 'payment_currency',
          width: 100
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 150,
          fixed: 'right'
        }
      ],

      // 模态框相关
      modalVisible: false,
      modalLoading: false,
      modalType: 'add', // 'add' | 'edit'
      form: this.$form.createForm(this),
      currentRecord: null,
      viewModalVisible: false
    }
  },

  computed: {
    ...mapGetters([
      'getMainMerchant'
    ]),
    // 过滤后的数据
    filteredData () {
      let data = [...this.addressData]

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        data = data.filter(item =>
          item.recipient_name?.toLowerCase().includes(searchTerm) ||
          item.wallet_address?.toLowerCase().includes(searchTerm)
        )
      }

      if (this.filters.currency) {
        data = data.filter(item =>
          item.payment_currency?.includes(this.filters.currency)
        )
      }

      this.pagination.total = data.length
      return data
    },

    // 从币种选项中提取可用的币种用于过滤
    availableCurrencies () {
      return this.cryptoCurrencyOptions.map(currency => ({
        value: currency.id,
        label: currency.name
      }))
    }
  },

  async created () {
    // 先获取币种数据，再获取地址列表
    await this.getWalletBalance()
    await this.getAddressList()
  },

  methods: {
    // 防抖处理的搜索方法
    handleSearch: _.debounce(function () {
      // 搜索逻辑在computed中处理
    }, 300),

    // 获取币种图标
    getCoinIcon (currencyId) {
      // 先尝试完整匹配
      if (this.coinIconMap[currencyId]) {
        return this.coinIconMap[currencyId]
      }

      // 提取币种名称进行匹配
      const coinName = currencyId.split('_')[0]
      if (this.coinIconMap[coinName]) {
        return this.coinIconMap[coinName]
      }

      // 默认图标
      return this.coinIconMap['USDT']
    },

    // 获取地址列表
    async getAddressList () {
      this.tableLoading = true
      try {
        const res = await request({
          url: '/merchant/contact/list',
          method: 'GET'
        })

        if (res.code === 200) {
          // 转换数据格式以匹配旧项目的接口返回格式
          this.addressData = (res.data || []).map(item => ({
            id: item.id,
            merchant_id: item.merchant_id,
            recipient_type: item.recipient_type?.toString() || '1',
            account_type: item.account_type?.toString() || '1',
            wallet_address: item.wallet_address || '',
            payment_currency: item.payment_currency || '',
            recipient_name: item.recipient_name || '',
            chain_code: item.chain_code || '',
            status: item.status !== false, // 转换为boolean
            created_at: item.created_at,
            updated_at: item.updated_at
          }))

          this.pagination.total = this.addressData.length
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取数据失败')
      } finally {
        this.tableLoading = false
      }
    },

    // 获取钱包余额和币种信息
    async getWalletBalance () {
      this.cryptoAccountsLoading = true
      try {
        // 获取当前商户ID
        const merchantId = localStorage.getItem('currentMerchantId')
        const res = await request({
          url: `/merchant/crypto/v2/accounts?type=1&merchant_id=${merchantId}`,
          method: 'GET'
        })

        if (res.code === 200 && res.data) {
          this.cryptoList = res.data

          // 格式化币种选项
          this.cryptoCurrencyOptions = res.data.map(item => ({
            id: item.crypto_currency_id,
            name: item.crypto_currency?.name || item.crypto_currency_id,
            chainName: item.crypto_currency?.chain_name || '',
            chainCode: item.crypto_currency?.chain_code || '',
            symbol: item.crypto_currency?.symbol || '',
            balance: item.balance
          }))

          console.log('加密货币账户列表:', this.cryptoCurrencyOptions)
        } else {
          console.error('获取加密货币账户失败:', res.message)
          this.$message.error('Failed to load crypto accounts')
        }
      } catch (error) {
        console.error('获取钱包信息失败:', error)
        this.$message.error('Failed to load crypto accounts')
      } finally {
        this.cryptoAccountsLoading = false
      }
    },

    // 重置搜索
    handleReset () {
      this.filters = {
        search: '',
        currency: undefined
      }
    },

    // 新增地址
    async handleNewAddress () {
      this.modalType = 'add'
      this.currentRecord = null
      this.modalVisible = true
      this.networkOptions = [] // 重置网络选项

      this.$nextTick(() => {
        this.form.resetFields()
      })
    },

    // 查看详情
    handleView (record) {
      this.currentRecord = record
      this.viewModalVisible = true
    },

    // 编辑地址
    async handleEdit (record) {
      this.modalType = 'edit'
      this.currentRecord = record
      this.modalVisible = true

      // 根据当前币种设置网络选项
      const currencyData = this.cryptoCurrencyOptions.find(
        item => item.id === record.payment_currency
      )

      if (currencyData && currencyData.chainCode) {
        this.networkOptions = [{
          code: currencyData.chainCode
        }]
      } else {
        this.networkOptions = []
      }

      this.$nextTick(() => {
        this.form.setFieldsValue({
          recipient_type: record.recipient_type?.toString() || '1',
          recipient_name: record.recipient_name || '',
          payment_currency: record.payment_currency || '',
          chain_code: record.chain_code || '',
          wallet_address: record.wallet_address || ''
        })
      })
    },

    // 删除地址
    handleDelete (record) {
      this.$confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete the address for "${record.recipient_name}"?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            // TODO: 这里需要调用删除接口，目前API可能没有提供删除接口
            // 暂时先从本地数组中删除
            const index = this.addressData.findIndex(item => item.id === record.id)
            if (index > -1) {
              this.addressData.splice(index, 1)
              this.$message.success('Address deleted successfully')
            }
          } catch (error) {
            console.error(error)
            this.$message.error('Delete failed')
          }
        }
      })
    },

    // 币种变更
    handleCurrencyChange (currency) {
      // 根据选择的币种设置对应的网络
      const currencyData = this.cryptoCurrencyOptions.find(
        item => item.id === currency
      )

      if (currencyData && currencyData.chainCode) {
        this.networkOptions = [{
          code: currencyData.chainCode
        }]

        // 自动选中对应的网络
        this.form.setFieldsValue({
          chain_code: currencyData.chainCode
        })
      } else {
        this.networkOptions = []
        this.form.setFieldsValue({
          chain_code: undefined
        })
      }
    },

    // 模态框确认
    handleModalOk () {
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.modalLoading = true

          try {
            let res
            if (this.modalType === 'add') {
              // 新增
              res = await request({
                url: '/merchant/contact/create',
                method: 'POST',
                data: {
                  recipient_type: values.recipient_type,
                  account_type: '1', // 固定为钱包类型
                  wallet_address: values.wallet_address,
                  payment_currency: values.payment_currency,
                  chain_code: values.chain_code,
                  recipient_name: values.recipient_name
                }
              })
            } else {
              // 编辑
              res = await request({
                url: '/merchant/contact/update',
                method: 'POST',
                data: {
                  id: this.currentRecord.id,
                  recipient_type: values.recipient_type,
                  account_type: '1',
                  wallet_address: values.wallet_address,
                  payment_currency: values.payment_currency,
                  chain_code: values.chain_code,
                  recipient_name: values.recipient_name
                }
              })
            }

            if (res.code === 200) {
              this.$message.success(this.modalType === 'add' ? 'Address added successfully' : 'Address updated successfully')
              this.modalVisible = false
              this.form.resetFields()
              this.networkOptions = []
              this.getAddressList() // 重新获取列表
            } else {
              this.$message.error(res.message || 'Operation failed')
            }
          } catch (error) {
            console.error(error)
            this.$message.error('System error, please try again')
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
      this.networkOptions = []
    },

    // 表格分页变更
    handleTableChange (pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
    },

    // 复制地址
    handleCopyAddress (address) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(address).then(() => {
          this.$message.success('Address copied to clipboard')
        }).catch(() => {
          this.$message.error('Copy failed')
        })
      } else {
        // 降级处理
        const textArea = document.createElement('textarea')
        textArea.value = address
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          this.$message.success('Address copied to clipboard')
        } catch (err) {
          this.$message.error('Copy failed')
        }
        document.body.removeChild(textArea)
      }
    },

    // 格式化日期
    formatDate (dateString) {
      if (!dateString) return '-'
      try {
        return new Date(dateString).toLocaleString()
      } catch (error) {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
.crypto-address-management {
  /* 移除padding，因为tab-content已经有了 */
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

/* 币种选项样式 - 已移除，现在只显示文本 */

/* 修复下拉选项样式 - 已移除，现在只显示文本 */

/* 地址样式 */
.address-cell {
  display: flex;
  align-items: center;
  max-width: 280px;
}

.address-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #595959;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  margin-left: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #1890ff;
  flex-shrink: 0;
}

.copy-icon:hover {
  color: #40a9ff;
}

/* 详情内容样式 */
.detail-content {
  padding: 16px 0;
}

.address-detail {
  display: flex;
  align-items: center;
}

.address-detail .address-text {
  flex: 1;
  word-break: break-all;
  max-width: 400px;
}

/* 表格样式 */
.crypto-address-management >>> .ant-table-thead > tr > th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
  font-weight: 600;
}

.crypto-address-management >>> .ant-table-tbody > tr > td {
  border-bottom: 1px solid #f0f0f0;
}

.crypto-address-management >>> .ant-table-tbody > tr:hover > td {
  background: #f5f5f5;
}

/* 操作按钮样式 */
.crypto-address-management >>> .ant-btn-link {
  padding: 4px 8px;
  height: auto;
  border: none;
  box-shadow: none;
}

.crypto-address-management >>> .ant-btn-link:hover {
  background: #f0f0f0;
  border-radius: 4px;
}

/* 标签样式 */
.crypto-address-management >>> .ant-tag {
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
}
</style>
