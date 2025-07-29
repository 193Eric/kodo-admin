// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse, Account, Settings, Payouts, Collections, Exchange } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/overview',
    children: [
      // Overview - 一级目录
      {
        path: '/overview',
        name: 'Overview',
        component: () => import('@/views/dashboard/Analysis'),
        meta: { title: 'Overview', keepAlive: false, icon: bxAnaalyse, permission: ['dashboard'] }
      },

      // Account Management
      {
        path: '/Account',
        redirect: '/Account/withdraw',
        component: RouteView,
        meta: { title: 'Account Management', icon: Account },
        children: [
          {
            path: '/multiCurrency',
            name: 'MultiCurrency',
            meta: {
              title: 'Multi-currency acct',
              auth: true
            },
            component: () => import('@/views/account/MultiCurrency')
          },
          {
            path: '/withdraw',
            name: 'Withdrawal',
            meta: {
              title: 'Withdrawal',
              auth: true
            },
            component: () => import('@/views/withdraw/index')
          },
          {
            path: '/deposit',
            name: 'Deposit',
            meta: {
              title: 'Deposit',
              auth: true
            },
            component: () => import('@/views/deposit/index')
          }
        ]
      },

      // Exchange - 新增一级目录
      {
        path: '/exchange',
        name: 'Exchange',
        component: () => import('@/views/exchange/index'),
        meta: { title: 'Exchange', keepAlive: true, icon: Exchange }
      },
            // Payouts
      {
        path: '/Payouts',
        redirect: '/Payouts/recipient',
        component: RouteView,
        meta: { title: 'Payouts', icon: Payouts },
        children: [
          {
            path: '/recipient',
            name: 'Recipient Management',
            meta: {
              title: 'Recipient Management',
              auth: true
            },
            component: () => import('@/views/payouts/recipient')
          },
          {
            path: '/create',
            name: ' Create Payout',
            meta: {
              title: 'Create Payout',
              auth: true
            },
            component: () => import('@/views/payouts/create')
          }

        ]
      },

      // Collections
      {
        path: '/collections',
        redirect: '/collections/payeeManagement',
        component: RouteView,
        meta: { title: 'Collections', icon: Collections },
        children: [
          {
            path: '/payeeManagement',
            name: 'PayeeManagement',
            meta: {
              title: 'Payee Management',
              auth: true
            },
            component: () => import('@/views/collections/payeeManagement')
          },
          {
            path: '/cryptoCollections',
            name: 'cryptoCollections',
            meta: {
              title: 'Crypto Collections',
              auth: true
            },
            component: () => import('@/views/collections/cryptoCollections')
          }
        ]
      },

      // settings
      {
        path: '/Settings',
        redirect: '/power/index',
        component: RouteView,
        meta: { title: 'Settings', icon: Settings },
        children: [
          {
            path: '/power',
            name: 'Power',
            meta: {
              title: 'Permission Management',
              auth: true
            },
            component: () => import('@/views/power/index')
          },
          {
            path: '/security',
            name: 'Security',
            meta: {
              title: 'Security Settings',
              auth: true
            },
            component: () => import('@/views/power/security')
          }
        ]
      }
    ]
  },

  // KYB - 移出 BasicLayout，使用 BlankLayout
  {
    path: '/kyb',
    component: BlankLayout,
    redirect: '/kyb/index',
    hidden: true,
    meta: { title: 'KYB', icon: 'form' },
    children: [
      {
        path: '/kyb/index',
        name: 'KYB',
        meta: {
          title: 'KYB',
          auth: true
        },
        component: () => import('@/views/kyb/index')
      }
    ]
  },

  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/newLogin')
      },
      {
        path: 'signup',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
