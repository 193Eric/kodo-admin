<template>
  <div class="recipient-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>Recipient Management</h1>
    </div>

    <!-- Tab切换 -->
    <a-tabs v-model="activeTab" class="recipient-tabs">
      <a-tab-pane key="digitalCurrency" tab="Digital Currency Recipient">
        <h2 style="margin-left: 20px;margin-top:10px; ">Coming soon</h2>
        <!-- 数字货币收款人页面 -->
        <div v-if="false" class="tab-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-filters">
              <a-input
                v-model="digitalFilters.search"
                placeholder="Search recipient..."
                style="width: 200px; margin-right: 16px"
                allow-clear
                @pressEnter="handleDigitalSearch"
              >
                <a-icon slot="prefix" type="search" />
              </a-input>

              <a-select
                v-model="digitalFilters.currency"
                placeholder="Currency"
                style="width: 120px; margin-right: 16px"
                allow-clear
                mode="multiple"
              >
                <a-select-option value="BTC">BTC</a-select-option>
                <a-select-option value="USDT">USDT</a-select-option>
                <a-select-option value="ETH">ETH</a-select-option>
                <a-select-option value="USDC">USDC</a-select-option>
              </a-select>

              <a-button @click="handleDigitalReset" style="margin-right: 16px">
                Reset
              </a-button>
            </div>

            <div class="action-buttons">
              <a-button type="primary" @click="handleNewDigitalRecipient">
                <a-icon type="plus" />
                New Recipient
              </a-button>
            </div>
          </div>

          <!-- 数字货币表格 -->
          <a-table
            :columns="digitalColumns"
            :data-source="filteredDigitalData"
            :row-key="record => record.id"
            :pagination="digitalPagination"
            :loading="digitalLoading"
            @change="handleDigitalTableChange"
          >
            <template slot="network" slot-scope="text, record">
              <a-space>
                <a-tag v-for="network in record.networks" :key="network" >
                  {{ network }}
                </a-tag>
              </a-space>
            </template>

            <template slot="currency" slot-scope="text, record">
              <span>{{ record.currencies.join(', ') }}</span>
            </template>

            <template slot="address" slot-scope="text">
              <span class="address-text">{{ text }}</span>
              <a-icon type="copy" class="copy-icon" @click="handleCopyAddress(text)" />
            </template>

            <template slot="operation" slot-scope="text, record">
              <a-space>
                <a-button type="link" size="small" @click="handleDigitalView(record)">
                  <a-icon type="file-search" />
                </a-button>
                <a-button type="link" size="small" @click="handleDigitalEdit(record)">
                  <a-icon type="edit" />
                </a-button>
                <a-button type="link" size="small" @click="handleDigitalDelete(record)">
                  <a-icon type="delete" />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="fiatCurrency" tab="Fiat Currency Recipient">
        <!-- 法币收款人页面 -->
        <h2 style="margin-left: 20px;margin-top:10px; ">Coming soon</h2>
        <div v-if="false" class="tab-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-filters">
              <a-input
                v-model="fiatFilters.search"
                placeholder="Search recipient..."
                style="width: 200px; margin-right: 16px"
                allow-clear
                @pressEnter="handleFiatSearch"
              >
                <a-icon slot="prefix" type="search" />
              </a-input>

              <a-select
                v-model="fiatFilters.accountType"
                placeholder="Account Type"
                style="width: 140px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="All">All</a-select-option>
                <a-select-option value="Company">Company</a-select-option>
                <a-select-option value="Personal">Personal</a-select-option>
              </a-select>

              <a-select
                v-model="fiatFilters.currency"
                placeholder="Currency"
                style="width: 120px; margin-right: 16px"
                allow-clear
                mode="multiple"
              >
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
                <a-select-option value="GBP">GBP</a-select-option>
                <a-select-option value="HKD">HKD</a-select-option>
              </a-select>

              <a-button @click="handleFiatReset">
                Reset
              </a-button>
            </div>

            <div class="action-buttons">
              <a-button type="primary" @click="handleNewFiatRecipient">
                <a-icon type="plus" />
                New Recipient
              </a-button>
            </div>
          </div>

          <!-- 法币表格 -->
          <a-table
            :columns="fiatColumns"
            :data-source="filteredFiatData"
            :row-key="record => record.id"
            :pagination="fiatPagination"
            :loading="fiatLoading"
            @change="handleFiatTableChange"
          >
            <template slot="receivingAccount" slot-scope="text">
              <span class="masked-account">{{ text }}</span>
            </template>

            <template slot="country" slot-scope="text, record">
              <a-space>
                <img :src="record.flag" :alt="text" style="width: 16px; height: 12px;" />
                <span>{{ text }}</span>
              </a-space>
            </template>

            <template slot="currency" slot-scope="text, record">
              <span>{{ record.currencies.join(', ') }}</span>
            </template>

            <template slot="operation" slot-scope="text, record">
              <a-space>
                <a-button type="link" size="small" @click="handleFiatView(record)">
                  <a-icon type="file-search" />
                </a-button>
                <a-button type="link" size="small" @click="handleFiatEdit(record)">
                  <a-icon type="edit" />
                </a-button>
                <a-button type="link" size="small" @click="handleFiatDelete(record)">
                  <a-icon type="delete" />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 新增/编辑数字货币收款人弹窗 -->
    <a-modal
      :title="digitalModalTitle"
      :visible="digitalModalVisible"
      @ok="handleDigitalModalOk"
      @cancel="handleDigitalModalCancel"
      :confirmLoading="digitalModalLoading"
      width="600px"
    >
      <a-form :form="digitalForm" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
        <a-form-item label="Country/Region">
          <a-select
            v-decorator="['country', { rules: [{ required: true, message: 'Please select country' }] }]"
            placeholder="Select country/region"
          >
            <a-select-option value="America">
              <img src="https://flagcdn.com/w20/us.png" style="width: 16px; margin-right: 8px;" />
              America
            </a-select-option>
            <a-select-option value="HongKong">
              <img src="https://flagcdn.com/w20/hk.png" style="width: 16px; margin-right: 8px;" />
              HongKong
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Currency">
          <a-select
            v-decorator="['currency', { rules: [{ required: true, message: 'Please select currency' }] }]"
            placeholder="Select currency"
            mode="multiple"
          >
            <a-select-option value="BTC">BTC</a-select-option>
            <a-select-option value="USDT">USDT</a-select-option>
            <a-select-option value="ETH">ETH</a-select-option>
            <a-select-option value="USDC">USDC</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Recipient Name">
          <a-input
            v-decorator="['recipientName', { rules: [{ required: true, message: 'Please input recipient name' }] }]"
            placeholder="The nickname is only visible to you and will not be sent to the recipient"
          />
        </a-form-item>

        <a-form-item label="Address">
          <a-input
            v-decorator="['address', { rules: [{ required: true, message: 'Please input address' }] }]"
            placeholder="Please input wallet address"
          />
        </a-form-item>

        <a-form-item label="Network">
          <a-select
            v-decorator="['network', { rules: [{ required: true, message: 'Please select network' }] }]"
            placeholder="Select network"
          >
            <a-select-option value="ERC-20">ERC-20</a-select-option>
            <a-select-option value="TRC-20">TRC-20</a-select-option>
            <a-select-option value="Bitcoin">Bitcoin</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <template slot="footer">
        <a-button @click="handleDigitalModalCancel">Cancel</a-button>
        <a-button type="primary" :loading="digitalModalLoading" @click="handleDigitalModalOk">
          {{ digitalModalMode === 'add' ? 'Add' : 'Update' }}
        </a-button>
      </template>
    </a-modal>

    <!-- 新增/编辑法币收款人弹窗 -->
    <a-modal
      :title="fiatModalTitle"
      :visible="fiatModalVisible"
      @ok="handleFiatModalOk"
      @cancel="handleFiatModalCancel"
      :confirmLoading="fiatModalLoading"
      width="700px"
    >
      <a-form :form="fiatForm" layout="vertical" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
        <!-- Account Details 部分 -->
        <div class="form-section">
          <h3 class="section-title">Account Details</h3>

          <a-form-item label="Country/Region">
            <a-select
              v-decorator="['country', { rules: [{ required: true, message: 'Please select country' }] }]"
              placeholder="Select country/region"
            >
              <a-select-option value="America">
                <img src="https://flagcdn.com/w20/us.png" style="width: 16px; margin-right: 8px;" />
                America
              </a-select-option>
              <a-select-option value="HongKong">
                <img src="https://flagcdn.com/w20/hk.png" style="width: 16px; margin-right: 8px;" />
                HongKong
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Currency">
            <a-select
              v-decorator="['currency', { rules: [{ required: true, message: 'Please select currency' }] }]"
              placeholder="Select currency"
              mode="multiple"
            >
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
              <a-select-option value="GBP">GBP</a-select-option>
              <a-select-option value="HKD">HKD</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Recipient Account Type">
            <a-radio-group v-decorator="['accountType', { initialValue: 'Company' }]">
              <a-radio value="Company">Company</a-radio>
              <a-radio value="Personal">Personal</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="Payment Method">
            <div class="payment-method-section">
              <div class="method-info">
                <strong>RTGS</strong>
                <div class="method-desc">Real-time Local Bank Payment Methods</div>
                <div class="method-details">Fee: 7.00 USD · Timescale: 0-1 business day</div>
              </div>
              <a-button type="link" @click="handleChangePaymentMethod">Change</a-button>
            </div>
          </a-form-item>

          <a-form-item label="SWIFT Code">
            <a-select
              v-decorator="['swiftCode', { rules: [{ required: true, message: 'Please select SWIFT code' }] }]"
              placeholder="Search for SWIFT code or bank name"
              show-search
              filter-option
            >
              <a-select-option value="BARCGB22829">BARCGB22829 - Barclays Bank</a-select-option>
              <a-select-option value="CHASUS33">CHASUS33 - Chase Bank</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Account No.">
            <a-input
              v-decorator="['accountNo', { rules: [{ required: true, message: 'Please input account number' }] }]"
              placeholder="A maximum of 17 digits, with the first 3 digits being the branch code"
            />
          </a-form-item>

          <a-form-item label="User Name">
            <a-input
              v-decorator="['userName', { rules: [{ required: true, message: 'Please input user name' }] }]"
              placeholder="Enter the account name of the payee at the bank"
            />
          </a-form-item>
        </div>

        <!-- Recipient Details 部分 -->
        <div class="form-section">
          <h3 class="section-title">Recipient Details</h3>

          <a-form-item label="Recipient Name">
            <a-input
              v-decorator="['recipientName', { rules: [{ required: true, message: 'Please input recipient name' }] }]"
              placeholder="The nickname is only visible to you and will not be sent to the recipient"
            />
          </a-form-item>

          <a-form-item label="Email Account">
            <a-input
              v-decorator="['emailAccount', { rules: [{ type: 'email', message: 'Please input valid email' }] }]"
              placeholder="Please input email account"
            />
          </a-form-item>

          <a-form-item label="Address">
            <a-textarea
              v-decorator="['address', { rules: [{ required: true, message: 'Please input address' }] }]"
              placeholder="Recipient address (PO or GPO Box type addresses are not supported)"
              :rows="3"
            />
          </a-form-item>
        </div>
      </a-form>

      <template slot="footer">
        <a-button @click="handleFiatModalCancel">Cancel</a-button>
        <a-button type="primary" :loading="fiatModalLoading" @click="handleFiatModalOk">
          {{ fiatModalMode === 'add' ? 'Add' : 'Update' }}
        </a-button>
      </template>
    </a-modal>

    <!-- 查看详情弹窗 -->
    <a-modal
      title="Details"
      :visible="detailModalVisible"
      @cancel="handleDetailModalCancel"
      :footer="null"
      width="700px"
    >
      <div v-if="currentDetailRecord">
        <!-- 数字货币详情 -->
        <div v-if="activeTab === 'digitalCurrency'" class="detail-content">
          <div class="detail-row">
            <div class="detail-item">
              <div class="detail-label">Country/Region</div>
              <div class="detail-value">
                <img :src="currentDetailRecord.flag" style="width: 16px; margin-right: 8px;" />
                {{ currentDetailRecord.country }}
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Currency</div>
              <div class="detail-value">{{ currentDetailRecord.currencies.join(', ') }}</div>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <div class="detail-label">Recipient Name</div>
              <div class="detail-value">{{ currentDetailRecord.recipientName }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Address</div>
              <div class="detail-value">
                {{ currentDetailRecord.address }}
                <a-icon type="copy" class="copy-icon" @click="handleCopyAddress(currentDetailRecord.address)" />
              </div>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item full-width">
              <div class="detail-label">Network</div>
              <div class="detail-value">{{ currentDetailRecord.networks.join(', ') }}</div>
            </div>
          </div>
        </div>

        <!-- 法币详情 -->
        <div v-else class="detail-content">
          <div class="detail-section">
            <h3 class="section-title">Account Details</h3>

            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Country/Region</div>
                <div class="detail-value">
                  <img :src="currentDetailRecord.flag" style="width: 16px; margin-right: 8px;" />
                  {{ currentDetailRecord.country }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Currency</div>
                <div class="detail-value">{{ currentDetailRecord.currencies.join(', ') }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Recipient Account Type</div>
                <div class="detail-value">{{ currentDetailRecord.accountType }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Payment Method</div>
                <div class="detail-value">{{ currentDetailRecord.paymentMethod }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">SWIFT Code</div>
                <div class="detail-value">{{ currentDetailRecord.swiftCode }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Account No.</div>
                <div class="detail-value">{{ currentDetailRecord.accountNo }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item full-width">
                <div class="detail-label">User Name</div>
                <div class="detail-value">{{ currentDetailRecord.userName }}</div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">Recipient Details</h3>

            <div class="detail-row">
              <div class="detail-item">
                <div class="detail-label">Recipient Name</div>
                <div class="detail-value">{{ currentDetailRecord.recipientName }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email Account</div>
                <div class="detail-value">{{ currentDetailRecord.emailAccount }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item full-width">
                <div class="detail-label">Address</div>
                <div class="detail-value">{{ currentDetailRecord.recipientAddress }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'RecipientManagement',
  data () {
    return {
      activeTab: 'digitalCurrency',

      // 数字货币相关数据
      digitalFilters: {
        search: '',
        currency: []
      },
      digitalData: [],
      digitalLoading: false,
      digitalPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
      },
      digitalColumns: [
        {
          title: 'Recipient Name',
          dataIndex: 'recipientName',
          width: 200
        },
        {
          title: 'Address',
          dataIndex: 'address',
          scopedSlots: { customRender: 'address' },
          width: 300
        },
        {
          title: 'Network',
          dataIndex: 'networks',
          scopedSlots: { customRender: 'network' },
          width: 150
        },
        {
          title: 'Currency',
          dataIndex: 'currencies',
          scopedSlots: { customRender: 'currency' },
          width: 120
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          fixed: 'right'
        }
      ],

      // 法币相关数据
      fiatFilters: {
        search: '',
        accountType: undefined,
        currency: []
      },
      fiatData: [],
      fiatLoading: false,
      fiatPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
      },
      fiatColumns: [
        {
          title: 'Recipient Name',
          dataIndex: 'recipientName',
          width: 160
        },
        {
          title: 'Account Type',
          dataIndex: 'accountType',
          width: 120
        },
        {
          title: 'Receiving Account',
          dataIndex: 'receivingAccount',
          scopedSlots: { customRender: 'receivingAccount' },
          width: 180
        },
        {
          title: 'Country/Region',
          dataIndex: 'country',
          scopedSlots: { customRender: 'country' },
          width: 150
        },
        {
          title: 'Currency',
          dataIndex: 'currencies',
          scopedSlots: { customRender: 'currency' },
          width: 100
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          fixed: 'right'
        }
      ],

      // 弹窗相关
      digitalModalVisible: false,
      digitalModalLoading: false,
      digitalModalMode: 'add', // add, edit
      digitalModalTitle: 'Add New Recipient',
      digitalForm: this.$form.createForm(this),
      currentDigitalRecord: null,

      fiatModalVisible: false,
      fiatModalLoading: false,
      fiatModalMode: 'add', // add, edit
      fiatModalTitle: 'Add New Recipient',
      fiatForm: this.$form.createForm(this),
      currentFiatRecord: null,

      detailModalVisible: false,
      currentDetailRecord: null
    }
  },

  computed: {
    // 过滤后的数字货币数据
    filteredDigitalData () {
      let filtered = [...this.digitalData]

      if (this.digitalFilters.search) {
        const search = this.digitalFilters.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.recipientName.toLowerCase().includes(search) ||
          item.address.toLowerCase().includes(search)
        )
      }

      if (this.digitalFilters.currency.length > 0) {
        filtered = filtered.filter(item =>
          this.digitalFilters.currency.some(currency =>
            item.currencies.includes(currency)
          )
        )
      }

      return filtered
    },

    // 过滤后的法币数据
    filteredFiatData () {
      let filtered = [...this.fiatData]

      if (this.fiatFilters.search) {
        const search = this.fiatFilters.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.recipientName.toLowerCase().includes(search) ||
          item.receivingAccount.toLowerCase().includes(search)
        )
      }

      if (this.fiatFilters.accountType && this.fiatFilters.accountType !== 'All') {
        filtered = filtered.filter(item => item.accountType === this.fiatFilters.accountType)
      }

      if (this.fiatFilters.currency.length > 0) {
        filtered = filtered.filter(item =>
          this.fiatFilters.currency.some(currency =>
            item.currencies.includes(currency)
          )
        )
      }

      return filtered
    }
  },

  mounted () {
    this.loadDigitalData()
    this.loadFiatData()
  },

  methods: {
    // 加载数字货币数据
    async loadDigitalData () {
      this.digitalLoading = true
      try {
        await this.delay(500)
        const mockData = this.generateDigitalMockData()
        this.digitalData = mockData
        this.digitalPagination.total = mockData.length
      } catch (error) {
        this.$message.error('加载数字货币数据失败')
      } finally {
        this.digitalLoading = false
      }
    },

    // 生成数字货币Mock数据
    generateDigitalMockData () {
      return [
        {
          id: 1,
          recipientName: 'Digital Solutions Inc',
          address: 'CF7PUKUBUqPA02LVRYYDS4ECgr7oDEJ3P9',
          networks: ['ERC-20', 'TRC-20'],
          currencies: ['BTC', 'USDT'],
          country: 'America',
          flag: 'https://flagcdn.com/w20/us.png'
        },
        {
          id: 2,
          recipientName: 'CryptoVendor Ltd',
          address: 'TQNPUKUBUqPA02LVRYYDS4ECgr7oDEJ92H',
          networks: ['TRC-20'],
          currencies: ['USDC', 'USDT'],
          country: 'America',
          flag: 'https://flagcdn.com/w20/us.png'
        },
        {
          id: 3,
          recipientName: 'BlockChain Merchants',
          address: 'CF7PUKUBUqPA02LVRYYDS4ECgr7oDEJ3P9',
          networks: ['Bitcoin', 'TRC-20'],
          currencies: ['BTC', 'USDT'],
          country: 'HongKong',
          flag: 'https://flagcdn.com/w20/hk.png'
        }
      ]
    },

    // 加载法币数据
    async loadFiatData () {
      this.fiatLoading = true
      try {
        await this.delay(500)
        const mockData = this.generateFiatMockData()
        this.fiatData = mockData
        this.fiatPagination.total = mockData.length
      } catch (error) {
        this.$message.error('加载法币数据失败')
      } finally {
        this.fiatLoading = false
      }
    },

    // 生成法币Mock数据
    generateFiatMockData () {
      return [
        {
          id: 1,
          recipientName: 'Global Trade Partners',
          accountType: 'Company',
          receivingAccount: '**** **** **** 2261',
          country: 'America',
          flag: 'https://flagcdn.com/w20/us.png',
          currencies: ['USD'],
          paymentMethod: 'RTGS',
          swiftCode: 'BARCGB22829',
          accountNo: '4320 2931 1023 2261',
          userName: 'Brooklyn Simmons',
          emailAccount: 'tranthuy.nute@gmail.com',
          recipientAddress: '2118 Thornridge Cir. Syracuse, Connecticut 35624'
        },
        {
          id: 2,
          recipientName: 'CryptoVendor Ltd',
          accountType: 'Personal',
          receivingAccount: '**** **** **** 2762',
          country: 'America',
          flag: 'https://flagcdn.com/w20/us.png',
          currencies: ['USD'],
          paymentMethod: 'RTGS',
          swiftCode: 'CHASUS33',
          accountNo: '4320 2931 1023 2762',
          userName: 'John Smith',
          emailAccount: 'john.smith@example.com',
          recipientAddress: '123 Main Street, New York, NY 10001'
        },
        {
          id: 3,
          recipientName: 'CryptoVendor Ltd',
          accountType: 'Company',
          receivingAccount: '**** **** **** 2762',
          country: 'HongKong',
          flag: 'https://flagcdn.com/w20/hk.png',
          currencies: ['USD'],
          paymentMethod: 'RTGS',
          swiftCode: 'BARCGB22829',
          accountNo: '4320 2931 1023 2762',
          userName: 'Li Wei',
          emailAccount: 'li.wei@cryptovendor.com',
          recipientAddress: 'Suite 1001, Central Plaza, Central, Hong Kong'
        }
      ]
    },

    // 数字货币搜索重置
    handleDigitalSearch () {
      this.digitalPagination.current = 1
    },

    handleDigitalReset () {
      this.digitalFilters = {
        search: '',
        currency: []
      }
    },

    // 法币搜索重置
    handleFiatSearch () {
      this.fiatPagination.current = 1
    },

    handleFiatReset () {
      this.fiatFilters = {
        search: '',
        accountType: undefined,
        currency: []
      }
    },

    // 表格变化处理
    handleDigitalTableChange (pagination) {
      this.digitalPagination.current = pagination.current
      this.digitalPagination.pageSize = pagination.pageSize
    },

    handleFiatTableChange (pagination) {
      this.fiatPagination.current = pagination.current
      this.fiatPagination.pageSize = pagination.pageSize
    },

    // 新增数字货币收款人
    handleNewDigitalRecipient () {
      this.digitalModalMode = 'add'
      this.digitalModalTitle = 'Add New Recipient'
      this.digitalModalVisible = true
      this.currentDigitalRecord = null
      this.digitalForm.resetFields()
    },

    // 编辑数字货币收款人
    handleDigitalEdit (record) {
      this.digitalModalMode = 'edit'
      this.digitalModalTitle = 'Edit Recipient'
      this.digitalModalVisible = true
      this.currentDigitalRecord = record
      this.$nextTick(() => {
        this.digitalForm.setFieldsValue({
          country: record.country,
          currency: record.currencies,
          recipientName: record.recipientName,
          address: record.address,
          network: record.networks[0] // 取第一个网络
        })
      })
    },

    handleDigitalModalOk () {
      this.digitalForm.validateFields((err, values) => {
        if (!err) {
          this.digitalModalLoading = true
          setTimeout(() => {
            if (this.digitalModalMode === 'add') {
              // 新增数字货币收款人
              const newRecipient = {
                id: Date.now(),
                recipientName: values.recipientName,
                address: values.address,
                networks: [values.network],
                currencies: values.currency,
                country: values.country,
                flag: values.country === 'America' ? 'https://flagcdn.com/w20/us.png' : 'https://flagcdn.com/w20/hk.png'
              }
              this.digitalData.unshift(newRecipient)
              this.digitalPagination.total += 1
              this.$message.success('数字货币收款人添加成功')
            } else if (this.digitalModalMode === 'edit') {
              // 编辑数字货币收款人
              const index = this.digitalData.findIndex(item => item.id === this.currentDigitalRecord.id)
              if (index !== -1) {
                this.digitalData.splice(index, 1, {
                  ...this.currentDigitalRecord,
                  recipientName: values.recipientName,
                  address: values.address,
                  networks: [values.network],
                  currencies: values.currency,
                  country: values.country,
                  flag: values.country === 'America' ? 'https://flagcdn.com/w20/us.png' : 'https://flagcdn.com/w20/hk.png'
                })
                this.$message.success('数字货币收款人更新成功')
              }
            }

            this.digitalModalVisible = false
            this.digitalModalLoading = false
            this.digitalForm.resetFields()
            this.currentDigitalRecord = null
          }, 1000)
        }
      })
    },

    handleDigitalModalCancel () {
      this.digitalModalVisible = false
      this.digitalForm.resetFields()
      this.currentDigitalRecord = null
    },

    // 新增法币收款人
    handleNewFiatRecipient () {
      this.fiatModalMode = 'add'
      this.fiatModalTitle = 'Add New Recipient'
      this.fiatModalVisible = true
      this.currentFiatRecord = null
      this.fiatForm.resetFields()
    },

    // 编辑法币收款人
    handleFiatEdit (record) {
      this.fiatModalMode = 'edit'
      this.fiatModalTitle = 'Edit Recipient'
      this.fiatModalVisible = true
      this.currentFiatRecord = record
      this.$nextTick(() => {
        this.fiatForm.setFieldsValue({
          country: record.country,
          currency: record.currencies,
          accountType: record.accountType,
          swiftCode: record.swiftCode,
          accountNo: record.accountNo,
          userName: record.userName,
          recipientName: record.recipientName,
          emailAccount: record.emailAccount,
          address: record.recipientAddress
        })
      })
    },

    handleFiatModalOk () {
      this.fiatForm.validateFields((err, values) => {
        if (!err) {
          this.fiatModalLoading = true
          setTimeout(() => {
            if (this.fiatModalMode === 'add') {
              // 新增法币收款人
              const newRecipient = {
                id: Date.now(),
                recipientName: values.recipientName,
                accountType: values.accountType,
                receivingAccount: `**** **** **** ${values.accountNo.slice(-4)}`,
                country: values.country,
                flag: values.country === 'America' ? 'https://flagcdn.com/w20/us.png' : 'https://flagcdn.com/w20/hk.png',
                currencies: values.currency,
                paymentMethod: 'RTGS',
                swiftCode: values.swiftCode,
                accountNo: values.accountNo,
                userName: values.userName,
                emailAccount: values.emailAccount,
                recipientAddress: values.address
              }
              this.fiatData.unshift(newRecipient)
              this.fiatPagination.total += 1
              this.$message.success('法币收款人添加成功')
            } else if (this.fiatModalMode === 'edit') {
              // 编辑法币收款人
              const index = this.fiatData.findIndex(item => item.id === this.currentFiatRecord.id)
              if (index !== -1) {
                this.fiatData.splice(index, 1, {
                  ...this.currentFiatRecord,
                  recipientName: values.recipientName,
                  accountType: values.accountType,
                  receivingAccount: `**** **** **** ${values.accountNo.slice(-4)}`,
                  country: values.country,
                  flag: values.country === 'America' ? 'https://flagcdn.com/w20/us.png' : 'https://flagcdn.com/w20/hk.png',
                  currencies: values.currency,
                  paymentMethod: 'RTGS',
                  swiftCode: values.swiftCode,
                  accountNo: values.accountNo,
                  userName: values.userName,
                  emailAccount: values.emailAccount,
                  recipientAddress: values.address
                })
                this.$message.success('法币收款人更新成功')
              }
            }

            this.fiatModalVisible = false
            this.fiatModalLoading = false
            this.fiatForm.resetFields()
            this.currentFiatRecord = null
          }, 1000)
        }
      })
    },

    handleFiatModalCancel () {
      this.fiatModalVisible = false
      this.fiatForm.resetFields()
      this.currentFiatRecord = null
    },

    // 查看详情
    handleDigitalView (record) {
      this.currentDetailRecord = record
      this.detailModalVisible = true
    },

    handleFiatView (record) {
      this.currentDetailRecord = record
      this.detailModalVisible = true
    },

    handleDetailModalCancel () {
      this.detailModalVisible = false
      this.currentDetailRecord = null
    },

    // 删除
    handleDigitalDelete (record) {
      this.$confirm({
        title: '确定删除此收款人吗？',
        content: `收款人：${record.recipientName}`,
        onOk: () => {
          const index = this.digitalData.findIndex(item => item.id === record.id)
          if (index !== -1) {
            this.digitalData.splice(index, 1)
            this.$message.success('删除成功')
          }
        }
      })
    },

    handleFiatDelete (record) {
      this.$confirm({
        title: '确定删除此收款人吗？',
        content: `收款人：${record.recipientName}`,
        onOk: () => {
          const index = this.fiatData.findIndex(item => item.id === record.id)
          if (index !== -1) {
            this.fiatData.splice(index, 1)
            this.$message.success('删除成功')
          }
        }
      })
    },

    // 复制地址
    handleCopyAddress (address) {
      navigator.clipboard.writeText(address).then(() => {
        this.$message.success('地址已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },

    // 修改支付方式
    handleChangePaymentMethod () {
      this.$message.info('修改支付方式功能')
    },

    // 延时函数
    delay (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.recipient-management {
  padding: 24px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #262626;
  font-weight: 600;
}

.recipient-tabs {
  background: #fff;
  border-radius: 8px;
}

.recipient-tabs .ant-tabs-bar {
  margin: 0;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.recipient-tabs .ant-tabs-tab {
  margin: 0 32px 0 0;
  padding: 16px 0;
  font-size: 14px;
  color: #8c8c8c;
}

.recipient-tabs .ant-tabs-tab-active {
  color: #11253E;
  font-weight: 600;
}

.tab-content {

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

/* 表格样式 */
.ant-table {
  background: #fff;
  border-radius: 6px;
}

.ant-table-thead > tr > th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
  font-weight: 600;
}

.ant-table-tbody > tr > td {
  border-bottom: 1px solid #f0f0f0;
}

.ant-table-tbody > tr:hover > td {
  background: #f5f5f5;
}

/* 地址样式 */
.address-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #595959;
}

.copy-icon {
  margin-left: 8px;
  cursor: pointer;
  font-size: 12px;
}

.copy-icon:hover {
  color: #11253E;
}

/* 脱敏账号样式 */
.masked-account {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #595959;
}

/* 操作按钮样式 */
.ant-btn-link {
  padding: 4px 8px;
  height: auto;
  border: none;
  box-shadow: none;
}

.ant-btn-link:hover {
  background: #f0f0f0;
  border-radius: 4px;
}

/* 表单样式 */
.form-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #262626;
  font-weight: 600;
  padding-bottom: 8px;
}

.payment-method-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.method-info strong {
  color: #262626;
  font-size: 14px;
}

.method-desc {
  color: #8c8c8c;
  font-size: 12px;
  margin: 4px 0;
}

.method-details {
  color: #8c8c8c;
  font-size: 12px;
}

/* 详情弹窗样式 */
.detail-content {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  margin-bottom: 20px;
  gap: 40px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  flex: 1;
}

.detail-item.full-width {
  flex: none;
  width: 100%;
}

.detail-label {
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 8px;
}

.detail-value {
  color: #262626;
  font-size: 12px;
  display: flex;
  align-items: center;
  word-break: break-all;
}

/* 通用样式 */
.ant-input-affix-wrapper .ant-input-prefix {
  color: #bfbfbf;
}

.ant-select-selection {
  border-radius: 6px;
}

.ant-btn {
  border-radius: 6px;
  font-weight: 400;
}

.ant-modal-header {
  border-bottom: 1px solid #f0f0f0;
}

.ant-modal-footer {
  border-top: 1px solid #f0f0f0;
}

.ant-form-item-label > label {
  color: #262626;
  font-weight: 500;
}

/* 标签样式 */
.ant-tag {
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .recipient-management {
    padding: 16px;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-filters {
    justify-content: flex-start;
  }

  .action-buttons {
    justify-content: flex-end;
  }

  .detail-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
