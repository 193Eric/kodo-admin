<template>
  <div class="merchant-switcher-app" v-if="showSwitcher">
    <div class="merchant-switcher-content">
      <div class="merchant-current-item" @click="toggleDropdown">
        <div class="merchant-info">
          <div class="merchant-avatar"><img style="width:100%" src="@/assets/SidebarIcon-Account.png"></div>
          <div class="merchant-details" v-if="!isCollapsed">
            <div class="merchant-name">{{ currentMerchantName }}</div>
            <div class="merchant-location">{{ currentMerchantLocation }}</div>
          </div>
        </div>
        <div class="merchant-arrow" v-if="!isCollapsed">
          <img style="width:100%" src="@/assets/Icon-Arrow-vertical.png">
        </div>
      </div>

      <div class="merchant-dropdown" v-show="dropdownVisible">
        <div class="merchant-list">
          <div
            v-for="merchant in getMerchants"
            :key="merchant.merchant_id"
            class="merchant-list-item"
            :class="{ 'active': merchant.merchant_id === currentMerchantId }"
            @click="switchMerchant(merchant)"
          >
            <div class="merchant-avatar">
              <img style="width:100%" src="@/assets/SidebarIcon-Account.png">
            </div>
            <div class="merchant-details">
              <div class="merchant-name">{{ merchant.merchant_name }}</div>
              <div class="merchant-location">{{ getMerchantLocation(merchant) }}</div>
            </div>
            <div class="merchant-check" v-if="merchant.merchant_id === currentMerchantId">
              <a-icon type="check" />
            </div>
          </div>
        </div>

        <a-divider style="margin: 0px 0;" />

        <div class="merchant-add">
          <div class="add-merchant-btn" @click="addMerchant">
            <a-icon type="plus" />
            <span>Add Account</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { request } from '@/api/_service'

export default {
  name: 'MerchantSwitcher',
  data () {
    return {
      dropdownVisible: false,
      isCollapsed: false,
      showSwitcher: true,
      // 只存储当前商户信息（从localStorage读取）
      currentMerchantId: null,
      currentMerchantName: 'No Merchant',
      currentMerchantLocation: '',
      switchingMerchant: false // 添加切换状态标识
    }
  },

  computed: {
    ...mapGetters([
      'getMerchants', // 商户列表从Vuex获取
      'getDefaultMerchant' // 获取默认商户
    ])
  },

  mounted () {
    console.log('🟢 MerchantSwitcher mounted')

    // 从localStorage恢复当前商户状态
    this.loadCurrentMerchantFromStorage()

    this.setupWatchers()

    // 监听点击外部关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    // 从localStorage加载当前商户信息
    loadCurrentMerchantFromStorage () {
      try {
        this.currentMerchantId = localStorage.getItem('currentMerchantId')

        if (this.currentMerchantId) {
          // 从localStorage获取当前商户信息
          const currentMerchant = localStorage.getItem('currentMerchant')
          if (currentMerchant) {
            const merchantData = JSON.parse(currentMerchant)
            this.currentMerchantName = merchantData.merchant_name || 'No Merchant'
            this.currentMerchantLocation = this.getMerchantLocation(merchantData)
            console.log('✅ 恢复当前商户:', this.currentMerchantName)
          }
        }

        console.log('当前商户ID:', this.currentMerchantId)
        console.log('Vuex商户列表:', this.getMerchants.length, '个')
      } catch (error) {
        console.error('❌ 加载当前商户失败:', error)
      }
    },

    // 修改方法：优先设置is_default为true的商户为当前商户
    setDefaultMerchant () {
      // 等待 Vuex 数据加载
      this.$nextTick(() => {
        if (this.getMerchants.length > 0) {
          let targetMerchant = null

          // 优先查找is_default为true的商户
          if (this.getDefaultMerchant) {
            targetMerchant = this.getDefaultMerchant
            console.log('🎯 找到默认商户 (is_default=true):', targetMerchant.merchant_name)
          } else {
            // 如果没有默认商户，尝试找主商户或第一个商户作为fallback
            targetMerchant = this.getMerchants.find(m => m.is_main) || this.getMerchants[0]
            console.log('⚠️ 未找到默认商户，使用fallback:', targetMerchant?.merchant_name)
          }

          if (targetMerchant) {
            // 设置为当前商户
            this.currentMerchantId = targetMerchant.merchant_id
            this.currentMerchantName = targetMerchant.merchant_name
            this.currentMerchantLocation = this.getMerchantLocation(targetMerchant)

            // 保存到localStorage
            localStorage.setItem('currentMerchant', JSON.stringify(targetMerchant))
            localStorage.setItem('currentMerchantId', targetMerchant.merchant_id)

            console.log('✅ 设置当前商户:', this.currentMerchantName)
          }
        }
      })
    },

    // 同步Vuex中的默认商户到组件状态
    syncDefaultMerchantFromVuex () {
      if (this.getDefaultMerchant) {
        const defaultMerchant = this.getDefaultMerchant

        // 如果当前商户与默认商户不一致，则更新
        if (this.currentMerchantId !== defaultMerchant.merchant_id) {
          console.log('🔄 同步Vuex默认商户到组件:', defaultMerchant.merchant_name)

          this.currentMerchantId = defaultMerchant.merchant_id
          this.currentMerchantName = defaultMerchant.merchant_name
          this.currentMerchantLocation = this.getMerchantLocation(defaultMerchant)

          // 更新localStorage
          localStorage.setItem('currentMerchant', JSON.stringify(defaultMerchant))
          localStorage.setItem('currentMerchantId', defaultMerchant.merchant_id)

          console.log('✅ 组件状态已同步Vuex默认商户')
        }
      }
    },

    setupWatchers () {
      // 检查侧边栏是否存在并显示切换器
      const checkSidebar = () => {
        const sider = document.querySelector('.ant-pro-sider')
        const isLoginPage = this.$route.path.includes('/user/login') ||
                           this.$route.path.includes('/user/register') ||
                           this.$route.path.includes('/user/signup') ||
                           this.$route.path.includes('/kyb/index')

        // 只有在有商户数据且不是登录页面时才显示
        this.showSwitcher = !isLoginPage && this.getMerchants.length > 0

        // 检查侧边栏是否收起
        if (sider) {
          this.isCollapsed = sider.classList.contains('ant-pro-sider-collapsed')
        }

        console.log('显示切换器:', this.showSwitcher, 'Vuex商户数量:', this.getMerchants.length)

        // 如果没有当前商户但有商户列表，设置默认商户
        if (!this.currentMerchantId && this.getMerchants.length > 0) {
          this.setDefaultMerchant()
        }
      }

      // 初始检查
      this.$nextTick(checkSidebar)

      // 路由变化时检查
      this.$watch('$route', checkSidebar)

      // 监听Vuex商户数据变化
      this.$watch('getMerchants', checkSidebar)

      // 监听Vuex默认商户变化，同步到组件状态
      this.$watch('getDefaultMerchant', (newDefaultMerchant) => {
        if (newDefaultMerchant) {
          console.log('👀 监听到Vuex默认商户变化:', newDefaultMerchant.merchant_name)
          this.syncDefaultMerchantFromVuex()
        }
      }, { immediate: true })

      // 定期检查侧边栏状态
      setInterval(checkSidebar, 1000)
    },

    toggleDropdown () {
      this.dropdownVisible = !this.dropdownVisible
      console.log('切换下拉菜单:', this.dropdownVisible)
    },

    async switchMerchant (merchant) {
      // 如果是当前商户，直接关闭下拉菜单
      if (merchant.merchant_id === this.currentMerchantId) {
        this.dropdownVisible = false
        return
      }

      // 防止重复点击
      if (this.switchingMerchant) {
        return
      }

      console.log('🔄 切换到商户:', merchant.merchant_name)

      this.switchingMerchant = true
      this.$message.info('切换商户中...')
      try {
        // 调用后端切换商户接口
        const response = await request({
          url: '/merchant/v2/switch',
          method: 'post',
          data: {
            merchant_id: merchant.merchant_id
          }
        })

        if (response.code === 200) {
          // 后端切换成功，更新本地状态
          // 只存储当前商户到localStorage
          localStorage.setItem('currentMerchant', JSON.stringify(merchant))
          localStorage.setItem('currentMerchantId', merchant.merchant_id)

          // 更新组件状态
          this.currentMerchantId = merchant.merchant_id
          this.currentMerchantName = merchant.merchant_name
          this.currentMerchantLocation = this.getMerchantLocation(merchant)

          console.log('✅ 商户切换成功，已保存到localStorage')

          this.$message.success('商户切换成功...')

          this.dropdownVisible = false
          this.$message.success(`Switched to ${merchant.merchant_name}`)

          // 刷新页面以加载新商户的数据
          window.location.reload()
        } else {
          throw new Error(response.message || 'Failed to switch merchant')
        }
      } catch (error) {
        console.error('❌ 切换商户失败:', error)
        this.$message.error(error.message || '切换商户失败，请重试')
      } finally {
        this.switchingMerchant = false
      }
    },

    addMerchant () {
      this.dropdownVisible = false
      this.$router.push('/kyb/index?is_sub=1')
      console.log('点击添加商户')
    },

    handleClickOutside (event) {
      const switcher = this.$el
      if (switcher && !switcher.contains(event.target)) {
        this.dropdownVisible = false
      }
    },

    getMerchantLocation (merchant) {
      const countryMap = {
        'HK': 'Hong Kong',
        'US': 'United States',
        'SG': 'Singapore',
        'CN': 'China'
      }

      return merchant.country_code
        ? countryMap[merchant.country_code] || merchant.country_code
        : 'Unknown Location'
    }
  }
}
</script>

<style lang="less" scoped>
.merchant-switcher-app {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 256px;
  z-index: 1000;
  transition: all 0.2s;

  .merchant-switcher-content {
    padding: 12px 16px;
    position: relative;

    .merchant-current-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border: 1px solid #EFF1F3;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f9fafb;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .merchant-info {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;

        .merchant-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .merchant-details {
          flex: 1;
          min-width: 0;

          .merchant-name {
            font-size: 14px;
            font-weight: bold;
            color: #11253E;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
          }

          .merchant-location {
            font-size: 12px;
            color: #8c8c8c;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            margin-top: 2px;
          }
        }
      }

      .merchant-arrow {
        color: #8c8c8c;
        font-size: 12px;
        width: 24px;
        height: 24px;
        margin-left: 8px;
        transition: all 0.2s;
      }
    }

    .merchant-dropdown {
      position: absolute;
      bottom: 80%;
      left: 12px;
      right: 12px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      margin-bottom: 8px;
      max-height: 320px;
      overflow-y: auto;

      .merchant-list {
        padding: 8px 0;

        .merchant-list-item {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;

          &:hover {
            background: #f5f5f5;
          }

          &.active {
            background: #F1F4F6;
          }

          .merchant-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 12px;
            margin-right: 12px;
            flex-shrink: 0;
          }

          .merchant-details {
            flex: 1;
            min-width: 0;

            .merchant-name {
              font-size: 14px;
              font-weight: 500;
              color: #262626;
              line-height: 1.2;
            }

            .merchant-location {
              font-size: 12px;
              color: #8c8c8c;
              line-height: 1.2;
              margin-top: 2px;
            }
          }

          .merchant-check {
            font-size: 16px;
            font-weight: bold;
          }
        }
      }

      .merchant-add {
        .add-merchant-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          color: #1890ff;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #f5f5f5;
            color: #40a9ff;
          }
        }
      }
    }
  }
}

// 收起状态适配
.ant-pro-sider.ant-pro-sider-collapsed ~ * .merchant-switcher-app {
  width: 80px;

  .merchant-current-item {
    justify-content: center;

    .merchant-info {
      .merchant-details {
        display: none;
      }
    }

    .merchant-arrow {
      display: none;
    }
  }

  .merchant-dropdown {
    left: 8px !important;
    right: 8px !important;
  }
}

// 响应式处理
@media (max-width: 768px) {
  .merchant-switcher-app {
    width: 100% !important;
    left: 0 !important;
    right: 0 !important;

    .merchant-dropdown {
      position: fixed !important;
      bottom: 80px !important;
      left: 16px !important;
      right: 16px !important;
      width: auto !important;
      margin-bottom: 0 !important;
    }
  }
}

// 滚动条样式
.merchant-dropdown::-webkit-scrollbar {
  width: 4px;
}

.merchant-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.merchant-dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.merchant-dropdown::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
