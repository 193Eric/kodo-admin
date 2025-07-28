<template>
  <div class="permission-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>Permission Management</h1>
    </div>

    <!-- Tab切换 -->
    <a-tabs v-model="activeTab" class="permission-tabs">
      <a-tab-pane key="userList" tab="User List">
        <!-- 用户列表页面 -->
        <div class="tab-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-filters">
              <a-input
                v-model="userListFilters.search"
                placeholder="Search members..."
                style="width: 200px; margin-right: 16px"
                allow-clear
                @pressEnter="handleUserListSearch"
              >
                <a-icon slot="prefix" type="search" />
              </a-input>

              <a-select
                v-model="userListFilters.roleAssignment"
                placeholder="Role Assignment"
                style="width: 160px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="Super Administrator">Super Administrator</a-select-option>
                <a-select-option value="Finance Personnel">Finance Personnel</a-select-option>
                <a-select-option value="Auditor">Auditor</a-select-option>
                <a-select-option value="API Operator">API Operator</a-select-option>
              </a-select>

              <a-select
                v-model="userListFilters.status"
                placeholder="Status"
                style="width: 120px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="Normal">Normal</a-select-option>
                <a-select-option value="Abnormal">Abnormal</a-select-option>
              </a-select>

              <a-button @click="handleUserListReset" style="margin-right: 16px">
                Reset
              </a-button>
            </div>

            <div class="action-buttons">
              <a-button type="primary" @click="handleNewUser">
                <a-icon type="plus" />
                New User
              </a-button>
            </div>
          </div>

          <!-- 用户表格 -->
          <a-table
            :columns="userListColumns"
            :data-source="filteredUserListData"
            :row-key="record => record.userId"
            :pagination="userListPagination"
            :loading="userListLoading"
            @change="handleUserListTableChange"
          >
            <template slot="status" slot-scope="text">
              <span :class="text === 'Abnormal' ? 'status-abnormal' : 'status-normal'">
                {{ text }}
              </span>
            </template>

            <template slot="mainAccount" slot-scope="text">
              {{ text ? 'Yes' : 'No' }}
            </template>

            <template slot="operation" slot-scope="text, record">
              <a-space>
                <a-button type="link" size="small" @click="handleUserView(record)">
                  <a-icon type="file-search" />
                </a-button>
                <a-button type="link" size="small" @click="handleUserEdit(record)">
                  <a-icon type="edit" />
                </a-button>
                <a-button type="link" size="small" @click="handleUserDelete(record)">
                  <a-icon type="delete" />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="characterConfig" tab="Character Configuration">
        <!-- 角色配置页面 -->
        <div class="tab-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-filters">
              <a-select
                v-model="characterFilters.roleAssignment"
                placeholder="Role Assignment"
                style="width: 160px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="Super Administrator">Super Administrator</a-select-option>
                <a-select-option value="Finance Personnel">Finance Personnel</a-select-option>
                <a-select-option value="Auditor">Auditor</a-select-option>
                <a-select-option value="API Operator">API Operator</a-select-option>
              </a-select>

              <a-select
                v-model="characterFilters.roleRemarks"
                placeholder="Role Remarks"
                style="width: 140px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="Boss">Boss</a-select-option>
                <a-select-option value="Manager">Manager</a-select-option>
                <a-select-option value="Staff">Staff</a-select-option>
              </a-select>

              <a-select
                v-model="characterFilters.status"
                placeholder="Status"
                style="width: 120px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="Normal">Normal</a-select-option>
                <a-select-option value="Abnormal">Abnormal</a-select-option>
              </a-select>

              <a-button @click="handleCharacterReset">
                Reset
              </a-button>
            </div>

          </div>

          <!-- 角色表格 -->
          <a-table
            :columns="characterColumns"
            :data-source="filteredCharacterData"
            :row-key="record => record.roleAssignment"
            :pagination="characterPagination"
            :loading="characterLoading"
            @change="handleCharacterTableChange"
          >
            <template slot="status" slot-scope="text">
              <span :class="text === 'Abnormal' ? 'status-abnormal' : 'status-normal'">
                {{ text }}
              </span>
            </template>

            <template slot="operation" slot-scope="text, record">
              <a-space>
                <a-button type="link" size="small" @click="handleCharacterView(record)">
                  <a-icon type="file-search" />
                </a-button>
                <a-button type="link" size="small" @click="handleCharacterEdit(record)">
                  <a-icon type="edit" />
                </a-button>
                <a-button type="link" size="small" @click="handleCharacterDelete(record)">
                  <a-icon type="delete" />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 新增/编辑用户弹窗 -->
    <a-modal
      :title="userModalTitle"
      :visible="userModalVisible"
      @ok="handleUserModalOk"
      @cancel="handleUserModalCancel"
      :confirmLoading="userModalLoading"
      :maskClosable="false"
    >
      <a-form :form="userForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="User ID">
          <a-input
            v-decorator="['userId', { rules: [{ required: true, message: 'Please input user ID' }] }]"
            placeholder="Please input user ID"
            :disabled="userModalMode === 'view'"
          />
        </a-form-item>
        <a-form-item label="Account">
          <a-input
            v-decorator="['account', { rules: [{ required: true, type: 'email', message: 'Please input valid email' }] }]"
            placeholder="Please input account email"
            :disabled="userModalMode === 'view'"
          />
        </a-form-item>
        <a-form-item label="Role Assignment">
          <a-select
            v-decorator="['roleAssignment', { rules: [{ required: true, message: 'Please select role' }] }]"
            placeholder="Please select role"
            :disabled="userModalMode === 'view'"
          >
            <a-select-option value="Super Administrator">Super Administrator</a-select-option>
            <a-select-option value="Finance Personnel">Finance Personnel</a-select-option>
            <a-select-option value="Auditor">Auditor</a-select-option>
            <a-select-option value="API Operator">API Operator</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Remarks">
          <a-input
            v-decorator="['remarks']"
            placeholder="Please input remarks"
            :disabled="userModalMode === 'view'"
          />
        </a-form-item>
        <a-form-item label="Main Account">
          <a-radio-group v-decorator="['mainAccount', { initialValue: true }]" :disabled="userModalMode === 'view'">
            <a-radio :value="true">Yes</a-radio>
            <a-radio :value="false">No</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Status">
          <a-radio-group v-decorator="['status', { initialValue: 'Normal' }]" :disabled="userModalMode === 'view'">
            <a-radio value="Normal">Normal</a-radio>
            <a-radio value="Abnormal">Abnormal</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>

      <template slot="footer">
        <a-button @click="handleUserModalCancel">
          {{ userModalMode === 'view' ? 'Close' : 'Cancel' }}
        </a-button>
        <a-button v-if="userModalMode !== 'view'" type="primary" :loading="userModalLoading" @click="handleUserModalOk">
          {{ userModalMode === 'add' ? 'Add' : 'Update' }}
        </a-button>
      </template>
    </a-modal>

    <!-- 查看/编辑角色弹窗 -->
    <a-modal
      :title="characterModalTitle"
      :visible="characterModalVisible"
      @ok="handleCharacterModalOk"
      @cancel="handleCharacterModalCancel"
      :confirmLoading="characterModalLoading"
      :maskClosable="false"
    >
      <a-form :form="characterForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="Role Assignment">
          <a-input
            v-decorator="['roleAssignment', { rules: [{ required: true, message: 'Please input role assignment' }] }]"
            placeholder="Please input role assignment"
            :disabled="characterModalMode === 'view'"
          />
        </a-form-item>
        <a-form-item label="Role Remarks">
          <a-input
            v-decorator="['roleRemarks']"
            placeholder="Please input role remarks"
            :disabled="characterModalMode === 'view'"
          />
        </a-form-item>
        <a-form-item label="Status">
          <a-radio-group v-decorator="['status', { initialValue: 'Normal' }]" :disabled="characterModalMode === 'view'">
            <a-radio value="Normal">Normal</a-radio>
            <a-radio value="Abnormal">Abnormal</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="User Number">
          <a-input-number
            v-decorator="['userNumber', { rules: [{ required: true, message: 'Please input user number' }] }]"
            min="{0}"
            placeholder="User number"
            :disabled="characterModalMode === 'view'"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>

      <template slot="footer">
        <a-button @click="handleCharacterModalCancel">
          {{ characterModalMode === 'view' ? 'Close' : 'Cancel' }}
        </a-button>
        <a-button v-if="characterModalMode !== 'view'" type="primary" :loading="characterModalLoading" @click="handleCharacterModalOk">
          Update
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'PermissionManagement',
  data () {
    return {
      activeTab: 'userList',

      // 用户列表相关数据
      userListFilters: {
        search: '',
        roleAssignment: undefined,
        status: undefined
      },
      userListData: [],
      userListLoading: false,
      userListPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
      },
      userListColumns: [
        {
          title: 'User ID',
          dataIndex: 'userId',
          width: 150
        },
        {
          title: 'Account',
          dataIndex: 'account',
          width: 250
        },
        {
          title: 'Role Assignment',
          dataIndex: 'roleAssignment',
          width: 180
        },
        {
          title: 'Status',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          width: 100
        },
        {
          title: 'Remarks',
          dataIndex: 'remarks',
          width: 150
        },
        {
          title: 'Main Account',
          dataIndex: 'mainAccount',
          scopedSlots: { customRender: 'mainAccount' },
          width: 120
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          fixed: 'right'
        }
      ],

      // 角色配置相关数据
      characterFilters: {
        roleAssignment: undefined,
        roleRemarks: undefined,
        status: undefined
      },
      characterData: [],
      characterLoading: false,
      characterPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
      },
      characterColumns: [
        {
          title: 'Role Assignment',
          dataIndex: 'roleAssignment',
          width: 200
        },
        {
          title: 'Role Remarks',
          dataIndex: 'roleRemarks',
          width: 150
        },
        {
          title: 'Status',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          width: 100
        },
        {
          title: 'User Number',
          dataIndex: 'userNumber',
          width: 120
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          fixed: 'right'
        }
      ],

      // 用户弹窗相关
      userModalVisible: false,
      userModalLoading: false,
      userModalMode: 'add', // add, edit, view
      userModalTitle: 'New User',
      userForm: this.$form.createForm(this),
      currentUserRecord: null,

      // 角色弹窗相关
      characterModalVisible: false,
      characterModalLoading: false,
      characterModalMode: 'view', // edit, view
      characterModalTitle: 'View Character',
      characterForm: this.$form.createForm(this),
      currentCharacterRecord: null
    }
  },

  computed: {
    // 过滤后的用户列表数据
    filteredUserListData () {
      let filtered = [...this.userListData]

      if (this.userListFilters.search) {
        const search = this.userListFilters.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.account.toLowerCase().includes(search) ||
          item.remarks.toLowerCase().includes(search) ||
          item.userId.includes(search)
        )
      }

      if (this.userListFilters.roleAssignment) {
        filtered = filtered.filter(item => item.roleAssignment === this.userListFilters.roleAssignment)
      }

      if (this.userListFilters.status) {
        filtered = filtered.filter(item => item.status === this.userListFilters.status)
      }

      return filtered
    },

    // 过滤后的角色配置数据
    filteredCharacterData () {
      let filtered = [...this.characterData]

      if (this.characterFilters.roleAssignment) {
        filtered = filtered.filter(item => item.roleAssignment === this.characterFilters.roleAssignment)
      }

      if (this.characterFilters.roleRemarks) {
        filtered = filtered.filter(item => item.roleRemarks === this.characterFilters.roleRemarks)
      }

      if (this.characterFilters.status) {
        filtered = filtered.filter(item => item.status === this.characterFilters.status)
      }

      return filtered
    }
  },

  mounted () {
    this.loadUserListData()
    this.loadCharacterData()
  },

  methods: {
    // 加载用户列表数据
    async loadUserListData () {
      this.userListLoading = true
      try {
        await this.delay(500)
        const mockData = this.generateUserListMockData()
        this.userListData = mockData
        this.userListPagination.total = mockData.length
      } catch (error) {
        this.$message.error('加载用户列表失败')
      } finally {
        this.userListLoading = false
      }
    },

    // 生成用户列表Mock数据
    generateUserListMockData () {
      const roles = ['Super Administrator', 'Finance Personnel', 'Auditor', 'API Operator']
      const names = ['Li Zhiqiang', 'Chen Xiaoli', 'Roosevelt', 'Tai Leilei', 'Zhang Xiaoming', 'John Wilson', 'Alvin Cullum York']

      return Array.from({ length: 20 }, (_, index) => ({
        userId: `091233${40912334 + index}`,
        account: `${names[index % names.length].toLowerCase().replace(' ', '.')}@example.com`,
        roleAssignment: roles[index % roles.length],
        status: index === 4 ? 'Abnormal' : 'Normal',
        remarks: names[index % names.length],
        mainAccount: index < 4
      }))
    },

    // 加载角色配置数据
    async loadCharacterData () {
      this.characterLoading = true
      try {
        await this.delay(500)
        const mockData = this.generateCharacterMockData()
        this.characterData = mockData
        this.characterPagination.total = mockData.length
      } catch (error) {
        this.$message.error('加载角色配置失败')
      } finally {
        this.characterLoading = false
      }
    },

    // 生成角色配置Mock数据
    generateCharacterMockData () {
      return [
        {
          roleAssignment: 'Super Administrator',
          roleRemarks: 'Boss',
          status: 'Normal',
          userNumber: 1
        },
        {
          roleAssignment: 'Finance Personnel',
          roleRemarks: '-',
          status: 'Normal',
          userNumber: 1
        },
        {
          roleAssignment: 'Auditor',
          roleRemarks: '-',
          status: 'Normal',
          userNumber: 1
        },
        {
          roleAssignment: 'API Operator',
          roleRemarks: '-',
          status: 'Normal',
          userNumber: 4
        }
      ]
    },

    // 用户列表搜索
    handleUserListSearch () {
      this.userListPagination.current = 1
    },

    // 用户列表重置
    handleUserListReset () {
      this.userListFilters = {
        search: '',
        roleAssignment: undefined,
        status: undefined
      }
    },

    // 角色配置重置
    handleCharacterReset () {
      this.characterFilters = {
        roleAssignment: undefined,
        roleRemarks: undefined,
        status: undefined
      }
    },

    // 表格变化处理
    handleUserListTableChange (pagination) {
      this.userListPagination.current = pagination.current
      this.userListPagination.pageSize = pagination.pageSize
    },

    handleCharacterTableChange (pagination) {
      this.characterPagination.current = pagination.current
      this.characterPagination.pageSize = pagination.pageSize
    },

    // 新增用户
    handleNewUser () {
      this.userModalMode = 'add'
      this.userModalTitle = 'New User'
      this.userModalVisible = true
      this.currentUserRecord = null
      this.userForm.resetFields()
    },

    // 查看用户
    handleUserView (record) {
      this.userModalMode = 'view'
      this.userModalTitle = 'View User'
      this.userModalVisible = true
      this.currentUserRecord = record
      this.$nextTick(() => {
        this.userForm.setFieldsValue({
          userId: record.userId,
          account: record.account,
          roleAssignment: record.roleAssignment,
          remarks: record.remarks,
          mainAccount: record.mainAccount,
          status: record.status
        })
      })
    },

    // 编辑用户
    handleUserEdit (record) {
      this.userModalMode = 'edit'
      this.userModalTitle = 'Edit User'
      this.userModalVisible = true
      this.currentUserRecord = record
      this.$nextTick(() => {
        this.userForm.setFieldsValue({
          userId: record.userId,
          account: record.account,
          roleAssignment: record.roleAssignment,
          remarks: record.remarks,
          mainAccount: record.mainAccount,
          status: record.status
        })
      })
    },

    // 删除用户
    handleUserDelete (record) {
      this.$confirm({
        title: '确定删除此用户吗？',
        content: `用户：${record.account}`,
        onOk: () => {
          const index = this.userListData.findIndex(item => item.userId === record.userId)
          if (index !== -1) {
            this.userListData.splice(index, 1)
            this.$message.success('删除成功')
          }
        }
      })
    },

    // 用户弹窗确认
    handleUserModalOk () {
      this.userForm.validateFields((err, values) => {
        if (!err) {
          this.userModalLoading = true
          setTimeout(() => {
            if (this.userModalMode === 'add') {
              // 新增用户
              const newUser = {
                ...values
              }
              this.userListData.unshift(newUser)
              this.$message.success('用户添加成功')
            } else if (this.userModalMode === 'edit') {
              // 编辑用户
              const index = this.userListData.findIndex(item => item.userId === this.currentUserRecord.userId)
              if (index !== -1) {
                this.userListData.splice(index, 1, {
                  ...this.currentUserRecord,
                  ...values
                })
                this.$message.success('用户更新成功')
              }
            }

            this.userModalVisible = false
            this.userModalLoading = false
            this.userForm.resetFields()
          }, 1000)
        }
      })
    },

    // 用户弹窗取消
    handleUserModalCancel () {
      this.userModalVisible = false
      this.userForm.resetFields()
    },

    // 查看角色
    handleCharacterView (record) {
      this.characterModalMode = 'view'
      this.characterModalTitle = 'View Character'
      this.characterModalVisible = true
      this.currentCharacterRecord = record
      this.$nextTick(() => {
        this.characterForm.setFieldsValue({
          roleAssignment: record.roleAssignment,
          roleRemarks: record.roleRemarks,
          status: record.status,
          userNumber: record.userNumber
        })
      })
    },

    // 编辑角色
    handleCharacterEdit (record) {
      this.characterModalMode = 'edit'
      this.characterModalTitle = 'Edit Character'
      this.characterModalVisible = true
      this.currentCharacterRecord = record
      this.$nextTick(() => {
        this.characterForm.setFieldsValue({
          roleAssignment: record.roleAssignment,
          roleRemarks: record.roleRemarks,
          status: record.status,
          userNumber: record.userNumber
        })
      })
    },

    // 删除角色
    handleCharacterDelete (record) {
      this.$confirm({
        title: '确定删除此角色吗？',
        content: `角色：${record.roleAssignment}`,
        onOk: () => {
          const index = this.characterData.findIndex(item => item.roleAssignment === record.roleAssignment)
          if (index !== -1) {
            this.characterData.splice(index, 1)
            this.$message.success('删除成功')
          }
        }
      })
    },

    // 角色弹窗确认
    handleCharacterModalOk () {
      this.characterForm.validateFields((err, values) => {
        if (!err) {
          this.characterModalLoading = true
          setTimeout(() => {
            // 编辑角色
            const index = this.characterData.findIndex(item => item.roleAssignment === this.currentCharacterRecord.roleAssignment)
            if (index !== -1) {
              this.characterData.splice(index, 1, {
                ...this.currentCharacterRecord,
                ...values
              })
              this.$message.success('角色更新成功')
            }

            this.characterModalVisible = false
            this.characterModalLoading = false
            this.characterForm.resetFields()
          }, 1000)
        }
      })
    },

    // 角色弹窗取消
    handleCharacterModalCancel () {
      this.characterModalVisible = false
      this.characterForm.resetFields()
    },

    // 延时函数
    delay (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.permission-management {
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

.permission-tabs {
  background: #fff;
  border-radius: 8px;
}

.permission-tabs .ant-tabs-bar {
  margin: 0;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.permission-tabs .ant-tabs-tab {
  margin: 0 32px 0 0;
  padding: 16px 0;
  font-size: 14px;
  color: #8c8c8c;
}

.permission-tabs .ant-tabs-tab-active {
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

.status-normal {
  color: #52c41a;
}

.status-abnormal {
  color: #ff4d4f;
}

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

.ant-btn-primary {

}

.ant-btn-primary:hover {

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

/* 禁用状态样式 */
.ant-input[disabled],
.ant-select-disabled .ant-select-selection,
.ant-radio-wrapper-disabled,
.ant-input-number-disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #11253E040;
  cursor: not-allowed;
}

.ant-radio-wrapper-disabled .ant-radio-disabled + span {
  color: #11253E040;
}
</style>
