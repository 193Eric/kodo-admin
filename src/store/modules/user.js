import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { login, getInfo, logout } from '@/api/login'
import { request } from '@/api/_service'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

storage.addPlugin(expirePlugin)

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    // 新增商户相关状态
    currentMerchant: null,
    userInfo: null,
    merchants: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    // 新增商户相关mutations
    SET_CURRENT_MERCHANT: (state, merchant) => {
      state.currentMerchant = merchant
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
    },
    SET_MERCHANTS: (state, merchants) => {
      state.merchants = merchants
    }
  },

  getters: {
    // 获取当前主商户信息
    getCurrentMerchant: (state) => state.currentMerchant,

    // 获取当前商户ID
    getCurrentMerchantId: (state) => state.currentMerchant?.merchant_id,

    // 获取用户信息
    getUserInfo: (state) => state.userInfo,

    // 获取所有商户列表
    getMerchants: (state) => state.merchants,

    // 获取主商户（有user字段的）
    getMainMerchant: (state) => state.merchants.find(merchant => merchant.user !== null && merchant.user !== undefined),

    // 获取子商户列表（没有user字段的）
    getSubMerchants: (state) => state.merchants.filter(merchant => !merchant.user),

    // 获取默认商户（is_default为true的）
    getDefaultMerchant: (state) => state.merchants.find(merchant => merchant.is_default === true),

    // 获取商户名称
    getCurrentMerchantName: (state) => state.currentMerchant?.merchant_name,

    // 获取用户邮箱
    getUserEmail: (state) => state.userInfo?.email,

    // 获取用户名称
    getUserName: (state) => state.userInfo?.name || state.userInfo?.username
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const result = response.result
          storage.set(ACCESS_TOKEN, result.token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', result.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        // 新增：调用商户信息接口
        request({
          url: '/merchant/v2/info',
          method: 'GET'
        }).then(infoResponse => {
          // 处理商户信息并存储到Vuex
          if (infoResponse.data && Array.isArray(infoResponse.data)) {
            // 存储所有商户列表
            commit('SET_MERCHANTS', infoResponse.data)

            // 找到is_default为true的商户（当前默认商户）
            const defaultMerchant = infoResponse.data.find(merchant => merchant.is_default === true)

            if (defaultMerchant) {
              // 存储默认商户信息
              commit('SET_CURRENT_MERCHANT', defaultMerchant)

              // 更新localStorage缓存
              localStorage.setItem('currentMerchant', JSON.stringify(defaultMerchant))
              localStorage.setItem('currentMerchantId', defaultMerchant.merchant_id)

              console.log('✅ 设置默认商户:', defaultMerchant.merchant_name)

              // 存储用户信息（如果默认商户有user字段）
              if (defaultMerchant.user) {
                commit('SET_USER_INFO', defaultMerchant.user)
              }
            } else {
              // 如果没有找到默认商户，尝试使用有user字段的商户作为fallback
              const mainMerchant = infoResponse.data.find(merchant => merchant.user !== null && merchant.user !== undefined)

              if (mainMerchant) {
                commit('SET_CURRENT_MERCHANT', mainMerchant)
                localStorage.setItem('currentMerchant', JSON.stringify(mainMerchant))
                localStorage.setItem('currentMerchantId', mainMerchant.merchant_id)

                if (mainMerchant.user) {
                  commit('SET_USER_INFO', mainMerchant.user)
                }

                console.log('⚠️ 未找到默认商户，使用主商户:', mainMerchant.merchant_name)
              }
            }
          }
        }).catch(error => {
          console.error('获取商户信息失败:', error)
        })

        // 原来的逻辑保持不变
        // 请求后端获取用户信息 /api/user/info
        getInfo().then(response => {
          const { result } = response
          if (result.role && result.role.permissions.length > 0) {
            const role = { ...result.role }
            role.permissions = result.role.permissions.map(permission => {
              const per = {
                ...permission,
                actionList: (permission.actionEntitySet || {}).map(item => item.action)
              }
              return per
            })
            role.permissionList = role.permissions.map(permission => { return permission.permissionId })
            // 覆盖响应体的 role, 供下游使用
            result.role = role

            commit('SET_ROLES', role)
            commit('SET_INFO', result)
            commit('SET_NAME', { name: result.name, welcome: welcome() })
            commit('SET_AVATAR', result.avatar)
            // 下游
            resolve(result)
          } else {
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          // 清空商户相关信息
          commit('SET_CURRENT_MERCHANT', null)
          commit('SET_USER_INFO', null)
          commit('SET_MERCHANTS', [])
          storage.remove(ACCESS_TOKEN)
          // 清空localStorage中的商户信息
          localStorage.removeItem('currentMerchant')
          localStorage.removeItem('currentMerchantId')
          window.location.reload()
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    }
  }
}

export default user
