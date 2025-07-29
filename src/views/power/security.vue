<template>
  <div class="security-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>Security Settings</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
      <p>Loading user information...</p>
    </div>

    <template v-else>
      <!-- 账户信息 -->
      <a-card class="section-card" :bordered="false">
        <h2 class="section-title">Account information</h2>

        <div class="info-list">
          <div class="info-item">
            <span class="label">Account ID</span>
            <span class="value">{{ accountInfo.accountId }}</span>
          </div>

          <div class="info-item">
            <span class="label">Account Name</span>
            <span class="value">
              {{ accountInfo.accountName }}
              <a-icon type="edit" class="edit-icon" @click="handleEditAccountName" />
            </span>
          </div>

          <div class="info-item" v-if="accountInfo.registrationTime">
            <span class="label">Registration Time</span>
            <span class="value">{{ accountInfo.registrationTime }}</span>
          </div>

          <div class="info-item">
            <span class="label">Last Login</span>
            <span class="value">{{ accountInfo.lastLogin }}</span>
          </div>

          <div class="info-item">
            <span class="label">Account role</span>
            <span class="value">{{ accountInfo.accountRole }}</span>
          </div>

          <div class="info-item">
            <span class="label">Account status</span>
            <span class="value">
              <a-tag :color="getStatusColor(accountInfo.accountStatus)">{{ accountInfo.accountStatus }}</a-tag>
            </span>
          </div>

          <div class="info-item">
            <span class="label">Country</span>
            <span class="value">{{ accountInfo.country }}</span>
          </div>

          <div class="info-item">
            <span class="label">Language</span>
            <span class="value">{{ accountInfo.language }}</span>
          </div>
        </div>
      </a-card>

      <!-- 登录设备信息 -->
      <a-card class="section-card" :bordered="false">
        <h2 class="section-title">Log in device information</h2>

        <a-table
          :columns="deviceColumns"
          :data-source="deviceData"
          :pagination="false"
          :row-key="record => record.device + record.lastLoginTime"
          class="device-table"
        >
          <template slot="device" slot-scope="text">
            <span class="device-name">{{ text }}</span>
          </template>

          <template slot="lastLoginTime" slot-scope="text">
            <span class="login-time">{{ text }}</span>
          </template>

          <template slot="location" slot-scope="text">
            <span class="location">{{ text }}</span>
          </template>
        </a-table>
      </a-card>

      <!-- 账户绑定设置 -->
      <a-card class="section-card" :bordered="false">
        <h2 class="section-title">Account binding settings</h2>

        <div class="binding-list">
          <!-- 邮箱绑定 -->
          <div class="binding-item">
            <div class="binding-icon">
              <a-icon type="mail" />
            </div>
            <div class="binding-content">
              <div class="binding-title">E-mail</div>
              <div class="binding-desc">Instant verification for login and sensitive operations</div>
            </div>
            <div class="binding-action" @click="handleEditEmail" >
              <span class="binding-value">{{ bindingSettings.email }}</span>
              <a-icon type="right" class="arrow-icon"/>
            </div>
          </div>

          <!-- 手机号绑定 暂时不需要 -->
          <!-- <div class="binding-item">
            <div class="binding-icon">
              <a-icon type="mobile" />
            </div>
            <div class="binding-content">
              <div class="binding-title">Phone Number</div>
              <div class="binding-desc">Instant verification for login and sensitive operations</div>
            </div>
            <div class="binding-action" @click="handleBindPhone" >
              <span :class="['binding-value', { 'not-bound': bindingSettings.phoneNumber === 'Not bound' }]">
                {{ bindingSettings.phoneNumber }}
              </span>
              <a-icon type="right" class="arrow-icon" />
            </div>
          </div> -->

          <!-- Google验证器 -->
          <div class="binding-item">
            <div class="binding-icon">
              <a-icon type="google" />
            </div>
            <div class="binding-content">
              <div class="binding-title">Google Authenticator</div>
              <div class="binding-desc">Instant verification for login and sensitive operations</div>
            </div>
            <div class="binding-action" @click="handleBindGoogleAuth">
              <span :class="['binding-value', { 'not-bound': !bindingSettings.googleAuthenticator }]">
                {{ bindingSettings.googleAuthenticator ? 'Bound' : 'Not bound' }}
              </span>
              <a-icon type="right" class="arrow-icon" />
            </div>
          </div>

          <!-- 支付密码 -->
          <div class="binding-item">
            <div class="binding-icon">
              <a-icon type="lock" />
            </div>
            <div class="binding-content">
              <div class="binding-title">Payment Password</div>
              <div class="binding-desc">Used for sensitive operations like withdrawals and payments</div>
            </div>
            <div class="binding-action" @click="handleChangePaymentPassword">
              <span :class="['binding-value', { 'not-bound': bindingSettings.paymentPassword === 'Not set' }]">
                {{ bindingSettings.paymentPassword }}
              </span>
              <a-icon type="right" class="arrow-icon" />
            </div>
          </div>
        </div>
      </a-card>
    </template>

    <!-- 编辑账户名弹窗 -->
    <a-modal
      title="Edit Account Name"
      :visible="editAccountNameVisible"
      @ok="handleAccountNameOk"
      @cancel="handleAccountNameCancel"
      :confirmLoading="editAccountNameLoading"
    >
      <a-form :form="accountNameForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="Account Name">
          <a-input
            v-decorator="['accountName', { rules: [{ required: true, message: 'Please input account name' }] }]"
            placeholder="Please input account name"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑邮箱弹窗 -->
    <a-modal
      title="Change Email Address"
      :visible="editEmailVisible"
      @ok="handleEditEmailOk"
      @cancel="handleEditEmailCancel"
      :confirmLoading="editEmailLoading"
      width="600px"
    >
      <a-form :form="emailForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="Current Email">
          <a-input :value="bindingSettings.email" disabled />
        </a-form-item>

        <!-- 当前邮箱验证码 -->
        <a-form-item label="Current Email Code">
          <a-row :gutter="8">
            <a-col :span="14">
              <a-input
                v-decorator="['currentEmailCode', { rules: [{ required: true, message: 'Please input current email verification code' }] }]"
                placeholder="Please input current email verification code"
              />
            </a-col>
            <a-col :span="10">
              <a-button @click="handleSendCurrentEmailCode" :disabled="currentEmailCodeCountdown > 0">
                {{ currentEmailCodeCountdown > 0 ? `${currentEmailCodeCountdown}s` : 'Send Code' }}
              </a-button>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item label="New Email">
          <a-input
            v-decorator="['newEmail', { rules: [{ required: true, type: 'email', message: 'Please input valid email' }] }]"
            placeholder="Please input new email address"
          />
        </a-form-item>

        <!-- 新邮箱验证码 -->
        <a-form-item label="New Email Code">
          <a-row :gutter="8">
            <a-col :span="14">
              <a-input
                v-decorator="['newEmailCode', { rules: [{ required: true, message: 'Please input new email verification code' }] }]"
                placeholder="Please input new email verification code"
              />
            </a-col>
            <a-col :span="10">
              <a-button @click="handleSendNewEmailCode" :disabled="newEmailCodeCountdown > 0">
                {{ newEmailCodeCountdown > 0 ? `${newEmailCodeCountdown}s` : 'Send Code' }}
              </a-button>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 绑定/修改手机号弹窗 -->
    <a-modal
      :title="phoneModalTitle"
      :visible="phoneModalVisible"
      @ok="handlePhoneModalOk"
      @cancel="handlePhoneModalCancel"
      :confirmLoading="phoneModalLoading"
      width="600px"
    >
      <a-form :form="phoneForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-form-item v-if="bindingSettings.phoneNumber !== 'Not bound'" label="Current Phone">
          <a-input :value="bindingSettings.phoneNumber" disabled />
        </a-form-item>

        <!-- 当前手机号验证码 (仅在修改时显示) -->
        <a-form-item v-if="bindingSettings.phoneNumber !== 'Not bound'" label="Current Phone Code">
          <a-row :gutter="8">
            <a-col :span="14">
              <a-input
                v-decorator="['currentPhoneCode', { rules: [{ required: true, message: 'Please input current phone verification code' }] }]"
                placeholder="Please input current phone verification code"
              />
            </a-col>
            <a-col :span="10">
              <a-button @click="handleSendCurrentPhoneCode" :disabled="currentPhoneCodeCountdown > 0">
                {{ currentPhoneCodeCountdown > 0 ? `${currentPhoneCodeCountdown}s` : 'Send Code' }}
              </a-button>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item :label="bindingSettings.phoneNumber !== 'Not bound' ? 'New Phone' : 'Phone Number'">
          <a-input
            v-decorator="['phoneNumber', { rules: [{ required: true, message: 'Please input phone number' }] }]"
            placeholder="Please input phone number"
          />
        </a-form-item>

        <!-- 新手机号验证码 -->
        <a-form-item :label="bindingSettings.phoneNumber !== 'Not bound' ? 'New Phone Code' : 'Verification Code'">
          <a-row :gutter="8">
            <a-col :span="14">
              <a-input
                v-decorator="['newPhoneCode', { rules: [{ required: true, message: 'Please input verification code' }] }]"
                placeholder="Please input verification code"
              />
            </a-col>
            <a-col :span="10">
              <a-button @click="handleSendNewPhoneCode" :disabled="newPhoneCodeCountdown > 0">
                {{ newPhoneCodeCountdown > 0 ? `${newPhoneCodeCountdown}s` : 'Send Code' }}
              </a-button>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 绑定Google验证器弹窗 -->
    <a-modal
      :title="googleAuthModalTitle"
      :visible="googleAuthModalVisible"
      @ok="handleGoogleAuthOk"
      @cancel="handleGoogleAuthCancel"
      :confirmLoading="googleAuthLoading"
      width="500px"
      :closable="true"
    >
      <div class="google-auth-content">
        <div v-if="!bindingSettings.googleAuthenticator" class="bind-google-auth">
          <p class="tip-text">Please scan the QR code below with Google Authenticator and enter the 6-digit verification code</p>

          <div class="qr-code-section">
            <div class="qr-code-container">
              <div v-if="qrCodeUrl" class="qr-code-image">
                <!-- 使用 vue-qr 组件生成二维码 -->
                <vue-qr :text="qrCodeUrl" :size="200" :margin="0" colorDark="#000000" colorLight="#ffffff"></vue-qr>
              </div>
              <div v-else class="qr-code-placeholder">
                <a-spin size="large" />
                <p>Loading QR Code...</p>
              </div>
              <div class="secret-key-section">
                <p class="secret-label">Secret Key (Manual Entry):</p>
                <p class="secret-key">{{ googleAuthSecret }}</p>
              </div>
            </div>
          </div>

          <div class="verify-code-section">
            <div class="verify-input">
              <div class="input-boxes">
                <input
                  v-for="(digit, index) in 6"
                  :key="index"
                  :ref="`googleAuthInput${index}`"
                  v-model="googleAuthCode[index]"
                  type="text"
                  maxlength="1"
                  class="code-input"
                  @input="handleGoogleAuthInput($event, index)"
                  @keydown="handleGoogleAuthKeydown($event, index)"
                />
              </div>
              <p class="input-tip">Please enter the 6-digit code from Google Authenticator</p>
            </div>
          </div>
        </div>

        <div v-else class="unbind-google-auth">
          <p class="tip-text">Are you sure you want to unbind Google Authenticator? This will reduce your account security.</p>

          <div class="verify-code-section">
            <div class="verify-input">
              <div class="input-boxes">
                <input
                  v-for="(digit, index) in 6"
                  :key="index"
                  :ref="`googleAuthInput${index}`"
                  v-model="googleAuthCode[index]"
                  type="text"
                  maxlength="1"
                  class="code-input"
                  @input="handleGoogleAuthInput($event, index)"
                  @keydown="handleGoogleAuthKeydown($event, index)"
                />
              </div>
              <p class="input-tip">Please enter the 6-digit code from Google Authenticator to confirm unbinding</p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 设置/修改支付密码弹窗 -->
    <a-modal
      :title="paymentPasswordModalTitle"
      :visible="paymentPasswordModalVisible"
      @ok="handlePaymentPasswordOk"
      @cancel="handlePaymentPasswordCancel"
      :confirmLoading="paymentPasswordLoading"
      width="600px"
    >
      <a-form :form="paymentPasswordForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <!-- <a-form-item v-if="bindingSettings.paymentPassword !== 'Not set'" label="Current Password">
          <a-input-password
            v-decorator="['currentPaymentPassword', { rules: [{ required: true, message: 'Please input current payment password' }] }]"
            placeholder="Please input current payment password"
            maxlength="6"
          />
        </a-form-item> -->

        <a-form-item :label="bindingSettings.paymentPassword !== 'Not set' ? 'New Password' : 'Payment Password'">
          <a-input-password
            v-decorator="['newPaymentPassword', {
              rules: [
                { validator: this.validatePaymentPassword }
              ]
            }]"
            placeholder="Please input 6-digit payment password (numbers, letters, symbols)"
            maxlength="6"
          />
        </a-form-item>

        <a-form-item label="Confirm Password">
          <a-input-password
            v-decorator="['confirmPaymentPassword', {
              rules: [
                { required: true, message: 'Please confirm payment password' },
                { validator: this.validateConfirmPaymentPassword }
              ]
            }]"
            placeholder="Please confirm payment password"
            maxlength="6"
          />
        </a-form-item>

        <a-form-item label="Email Code">
          <a-row :gutter="8">
            <a-col :span="14">
              <a-input
                v-decorator="['paymentPasswordEmailCode', { rules: [{ required: true, message: 'Please input email verification code' }] }]"
                placeholder="Please input email verification code"
              />
            </a-col>
            <a-col :span="10">
              <a-button @click="handleSendPaymentPasswordEmailCode" :disabled="paymentPasswordEmailCodeCountdown > 0">
                {{ paymentPasswordEmailCodeCountdown > 0 ? `${paymentPasswordEmailCodeCountdown}s` : 'Send Code' }}
              </a-button>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import VueQr from 'vue-qr'

export default {
  name: 'SecuritySettings',
  components: {
    'vue-qr': VueQr
  },
  data () {
    return {
      loading: true, // 添加加载状态

      // 账户信息
      accountInfo: {
        accountId: '',
        accountName: '',
        registrationTime: '',
        lastLogin: '',
        accountRole: '',
        accountStatus: '',
        country: '',
        language: ''
      },

      // 原始用户数据
      userInfo: null,

      // 设备信息表格列
      deviceColumns: [
        {
          title: 'Device',
          dataIndex: 'device',
          scopedSlots: { customRender: 'device' },
          width: '35%'
        },
        {
          title: 'Last Login Time',
          dataIndex: 'lastLoginTime',
          scopedSlots: { customRender: 'lastLoginTime' },
          width: '30%'
        },
        {
          title: 'Login Location',
          dataIndex: 'location',
          scopedSlots: { customRender: 'location' },
          width: '35%'
        }
      ],

      // 设备信息数据 - 根据最后登录信息构建
      deviceData: [],

      // 绑定设置
      bindingSettings: {
        email: '',
        phoneNumber: 'Not bound',
        googleAuthenticator: false,
        paymentPassword: 'Not set'
      },

      // 弹窗状态
      editAccountNameVisible: false,
      editAccountNameLoading: false,
      editEmailVisible: false,
      editEmailLoading: false,
      phoneModalVisible: false,
      phoneModalLoading: false,
      phoneModalTitle: 'Bind Phone Number',
      googleAuthModalVisible: false,
      googleAuthLoading: false,
      googleAuthModalTitle: 'Bind Google Authenticator',
      paymentPasswordModalVisible: false,
      paymentPasswordLoading: false,
      paymentPasswordModalTitle: 'Set Payment Password',

      // Google验证器相关
      googleAuthSecret: '',
      qrCodeUrl: '',
      googleAuthCode: ['', '', '', '', '', ''],
      isGoogleAuthComplete: false,

      // 验证码倒计时
      currentEmailCodeCountdown: 0,
      currentEmailCodeTimer: null,
      newEmailCodeCountdown: 0,
      newEmailCodeTimer: null,
      currentPhoneCodeCountdown: 0,
      currentPhoneCodeTimer: null,
      newPhoneCodeCountdown: 0,
      newPhoneCodeTimer: null,
      paymentPasswordEmailCodeCountdown: 0,
      paymentPasswordEmailCodeTimer: null,

      // 表单
      accountNameForm: this.$form.createForm(this),
      emailForm: this.$form.createForm(this),
      phoneForm: this.$form.createForm(this),
      paymentPasswordForm: this.$form.createForm(this)
    }
  },

  computed: {
    isGoogleAuthCodeComplete () {
      return this.googleAuthCode.every(digit => digit !== '')
    }
  },

  beforeDestroy () {
    // 清理所有定时器
    this.clearAllTimers()
  },

  methods: {
    // 获取用户信息
    // 获取用户信息
async fetchUserInfo () {
  try {
    this.loading = true
    const response = await request({
      url: '/merchant/v2/info',
      method: 'get'
    })

    if (response.code === 200) {
      // 找到主商户（有user字段的商户）
      const mainMerchant = response.data.find(merchant =>
        merchant.user !== null && merchant.user !== undefined
      )

      if (mainMerchant) {
        this.userInfo = mainMerchant
        this.mapUserInfoToPage(mainMerchant)
      } else {
        // 如果没有找到主商户，fallback到第0个或显示错误
        // console.warn('No main merchant found, using first merchant as fallback')
        // if (response.data && response.data.length > 0) {
        //   this.userInfo = response.data[0]
        //   this.mapUserInfoToPage(response.data[0])
        // } else {
        //   this.$message.error('No merchant information available')
        // }
      }
    } else {
      this.$message.error(response.message || 'Failed to load user information')
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    this.$message.error('Failed to load user information')
  } finally {
    this.loading = false
  }
},

    // 将API数据映射到页面显示
    mapUserInfoToPage (data) {
      // 映射账户信息
      this.accountInfo = {
        accountId: data.merchant_no || data.merchant_id?.toString() || '',
        accountName: data.merchant_name || data.username || '',
        registrationTime: '', // API中没有注册时间
        lastLogin: data.last_login_at || '',
        accountRole: this.getMerchantRole(data.merchant_type, data.user_type),
        accountStatus: this.getMerchantStatus(data.merchant_status, data.user_status),
        country: this.getCountryName(data.country_code),
        language: this.getLanguageName(data.language)
      }

      // 映射绑定设置
      this.bindingSettings = {
        email: data.memail || data.user.email || '',
        phoneNumber: this.formatPhoneNumber(data.phone_code, data.phone),
        googleAuthenticator: data.user.is_2fa_enabled === 1,
        paymentPassword: data.is_set_password ? '******' : 'Not set'
      }

      // 构建设备登录信息
      this.buildDeviceData(data)
    },

    // 构建设备登录数据
    buildDeviceData (data) {
      this.deviceData = []

      if (data.last_login_at && data.last_login_ip) {
        // 根据IP推测设备类型和位置
        const device = this.guessDeviceFromIP(data.last_login_ip)
        const location = this.guessLocationFromCountry(data.country_code)

        this.deviceData.push({
          device: device,
          lastLoginTime: this.formatDate(data.last_login_at),
          location: location
        })
      }

      // 如果只有一条记录，可以添加一些模拟的历史记录
      if (this.deviceData.length === 1) {
        const baseDevice = this.deviceData[0]
        // 添加一些历史登录记录
        this.deviceData.push({
          device: 'Chrome, Mac OS X',
          lastLoginTime: this.formatDateBefore(data.last_login_at, 7),
          location: baseDevice.location
        })
        this.deviceData.push({
          device: 'Safari, iPhone',
          lastLoginTime: this.formatDateBefore(data.last_login_at, 15),
          location: baseDevice.location
        })
      }
    },

    // 根据商户类型获取角色描述
    getMerchantRole (merchantType, userType) {
      const roleMap = {
        1: 'Super Administrator',
        2: 'Administrator',
        3: 'Operator',
        4: 'Viewer'
      }
      return roleMap[merchantType] || roleMap[userType] || 'User'
    },

    // 获取账户状态
    getMerchantStatus (merchantStatus, userStatus) {
      if (merchantStatus === 1 && userStatus === 1) {
        return 'Normal'
      } else if (merchantStatus === 0 || userStatus === 0) {
        return 'Suspended'
      } else {
        return 'Inactive'
      }
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colorMap = {
        'Normal': 'green',
        'Suspended': 'orange',
        'Inactive': 'red'
      }
      return colorMap[status] || 'default'
    },

    // 获取国家名称
    getCountryName (countryCode) {
      const countryMap = {
        'SG': 'Singapore',
        'US': 'United States',
        'CN': 'China',
        'HK': 'Hong Kong',
        'JP': 'Japan',
        'KR': 'South Korea',
        'TH': 'Thailand',
        'MY': 'Malaysia',
        'ID': 'Indonesia',
        'PH': 'Philippines'
      }
      return countryMap[countryCode] || countryCode
    },

    // 获取语言名称
    getLanguageName (languageCode) {
      const languageMap = {
        'us': 'English',
        'cn': '中文',
        'ja': '日本語',
        'ko': '한국어',
        'th': 'ไทย'
      }
      return languageMap[languageCode] || languageCode
    },

    // 格式化手机号
    formatPhoneNumber (phoneCode, phone) {
      if (!phone) {
        return 'Not bound'
      }
      if (phoneCode) {
        return `+${phoneCode} ${phone}`
      }
      return phone
    },

    // 格式化日期
    formatDate (dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    // 生成之前的日期
    formatDateBefore (dateString, daysBefore) {
      if (!dateString) return ''
      const date = new Date(dateString)
      date.setDate(date.getDate() - daysBefore)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    // 根据IP猜测设备
    guessDeviceFromIP (ip) {
      // 这里可以根据实际情况调整
      if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return 'Chrome, Mac OS X 10.15.7'
      }
      return 'Browser, Unknown OS'
    },

    // 根据国家代码猜测位置
    guessLocationFromCountry (countryCode) {
      const locationMap = {
        'SG': 'Singapore',
        'US': 'United States',
        'CN': 'China',
        'HK': 'Hong Kong',
        'JP': 'Tokyo, Japan',
        'KR': 'Seoul, South Korea'
      }
      return locationMap[countryCode] || 'Unknown Location'
    },

    // 清理所有定时器
    clearAllTimers () {
      if (this.currentEmailCodeTimer) {
        clearInterval(this.currentEmailCodeTimer)
        this.currentEmailCodeTimer = null
      }
      if (this.newEmailCodeTimer) {
        clearInterval(this.newEmailCodeTimer)
        this.newEmailCodeTimer = null
      }
      if (this.currentPhoneCodeTimer) {
        clearInterval(this.currentPhoneCodeTimer)
        this.currentPhoneCodeTimer = null
      }
      if (this.newPhoneCodeTimer) {
        clearInterval(this.newPhoneCodeTimer)
        this.newPhoneCodeTimer = null
      }
      if (this.paymentPasswordEmailCodeTimer) {
        clearInterval(this.paymentPasswordEmailCodeTimer)
        this.paymentPasswordEmailCodeTimer = null
      }
    },

    // 编辑账户名
    handleEditAccountName () {
      this.editAccountNameVisible = true
      this.$nextTick(() => {
        this.accountNameForm.setFieldsValue({
          accountName: this.accountInfo.accountName
        })
      })
    },

    handleAccountNameOk () {
      this.accountNameForm.validateFields((err, values) => {
        if (!err) {
          this.editAccountNameLoading = true
          setTimeout(() => {
            this.accountInfo.accountName = values.accountName
            this.editAccountNameVisible = false
            this.editAccountNameLoading = false
            this.$message.success('Account name updated successfully')
          }, 1000)
        }
      })
    },

    handleAccountNameCancel () {
      this.editAccountNameVisible = false
      this.accountNameForm.resetFields()
    },

    // 编辑邮箱
    handleEditEmail () {
      this.editEmailVisible = true
      this.emailForm.resetFields()
    },

    handleEditEmailOk () {
      this.emailForm.validateFields((err, values) => {
        if (!err) {
          this.editEmailLoading = true
          setTimeout(() => {
            this.bindingSettings.email = values.newEmail
            this.accountInfo.accountName = values.newEmail
            this.editEmailVisible = false
            this.editEmailLoading = false
            this.$message.success('Email address updated successfully')
          }, 1000)
        }
      })
    },

    handleEditEmailCancel () {
      this.editEmailVisible = false
      this.emailForm.resetFields()
      this.clearEmailTimers()
    },

    // 发送当前邮箱验证码
    handleSendCurrentEmailCode () {
      this.startCurrentEmailCodeCountdown()
      this.$message.success(`Verification code sent to ${this.bindingSettings.email}`)
    },

    // 发送新邮箱验证码
    handleSendNewEmailCode () {
      const newEmail = this.emailForm.getFieldValue('newEmail')
      if (!newEmail) {
        this.$message.error('Please input new email address first')
        return
      }

      this.startNewEmailCodeCountdown()
      this.$message.success(`Verification code sent to ${newEmail}`)
    },

    startCurrentEmailCodeCountdown () {
      this.currentEmailCodeCountdown = 60
      this.currentEmailCodeTimer = setInterval(() => {
        this.currentEmailCodeCountdown--
        if (this.currentEmailCodeCountdown <= 0) {
          clearInterval(this.currentEmailCodeTimer)
        }
      }, 1000)
    },

    startNewEmailCodeCountdown () {
      this.newEmailCodeCountdown = 60
      this.newEmailCodeTimer = setInterval(() => {
        this.newEmailCodeCountdown--
        if (this.newEmailCodeCountdown <= 0) {
          clearInterval(this.newEmailCodeTimer)
        }
      }, 1000)
    },

    clearEmailTimers () {
      if (this.currentEmailCodeTimer) {
        clearInterval(this.currentEmailCodeTimer)
        this.currentEmailCodeCountdown = 0
      }
      if (this.newEmailCodeTimer) {
        clearInterval(this.newEmailCodeTimer)
        this.newEmailCodeCountdown = 0
      }
    },

    // 绑定/修改手机号
    handleBindPhone () {
      if (this.bindingSettings.phoneNumber !== 'Not bound') {
        this.phoneModalTitle = 'Change Phone Number'
      } else {
        this.phoneModalTitle = 'Bind Phone Number'
      }
      this.phoneModalVisible = true
      this.phoneForm.resetFields()
    },

    handlePhoneModalOk () {
      this.phoneForm.validateFields((err, values) => {
        if (!err) {
          this.phoneModalLoading = true
          setTimeout(() => {
            this.bindingSettings.phoneNumber = values.phoneNumber
            this.phoneModalVisible = false
            this.phoneModalLoading = false
            if (this.phoneModalTitle.includes('Change')) {
              this.$message.success('Phone number updated successfully')
            } else {
              this.$message.success('Phone number bound successfully')
            }
          }, 1000)
        }
      })
    },

    handlePhoneModalCancel () {
      this.phoneModalVisible = false
      this.phoneForm.resetFields()
      this.clearPhoneTimers()
    },

    // 发送当前手机号验证码
    handleSendCurrentPhoneCode () {
      this.startCurrentPhoneCodeCountdown()
      this.$message.success(`Verification code sent to ${this.bindingSettings.phoneNumber}`)
    },

    // 发送新手机号验证码
    handleSendNewPhoneCode () {
      const phoneNumber = this.phoneForm.getFieldValue('phoneNumber')
      if (!phoneNumber) {
        this.$message.error('Please input phone number first')
        return
      }

      this.startNewPhoneCodeCountdown()
      this.$message.success(`Verification code sent to ${phoneNumber}`)
    },

    startCurrentPhoneCodeCountdown () {
      this.currentPhoneCodeCountdown = 60
      this.currentPhoneCodeTimer = setInterval(() => {
        this.currentPhoneCodeCountdown--
        if (this.currentPhoneCodeCountdown <= 0) {
          clearInterval(this.currentPhoneCodeTimer)
        }
      }, 1000)
    },

    startNewPhoneCodeCountdown () {
      this.newPhoneCodeCountdown = 60
      this.newPhoneCodeTimer = setInterval(() => {
        this.newPhoneCodeCountdown--
        if (this.newPhoneCodeCountdown <= 0) {
          clearInterval(this.newPhoneCodeTimer)
        }
      }, 1000)
    },

    clearPhoneTimers () {
      if (this.currentPhoneCodeTimer) {
        clearInterval(this.currentPhoneCodeTimer)
        this.currentPhoneCodeCountdown = 0
      }
      if (this.newPhoneCodeTimer) {
        clearInterval(this.newPhoneCodeTimer)
        this.newPhoneCodeCountdown = 0
      }
    },

    // Google验证器绑定/解绑
    async handleBindGoogleAuth () {
      if (this.bindingSettings.googleAuthenticator) {
        this.googleAuthModalTitle = 'Unbind Google Authenticator'
        this.googleAuthModalVisible = true
        this.googleAuthCode = ['', '', '', '', '', '']
      } else {
        this.googleAuthModalTitle = 'Bind Google Authenticator'
        // 获取二维码和secret
        await this.getGoogleAuthSecret()
        this.googleAuthModalVisible = true
        this.googleAuthCode = ['', '', '', '', '', '']
      }
    },

    async handleGoogleAuthOk () {
      if (!this.isGoogleAuthCodeComplete) {
        this.$message.error('Please enter complete verification code')
        return
      }

      this.googleAuthLoading = true
      const code = this.googleAuthCode.join('')

      try {
        if (this.bindingSettings.googleAuthenticator) {
          // 解绑逻辑 - 这里可以调用解绑接口
          await this.unbindGoogleAuth(code)
        } else {
          // 绑定逻辑
          await this.bindGoogleAuth(code)
        }
      } catch (error) {
        this.$message.error(error.message || 'Operation failed')
        this.googleAuthCode = ['', '', '', '', '', '']
        // 清空输入框的值
        this.$nextTick(() => {
          for (let i = 0; i < 6; i++) {
            const input = this.$refs[`googleAuthInput${i}`]
            if (input && input[0]) {
              input[0].value = ''
            }
          }
          // 聚焦第一个输入框
          const firstInput = this.$refs[`googleAuthInput0`]
          if (firstInput && firstInput[0]) {
            firstInput[0].focus()
          }
        })
      } finally {
        this.googleAuthLoading = false
      }
    },

    handleGoogleAuthCancel () {
      this.googleAuthModalVisible = false
      this.googleAuthCode = ['', '', '', '', '', '']
      // 清空输入框的值
      this.$nextTick(() => {
        for (let i = 0; i < 6; i++) {
          const input = this.$refs[`googleAuthInput${i}`]
          if (input && input[0]) {
            input[0].value = ''
          }
        }
      })
    },

    // Google验证码输入处理
    handleGoogleAuthInput (event, index) {
      const value = event.target.value

      // 只允许数字
      if (!/^\d*$/.test(value)) {
        this.googleAuthCode[index] = ''
        event.target.value = ''
        return
      }

      this.googleAuthCode[index] = value
      this.$forceUpdate()

      // 自动跳转到下一个输入框
      if (value && index < 5) {
        const nextInput = this.$refs[`googleAuthInput${index + 1}`]
        if (nextInput && nextInput[0]) {
          nextInput[0].focus()
        }
      }
    },

    handleGoogleAuthKeydown (event, index) {
      if (event.key === 'Backspace') {
        if (!this.googleAuthCode[index] && index > 0) {
          // 回退到上一个输入框
          const prevInput = this.$refs[`googleAuthInput${index - 1}`]
          if (prevInput && prevInput[0]) {
            prevInput[0].focus()
          }
        } else {
          // 清空当前框
          this.googleAuthCode[index] = ''
          event.target.value = ''
        }
      }
    },

    // 支付密码设置/修改
    handleChangePaymentPassword () {
      if (this.bindingSettings.paymentPassword !== 'Not set') {
        this.paymentPasswordModalTitle = 'Change Payment Password'
      } else {
        this.paymentPasswordModalTitle = 'Set Payment Password'
      }
      this.paymentPasswordModalVisible = true
      this.paymentPasswordForm.resetFields()
    },

    async handlePaymentPasswordOk () {
      this.paymentPasswordForm.validateFields(async (err, values) => {
        if (err) return

        this.paymentPasswordLoading = true

        try {
          const isUpdate = this.bindingSettings.paymentPassword !== 'Not set'
          const url = isUpdate
            ? '/merchant/operation/password/update'
            : '/merchant/operation/password'

          const data = isUpdate ? {
            current_password: values.currentPaymentPassword,
            new_password: values.newPaymentPassword,
            new_password_confirmation: values.confirmPaymentPassword,
            code: values.paymentPasswordEmailCode
          } : {
            operation_password: values.newPaymentPassword,
            operation_password_confirmation: values.confirmPaymentPassword,
            code: values.paymentPasswordEmailCode
          }

          const res = await request({
            url: url,
            method: 'post',
            data: data
          })

          if (res.code === 200) {
            this.bindingSettings.paymentPassword = '******'
            this.paymentPasswordModalVisible = false

            this.$message.success(
              isUpdate
                ? 'Payment password changed successfully'
                : 'Payment password set successfully'
            )

            // 刷新用户信息
            if (this.$store && this.$store.dispatch) {
              this.$store.dispatch('d2admin/account/refresh')
            }
          } else {
            throw new Error(res.message || 'Operation failed')
          }
        } catch (error) {
          this.$message.error(error.message || 'Operation failed')
        } finally {
          this.paymentPasswordLoading = false
        }
      })
    },

    handlePaymentPasswordCancel () {
      this.paymentPasswordModalVisible = false
      this.paymentPasswordForm.resetFields()
      // 清理验证码倒计时
      if (this.paymentPasswordEmailCodeTimer) {
        clearInterval(this.paymentPasswordEmailCodeTimer)
        this.paymentPasswordEmailCodeTimer = null
        this.paymentPasswordEmailCodeCountdown = 0
      }
    },

    // 发送支付密码邮箱验证码
    async handleSendPaymentPasswordEmailCode () {
  // 先检查是否正在倒计时
  if (this.paymentPasswordEmailCodeCountdown > 0 || this.paymentPasswordEmailCodeTimer) {
    return
  }

  try {
    const isUpdate = this.bindingSettings.paymentPassword !== 'Not set'
    const res = await request({
      url: '/merchant/payment/password/code',
      method: 'post',
      data: {
        type: isUpdate ? 'update' : 'create'
      }
    })

    if (res.code === 200) {
      this.$message.success(`Verification code sent to ${this.bindingSettings.email}`)
      // 接口调用成功后才开始倒计时
      this.startPaymentPasswordEmailCodeCountdown()
    } else {
      throw new Error(res.message)
    }
  } catch (error) {
    this.$message.error(error.message || 'Failed to send verification code')
  }
},

    startPaymentPasswordEmailCodeCountdown () {
      // 先清除已存在的定时器，防止多个定时器同时运行
      if (this.paymentPasswordEmailCodeTimer) {
        clearInterval(this.paymentPasswordEmailCodeTimer)
        this.paymentPasswordEmailCodeTimer = null
      }

      this.paymentPasswordEmailCodeCountdown = 60
      this.paymentPasswordEmailCodeTimer = setInterval(() => {
        this.paymentPasswordEmailCodeCountdown--
        if (this.paymentPasswordEmailCodeCountdown <= 0) {
          clearInterval(this.paymentPasswordEmailCodeTimer)
          this.paymentPasswordEmailCodeTimer = null
        }
      }, 1000)
    },

    // 确认支付密码验证
    validateConfirmPaymentPassword (rule, value, callback) {
      const newPassword = this.paymentPasswordForm.getFieldValue('newPaymentPassword')
      if (value && value !== newPassword) {
        callback(new Error('Passwords do not match'))
      } else {
        callback()
      }
    },

    // 支付密码格式验证
    validatePaymentPassword (rule, value, callback) {
      if (!value) {
        callback(new Error('Please input payment password'))
        return
      }

      if (value.length !== 6) {
        callback(new Error('Payment password must be exactly 6 characters'))
        return
      }

      // 检查是否包含有效字符（数字、字母、符号）
      const validPattern = /^[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
      if (!validPattern.test(value)) {
        callback(new Error('Password can only contain numbers, letters, and symbols'))
        return
      }

      callback()
    },

    // Google验证器相关API调用
    async getGoogleAuthSecret () {
      if (this.googleAuthSecret && !this.bindingSettings.googleAuthenticator) {
        return
      }

      if (this.bindingSettings.googleAuthenticator) {
        return
      }

      try {
        const res = await request({
          url: '/merchant/2fa/secret',
          method: 'GET'
        })

        console.log('Google Auth Secret Response:', res) // 调试信息

        if (res.code === 200) {
          this.googleAuthSecret = res.data.secret || ''
          this.qrCodeUrl = res.data.qr_code_url || ''
          console.log('QR Code URL:', this.qrCodeUrl) // 调试信息
        } else {
          throw new Error(res.message)
        }
      } catch (error) {
        console.error('Failed to get Google Auth secret:', error)
        this.$message.error(error.message || 'Failed to get QR code')
      }
    },

    async bindGoogleAuth (code) {
      const res = await request({
        url: '/merchant/2fa/bind',
        method: 'post',
        data: {
          secret: this.googleAuthSecret,
          code: code
        }
      })

      if (res.code === 200) {
        this.bindingSettings.googleAuthenticator = true
        this.googleAuthModalVisible = false
        this.$message.success('Google Authenticator bound successfully')

        // 刷新用户信息
        if (this.$store && this.$store.dispatch) {
          this.$store.dispatch('d2admin/account/refresh')
        }
      } else {
        throw new Error(res.message || 'Binding failed')
      }
    },

    async unbindGoogleAuth (code) {
      // 解绑接口 - 根据实际API调整
      const res = await request({
        url: '/merchant/2fa/unbind',
        method: 'post',
        data: {
          code: code
        }
      })

      if (res.code === 200) {
        this.bindingSettings.googleAuthenticator = false
        this.googleAuthModalVisible = false
        this.$message.success('Google Authenticator unbound successfully')

        // 刷新用户信息
        if (this.$store && this.$store.dispatch) {
          this.$store.dispatch('d2admin/account/refresh')
        }
      } else {
        throw new Error(res.message || 'Unbinding failed')
      }
    }
  },

  // 组件创建时获取数据
  async created () {
    await this.fetchUserInfo()
    // 如果用户未绑定Google验证器，获取secret
    if (!this.bindingSettings.googleAuthenticator) {
      this.getGoogleAuthSecret()
    }
  }
}
</script>

<style scoped>
.security-settings {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.security-settings > * {
  width: 100%;
  max-width: 850px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.loading-container p {
  margin-top: 16px;
  font-size: 14px;
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

.section-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  color: #262626;
  font-weight: 600;
}

/* 账户信息样式 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 0;
}

.info-item .label {
  width: 160px;
  color: #8c8c8c;
  font-size: 14px;
  flex-shrink: 0;
}

.info-item .value {
  color: #262626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  color: #11253E;
  cursor: pointer;
  font-size: 12px;
}

.edit-icon:hover {
  color: #40a9ff;
}

/* 设备表格样式 */
.device-table {
  border-radius: 6px;
}

.device-table .ant-table-thead > tr > th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  color: #8c8c8c;
  font-weight: 500;
  font-size: 14px;
  padding: 16px;
}

.device-table .ant-table-tbody > tr > td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.device-name {
  color: #262626;
  font-size: 14px;
}

.login-time {
  color: #262626;
  font-size: 14px;
}

.location {
  color: #262626;
  font-size: 14px;
}

/* 绑定设置样式 */
.binding-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.binding-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.binding-item:last-child {
  border-bottom: none;
}

.binding-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
  margin-right: 16px;
  flex-shrink: 0;
}

.binding-icon .anticon {
  font-size: 18px;
  color: #8c8c8c;
}

.binding-content {
  flex: 1;
}

.binding-title {
  font-size: 16px;
  color: #262626;
  font-weight: 500;
  margin-bottom: 4px;
}

.binding-desc {
  font-size: 14px;
  color: #8c8c8c;
}

.binding-action {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.binding-value {
  color: #262626;
  font-size: 14px;
}

.binding-value.not-bound {
  color: #8c8c8c;
}

.arrow-icon {
  color: #8c8c8c;
  cursor: pointer;
  font-size: 12px;
}

.arrow-icon:hover {
  color: #11253E;
}

/* Google验证器弹窗样式 */
.google-auth-content {
  text-align: center;
  padding: 20px 0;
}

.tip-text {
  color: #262626;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.qr-code-section {
  margin-bottom: 24px;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-image {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-code-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  margin-bottom: 16px;
}

.qr-code-placeholder p {
  margin: 16px 0 0 0;
  color: #8c8c8c;
  font-size: 14px;
}

.secret-key-section {
  text-align: center;
  margin-top: 16px;
}

.secret-label {
  color: #8c8c8c;
  font-size: 12px;
  margin-bottom: 4px;
}

.secret-key {
  color: #11253E;
  font-family: monospace;
  font-size: 14px;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  word-break: break-all;
  max-width: 300px;
  margin: 0 auto;
}

.verify-code-section {
  margin-top: 24px;
}

.input-boxes {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.code-input {
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.3s;
}

.code-input:focus {
  border-color: #11253E;
  box-shadow: 0 0 0 2px rgba(17, 37, 62, 0.2);
}

.code-input:hover {
  border-color: #11253E;
}

.input-tip {
  color: #8c8c8c;
  font-size: 12px;
  margin: 8px 0 0 0;
}

/* 标签样式 */
.ant-tag {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 8px;
}

/* 表单样式 */
.ant-form-item-label > label {
  color: #262626;
  font-weight: 500;
}

.ant-input,
.ant-input-password {
  border-radius: 6px;
}

.ant-btn {
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .security-settings {
    padding: 16px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-item .label {
    width: auto;
  }

  .binding-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .binding-action {
    width: 100%;
    justify-content: space-between;
  }

  .input-boxes {
    gap: 4px;
  }

  .code-input {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>
