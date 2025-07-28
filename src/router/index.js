import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

// hack router push callback
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const createRouter = () =>
  new Router({
    mode: 'hash',
    routes: constantRouterMap,
    // 添加滚动行为配置
    scrollBehavior (to, from, savedPosition) {
      // 如果有保存的位置（比如通过浏览器前进后退），则返回保存的位置
      if (savedPosition) {
        return savedPosition
      }

      // 如果路由有锚点，滚动到锚点位置
      if (to.hash) {
        return {
          selector: to.hash,
          behavior: 'smooth' // 平滑滚动
        }
      }

      // 默认滚动到页面顶部
      return { x: 0, y: 0 }
    }
  })

const router = createRouter()

// 定义一个resetRouter 方法，在退出登录后或token过期后 需要重新登录时，调用即可
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
