<template>
  <div class="withdrawal-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>Withdrawal</h1>
      <div class="header-actions">
        <a-button type="link" @click="handleWithdrawalHistory">
          <a-icon type="history" />
          Withdrawal History
        </a-button>
      </div>
    </div>

    <!-- Tab切换 -->
    <a-tabs v-model="activeTab" class="withdrawal-tabs">
      <a-tab-pane key="withdrawalCrypto" tab="Withdrawal Crypto">
        <WithdrawalCrypto />
      </a-tab-pane>

      <a-tab-pane key="withdrawalFiat" tab="Withdrawal Fiat">
        <WithdrawalFiat />
      </a-tab-pane>

      <a-tab-pane key="cryptoAddress" tab="Crypto Address">
        <!-- 数字货币地址管理组件 -->
        <CryptoAddressManagement />
      </a-tab-pane>

      <a-tab-pane key="fiatAddress" tab="Fiat Address">
        <!-- 法币地址管理组件 -->
        <FiatAddressManagement />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
// 引入子组件
import WithdrawalCrypto from './WithdrawalCrypto.vue'
import WithdrawalFiat from './WithdrawalFiat.vue'
import CryptoAddressManagement from './CryptoAddressManagement.vue'
import FiatAddressManagement from './FiatAddressManagement.vue'

export default {
  name: 'WithdrawalPage',
  components: {
    WithdrawalCrypto,
    WithdrawalFiat,
    CryptoAddressManagement,
    FiatAddressManagement
  },
  data () {
    return {
      activeTab: 'withdrawalCrypto'
    }
  },

  methods: {
    // 提现历史
    handleWithdrawalHistory () {
      this.$message.info('跳转到提现历史页面')
      // 实际项目中这里应该是路由跳转
      // this.$router.push('/withdrawal/history')
    }
  }
}
</script>

<style scoped>
.withdrawal-page {
  padding: 24px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #262626;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.withdrawal-tabs {
  background: #fff;
  border-radius: 8px;
}

.withdrawal-tabs >>> .ant-tabs-bar {
  margin: 0;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.withdrawal-tabs >>> .ant-tabs-tab {
  margin: 0 32px 0 0;
  padding: 16px 0;
  font-size: 14px;
  color: #8c8c8c;
}

.withdrawal-tabs >>> .ant-tabs-tab-active {
  color: #11253E;
  font-weight: 600;
}
</style>
