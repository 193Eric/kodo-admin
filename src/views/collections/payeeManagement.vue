<template>
  <div class="payee-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">Payee Management</h2>
    </div>

    <!-- Tab切换和内容区域 -->
    <div class="payee-content">
      <a-tabs v-model="activeTab" @change="handleTabChange">
        <!-- 数字货币收款人 -->
        <a-tab-pane key="digital" tab="Digital Currency Payee">
          <div class="tab-content">
            <!-- 搜索过滤区域 -->
            <div class="filter-section">
              <div class="filter-row">
                <div class="filter-item">
                  <a-input
                    v-model="digitalFilters.payeeName"
                    placeholder="Payee's Name"
                    style="width: 200px"
                  />
                </div>
                <div class="filter-item">
                  <div class="custom-select" @click="toggleNetworkDropdown">
                    <div class="select-content">
                      <span class="select-label">Network</span>
                      <span class="select-value">{{ digitalFilters.network || 'All' }}</span>
                    </div>
                    <a-icon type="down" class="select-arrow" />
                    <div v-if="networkDropdownVisible" class="select-dropdown">
                      <div class="dropdown-item" @click.stop="selectNetwork('')">All</div>
                      <div class="dropdown-item" @click.stop="selectNetwork('ERC-20')">ERC-20</div>
                      <div class="dropdown-item" @click.stop="selectNetwork('TRC-20')">TRC-20</div>
                      <div class="dropdown-item" @click.stop="selectNetwork('Bitcoin')">Bitcoin</div>
                    </div>
                  </div>
                </div>
                <div class="filter-item">
                  <div class="custom-select" @click="toggleCurrencyDropdown">
                    <div class="select-content">
                      <span class="select-label">Currency</span>
                      <span class="select-value">{{ digitalFilters.currency || 'All' }}</span>
                    </div>
                    <a-icon type="down" class="select-arrow" />
                    <div v-if="currencyDropdownVisible" class="select-dropdown">
                      <div class="dropdown-item" @click.stop="selectCurrency('')">All</div>
                      <div class="dropdown-item" @click.stop="selectCurrency('BTC')">BTC</div>
                      <div class="dropdown-item" @click.stop="selectCurrency('USDT')">USDT</div>
                      <div class="dropdown-item" @click.stop="selectCurrency('USDC')">USDC</div>
                    </div>
                  </div>
                </div>
                <div class="filter-actions">
                  <a-button type="primary" @click="searchDigitalPayees">Search</a-button>
                  <a-button @click="resetDigitalFilters">Reset</a-button>
                </div>
              </div>
              <div class="filter-row-right">
                <a-button type="primary" @click="showAddDigitalModal">
                  <a-icon type="plus" />
                  New Payee
                </a-button>
              </div>
            </div>

            <!-- 数字货币收款人表格 -->
            <div class="table-section">
              <a-table
                :dataSource="filteredDigitalPayees"
                :columns="digitalColumns"
                :pagination="digitalPagination"
                rowKey="id"
              >
                <template slot="network" slot-scope="networks">
                  <a-tag
                    v-for="network in networks"
                    :key="network"
                    :color="getNetworkColor(network)"
                  >
                    {{ network }}
                  </a-tag>
                </template>

                <template slot="currency" slot-scope="currencies">
                  {{ currencies.join(', ') }}
                </template>

                <template slot="address" slot-scope="address">
                  <span class="address-text">{{ address }}</span>
                  <a-button type="link" size="small" @click="copyAddress(address)">
                    <a-icon type="copy" />
                  </a-button>
                </template>

                <template slot="operations" slot-scope="text, record">
                  <div class="operation-buttons">
                    <a-button type="link" size="small" @click="viewDigitalDetails(record)">
                      <a-icon type="eye" />
                    </a-button>
                    <a-button type="link" size="small" @click="editDigitalPayee(record)">
                      <a-icon type="edit" />
                    </a-button>
                    <a-button type="link" size="small" @click="deleteDigitalPayee(record)">
                      <a-icon type="delete" />
                    </a-button>
                  </div>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>

        <!-- 法币收款人 -->
        <a-tab-pane key="fiat" tab="Fiat Currency Payee">
          <div class="tab-content">
            <!-- 搜索过滤区域 -->
            <div class="filter-section">
              <div class="filter-row">
                <div class="filter-item">
                  <a-input
                    v-model="fiatFilters.payeeName"
                    placeholder="Payee's Name"
                    style="width: 200px"
                  />
                </div>
                <div class="filter-item">
                  <div class="custom-select" @click="toggleFiatCurrencyDropdown">
                    <div class="select-content">
                      <span class="select-label">Currency</span>
                      <span class="select-value">{{ fiatFilters.currency || 'All' }}</span>
                    </div>
                    <a-icon type="down" class="select-arrow" />
                    <div v-if="fiatCurrencyDropdownVisible" class="select-dropdown">
                      <div class="dropdown-item" @click.stop="selectFiatCurrency('')">All</div>
                      <div class="dropdown-item" @click.stop="selectFiatCurrency('USD')">USD</div>
                      <div class="dropdown-item" @click.stop="selectFiatCurrency('EUR')">EUR</div>
                      <div class="dropdown-item" @click.stop="selectFiatCurrency('HKD')">HKD</div>
                    </div>
                  </div>
                </div>
                <div class="filter-item">
                  <div class="custom-select" @click="toggleAccountTypeDropdown">
                    <div class="select-content">
                      <span class="select-label">Account Type</span>
                      <span class="select-value">{{ fiatFilters.accountType || 'All' }}</span>
                    </div>
                    <a-icon type="down" class="select-arrow" />
                    <div v-if="accountTypeDropdownVisible" class="select-dropdown">
                      <div class="dropdown-item" @click.stop="selectAccountType('')">All</div>
                      <div class="dropdown-item" @click.stop="selectAccountType('Company')">Company</div>
                      <div class="dropdown-item" @click.stop="selectAccountType('Personal')">Personal</div>
                    </div>
                  </div>
                </div>
                <div class="filter-item">
                  <div class="custom-select" @click="toggleCountryDropdown">
                    <div class="select-content">
                      <span class="select-label">Country/Region</span>
                      <span class="select-value">{{ fiatFilters.country || 'All' }}</span>
                    </div>
                    <a-icon type="down" class="select-arrow" />
                    <div v-if="countryDropdownVisible" class="select-dropdown">
                      <div class="dropdown-item" @click.stop="selectCountry('')">All</div>
                      <div class="dropdown-item" @click.stop="selectCountry('America')">America</div>
                      <div class="dropdown-item" @click.stop="selectCountry('HongKong')">HongKong</div>
                    </div>
                  </div>
                </div>
                <div class="filter-actions">
                  <a-button type="primary" @click="searchFiatPayees">Search</a-button>
                  <a-button @click="resetFiatFilters">Reset</a-button>
                </div>
              </div>
              <div class="filter-row-right">
                <a-button type="primary" @click="showAddFiatModal">
                  <a-icon type="plus" />
                  New Payee
                </a-button>
              </div>
            </div>

            <!-- 法币收款人表格 -->
            <div class="table-section">
              <a-table
                :dataSource="filteredFiatPayees"
                :columns="fiatColumns"
                :pagination="fiatPagination"
                rowKey="id"
              >
                <template slot="countryRegion" slot-scope="country, record">
                  <div class="country-cell">
                    <span :class="`flag-icon flag-${country.toLowerCase()}`"></span>
                    {{ record.countryName }}
                  </div>
                </template>

                <template slot="operations" slot-scope="text, record">
                  <div class="operation-buttons">
                    <a-button type="link" size="small" @click="viewFiatDetails(record)">
                      <a-icon type="eye" />
                    </a-button>
                    <a-button type="link" size="small" @click="editFiatPayee(record)">
                      <a-icon type="edit" />
                    </a-button>
                    <a-button type="link" size="small" @click="deleteFiatPayee(record)">
                      <a-icon type="delete" />
                    </a-button>
                  </div>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 添加数字货币收款人弹窗 -->
    <a-modal
      v-model="digitalModalVisible"
      title="Add New Payee"
      width="600px"
      :footer="null"
      @cancel="closeDigitalModal"
    >
      <a-form :form="digitalForm" layout="vertical">
        <a-form-item label="Currency">
          <a-select
            v-decorator="['currency', { rules: [{ required: true, message: 'Please select currency' }] }]"
            placeholder="BTC, USDT"
            style="width: 100%"
          >
            <a-select-option value="BTC,USDT">BTC, USDT</a-select-option>
            <a-select-option value="USDC,USDT">USDC, USDT</a-select-option>
            <a-select-option value="BTC">BTC</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Payee's Name">
          <span class="form-description">The nickname is only visible to you and will not be sent to the recipient</span>
          <a-input
            v-decorator="['payeeName', { rules: [{ required: true, message: 'Please enter payee name' }] }]"
            placeholder="Enter payee name"
          />
        </a-form-item>

        <a-form-item label="Address">
          <a-textarea
            v-decorator="['address', { rules: [{ required: true, message: 'Please enter address' }] }]"
            placeholder="Enter wallet address"
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="Network">
          <a-select
            v-decorator="['network', { rules: [{ required: true, message: 'Please select network' }] }]"
            placeholder="Select network"
            style="width: 100%"
          >
            <a-select-option value="ERC-20">ERC-20</a-select-option>
            <a-select-option value="TRC-20">TRC-20</a-select-option>
            <a-select-option value="Bitcoin">Bitcoin</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <div class="modal-footer">
        <a-button @click="closeDigitalModal">Cancel</a-button>
        <a-button type="primary" @click="saveDigitalPayee">Save</a-button>
      </div>
    </a-modal>

    <!-- 添加法币收款人弹窗 -->
    <a-modal
      v-model="fiatModalVisible"
      title="Add New Payee"
      width="700px"
      :footer="null"
      @cancel="closeFiatModal"
    >
      <a-form :form="fiatForm" layout="vertical">
        <!-- Account Details -->
        <div class="form-section">
          <h3 class="section-title">Account Details</h3>

          <a-form-item label="Country/Region">
            <a-select
              v-decorator="['country', { rules: [{ required: true, message: 'Please select country' }] }]"
              placeholder="America"
              style="width: 100%"
            >
              <a-select-option value="America">🇺🇸 America</a-select-option>
              <a-select-option value="HongKong">🇭🇰 HongKong</a-select-option>
              <a-select-option value="UK">🇬🇧 United Kingdom</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Currency">
            <a-select
              v-decorator="['currency', { rules: [{ required: true, message: 'Please select currency' }] }]"
              placeholder="USD"
              style="width: 100%"
            >
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="HKD">HKD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Recipient Account Type">
            <a-radio-group
              v-decorator="['accountType', { rules: [{ required: true, message: 'Please select account type' }] }]"
            >
              <a-radio value="Company">Company</a-radio>
              <a-radio value="Personal">Personal</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="Payment Method">
            <div class="payment-method-section">
              <div class="payment-method-item">
                <a-icon type="bank" />
                <span class="payment-method-name">RTGS</span>
                <a-button type="link" size="small">Change</a-button>
              </div>
              <div class="payment-method-description">
                Real-time Local Bank Payment Methods<br>
                Fee: 700 USD | Timescale: 0-1 business day
              </div>
            </div>
          </a-form-item>

          <a-form-item label="SWIFT Code">
            <a-input
              v-decorator="['swiftCode', { rules: [{ required: true, message: 'Please enter SWIFT code' }] }]"
              placeholder="Search for SWIFT code or bank name"
            />
          </a-form-item>

          <a-form-item label="Account No.">
            <span class="form-description">A maximum of 17 digits, with the first 3 digits being the branch code</span>
            <a-input
              v-decorator="['accountNo', { rules: [{ required: true, message: 'Please enter account number' }] }]"
              placeholder="Enter account number"
            />
          </a-form-item>

          <a-form-item label="User Name">
            <span class="form-description">Enter the account name of the payee at the bank</span>
            <a-input
              v-decorator="['userName', { rules: [{ required: true, message: 'Please enter user name' }] }]"
              placeholder="Enter user name"
            />
          </a-form-item>
        </div>

        <!-- Payee's Details -->
        <div class="form-section">
          <h3 class="section-title">Payee's Details</h3>

          <a-form-item label="Payee's Name">
            <span class="form-description">The nickname is only visible to you and will not be sent to the recipient</span>
            <a-input
              v-decorator="['payeeName', { rules: [{ required: true, message: 'Please enter payee name' }] }]"
              placeholder="Enter payee name"
            />
          </a-form-item>

          <a-form-item label="Email Account">
            <a-input
              v-decorator="['email']"
              placeholder="Enter email address"
              type="email"
            />
          </a-form-item>

          <a-form-item label="Address">
            <span class="form-description">Recipient address (PO or GPO Box type addresses are not supported)</span>
            <a-textarea
              v-decorator="['address']"
              placeholder="Enter address"
              :rows="3"
            />
          </a-form-item>
        </div>
      </a-form>

      <div class="modal-footer">
        <a-button @click="closeFiatModal">Cancel</a-button>
        <a-button type="primary" @click="saveFiatPayee">Save</a-button>
      </div>
    </a-modal>

    <!-- 编辑数字货币收款人弹窗 -->
    <a-modal
      v-model="digitalEditModalVisible"
      title="Edit Payee"
      width="600px"
      :footer="null"
      @cancel="closeDigitalEditModal"
    >
      <a-form :form="digitalEditForm" layout="vertical">
        <a-form-item label="Currency">
          <a-select
            v-decorator="['currency', { rules: [{ required: true, message: 'Please select currency' }] }]"
            placeholder="BTC, USDT"
            style="width: 100%"
          >
            <a-select-option value="BTC,USDT">BTC, USDT</a-select-option>
            <a-select-option value="USDC,USDT">USDC, USDT</a-select-option>
            <a-select-option value="BTC">BTC</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Payee's Name">
          <span class="form-description">The nickname is only visible to you and will not be sent to the recipient</span>
          <a-input
            v-decorator="['payeeName', { rules: [{ required: true, message: 'Please enter payee name' }] }]"
            placeholder="Enter payee name"
          />
        </a-form-item>

        <a-form-item label="Address">
          <a-textarea
            v-decorator="['address', { rules: [{ required: true, message: 'Please enter address' }] }]"
            placeholder="Enter wallet address"
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="Network">
          <a-select
            v-decorator="['network', { rules: [{ required: true, message: 'Please select network' }] }]"
            placeholder="Select network"
            style="width: 100%"
          >
            <a-select-option value="ERC-20">ERC-20</a-select-option>
            <a-select-option value="TRC-20">TRC-20</a-select-option>
            <a-select-option value="Bitcoin">Bitcoin</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <div class="modal-footer">
        <a-button @click="closeDigitalEditModal">Cancel</a-button>
        <a-button type="primary" @click="updateDigitalPayee">Save</a-button>
      </div>
    </a-modal>

    <!-- 编辑法币收款人弹窗 -->
    <a-modal
      v-model="fiatEditModalVisible"
      title="Edit Payee"
      width="700px"
      :footer="null"
      @cancel="closeFiatEditModal"
    >
      <a-form :form="fiatEditForm" layout="vertical">
        <!-- Account Details -->
        <div class="form-section">
          <h3 class="section-title">Account Details</h3>

          <a-form-item label="Country/Region">
            <a-select
              v-decorator="['country', { rules: [{ required: true, message: 'Please select country' }] }]"
              placeholder="America"
              style="width: 100%"
            >
              <a-select-option value="America">🇺🇸 America</a-select-option>
              <a-select-option value="HongKong">🇭🇰 HongKong</a-select-option>
              <a-select-option value="UK">🇬🇧 United Kingdom</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Currency">
            <a-select
              v-decorator="['currency', { rules: [{ required: true, message: 'Please select currency' }] }]"
              placeholder="USD"
              style="width: 100%"
            >
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="HKD">HKD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Recipient Account Type">
            <a-radio-group
              v-decorator="['accountType', { rules: [{ required: true, message: 'Please select account type' }] }]"
            >
              <a-radio value="Company">Company</a-radio>
              <a-radio value="Personal">Personal</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="SWIFT Code">
            <a-input
              v-decorator="['swiftCode', { rules: [{ required: true, message: 'Please enter SWIFT code' }] }]"
              placeholder="Search for SWIFT code or bank name"
            />
          </a-form-item>

          <a-form-item label="Account No.">
            <span class="form-description">A maximum of 17 digits, with the first 3 digits being the branch code</span>
            <a-input
              v-decorator="['accountNo', { rules: [{ required: true, message: 'Please enter account number' }] }]"
              placeholder="Enter account number"
            />
          </a-form-item>

          <a-form-item label="User Name">
            <span class="form-description">Enter the account name of the payee at the bank</span>
            <a-input
              v-decorator="['userName', { rules: [{ required: true, message: 'Please enter user name' }] }]"
              placeholder="Enter user name"
            />
          </a-form-item>
        </div>

        <!-- Payee's Details -->
        <div class="form-section">
          <h3 class="section-title">Payee's Details</h3>

          <a-form-item label="Payee's Name">
            <span class="form-description">The nickname is only visible to you and will not be sent to the recipient</span>
            <a-input
              v-decorator="['payeeName', { rules: [{ required: true, message: 'Please enter payee name' }] }]"
              placeholder="Enter payee name"
            />
          </a-form-item>

          <a-form-item label="Email Account">
            <a-input
              v-decorator="['email']"
              placeholder="Enter email address"
              type="email"
            />
          </a-form-item>

          <a-form-item label="Address">
            <span class="form-description">Recipient address (PO or GPO Box type addresses are not supported)</span>
            <a-textarea
              v-decorator="['address']"
              placeholder="Enter address"
              :rows="3"
            />
          </a-form-item>
        </div>
      </a-form>

      <div class="modal-footer">
        <a-button @click="closeFiatEditModal">Cancel</a-button>
        <a-button type="primary" @click="updateFiatPayee">Save</a-button>
      </div>
    </a-modal>
    <a-modal
      v-model="digitalDetailVisible"
      title="Details"
      width="600px"
      :footer="null"
      @cancel="closeDigitalDetail"
    >
      <div v-if="selectedDigitalPayee" class="detail-content">
        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">Recipient Name</span>
            <span class="detail-value">{{ selectedDigitalPayee.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Currency</span>
            <span class="detail-value">{{ selectedDigitalPayee.currency.join(', ') }}</span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-item">
            <span class="detail-label">Network</span>
            <span class="detail-value">{{ selectedDigitalPayee.network.join(', ') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Address</span>
            <div class="address-detail">
              <span class="detail-value">{{ selectedDigitalPayee.address }}</span>
              <a-button type="link" size="small" @click="copyAddress(selectedDigitalPayee.address)">
                <a-icon type="copy" />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 法币详情弹窗 -->
    <a-modal
      v-model="fiatDetailVisible"
      title="Details"
      width="700px"
      :footer="null"
      @cancel="closeFiatDetail"
    >
      <div v-if="selectedFiatPayee" class="detail-content">
        <!-- Account Details -->
        <div class="detail-section">
          <h3 class="section-title">Account Details</h3>

          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label">Country/Region</span>
              <span class="detail-value">
                <span :class="`flag-icon flag-${selectedFiatPayee.country.toLowerCase()}`"></span>
                {{ selectedFiatPayee.countryName }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Currency</span>
              <span class="detail-value">{{ selectedFiatPayee.currency }}</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label">Recipient Account Type</span>
              <span class="detail-value">{{ selectedFiatPayee.accountType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment Method</span>
              <span class="detail-value">{{ selectedFiatPayee.paymentMethod }}</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label">SWIFT Code</span>
              <span class="detail-value">{{ selectedFiatPayee.swiftCode }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Account No.</span>
              <span class="detail-value">{{ selectedFiatPayee.accountNo }}</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item full-width">
              <span class="detail-label">User Name</span>
              <span class="detail-value">{{ selectedFiatPayee.userName }}</span>
            </div>
          </div>
        </div>

        <!-- Payee Details -->
        <div class="detail-section">
          <h3 class="section-title">Payee Details</h3>

          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label">Payee's Name</span>
              <span class="detail-value">{{ selectedFiatPayee.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email Account</span>
              <span class="detail-value">{{ selectedFiatPayee.email }}</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item full-width">
              <span class="detail-label">Address</span>
              <span class="detail-value">{{ selectedFiatPayee.address }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'PayeeManagement',
  data () {
    return {
      activeTab: 'digital',

      // 下拉框状态控制
      networkDropdownVisible: false,
      currencyDropdownVisible: false,
      fiatCurrencyDropdownVisible: false,
      accountTypeDropdownVisible: false,
      countryDropdownVisible: false,

      // 数字货币相关数据
      digitalModalVisible: false,
      digitalDetailVisible: false,
      digitalEditModalVisible: false,
      digitalForm: this.$form.createForm(this),
      digitalEditForm: this.$form.createForm(this),
      selectedDigitalPayee: null,
      editingDigitalPayee: null,
      digitalFilters: {
        payeeName: '',
        network: '',
        currency: ''
      },
      digitalPagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },

      // 法币相关数据
      fiatModalVisible: false,
      fiatDetailVisible: false,
      fiatEditModalVisible: false,
      fiatForm: this.$form.createForm(this),
      fiatEditForm: this.$form.createForm(this),
      selectedFiatPayee: null,
      editingFiatPayee: null,
      fiatFilters: {
        payeeName: '',
        currency: '',
        accountType: '',
        country: ''
      },
      fiatPagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },

      // 数字货币收款人数据
      digitalPayees: [
        {
          id: 1,
          name: 'Digital Solutions Inc',
          address: 'TPRgvk...JoCSck',
          network: ['ERC-20', 'TRC-20'],
          currency: ['BTC', 'USDT']
        },
        {
          id: 2,
          name: 'CryptoVendor Ltd',
          address: 'TPRgvk...JoCSck',
          network: ['ERC-20', 'TRC-20'],
          currency: ['USDC', 'USDT']
        },
        {
          id: 3,
          name: 'BlockChain Merchants',
          address: 'TPRgvk...JoCSck',
          network: ['Bitcoin', 'TRC-20'],
          currency: ['BTC', 'USDT']
        }
      ],

      // 法币收款人数据
      fiatPayees: [
        {
          id: 1,
          name: 'Global Trade Partners',
          accountType: 'Company',
          receivingAccount: '**** **** **** 2261',
          country: 'america',
          countryName: 'America',
          currency: 'USD',
          paymentMethod: 'RTGS',
          swiftCode: 'BARCGB22829',
          accountNo: '4320 2931 1023 2261',
          userName: 'Brooklyn Simmons',
          email: 'tranthuy.nute@gmail.com',
          address: '2118 Thornridge Cir. Syracuse, Connecticut 35624'
        },
        {
          id: 2,
          name: 'CryptoVendor Ltd',
          accountType: 'Personal',
          receivingAccount: '**** **** **** 2762',
          country: 'america',
          countryName: 'America',
          currency: 'USD',
          paymentMethod: 'RTGS',
          swiftCode: 'BARCGB22829',
          accountNo: '4320 2931 1023 2762',
          userName: 'John Smith',
          email: 'john.smith@gmail.com',
          address: '1234 Main St, New York, NY 10001'
        },
        {
          id: 3,
          name: 'CryptoVendor Ltd',
          accountType: 'Company',
          receivingAccount: '**** **** **** 2762',
          country: 'hongkong',
          countryName: 'HongKong',
          currency: 'USD',
          paymentMethod: 'RTGS',
          swiftCode: 'HKBCGB22829',
          accountNo: '4320 2931 1023 2762',
          userName: 'David Wong',
          email: 'david.wong@gmail.com',
          address: '123 Central Road, Hong Kong'
        }
      ],

      // 表格列定义
      digitalColumns: [
        {
          title: "Payee's Name",
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
          scopedSlots: { customRender: 'address' }
        },
        {
          title: 'Network',
          dataIndex: 'network',
          key: 'network',
          scopedSlots: { customRender: 'network' }
        },
        {
          title: 'Currency',
          dataIndex: 'currency',
          key: 'currency',
          scopedSlots: { customRender: 'currency' }
        },
        {
          title: 'Operations',
          key: 'operations',
          scopedSlots: { customRender: 'operations' }
        }
      ],

      fiatColumns: [
        {
          title: "Payee's Name",
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: 'Account Type',
          dataIndex: 'accountType',
          key: 'accountType'
        },
        {
          title: 'Receiving Account',
          dataIndex: 'receivingAccount',
          key: 'receivingAccount'
        },
        {
          title: 'Country/Region',
          dataIndex: 'country',
          key: 'country',
          scopedSlots: { customRender: 'countryRegion' }
        },
        {
          title: 'Currency',
          dataIndex: 'currency',
          key: 'currency'
        },
        {
          title: 'Operation',
          key: 'operations',
          scopedSlots: { customRender: 'operations' }
        }
      ]
    }
  },

  computed: {
    filteredDigitalPayees () {
      return this.digitalPayees.filter(payee => {
        const nameMatch = !this.digitalFilters.payeeName ||
          payee.name.toLowerCase().includes(this.digitalFilters.payeeName.toLowerCase())
        const networkMatch = !this.digitalFilters.network ||
          payee.network.includes(this.digitalFilters.network)
        const currencyMatch = !this.digitalFilters.currency ||
          payee.currency.includes(this.digitalFilters.currency)

        return nameMatch && networkMatch && currencyMatch
      })
    },

    filteredFiatPayees () {
      return this.fiatPayees.filter(payee => {
        const nameMatch = !this.fiatFilters.payeeName ||
          payee.name.toLowerCase().includes(this.fiatFilters.payeeName.toLowerCase())
        const currencyMatch = !this.fiatFilters.currency ||
          payee.currency === this.fiatFilters.currency
        const accountTypeMatch = !this.fiatFilters.accountType ||
          payee.accountType === this.fiatFilters.accountType
        const countryMatch = !this.fiatFilters.country ||
          payee.countryName === this.fiatFilters.country

        return nameMatch && currencyMatch && accountTypeMatch && countryMatch
      })
    }
  },

  mounted () {
    // 点击外部关闭下拉框
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    handleClickOutside (event) {
      if (!event.target.closest('.custom-select')) {
        this.closeAllDropdowns()
      }
    },
    handleTabChange (key) {
      this.activeTab = key
    },

    // 数字货币相关方法
    showAddDigitalModal () {
      this.digitalModalVisible = true
    },

    closeDigitalModal () {
      this.digitalModalVisible = false
      this.digitalForm.resetFields()
    },

    saveDigitalPayee () {
      this.digitalForm.validateFields((err, values) => {
        if (!err) {
          console.log('Digital payee data:', values)
          this.$message.success('Digital payee added successfully')
          this.closeDigitalModal()
        }
      })
    },

    viewDigitalDetails (record) {
      this.selectedDigitalPayee = record
      this.digitalDetailVisible = true
    },

    closeDigitalDetail () {
      this.digitalDetailVisible = false
      this.selectedDigitalPayee = null
    },

    editDigitalPayee (record) {
      this.editingDigitalPayee = { ...record }
      this.digitalEditModalVisible = true
      this.$nextTick(() => {
        this.digitalEditForm.setFieldsValue({
          currency: record.currency.join(','),
          payeeName: record.name,
          address: record.address,
          network: record.network[0] // 假设只取第一个网络
        })
      })
    },

    closeDigitalEditModal () {
      this.digitalEditModalVisible = false
      this.digitalEditForm.resetFields()
      this.editingDigitalPayee = null
    },

    updateDigitalPayee () {
      this.digitalEditForm.validateFields((err, values) => {
        if (!err) {
          console.log('Update digital payee data:', values)
          // 这里可以调用API更新数据
          const index = this.digitalPayees.findIndex(p => p.id === this.editingDigitalPayee.id)
          if (index !== -1) {
            this.digitalPayees[index] = {
              ...this.editingDigitalPayee,
              name: values.payeeName,
              address: values.address,
              currency: values.currency.split(','),
              network: [values.network]
            }
          }
          this.$message.success('Digital payee updated successfully')
          this.closeDigitalEditModal()
        }
      })
    },

    deleteDigitalPayee (record) {
      this.$confirm({
        title: 'Delete Payee',
        content: `Are you sure you want to delete ${record.name}?`,
        onOk: () => {
          this.$message.success('Payee deleted successfully')
        }
      })
    },

    searchDigitalPayees () {
      this.$message.info('Searching digital payees...')
    },

    resetDigitalFilters () {
      this.digitalFilters = {
        payeeName: '',
        network: '',
        currency: ''
      }
      this.closeAllDropdowns()
    },

    // 法币相关方法
    showAddFiatModal () {
      this.fiatModalVisible = true
    },

    closeFiatModal () {
      this.fiatModalVisible = false
      this.fiatForm.resetFields()
    },

    saveFiatPayee () {
      this.fiatForm.validateFields((err, values) => {
        if (!err) {
          console.log('Fiat payee data:', values)
          this.$message.success('Fiat payee added successfully')
          this.closeFiatModal()
        }
      })
    },

    viewFiatDetails (record) {
      this.selectedFiatPayee = record
      this.fiatDetailVisible = true
    },

    closeFiatDetail () {
      this.fiatDetailVisible = false
      this.selectedFiatPayee = null
    },

    editFiatPayee (record) {
      this.editingFiatPayee = { ...record }
      this.fiatEditModalVisible = true
      this.$nextTick(() => {
        this.fiatEditForm.setFieldsValue({
          country: record.countryName,
          currency: record.currency,
          accountType: record.accountType,
          swiftCode: record.swiftCode,
          accountNo: record.accountNo,
          userName: record.userName,
          payeeName: record.name,
          email: record.email,
          address: record.address
        })
      })
    },

    closeFiatEditModal () {
      this.fiatEditModalVisible = false
      this.fiatEditForm.resetFields()
      this.editingFiatPayee = null
    },

    updateFiatPayee () {
      this.fiatEditForm.validateFields((err, values) => {
        if (!err) {
          console.log('Update fiat payee data:', values)
          // 这里可以调用API更新数据
          const index = this.fiatPayees.findIndex(p => p.id === this.editingFiatPayee.id)
          if (index !== -1) {
            this.fiatPayees[index] = {
              ...this.editingFiatPayee,
              name: values.payeeName,
              countryName: values.country,
              currency: values.currency,
              accountType: values.accountType,
              swiftCode: values.swiftCode,
              accountNo: values.accountNo,
              userName: values.userName,
              email: values.email,
              address: values.address
            }
          }
          this.$message.success('Fiat payee updated successfully')
          this.closeFiatEditModal()
        }
      })
    },

    deleteFiatPayee (record) {
      this.$confirm({
        title: 'Delete Payee',
        content: `Are you sure you want to delete ${record.name}?`,
        onOk: () => {
          this.$message.success('Payee deleted successfully')
        }
      })
    },

    searchFiatPayees () {
      this.$message.info('Searching fiat payees...')
    },

    resetFiatFilters () {
      this.fiatFilters = {
        payeeName: '',
        currency: '',
        accountType: '',
        country: ''
      }
      this.closeAllDropdowns()
    },

    // 自定义下拉框方法
    toggleNetworkDropdown () {
      this.networkDropdownVisible = !this.networkDropdownVisible
      this.currencyDropdownVisible = false
      this.fiatCurrencyDropdownVisible = false
      this.accountTypeDropdownVisible = false
      this.countryDropdownVisible = false
    },

    toggleCurrencyDropdown () {
      this.currencyDropdownVisible = !this.currencyDropdownVisible
      this.networkDropdownVisible = false
      this.fiatCurrencyDropdownVisible = false
      this.accountTypeDropdownVisible = false
      this.countryDropdownVisible = false
    },

    toggleFiatCurrencyDropdown () {
      this.fiatCurrencyDropdownVisible = !this.fiatCurrencyDropdownVisible
      this.networkDropdownVisible = false
      this.currencyDropdownVisible = false
      this.accountTypeDropdownVisible = false
      this.countryDropdownVisible = false
    },

    toggleAccountTypeDropdown () {
      this.accountTypeDropdownVisible = !this.accountTypeDropdownVisible
      this.networkDropdownVisible = false
      this.currencyDropdownVisible = false
      this.fiatCurrencyDropdownVisible = false
      this.countryDropdownVisible = false
    },

    toggleCountryDropdown () {
      this.countryDropdownVisible = !this.countryDropdownVisible
      this.networkDropdownVisible = false
      this.currencyDropdownVisible = false
      this.fiatCurrencyDropdownVisible = false
      this.accountTypeDropdownVisible = false
    },

    selectNetwork (value) {
      this.digitalFilters.network = value
      this.networkDropdownVisible = false
    },

    selectCurrency (value) {
      this.digitalFilters.currency = value
      this.currencyDropdownVisible = false
    },

    selectFiatCurrency (value) {
      this.fiatFilters.currency = value
      this.fiatCurrencyDropdownVisible = false
    },

    selectAccountType (value) {
      this.fiatFilters.accountType = value
      this.accountTypeDropdownVisible = false
    },

    selectCountry (value) {
      this.fiatFilters.country = value
      this.countryDropdownVisible = false
    },

    closeAllDropdowns () {
      this.networkDropdownVisible = false
      this.currencyDropdownVisible = false
      this.fiatCurrencyDropdownVisible = false
      this.accountTypeDropdownVisible = false
      this.countryDropdownVisible = false
    },
    getNetworkColor (network) {
      const colors = {
        'ERC-20': 'blue',
        'TRC-20': 'green',
        'Bitcoin': 'orange'
      }
      return colors[network] || 'default'
    },

    copyAddress (address) {
      navigator.clipboard.writeText(address).then(() => {
        this.$message.success('Address copied to clipboard')
      }).catch(() => {
        this.$message.error('Failed to copy address')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.payee-management-container {
  padding: 24px;
  background: #fff;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }
  }

  .payee-content {
    /deep/ .ant-tabs-tab {
      font-size: 16px;
      font-weight: 500;

      &.ant-tabs-tab-active {

      }
    }

    /deep/ .ant-tabs-ink-bar {

    }
  }

  .tab-content {
    .filter-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;

      .filter-row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .filter-label {
            color: #8c8c8c;
            font-size: 14px;
            white-space: nowrap;
          }

          // 自定义下拉框样式
          .custom-select {
            position: relative;
            width: 150px;
            height: 32px;
            border: 1px solid #d9d9d9;
            border-radius: 16px;
            background: #fff;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #40a9ff;
            }

            .select-content {
              display: flex;
              align-items: center;
              height: 100%;
              padding: 0 12px;

              .select-label {
                color: #8c8c8c;
                font-size: 12px;
                margin-right: 8px;
                white-space: nowrap;
              }

              .select-value {
                flex: 1;
                color: #262626;
                font-size: 12px;
                margin-right: 20px;
                text-align: right;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .select-arrow {
              position: absolute;
              right: 12px;
              top: 50%;
              transform: translateY(-50%);
              color: #8c8c8c;
              font-size: 12px;
              transition: transform 0.3s;
            }

            .select-dropdown {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: #fff;
              border: 1px solid #d9d9d9;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              z-index: 1000;
              margin-top: 4px;

              .dropdown-item {
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                color: #262626;
                transition: background-color 0.3s;

                &:hover {
                  background-color: #f5f5f5;
                }

                &:first-child {
                  border-radius: 6px 6px 0 0;
                }

                &:last-child {
                  border-radius: 0 0 6px 6px;
                }
              }
            }
          }
        }

        .filter-actions {
          display: flex;
          gap: 8px;
        }
      }

      .filter-row-right {
        flex-shrink: 0;
      }
    }

    .table-section {
      .address-text {
        font-family: monospace;
        font-size: 13px;
      }

      .operation-buttons {
        display: flex;
        gap: 8px;

        .ant-btn-link {
          padding: 4px;
          color: #8c8c8c;

          &:hover {

          }
        }
      }

      .country-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .flag-icon {
          width: 20px;
          height: 14px;
          display: inline-block;
          border-radius: 2px;

          &.flag-america {
            background: linear-gradient(to bottom, #FF0000 0%, #FF0000 50%, #FFFFFF 50%, #FFFFFF 100%);
          }

          &.flag-hongkong {
            background: #DE2910;
          }
        }
      }
    }
  }
}

// 弹窗样式
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.form-section {
  margin-bottom: 32px;

  .section-title {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
  }
}

.form-description {
  display: block;
  margin-bottom: 8px;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 1.4;
}

.payment-method-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;

  .payment-method-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .ant-icon {

      font-size: 16px;
    }

    .payment-method-name {
      font-weight: 600;
      color: #262626;
    }
  }

  .payment-method-description {
    color: #8c8c8c;
    font-size: 13px;
    line-height: 1.4;
  }
}

// 详情弹窗样式
.detail-content {
  .detail-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
  }

  .detail-row {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .detail-item {
    flex: 1;

    &.full-width {
      flex: none;
      width: 100%;
    }

    .detail-label {
      display: block;
      margin-bottom: 6px;
      color: #8c8c8c;
      font-size: 14px;
    }

    .detail-value {
      display: block;
      color: #262626;
      font-weight: 500;
      word-break: break-all;
    }

    .address-detail {
      display: flex;
      align-items: center;
      gap: 8px;

      .detail-value {
        font-family: monospace;
        font-size: 13px;
      }
    }
  }
}

// 响应式样式
@media (max-width: 768px) {
  .payee-management-container {
    padding: 16px;
  }

  .filter-section {
    flex-direction: column;
    gap: 16px;

    .filter-row {
      flex-direction: column;
      align-items: flex-start;

      .filter-item {
        width: 100%;

        .ant-input {
          width: 100% !important;
        }

        .custom-select {
          width: 100% !important;
        }
      }
    }
  }

  .detail-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
