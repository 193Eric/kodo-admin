<template>
  <a-modal
    :visible="visible"
    title=""
    :footer="null"
    :closable="false"
    centered
    width="480px"
    class="verification-modal"
    @cancel="handleCancel"
  >
    <div class="verification-container">
      <!-- 头部 -->
      <div class="modal-header">
        <h2 class="modal-title">Verification</h2>
        <a-button type="text" class="close-button" @click="handleCancel">
          <a-icon type="close" />
        </a-button>
      </div>

      <!-- Trade PIN -->
      <div class="verification-section">
        <div class="section-header">
          <span class="section-title">Trade PIN</span>
          <a class="forgot-link" @click="handleForgotPin">Forgot Trade Pin?</a>
        </div>
        <div class="pin-input-container">
          <div
            v-for="(digit, index) in tradePinInputs"
            :key="`pin-${index}`"
            class="pin-input-item"
            :class="{
              'focused': pinFocusedIndex === index,
              'filled': digit !== ''
            }"
            @click="focusPinInput(index)"
          >
            <!-- 隐藏的真实输入框 -->
            <input
              :ref="`pinInput${index}`"
              v-model="tradePinInputs[index]"
              class="pin-input"
              type="text"
              maxlength="1"
              @input="handlePinInput(index, $event)"
              @keydown="handlePinKeydown(index, $event)"
              @focus="handlePinFocus(index)"
              @blur="handlePinBlur"
              @paste="handlePinPaste"
            />
            <!-- 显示的圆点 -->
            <div class="input-dot" v-if="digit !== ''"></div>
          </div>
        </div>
      </div>

      <!-- Google Authentication Code -->
      <div class="verification-section">
        <div class="section-header">
          <span class="section-title">Google Authentication Code</span>
        </div>
        <div class="pin-input-container">
          <div
            v-for="(digit, index) in googleCodeInputs"
            :key="`google-${index}`"
            class="pin-input-item"
            :class="{
              'focused': googleFocusedIndex === index,
              'filled': digit !== ''
            }"
            @click="focusGoogleInput(index)"
          >
            <!-- 隐藏的真实输入框 -->
            <input
              :ref="`googleInput${index}`"
              v-model="googleCodeInputs[index]"
              class="pin-input"
              type="text"
              maxlength="1"
              @input="handleGoogleInput(index, $event)"
              @keydown="handleGoogleKeydown(index, $event)"
              @focus="handleGoogleFocus(index)"
              @blur="handleGoogleBlur"
              @paste="handleGooglePaste"
            />
            <!-- 显示的圆点 -->
            <div class="input-dot" v-if="digit !== ''"></div>
          </div>
        </div>
      </div>

      <!-- 确认按钮 -->
      <div class="modal-footer">
        <a-button
          type="primary"
          size="large"
          block
          class="confirm-button"
          :loading="loading"
          :disabled="!isFormComplete"
          @click="handleConfirm"
        >
          Confirm
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'VerificationModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tradePinInputs: ['', '', '', '', '', ''],
      googleCodeInputs: ['', '', '', '', '', ''],
      pinFocusedIndex: -1,
      googleFocusedIndex: -1
    }
  },
  computed: {
    tradePin () {
      return this.tradePinInputs.join('')
    },
    googleCode () {
      return this.googleCodeInputs.join('')
    },
    isFormComplete () {
      return this.tradePin.length === 6 && this.googleCode.length === 6
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.resetInputs()
        this.$nextTick(() => {
          this.focusFirstInput()
        })
      }
    }
  },
  methods: {
    // Trade PIN 输入处理
    handlePinInput (index, event) {
      const value = event.target.value

      // 只允许数字
      // if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(value)) {
      //   this.tradePinInputs[index] = ''
      //   return
      // }

      this.tradePinInputs[index] = value
      this.$forceUpdate()

      // 自动跳转到下一个输入框
      if (value && index < 5) {
        this.focusPinInput(index + 1)
      }

      this.emitChange()
    },

    handlePinKeydown (index, event) {
      if (event.key === 'Backspace') {
        if (!this.tradePinInputs[index] && index > 0) {
          // 回退到上一个输入框
          this.focusPinInput(index - 1)
        } else {
          // 清空当前框
          this.tradePinInputs[index] = ''
        }
      } else if (event.key === 'ArrowLeft' && index > 0) {
        this.focusPinInput(index - 1)
      } else if (event.key === 'ArrowRight' && index < 5) {
        this.focusPinInput(index + 1)
      }
    },

    handlePinFocus (index) {
      this.pinFocusedIndex = index
    },

    handlePinBlur () {
      this.pinFocusedIndex = -1
    },

    handlePinPaste (event) {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')

      // 只处理数字
      const numbers = pastedData.replace(/\D/g, '')
      if (numbers) {
        const passwordArray = numbers.slice(0, 6).split('')
        for (let i = 0; i < 6; i++) {
          this.tradePinInputs[i] = passwordArray[i] || ''
        }
        this.$forceUpdate()

        // 聚焦到下一个空白位置
        const nextEmptyIndex = this.tradePinInputs.findIndex(digit => digit === '')
        if (nextEmptyIndex !== -1) {
          this.focusPinInput(nextEmptyIndex)
        }
        this.emitChange()
      }
    },

    focusPinInput (index) {
      if (index >= 0 && index < 6) {
        this.$nextTick(() => {
          const input = this.$refs[`pinInput${index}`]
          if (input && input[0]) {
            input[0].focus()
          } else if (input) {
            input.focus()
          }
        })
      }
    },

    // Google Code 输入处理
    handleGoogleInput (index, event) {
      const value = event.target.value

      // 只允许数字
      if (!/^\d*$/.test(value)) {
        this.googleCodeInputs[index] = ''
        return
      }

      this.googleCodeInputs[index] = value
      this.$forceUpdate()

      // 自动跳转到下一个输入框
      if (value && index < 5) {
        this.focusGoogleInput(index + 1)
      }

      this.emitChange()
    },

    handleGoogleKeydown (index, event) {
      if (event.key === 'Backspace') {
        if (!this.googleCodeInputs[index] && index > 0) {
          // 回退到上一个输入框
          this.focusGoogleInput(index - 1)
        } else {
          // 清空当前框
          this.googleCodeInputs[index] = ''
        }
      } else if (event.key === 'ArrowLeft' && index > 0) {
        this.focusGoogleInput(index - 1)
      } else if (event.key === 'ArrowRight' && index < 5) {
        this.focusGoogleInput(index + 1)
      }
    },

    handleGoogleFocus (index) {
      this.googleFocusedIndex = index
    },

    handleGoogleBlur () {
      this.googleFocusedIndex = -1
    },

    handleGooglePaste (event) {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')

      // 只处理数字
      const numbers = pastedData.replace(/\D/g, '')
      if (numbers) {
        const passwordArray = numbers.slice(0, 6).split('')
        for (let i = 0; i < 6; i++) {
          this.googleCodeInputs[i] = passwordArray[i] || ''
        }
        this.$forceUpdate()

        // 聚焦到下一个空白位置
        const nextEmptyIndex = this.googleCodeInputs.findIndex(digit => digit === '')
        if (nextEmptyIndex !== -1) {
          this.focusGoogleInput(nextEmptyIndex)
        }
        this.emitChange()
      }
    },

    focusGoogleInput (index) {
      if (index >= 0 && index < 6) {
        this.$nextTick(() => {
          const input = this.$refs[`googleInput${index}`]
          if (input && input[0]) {
            input[0].focus()
          } else if (input) {
            input.focus()
          }
        })
      }
    },

    // 通用方法
    focusFirstInput () {
      this.focusPinInput(0)
    },

    resetInputs () {
      this.tradePinInputs = ['', '', '', '', '', '']
      this.googleCodeInputs = ['', '', '', '', '', '']
      this.pinFocusedIndex = -1
      this.googleFocusedIndex = -1
    },

    handleCancel () {
      this.resetInputs()
      this.$emit('cancel')
    },

    handleConfirm () {
      if (this.isFormComplete) {
        this.$emit('confirm', {
          tradePin: this.tradePin,
          googleCode: this.googleCode
        })
      }
    },

    handleForgotPin () {
      this.$emit('forgot-pin')
    },

    emitChange () {
      this.$emit('change', {
        tradePin: this.tradePin,
        googleCode: this.googleCode,
        isComplete: this.isFormComplete
      })
    }
  }
}
</script>

<style scoped>
.verification-modal {
  .ant-modal-content {
    border-radius: 16px;
    padding: 0;
  }

  .ant-modal-body {
    padding: 0;
  }
}

.verification-container {
  padding:0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #8c8c8c;
  font-size: 16px;

  &:hover {
    color: #262626;
    background: #f5f5f5;
  }
}

.verification-section {
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 40px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.forgot-link {
  font-size: 14px;
  color: #1890ff;
  text-decoration: none;

  &:hover {
    color: #40a9ff;
    text-decoration: underline;
  }
}

.pin-input-container {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.pin-input-item {
  position: relative;
  flex: 1;
  height: 56px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &.focused {
    border-color: #1890ff;
    background: white;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  &:hover:not(.focused) {
    border-color: #d9d9d9;
  }
}

.pin-input {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: transparent; /* 隐藏输入的数字 */
  caret-color: transparent; /* 隐藏光标 */
}

.input-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #262626;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; /* 不阻挡点击事件 */
}

.modal-footer {
  margin-top: 40px;
}

.confirm-button {
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: #1f2937;
  border: none;

  &:hover:not(:disabled) {
    background: #374151;
  }

  &:disabled {
    background: #d9d9d9;
    color: #bfbfbf;
    cursor: not-allowed;
  }
}

/* 响应式设计 */
@media (max-width: 576px) {
  .verification-container {
    padding: 24px;
  }

  .pin-input-container {
    gap: 8px;
  }

  .pin-input {
    .ant-input {
      height: 48px;
      font-size: 18px;
    }
  }
}
</style>
