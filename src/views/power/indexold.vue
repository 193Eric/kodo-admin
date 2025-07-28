<template>
  <div>
    <div v-show="$route.name === 'Power'">
      <div class="history-page">
        <div style="background: #fff; border-radius: 8px; padding: 20px 30px; box-sizing: border-box;">
          <!-- Tab栏 -->
          <div class="tab-wrapper">
            <a-tabs v-model:activeKey="activeTab">
              <a-tab-pane :tab="$t('用户列表')" key="receive" />
              <a-tab-pane :tab="$t('角色配置')" key="withdraw" />
            </a-tabs>
          </div>

          <!-- 搜索区域 -->
          <div class="search-wrapper" v-if="activeTab === 'receive'">
            <!-- 搜索用户账号 -->
            <div class="custom-input-wrapper">
              <a-input
                v-model:value="searchForm.address"
                :placeholder="$t('搜索用户账号')"
                class="search-input-with-icon"
              >
                <template #prefix>
                  <!-- <SearchOutlined /> -->
                </template>
              </a-input>
            </div>

            <!-- 新建用户按钮 -->
            <a-button type="primary" class="download-btn" @click="userShow">
              {{ $t('新建用户') }}
            </a-button>
          </div>

          <div class="search-wrapper2" v-if="activeTab === 'withdraw'">
            <!-- 新建角色 -->
            <a-button type="primary" class="download-btn">
              {{ $t('新建角色') }}
            </a-button>
          </div>

          <!-- 用户列表表格 -->
          <a-table
            v-if="activeTab === 'receive'"
            :dataSource="tableData"
            :columns="userColumns"
            :pagination="false"
            :scroll="{ x: 'max-content' }"
            :locale="{ emptyText: $t('暂无数据') }"
            class="custom-table"
          >
            <template #bodyCell="{ column, record, index }">
              <!-- 用户ID -->
              <template v-if="column.key === 'transactionId'">
                <div class="transaction-id-wrapper">
                  <span
                    v-clipboard:copy="record.transactionId"
                    v-clipboard:success="() => $message.success('复制成功')"
                    style="cursor: pointer;"
                  >
                    {{ record.transactionId }}
                  </span>
                </div>
              </template>

              <!-- 状态 -->
              <template v-if="column.key === 'status'">
                <div class="status-wrapper">
                  <span>{{ $t(record.status) }}</span>
                </div>
              </template>

              <!-- 操作 -->
              <template v-if="column.key === 'operation'">
                <div class="operation-buttons">
                  <a @click="showModal()" style="color: #52C794; margin-right: 16px;">
                    {{ $t('查看详情') }}
                  </a>
                  <a style="color: #1F68BC; margin-right: 16px;">
                    {{ $t('角色分配') }}
                  </a>
                  <a @click="writeE" style="color: #1F68BC; margin-right: 16px;">
                    {{ $t('编辑') }}
                  </a>
                  <a @click="DeleteVisible = true" style="color: #FF6D00;">
                    {{ $t('删除') }}
                  </a>
                </div>
              </template>
            </template>
          </a-table>

          <!-- 角色配置表格 -->
          <a-table
            v-if="activeTab === 'withdraw'"
            :dataSource="tableData"
            :columns="roleColumns"
            :pagination="false"
            :scroll="{ x: 'max-content' }"
            :locale="{ emptyText: $t('暂无数据') }"
            class="custom-table"
          >
            <template #bodyCell="{ column, record, index }">
              <!-- 角色名 -->
              <template v-if="column.key === 'roleName'">
                <div class="transaction-id-wrapper">
                  <span
                    v-clipboard:copy="record.transactionId"
                    v-clipboard:success="() => $message.success('复制成功')"
                    style="cursor: pointer;"
                  >
                    {{ record.transactionId }}
                  </span>
                </div>
              </template>

              <!-- 状态 -->
              <template v-if="column.key === 'status'">
                <div class="status-wrapper">
                  <div class="dot"></div>
                  <span>{{ record.status }}</span>
                </div>
              </template>

              <!-- 操作 -->
              <template v-if="column.key === 'operation'">
                <div class="operation-buttons">
                  <a @click="openEdit" style="color: #1F68BC; margin-right: 16px;">
                    {{ $t('编辑权限') }}
                  </a>
                  <a @click="AletDelete" style="color: #FF6D00;">
                    {{ $t('删除') }}
                  </a>
                </div>
              </template>
            </template>
          </a-table>

          <!-- 弹窗--查看详情 -->
          <a-modal
            v-model:visible="modalVisible"
            :title="$t('查看详情')"
            :footer="null"
            width="30%"
            @cancel="handleClose"
          >
            <a-divider style="margin: 16px 0;" />
            <div class="big_con">
              <div class="fie_con">
                <div class="dia_fir">
                  <span class="dia_left">{{ $t('登录邮箱：') }}</span>
                  <span>7432343878@gmail.com</span>
                </div>
                <div class="dia_fir">
                  <span class="dia_left">{{ $t('状态：') }}</span>
                  <span>{{ $t('正常') }}</span>
                </div>
              </div>

              <div class="se_con">
                <div class="se_1_co">
                  <div class="se_1_1">{{ $t('角色名称') }}</div>
                  <div class="se_1_2">{{ $t('备注') }}</div>
                </div>
                <div class="se_2_co">
                  <div class="se_2_1">{{ $t('管理员') }}</div>
                  <div class="se_2_2">{{ $t('新平台管理员') }}</div>
                </div>
              </div>

              <div class="dialog-container">
                <div class="dialog-footer">
                  <a-button @click="modalVisible = false" class="dia_bto">
                    {{ $t('取 消') }}
                  </a-button>
                </div>
              </div>
            </div>
          </a-modal>

          <!-- 弹窗--编辑角色权限 -->
          <a-modal
            v-model:visible="EditVisible"
            :title="$t('编辑角色权限')"
            :footer="null"
            width="30%"
            @cancel="handleClose"
          >
            <a-divider style="margin: 16px 0;" />
            <div class="tab-wrapper1">
              <div class="E_co">
                <a-tabs v-model:activeKey="activeTab_new">
                  <a-tab-pane :tab="$t('角色信息')" key="jiaoMe" />
                  <a-tab-pane :tab="$t('权限配置')" key="pow" />
                </a-tabs>

                <div class="search-wrapper1" v-if="activeTab_new === 'jiaoMe'">
                  <div class="co_co">
                    <div class="form-item-label">{{ $t('角色名称') }}</div>
                    <a-input v-model:value="formLo.username" :placeholder="$t('用户备注')" />
                  </div>
                  <div class="co_co">
                    <div class="form-item-label">{{ $t('角色备注') }}</div>
                    <a-input v-model:value="formLo.username" size="large" />
                  </div>
                  <div class="co_co">
                    <div class="form-item-label">{{ $t('角色状态') }}</div>
                    <a-select
                      v-model:value="selectedStatus"
                      :placeholder="$t('请选择状态')"
                      allow-clear
                      style="width: 100%;"
                      @change="handleStatusChange"
                    >
                      <a-select-option
                        v-for="status in statuses"
                        :key="status.value"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </a-select-option>
                    </a-select>
                  </div>
                </div>

                <div class="search-wrapper1" v-if="activeTab_new === 'pow'">
                  <table id="myTable">
                    <thead>
                      <tr>
                        <th>{{ $t('模块') }}</th>
                        <th>{{ $t('功能') }}</th>
                        <th>{{ $t('操作') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <a-checkbox>{{ $t('安全') }}</a-checkbox><br>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('KYB提交') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('支付密码设置') }}</a-checkbox>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('设置') }}</a-checkbox>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a-checkbox>{{ $t('数币承兑') }}</a-checkbox><br>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('银行账户') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('数币承兑') }}</a-checkbox>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('创建') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('解绑') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                        </td>
                      </tr>
                      <tr>
                        <td>{{ $t('数币收款') }}</td>
                        <td>
                          <a-checkbox>{{ $t('数币收款') }}</a-checkbox><br>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                          <a-checkbox>{{ $t('收款列表') }}</a-checkbox><br>
                        </td>
                      </tr>
                      <tr>
                        <td>{{ $t('数币付款') }}</td>
                        <td>
                          <a-checkbox>{{ $t('数币付款') }}</a-checkbox><br>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                          <a-checkbox>{{ $t('付款列表') }}</a-checkbox><br>
                        </td>
                      </tr>
                      <tr>
                        <td>{{ $t('法币承兑') }}</td>
                        <td>
                          <a-checkbox>{{ $t('法币承兑') }}</a-checkbox><br>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                        </td>
                      </tr>
                      <tr>
                        <td>{{ $t('数据') }}</td>
                        <td>
                          <a-checkbox>{{ $t('交易记录-收款') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('交易记录-付款') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('交易记录-数币承兑') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('交易记录-法币承兑') }}</a-checkbox><br>
                        </td>
                        <td>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                          <a-checkbox>{{ $t('导出') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                          <a-checkbox>{{ $t('导出') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                          <a-checkbox>{{ $t('导出') }}</a-checkbox><br>
                          <a-checkbox>{{ $t('提交') }}</a-checkbox>
                          <a-checkbox>{{ $t('导出') }}</a-checkbox><br>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="dialog-container">
                  <div class="dialog-footer">
                    <a-button type="primary" class="dia_bto1">
                      {{ $t('保存') }}
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-modal>

          <!-- 弹窗--编辑-->
          <a-modal
            v-model:visible="writeEVisible"
            :title="$t('编辑')"
            :footer="null"
            width="30%"
            @cancel="handleClose"
          >
            <a-divider style="margin: 16px 0;" />
            <div class="big_write">
              <div class="wri_fi">
                <div class="wri_fi_1_title">{{ $t('登录邮箱') }}</div>
                <div class="wri_fi_1_ema">7432343878@gmail.com</div>
              </div>

              <div class="wri_fi">
                <div class="wri_fi_1_title">{{ $t('状态') }}</div>
                <a-select
                  v-model:value="selectedStatus"
                  :placeholder="$t('请选择状态')"
                  allow-clear
                  style="width: 100%;"
                  @change="handleStatusChange"
                >
                  <a-select-option
                    v-for="status in statuses"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </a-select-option>
                </a-select>
              </div>
            </div>

            <div class="dialog-container1">
              <div class="dialog-footer">
                <a-button @click="writeEVisible = false" class="dia_bto">
                  {{ $t('取消') }}
                </a-button>
                <a-button @click="defineDelete" type="primary" class="dia_bto1" style="margin-left: 8px;">
                  {{ $t('保存') }}
                </a-button>
              </div>
            </div>
          </a-modal>

          <!-- 弹窗--新建用户-->
          <a-modal
            v-model:visible="newUserVisible"
            :title="$t('新建用户')"
            :footer="null"
            width="30%"
            @cancel="handleClose"
          >
            <a-divider style="margin: 16px 0;" />
            <div class="userCon">
              <div class="u_f">
                <div class="user_ti">{{ $t('用户备注') }}</div>
                <a-input v-model:value="searchForm.address" :placeholder="$t('用户备注')" />
              </div>
              <div class="u_f">
                <div class="user_ti">{{ $t('用户邮箱') }}</div>
                <a-input v-model:value="searchForm.address" :placeholder="$t('用户邮箱')" />
              </div>
              <div class="u_f">
                <div class="user_ti">{{ $t('角色分配') }}</div>
                <div class="custom-select-wrapper">
                  <a-select
                    v-model:value="selectedRoles"
                    mode="multiple"
                    :placeholder="$t('请选择角色')"
                    style="width: 100%;"
                    @change="handleRoleChange"
                  >
                    <a-select-option
                      v-for="role in roles"
                      :key="role.value"
                      :value="role.value"
                    >
                      {{ role.label }}
                    </a-select-option>
                  </a-select>
                </div>
                <div class="dialog-container">
                  <div class="dialog-footer">
                    <a-button @click="defineDelete" type="primary" class="dia_bto1">
                      {{ $t('发送邮件') }}
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-modal>

          <!-- 弹窗--确认删除-->
          <a-modal
            v-model:visible="DeleteVisible"
            :title="$t('确认删除')"
            :footer="null"
            width="30%"
            @cancel="handleClose"
          >
            <a-divider style="margin: 16px 0;" />
            <div class="mess">{{ $t('您确定要删除这个角色吗？') }}</div>

            <div class="dialog-container">
              <div class="dialog-footer">
                <a-button @click="DeleteVisible = false" class="dia_bto">
                  {{ $t('取消') }}
                </a-button>
                <a-button @click="defineDelete" type="primary" danger class="dia_bto1" style="margin-left: 8px;">
                  {{ $t('删除') }}
                </a-button>
              </div>
            </div>
          </a-modal>
        </div>
      </div>
    </div>

    <!-- 添加 router-view 用于显示子路由组件 -->
    <router-view v-if="$route.name !== 'TransactionHistory'" />
  </div>
</template>

<script>
import { SearchOutlined } from '@ant-design/icons-vue'
import { request } from '@/api/_service'

export default {
    name: 'TransactionHistory',
    components: {
        SearchOutlined
    },
    data () {
        return {
            searchInput: '',
            selectedRoles: ['admin'],
            roles: [
                { value: 'admin', label: '超级管理员' },
                { value: 'finance', label: '财务管理员' }
            ],
            selectedStatus: 'normal',
            statuses: [
                { value: 'normal', label: '正常' },
                { value: 'abnormal', label: '不正常' }
            ],
            formLo: {
                username: ''
            },
            activeTab_new: 'jiaoMe',
            activeTab: 'receive',
            modalVisible: false,
            EditVisible: false,
            DeleteVisible: false,
            newUserVisible: false,
            writeEVisible: false,
            searchForm: {
                dateRange: [],
                address: '',
                transactionId: '',
                status: ''
            },

            // 用户列表表格列配置
            userColumns: [
                {
                    title: this.$t('用户ID'),
                    dataIndex: 'transactionId',
                    key: 'transactionId',
                    width: 350,
                    align: 'left'
                },
                {
                    title: this.$t('账号'),
                    dataIndex: 'transactionTime',
                    key: 'transactionTime',
                    width: 220,
                    align: 'left'
                },
                {
                    title: this.$t('角色'),
                    dataIndex: 'amount',
                    key: 'amount',
                    width: 200,
                    align: 'left'
                },
                {
                    title: this.$t('状态'),
                    key: 'status',
                    width: 190,
                    align: 'left'
                },
                {
                    title: this.$t('备注'),
                    dataIndex: 'network',
                    key: 'network',
                    width: 190,
                    align: 'left'
                },
                {
                    title: this.$t('主账号'),
                    dataIndex: 'currency',
                    key: 'currency',
                    width: 180,
                    align: 'left'
                },
                {
                    title: this.$t('operation'),
                    key: 'operation',
                    width: 420,
                    align: 'left'
                }
            ],

            // 角色配置表格列配置
            roleColumns: [
                {
                    title: this.$t('角色名'),
                    dataIndex: 'transactionId',
                    key: 'roleName',
                    width: 350,
                    align: 'left'
                },
                {
                    title: this.$t('角色备注'),
                    dataIndex: 'currency',
                    key: 'currency',
                    width: 180,
                    align: 'left'
                },
                {
                    title: this.$t('状态'),
                    key: 'status',
                    width: 190,
                    align: 'left'
                },
                {
                    title: this.$t('用户人数'),
                    dataIndex: 'bankName',
                    key: 'bankName',
                    width: 300,
                    align: 'left'
                },
                {
                    title: this.$t('操作'),
                    key: 'operation',
                    width: 420,
                    align: 'left'
                }
            ],

            receiveStatusOptions: [
                { label: this.$t('全部'), value: '' },
                { label: this.$t('待支付'), value: '0' },
                { label: this.$t('部分支付'), value: '1' },
                { label: this.$t('已支付'), value: '2' },
                { label: this.$t('已完成'), value: '3' },
                { label: this.$t('已取消'), value: '4' },
                { label: this.$t('已关闭'), value: '5' },
                { label: this.$t('异常'), value: '6' }
            ],

            withdrawStatusOptions: [
                { label: this.$t('承兑处理中'), value: '4' },
                { label: this.$t('部分承兑成功'), value: '5' },
                { label: this.$t('全部承兑成功'), value: '6' },
                { label: this.$t('已完成'), value: '7' },
                { label: this.$t('已过期'), value: '8' },
                { label: this.$t('已失败'), value: '9' },
                { label: this.$t('已取消'), value: '10' }
            ],

            statusOptions: [
                { label: this.$t('全部'), value: '' },
                { label: this.$t('成功'), value: 'success' },
                { label: this.$t('失败'), value: 'failed' },
                { label: this.$t('处理中'), value: 'pending' }
            ],

            // 表格数据
            tableData: []
        }
    },

    created () {
        if (this.$route.query.type === '2') {
            this.activeTab = 'withdraw'
            this._getWithdrawList()
        } else {
            this._getReceiveList()
        }
    },

    methods: {
        handleStatusChange (value) {
            console.log('状态改变:', value)
        },
        handleRoleChange (value) {
            console.log('角色改变:', value)
        },
        toggleRole (roleValue) {
            const index = this.selectedRoles.indexOf(roleValue)
            if (index > -1) {
                this.selectedRoles.splice(index, 1)
            } else {
                this.selectedRoles.push(roleValue)
            }
        },
        writeE () {
            this.writeEVisible = true
        },
        userShow () {
            this.newUserVisible = true
        },
        defineDelete () {
            this.DeleteVisible = false
        },
        openEdit () {
            this.EditVisible = true
        },
        AletDelete () {
            this.DeleteVisible = true
        },
        showModal () {
            this.modalVisible = true
        },
        handleClose () {
            this.modalVisible = false
            this.EditVisible = false
            this.DeleteVisible = false
            this.writeEVisible = false
            this.newUserVisible = false
        },

        _dealFromAddress (flows = []) {
            return flows.map(item => item.from_address).join(',')
        },
        _getWithdrawList () {
            request({
                url: `/merchant/exchange/list?limit=1000&start_time=${this.searchForm.dateRange[0] || ''}&end_time=${this.searchForm.dateRange[1] || ''}&order_no=${this.searchForm.transactionId || ''}&status=${(this.searchForm.status === '4' ? '3,4' : this.searchForm.status) || ''}`,
                method: 'GET'
            }).then(res => {
                if (res.code === 200) {
                    const WithdrawList = res.data.list
                    const tableData = WithdrawList.map(item => {
                        if (item.status_text === '待分配承兑商') {
                            item.status_text = '承兑处理中'
                        }

                        return {
                            ...item,
                            key: item.order_no, // Ant Design需要唯一key
                            transactionId: item.order_no,
                            transactionTime: this.formatDate(item.created_at),
                            amount: parseFloat(item.crypto_amount),
                            currency: item.crypto_currency_id.split('_')[0],
                            network: item.crypto_currency_id.split('_')[1],
                            status: item.status_text,
                            created_at: this.formatDate(item.created_at),
                            bankName: item.bank_info.bank_name,
                            account_number: item.bank_info.account_number
                        }
                    })

                    this.tableData = tableData
                }
            })
        },
        formatDate (date) {
            const d = new Date(date)
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const hours = String(d.getHours()).padStart(2, '0')
            const minutes = String(d.getMinutes()).padStart(2, '0')

            return `${year}/${month}/${day} ${hours}:${minutes}`
        },
        async _getPayeeList () {
            const res = await request({
                url: '/users/payeeList',
                method: 'GET'
            })

            if (res.Code === '0') {
                this.tableData = []
            }
        },
        _getReceiveList () {
            request({
                url: `/merchant/crypto/deposit/list?limit=1000&start_time=${this.searchForm.dateRange[0] || ''}&end_time=${this.searchForm.dateRange[1] || ''}&address=${this.searchForm.address || ''}&order_no=${this.searchForm.transactionId || ''}&status=${this.searchForm.status || ''}`,
                method: 'GET'
            }).then(res => {
                if (res.code === 200) {
                    const list = res.data.list

                    const tableData = list.map(item => {
                        return {
                            ...item,
                            key: item.order_no, // Ant Design需要唯一key
                            transactionId: item.order_no,
                            transactionTime: this.formatDate(item.created_at),
                            amount: parseFloat(item.amount).toFixed(0),
                            currency: item.crypto_currency_id.split('_')[0],
                            network: item.crypto_currency_id.split('_')[1],
                            status: item.status_text,
                            paymentAddress: item.flows[0]?.from_adress
                        }
                    })

                    this.tableData = tableData
                }
            })
        },
        handleDownload () {
            this.$message.success('开始下载')
        }
    },
    watch: {
        activeTab (val) {
            if (val === 'receive') {
                this._getReceiveList()
            }

            if (val === 'payment') {
                this._getPayeeList()
            }

            if (val === 'withdraw') {
                this._getWithdrawList()
            }
        },
        searchForm: {
            deep: true,
            handler (val) {
                if (this.activeTab === 'receive') {
                    this._getReceiveList()
                }

                if (this.activeTab === 'payment') {
                    this._getPayeeList()
                }

                if (this.activeTab === 'withdraw') {
                    this._getWithdrawList()
                }
            }
        }
    }
}
</script>

<style scoped>

#myTable {
    width: 100%;
    border-collapse: collapse;
}

#myTable th,
#myTable td {
    color: #7D7D7D;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    border: 1px solid #CACACA;
    padding: 10px;
    text-align: left;
}

#myTable th {
    background-color: #F1F1F1;
}

.co_co {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: -1px;
    align-self: stretch;
    margin-bottom: 27px;
}

.search-wrapper1 {
    margin-top: 10px;
    margin-bottom: -15px;
}

.form-item-label {
    padding-bottom: 15px;
    color: #5A5A5A;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.E_co {
    margin-top: 30px;
}

.mess {
    margin-top: 30px;
    width: 50%;
    margin-left: auto;
    margin-right: auto;
    color: #5A5A5A;
    text-align: center;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.dialog-footer {
    display: flex;
    padding-top: 28px;
    margin-bottom: 7px;
    justify-content: flex-end;
}

.dialog-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.dialog-container1 {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-right: 30px;
}

.dia_bto {
    display: flex;
    padding: 8px 14px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    background: #FFF;
    font-family: "PingFang SC";
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.dia_bto1 {
    display: flex;
    padding: 8px 14px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    color: #FFF;
    font-family: "PingFang SC";
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.big_write {
    margin: 30px;
}

.wri_fi_1_ema {
    margin-bottom: 30px;
    color: #7D7D7D;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: flex;
    padding: 12px 20px;
    align-items: center;
    gap: 523px;
    align-self: stretch;
    border-radius: 8px;
    background: #F1F1F1;
}

.wri_fi_1_title {
    padding-bottom: 15px;
    color: #5A5A5A;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.u_f {
    margin-top: 28px;
    color: #5A5A5A;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.user_ti {
    padding-bottom: 10px;
    color: #5A5A5A;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
}

.se_con {
    margin-top: 30px;
    height: 92px;
    border-radius: 8px 8px 8px 8px;
    border: 1px solid #CACACA;
    overflow: hidden;
}

.se_2_1 {
    color: #7D7D7D;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 50%;
    padding: 12px 20px;
}

.se_1_1 {
    padding: 12px 20px;
    color: #5A5A5A;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 50%;
}

.se_2_2 {
    color: #7D7D7D;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 50%;
    padding: 12px 20px;
    border-left: 1px solid #CACACA;
}

.se_1_2 {
    padding: 12px 20px;
    color: #5A5A5A;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 50%;
    border-left: 1px solid #CACACA;
}

.se_2_co {
    display: flex;
    height: 50%;
    border-top: 1px solid #CACACA;
}

.se_1_co {
    display: flex;
    background: #F1F1F1;
    height: 50%;
    border-bottom: 1px solid #CACACA;
}

.fie_con {
    border-radius: 8px;
    background: #F1F1F1;
    padding: 12px 20px;
}

.dia_fir {
    display: flex;
    align-items: center;
}

.big_con {
    margin: 30px;
}

.dia_left {
    width: 90px;
    text-align: left;
    padding-right: 10px;
    box-sizing: border-box;
}

.dia_fir span:not(.dia_left) {
    padding-left: 10px;
}

.history-page {
    .tab-wrapper {
        margin-bottom: 20px;

        :deep(.ant-tabs-tab) {
            font-size: 16px;
            color: #303030;
            height: 58px;
            line-height: 40px;

            &.ant-tabs-tab-active {

            }
        }

        :deep(.ant-tabs-ink-bar) {

        }
    }

    .tab-wrapper1 {
        margin-bottom: 20px;

        :deep(.ant-tabs-tab) {
            font-size: 16px;
            color: #303030;
            height: 40px;
            line-height: 40px;
        }

        :deep(.ant-tabs-ink-bar) {

        }
    }

    .custom-input-wrapper {
        width: 500px;
        height: 40px;
        display: inline-flex;
        align-items: center;
    }

    .search-wrapper2 {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;

        .download-btn {
            height: 40px;
            padding: 0 20px;
            color: #fff;
            border-radius: 4px;
            font-family: "PingFang SC";
        }
    }

    .search-wrapper {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;

        .download-btn {
            height: 40px;
            padding: 0 20px;
            color: #fff;
            border-radius: 4px;
            font-family: "PingFang SC";

            &:hover {
            }
        }
    }
}

:deep(.custom-table) {
    .ant-table {
        border: 1px solid #EAEAEA;
        border-radius: 4px;
        overflow: hidden;
    }

    .ant-table-thead > tr > th {
        background: #fff;
        color: #5A5A5A;
        font-family: "PingFang SC";
        font-size: 14px;
        font-weight: 400;
        height: 56px;
        border-right: none;
    }

    .ant-table-tbody > tr > td {
        color: #5A5A5A;
        font-family: "PingFang SC";
        font-size: 14px;
        font-weight: bold;
        height: 56px;
        border-right: none;
        border-bottom: none;
    }

    .ant-table-tbody > tr:hover > td {
        background-color: #fff !important;
    }
}

.operation-buttons {
    display: flex;
    align-items: center;
}

.status-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #00B42A;
    }

    span {
        font-size: 14px;
        color: #00B42A;
    }
}

</style>
