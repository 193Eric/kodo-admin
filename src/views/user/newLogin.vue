<template>
  <div class="login-container">
    <!-- 左侧图片区域 -->
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">
          <span class="brand-icon"><img style="width:150px" src="@/assets/login-left-logo.png"></span>
        </div>
      </div>
      <div class="background-shapes">
        <!-- 装饰性形状 -->
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="login-right">
      <div class="login-form-container">
        <!-- 步骤1: 邮箱输入 -->
        <div v-if="currentStep === 1" class="login-header">
          <h1 class="login-title">Welcome to KODO</h1>
        </div>

        <!-- 步骤2: 密码输入 -->
        <div v-if="currentStep === 2" class="login-header">
          <h1 class="login-title">Enter your password</h1>
          <p class="user-email">{{ userEmail }}</p>
        </div>

        <a-form
          :form="form"
          @submit="handleSubmit"
          class="login-form"
        >
          <!-- 步骤1: 邮箱/手机号输入 -->
          <div v-if="currentStep === 1" class="form-group">
            <label class="form-label">Phone number/Email</label>
            <a-form-item>
              <a-input
                v-decorator="[
                  'username',
                  {
                    rules: [
                      { required: true, message: 'Please input your phone number or email!' },
                      { type: 'email', message: 'Please input a valid email!' }
                    ]
                  }
                ]"
                size="large"
                placeholder="Phone number/Email(without country code)"
                class="login-input"
                @blur="handleEmailBlur"
              />
            </a-form-item>
          </div>

          <!-- 步骤2: 密码输入 -->
          <div v-if="currentStep === 2" class="form-group">
            <label class="form-label">Password</label>
            <a-form-item>
              <div class="password-input-wrapper">
                <a-input
                  v-decorator="[
                    'password',
                    {
                      rules: [
                        { required: true, message: 'Please input your password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                      ]
                    }
                  ]"
                  :type="showPassword ? 'text' : 'password'"
                  size="large"
                  placeholder="Enter your password"
                  class="login-input password-input"
                  v-model="passwordValue"
                />
                <div class="password-actions">
                  <!-- 清除按钮 -->
                  <a-icon
                    v-if="passwordValue"
                    type="close-circle"
                    class="password-action-icon clear-icon"
                    @click="clearPassword"
                  />
                  <!-- 显示/隐藏密码按钮 -->
                  <a-icon
                    :type="showPassword ? 'eye-invisible' : 'eye'"
                    class="password-action-icon toggle-icon"
                    @click="togglePasswordVisibility"
                  />
                </div>
              </div>
            </a-form-item>
          </div>

          <!-- 步骤2: 谷歌验证码输入（如果需要的话） -->
          <div v-if="currentStep === 2 && needGoogleAuth" class="form-group">
            <label class="form-label">Google Authenticator Code</label>
            <a-form-item>
              <a-input
                v-decorator="[
                  'googleCode',
                  {
                    rules: [
                      { required: true, message: 'Please input your Google Authenticator code!' },
                      { pattern: /^\d{6}$/, message: 'Google code must be 6 digits!' }
                    ]
                  }
                ]"
                size="large"
                placeholder="Enter 6-digit code"
                class="login-input"
                maxlength="6"
              />
            </a-form-item>
          </div>

          <a-form-item class="login-button-item">
            <a-button
              type="primary"
              htmlType="submit"
              size="large"
              block
              class="login-button"
              :loading="loading"
            >
              {{ currentStep === 1 ? 'Next' : 'Login' }}
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 步骤2: 忘记密码链接 -->
        <div v-if="currentStep === 2" class="forgot-password">
          <a href="#" class="forgot-password-link" @click="handleForgotPassword">
            Forgot password?
          </a>
        </div>

        <!-- 步骤1: 注册链接 -->
        <div v-if="currentStep === 1" class="login-footer">
          <span class="footer-text">Already have an account? </span>
          <a href="#" class="sign-up-link" @click="goToSignUp">Sign up</a>
        </div>

        <!-- 语言选择 -->
        <div class="language-selector">
          <a-icon type="global" />
          <span>English</span>
        </div>

        <!-- 返回按钮（步骤2时显示） -->
        <div v-if="currentStep === 2" class="back-button">
          <a-button
            type="link"
            @click="goBackToStep1"
            class="back-link"
          >
            <a-icon type="left" />
            Back
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import { timeFix } from '@/utils/util'

export default {
  name: 'LoginPage',
  data () {
    return {
      loading: false,
      currentStep: 1, // 1: 邮箱输入, 2: 密码输入
      userEmail: '',
      showPassword: false,
      passwordValue: '',
      needGoogleAuth: false, // 是否需要谷歌验证码
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      isLoginError: false,
      errorMessage: ''
    }
  },

  computed: {
    maskedEmail () {
      if (!this.userEmail) return ''
      if (this.loginType === 0) { // email
        const [local, domain] = this.userEmail.split('@')
        if (local && domain) {
          const maskedLocal = local.substring(0, Math.min(4, local.length)) + '****'
          return `${maskedLocal}@${domain}`
        }
      }
      // 如果是手机号或用户名，直接显示前几位+****
      return this.userEmail.substring(0, 4) + '****'
    }
  },

  beforeCreate () {
    this.form = this.$form.createForm(this)
  },

  methods: {
    // 验证用户名或邮箱类型
    handleUsernameOrEmail (rule, value, callback) {
      const emailRegex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      const phoneRegex = /^1[34578]\d{9}$/

      if (emailRegex.test(value)) {
        this.loginType = 0 // email
      } else if (phoneRegex.test(value)) {
        this.loginType = 2 // telephone
      } else {
        this.loginType = 1 // username
      }
      callback()
    },

    // 检查是否需要谷歌验证码
    async checkGoogleAuth (email) {
      try {
        const res = await request({
          url: '/merchant/2fa/status',
          method: 'GET',
          params: {
            email: email
          }
        })

        if (res.code === 200) {
          this.needGoogleAuth = res.data.is_enabled || false
          console.log('Google Auth required:', this.needGoogleAuth)
        }
      } catch (error) {
        this.needGoogleAuth = false
        console.error('检查谷歌验证失败:', error)
      }
    },

    // 邮箱输入框失焦时检查谷歌验证
    async handleEmailBlur (e) {
      const email = e.target.value
      if (!email) return

      // 验证email格式
      const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (emailReg.test(email)) {
        await this.checkGoogleAuth(email)
      }
    },

    handleForgotPassword () {},

    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (!err) {
          this.loading = true
          this.isLoginError = false

          if (this.currentStep === 1) {
            // 第一步：验证邮箱/手机号，检查是否需要谷歌验证，然后进入密码输入步骤
            console.log('Step 1 - Email/Phone: ', values.username)
            this.userEmail = values.username

            // 检查是否需要谷歌验证码
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (emailReg.test(values.username)) {
              await this.checkGoogleAuth(values.username)
            }

            setTimeout(() => {
              this.loading = false
              this.currentStep = 2
              // 清除表单验证状态，准备下一步
              this.form.resetFields()
            }, 800)
          } else if (this.currentStep === 2) {
            // 第二步：执行真正的登录
            try {
              console.log('Step 2 - Password: ', values.password)
              console.log('User Email: ', this.userEmail)
              console.log('Google Code: ', values.googleCode)
              console.log('Need Google Auth: ', this.needGoogleAuth)
              console.log('Login Type: ', this.loginType)

              // 构建登录参数
              const loginData = {
                email: this.userEmail,
                password: values.password
              }

              // 如果需要谷歌验证码，添加到请求参数中
              if (this.needGoogleAuth && values.googleCode) {
                loginData.totp_code = values.googleCode
              }

              // 调用登录接口
              const res = await request({
                url: '/merchant/login',
                method: 'POST',
                data: loginData
              })

              // 判断登录是否成功 - 根据实际返回格式
              if (res.code === 200) {
                this.loginSuccess(res)
              } else {
                // 登录失败
                this.requestFailed({
                  response: {
                    data: {
                      message: res.message || 'Login failed'
                    }
                  }
                })
                this.loading = false
              }
            } catch (error) {
              this.loading = false
              this.requestFailed(error)
            }
          }
        } else {
          setTimeout(() => {
            this.loading = false
          }, 600)
        }
      })
    },

    async loginSuccess (res) {
      console.log('Login success:', res)

      // 保存token
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('Access-Token', res.data.token)
      }

      // 保存用户信息
        if (res.data.user) {
          localStorage.setItem('userInfo', JSON.stringify(res.data.user))
        }

      // 跳转到首页
      this.$router.push({ path: '/overview' })

      // 延迟显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: 'Welcome',
          description: `welcome back!`
        })
      }, 1000)

      this.isLoginError = false
    },

    requestFailed (err) {
      console.error('Login failed:', err)
      this.isLoginError = true
      this.errorMessage = ((err.response || {}).data || {}).message || 'Login failed, please try again'

      this.$notification['error']({
        message: 'Error',
        description: this.errorMessage,
        duration: 4
      })
    },

    goToSignUp () {
      // 跳转到注册页面
      this.$router.push('/user/signup')
    },

    togglePasswordVisibility () {
      this.showPassword = !this.showPassword
    },

    clearPassword () {
      this.passwordValue = ''
      this.form.setFieldsValue({ password: '' })
    },

    goBackToStep1 () {
      this.currentStep = 1
      this.passwordValue = ''
      this.isLoginError = false
      this.errorMessage = ''
      this.needGoogleAuth = false // 重置谷歌验证状态
      this.form.resetFields()
    }
  },

  watch: {
    passwordValue (newVal) {
      // 同步表单值
      this.form.setFieldsValue({ password: newVal })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.login-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: url('./../../assets/Login_page.png') no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;

  .brand-section {
    padding: 40px 50px;
    z-index: 10;
    position: relative;

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .brand-text {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: -0.5px;
      }

      .brand-icon {
        font-size: 24px;
        color: #8b5cf6;
        font-weight: bold;
      }
    }
  }

  .background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.2);
      top: 20%;
      left: -10%;
      animation: float 6s ease-in-out infinite;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.15);
      top: 60%;
      right: -5%;
      animation: float 8s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.1);
      bottom: 10%;
      left: 30%;
      animation: float 10s ease-in-out infinite;
    }
  }
}

.login-right {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;

  .login-form-container {
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .login-title {
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      line-height: 1.2;
    }

    .user-email {
      font-size: 16px;
      color: #9ca3af;
      margin: 8px 0 0 0;
    }
  }

  .login-form {
    .form-group {
      margin-bottom: 24px;

      .form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
    }

    .login-input {
      height: 48px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-size: 16px;

      &:focus,
      &:hover {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
      }

      /deep/ .ant-input {
        border: none;
        box-shadow: none;
        font-size: 16px;

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    // 密码输入框样式
    .password-input-wrapper {
      position: relative;

      .password-input {
        padding-right: 60px;
      }

      .password-actions {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10;

        .password-action-icon {
          font-size: 16px;
          color: #9ca3af;
          cursor: pointer;
          padding: 2px;
          transition: color 0.2s;

          &:hover {
            color: #6b7280;
          }

          &.clear-icon:hover {
            color: #ef4444;
          }
        }
      }
    }

    .login-button-item {
      margin-bottom: 24px;
      margin-top: 32px;

      /deep/ .ant-form-item-control {
        line-height: normal;
      }
    }

    .login-button {
      height: 48px;
      border-radius: 8px;
      background: #1f2937;
      border: none;
      font-size: 16px;
      font-weight: 500;

      &:hover,
      &:focus {
        background: #374151;
      }

      &:active {
        background: #111827;
      }
    }
  }

  .forgot-password {
    text-align: center;
    margin-bottom: 40px;

    .forgot-password-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        color: #2563eb;
        text-decoration: underline;
      }
    }
  }

  .login-footer {
    text-align: center;
    margin-bottom: 40px;

    .footer-text {
      color: #6b7280;
      font-size: 14px;
    }

    .sign-up-link {
      color: #8b5cf6;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        color: #7c3aed;
        text-decoration: underline;
      }
    }
  }

  .language-selector {
    position: absolute;
    bottom: 20px;
    left:0;
    right:0;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #9ca3af;
    font-size: 14px;
    cursor: pointer;

    .anticon {
      font-size: 16px;
    }
  }

  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;

    .back-link {
      color: #6b7280;
      padding: 0;
      height: auto;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover {
        color: #374151;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    min-height: 200px;
    flex: none;

    .brand-section {
      padding: 20px 30px;
    }
  }

  .login-right {
    padding: 20px;

    .login-header .login-title {
      font-size: 24px;
    }

    .back-button {
      top: 10px;
      left: 10px;
    }
  }
}
</style>
