<template>
  <div class="dashboard-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="left-content">
        <!-- 账户净值部分 -->
        <div class="net-worth-section">
          <div class="net-worth-header">
            <h2>
              Account Net Worth
              <a-icon
                :type="showAmount ? 'eye' : 'eye-invisible'"
                class="toggle-visibility"
                @click="toggleAmount"
              />
            </h2>
            <span class="update-time">Updated on 2025-5-20 16:22:29</span>
          </div>
          <div class="net-worth-content">
            <div class="amount-display">
              <span class="amount-number">{{ showAmount ? '12830.800000' : '********' }}</span>
              <a-select
                v-if="showAmount"
                class="currency-select"
                :value="selectedCurrency"
                @change="handleCurrencyChange"
                :bordered="false"
              >
                <a-select-option value="USDT">USDT</a-select-option>
                <a-select-option value="USDC">USDC</a-select-option>
                <a-select-option value="BTC">BTC</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
              </a-select>
            </div>
          </div>
        </div>

        <!-- 币种余额展示 -->
        <div class="balance-section">
          <div class="balance-row">
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-icon usdt">
                  <img style="width:100%" src="@/assets/icons/usdt.png" />
                </div>
                <span class="currency-code">USDT</span>
              </div>
              <div class="balance-amount">30.800000</div>
            </div>
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-icon usdc">
                  <img style="width:100%" src="@/assets/icons/usdc.png" />
                </div>
                <span class="currency-code">USDC</span>
              </div>
              <div class="balance-amount">0.000000</div>
            </div>
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-icon btc">
                  <img style="width:100%" src="@/assets/icons/btc.png" />
                </div>
                <span class="currency-code">BTC</span>
              </div>
              <div class="balance-amount">0.000000</div>
            </div>
            <div class="balance-item empty">
              <!-- <div class="currency-header">
                <div class="currency-icon placeholder"></div>
                <span class="currency-code">-</span>
              </div>
              <div class="balance-amount">-</div> -->
            </div>
          </div>

          <div class="balance-row fiat-row">
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-flag us">
                  <img style="width:100%" src="@/assets/icons/usd.png" />
                </div>
                <span class="currency-code">USD US dollars</span>
              </div>
              <div class="balance-amount">12800.00</div>
            </div>
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-flag eu">
                  <img style="width:100%" src="@/assets/icons/eur.png" />
                </div>
                <span class="currency-code">EUR Euro</span>
              </div>
              <div class="balance-amount">0.00</div>
            </div>
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-flag ru">
                  <img style="width:100%" src="@/assets/icons/rub.png" />
                </div>
                <span class="currency-code">RUB Russian Rouble</span>
              </div>
              <div class="balance-amount">0.00</div>
            </div>
            <div class="balance-item">
              <div class="currency-header">
                <div class="currency-flag br">
                  <img style="width:100%" src="@/assets/icons/brl.png" />
                </div>
                <span class="currency-code">BRL Brazilian Real</span>
              </div>
              <div class="balance-amount">0.00</div>
            </div>
          </div>
        </div>

        <!-- Quick Access -->
        <div class="quick-access-section">
          <div class="quick-header">
            <h3 class="section-title">Quick Access</h3>
            <a-icon type="more" class="more-icon" />
          </div>
          <div class="quick-grid">
            <div class="quick-item" @click="$router.push('/exchange')">
              <div class="quick-icon ">
                <img style="width:100%" src="@/assets/icons/exchange.png" />
              </div>
              <h4>Exchange</h4>
              <p>Supports multiple scenarios, platforms, and currencies.</p>
            </div>
            <div class="quick-item" @click="$router.push('/deposit')">
              <div class="quick-icon ">
                <img style="width:100%" src="@/assets/icons/topup.png" />
              </div>
              <h4>Top-up</h4>
              <p>Supports multiple scenarios, platforms, and currencies.</p>
            </div>
            <div class="quick-item" @click="$router.push('/withdraw')">
              <div class="quick-icon ">
                <img style="width:100%" src="@/assets/icons/withdrawal.png" />
              </div>
              <h4>Withdrawal</h4>
              <p>Supports multiple scenarios, platforms, and currencies.</p>
            </div>
            <div class="quick-item" @click="$router.push('/create')" >
              <div class="quick-icon ">
                <img style="width:100%" src="@/assets/icons/payouts.png" />
              </div>
              <h4>Payouts</h4>
              <p>Supports multiple scenarios, platforms, and currencies.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="right-content">
        <!-- Exchange Rates -->
        <div class="exchange-rates-section">
          <div class="rates-header">
            <h3 class="section-title">Exchange Rates</h3>
            <div class="sort-button" @click="toggleSortOrder">
              <div class="currency-flag us small">
                <img style="width:100%" src="@/assets/icons/usd.png" />
              </div>
              <span>USD</span>
              <a-icon :type="sortAscending ? 'caret-up' : 'caret-down'" />
            </div>
          </div>
          <div class="rates-list">
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-icon usdt small">
                  <img style="width:100%" src="@/assets/icons/usdt.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>USDT</span>
                  <span>100USDT</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">100.0000</span>
                <span class="rate-change neutral">0.000%</span>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-icon usdc small">
                  <img style="width:100%" src="@/assets/icons/usdc.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>USDC</span>
                  <span>100USDC</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">100.0000</span>
                <span class="rate-change neutral">0.000%</span>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-icon btc small">
                  <img style="width:100%" src="@/assets/icons/btc.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>BTC</span>
                  <span>100BTC</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">100.0000</span>
                <span class="rate-change neutral">0.000%</span>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-flag us small">
                  <img style="width:100%" src="@/assets/icons/usd.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>USD</span>
                  <span>100USD</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">100.0000</span>
                <span class="rate-change neutral">0.000%</span>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-flag eu small">
                  <img style="width:100%" src="@/assets/icons/eur.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>EUR</span>
                  <span>100Euro</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">113.2845</span>
                <span class="rate-change positive">+0.2828%</span>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-flag ru small">
                  <img style="width:100%" src="@/assets/icons/rub.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>RUB</span>
                  <span>100Russian Rouble</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">1.2393</span>
                <span class="rate-change negative">-0.3687%</span>
              </div>
            </div>
            <div class="rate-item">
              <div class="rate-left">
                <div class="currency-flag br small">
                  <img style="width:100%" src="@/assets/icons/brl.png" />
                </div>
                <div style="display: flex;flex-direction: column;">
                  <span>BRL</span>
                  <span>100Brazilian Real</span>
                </div>
              </div>
              <div class="rate-right">
                <span class="rate-value">17.6404</span>
                <span class="rate-change negative">-0.3631%</span>
              </div>
            </div>

            <div
              style="text-align: center;
    margin-top: 15px;
    font-size: 12px;
    color: rgba(138, 149, 161, 1);
}">
              Last updated on 2025-5-20  04:37 UTC
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Business Verification -->
    <div class="verification-section" v-if="isMasterPending">
      <div class="verification-content">
        <div class="verification-icon">
          <img style="width:100%" src="@/assets/icons/Introduction.png" />
        </div>
        <div class="verification-text">
          <h3>Business Verification</h3>
          <p>Complete merchant verification, manage funds more easily, and accelerate business development.</p>
        </div>
        <button
          class="verify-btn" @click="()=>{
            this.$router.push('/kyb/index?is_sub=0')
          }">Verify now</button>
      </div>
    </div>

    <div class="verification-section" v-if="isReject">
      <div class="verification-content">
        <div class="verification-icon">
          <img style="width:100%" src="@/assets/icons/Introduction.png" />
        </div>
        <div class="verification-text">
          <h3>KYB Application Rejected</h3>
          <p>reject reason：<span style="color:red">{{ this.currentMerchant.reject_reason }}</span></p>
        </div>
        <button
          class="verify-btn" @click="()=>{
            this.$router.push(`/kyb/index?is_sub=${this.currentMerchant.user ? '0' :'1'}&id=${this.currentMerchant.kyb_id}`)
          }">reapply</button>
      </div>
    </div>

    <!-- 底部两栏：To Do List 和 Financial Calendar（全宽度） -->
    <div v-if="false" class="bottom-full-section">
      <!-- To Do List -->
      <div class="todo-section">
        <h3 class="section-title">To Do List</h3>
        <div class="todo-list">
          <div class="todo-grid">
            <div class="todo-column">
              <div class="todo-item">
                <span class="todo-text">New payee account review</span>
                <span class="todo-count">3</span>
              </div>
              <div class="todo-item">
                <span class="todo-text">Transfer review</span>
                <span class="todo-count">12</span>
              </div>
              <div class="todo-item">
                <span class="todo-text">Supplementary transfer documentation</span>
                <span class="todo-count zero">0</span>
              </div>
            </div>
            <div class="todo-column">
              <div class="todo-item">
                <span class="todo-text">Exchange review</span>
                <span class="todo-count zero">0</span>
              </div>
              <div class="todo-item">
                <span class="todo-text">Supplementary recharge documentation</span>
                <span class="todo-count zero">0</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Business Verification -->
        <div class="verification-section" v-if="isMasterPending">
          <div class="verification-content">
            <div class="verification-icon">
              <img style="width:100%" src="@/assets/icons/Introduction.png" />
            </div>
            <div class="verification-text">
              <h3>KYB Application Rejected</h3>
              <p>reject reason：<span style="color:red">{{ this.currentMerchant. reject_reason }}</span></p>
            </div>
            <button
              class="verify-btn" @click="()=>{
                this.$router.push('/kyb/index?is_sub=0')
              }">Verify now</button>
          </div>
        </div>
      </div>

      <!-- Financial Calendar -->
      <div class="calendar-section">
        <div class="calendar-header">
          <h3 class="section-title">Financial Calendar</h3>
          <a href="#" class="view-all">View all</a>
        </div>

        <div class="calendar-main">
          <div class="calendar-events-left">
            <div class="event-item">
              <div class="event-date">25th May 2025, Sunday</div>
              <div class="event-desc">
                US Dollar, British Pound, Euro, Hong Kong Dollar, Renminbi, Japanese Yen, Indonesian Rupiah, Australian Dollar, Romanian Leu, Bangladeshi Taka... Currency holidays may cause delays in deposits and withdrawals. For more currencies, please refer...
              </div>
            </div>
            <div class="event-item">
              <div class="event-date">25th May 2025, Sunday</div>
              <div class="event-desc">
                US Dollar, British Pound, Euro, Hong Kong Dollar, Renminbi, Japanese Yen, Indonesian Rupiah, Australian Dollar, Romanian Leu, Bangladeshi Taka... Currency holidays may cause delays in deposits and withdrawals. For more currencies, please refer to the announcement policy.
              </div>
            </div>
          </div>

          <div class="calendar-widget-right">
            <div class="calendar-container">
              <a-calendar
                :fullscreen="false"
                v-model="selectedDate"
                :headerRender="headerRender"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { Calendar } from 'ant-design-vue'

export default {
  name: 'DashboardHome',
  components: {
    'a-calendar': Calendar
  },

  data () {
    return {
      showAmount: true,
      selectedCurrency: 'USDT',
      selectedDate: moment(),
      sortAscending: true,
      // 从localStorage获取的当前商户信息
      currentMerchant: null
    }
  },

  computed: {
    // 从localStorage判断是否需要显示商户验证提示
    isMasterPending () {
      if (!this.currentMerchant) {
        return false
      }

      // 如果是主商户(有user字段) 且 kyb_status为0，则显示验证提示
      return this.currentMerchant.user && this.currentMerchant.kyb_status === 0
    },
    isReject () {
      if (!this.currentMerchant) {
        return false
      }

      return this.currentMerchant.kyb_status && this.currentMerchant.kyb_status === -1
    }
  },

  mounted () {
    // 页面加载时从localStorage获取当前商户信息
    this.loadCurrentMerchantFromStorage()

    console.log('当前商户信息:', this.currentMerchant)
    console.log('是否需要显示验证提示:', this.isMasterPending)
  },

  methods: {
    // 从localStorage加载当前商户信息
    loadCurrentMerchantFromStorage () {
      try {
        const currentMerchant = localStorage.getItem('currentMerchant')
        if (currentMerchant) {
          this.currentMerchant = JSON.parse(currentMerchant)
          console.log('✅ 从localStorage加载当前商户:', this.currentMerchant.merchant_name)
        } else {
          console.log('⚠️ localStorage中没有找到当前商户信息')
          this.currentMerchant = null
        }
      } catch (error) {
        console.error('❌ 从localStorage加载商户信息失败:', error)
        this.currentMerchant = null
      }
    },

    toggleAmount () {
      this.showAmount = !this.showAmount
    },

    handleCurrencyChange (value) {
      this.selectedCurrency = value
    },

    toggleSortOrder () {
      this.sortAscending = !this.sortAscending
      // 这里可以添加排序逻辑
      console.log('Sort order:', this.sortAscending ? 'Ascending' : 'Descending')
    },

    headerRender ({ value, type, onChange, onTypeChange }) {
      return (
        <div class="calendar-header-custom">
          <div class="calendar-controls">
            <a-button
              size="small"
              icon="left"
              onClick={() => onChange(value.clone().subtract(1, 'month'))}
            />
            <span class="calendar-month">{value.format('MMMM YYYY')}</span>
            <a-button
              size="small"
              icon="right"
              onClick={() => onChange(value.clone().add(1, 'month'))}
            />
          </div>
        </div>
      )
    }
  }
}
</script>

<style>
.calendar-container{
  background: rgba(246, 249, 252, 1);
}
</style>
<style lang="less" scoped>
.dashboard-container {
  // padding: 24px 0;
  // background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.net-worth-section {
  background: white;
  border-radius: 8px;

  .net-worth-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      margin: 0;
      font-weight: bold;
    color: #000;
      font-size: 16px;
      display: flex;
      align-items: center;

      .toggle-visibility {
        margin-left: 8px;
        font-size: 16px;
        color: #bfbfbf;
        cursor: pointer;

        &:hover {
          color: #11253E;
        }
      }
    }

    .update-time {
      font-size: 12px;
      margin-left:15px;
      color: #8c8c8c;
    }
  }

  .net-worth-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .amount-display {
      display: flex;
      align-items: center;

      .amount-number {
        font-size: 30px;
        font-weight: bold;
        color: #000;
        margin-right: 16px;
      }

      .currency-select {
        min-width: 80px;

        /deep/ .ant-select-selection {
          border: none !important;
          box-shadow: none !important;
        }
      }
    }
  }
}

.main-content {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;

  .left-content {
    flex: 1;
  }

  .right-content {
    width: 300px;
  }
}

.bottom-full-section {
  display: flex;
  gap: 24px;

  .todo-section {
    flex: 1;
    background: white;
    padding: 10px 0;
  }
  .todo-list{
    border-radius: 8px;
      border: 1px solid #f0f0f0;
      padding: 20px;
      margin-bottom: 20px;
  }

  .calendar-section {
    flex: 1;
    background: white;
    padding: 10px 0;

  }
}

.balance-section {
  background: white;
  padding: 10px 0;
  border-radius: 8px;
  margin-bottom: 24px;
  margin-top:10px;

  .balance-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .balance-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #fafafa;
      }

      &.empty {
        opacity: 0.5;
      }

      .currency-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .currency-icon, .currency-flag {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;

          &.usdt { background-color: #26a17b; }
          &.usdc { background-color: #2775ca; }
          &.btc { background-color: #f7931a; }
          &.placeholder { background-color: #d9d9d9; }
          &.us { background-color: #002868; }
          &.eu { background-color: #003399; }
          &.ru { background-color: #0033a0; }
          &.br { background-color: #009739; }
        }

        .currency-code {
          font-size: 12px;
          color: #8c8c8c;
          font-weight: 500;
        }
      }

      .balance-amount {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin: 0 0 16px 0;
}

.quick-access-section {
  background: white;
  padding: 10px 0;
  border-radius: 8px;

  .quick-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      margin: 0;
    }

    .more-icon {
      color: #bfbfbf;
      cursor: pointer;
      font-size: 16px;

      &:hover {
        color: #11253E;
      }
    }
  }

  .quick-grid {
    display: flex;
    gap: 20px;

    .quick-item {
      flex: 1;
      text-align: left;
      padding: 20px 16px;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 8px;
      border: 1px solid #f0f0f0;

      &:hover {
        background-color: #fafafa;
        border-color: #d9d9d9;
      }

      .quick-icon {
        width: 24px;
        height: 24px;
        margin: 0 0 16px;
        border-radius: 50%;

        &.exchange { background-color: #11253E; }
        &.topup { background-color: #722ed1; }
        &.withdrawal { background-color: #52c41a; }
        &.payouts { background-color: #11253E; }
      }

      h4 {
        font-size: 14px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: #262626;
      }

      p {
        font-size: 12px;
        color: #8c8c8c;
        margin: 0;
        line-height: 1.4;
      }
    }
  }
}

.todo-section {
  .todo-grid {
    display: flex;
    gap: 40px;

    .todo-column {
      flex: 1;

      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;

        &:last-child {
          border-bottom: none;
        }

        .todo-text {
          font-size: 14px;
          color: #262626;
        }

        .todo-count {
          color: #000;
          padding: 2px 8px;
          font-size: 14px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }
      }
    }
  }
}

.verification-section {
  background: linear-gradient(135deg, #fff 0%, #cfbbe4 100%);
  padding: 24px;
  border-radius: 8px;

  .verification-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .verification-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .verification-text {
      flex: 1;

      h3 {
        color: #000;
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 8px 0;
      }

      p {
        color: #8A95A1;
        font-size: 12px;
        margin: 0;
        line-height: 1.4;
      }
    }

    .verify-btn {
      background-color: #000;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.exchange-rates-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border-radius: 8px;
    border: 1px solid #f0f0f0;

  .rates-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
      margin: 0;
    }

    .sort-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      .currency-flag {
        &.small {
          width: 16px;
          height: 16px;
          border-radius: 50%;

          &.us {
            background-color: #002868;
          }
        }
      }

      span {
        font-size: 12px;
        color: #8c8c8c;
        font-weight: 500;
      }

      .anticon {
        font-size: 10px;
        color: #bfbfbf;
      }
    }
  }

  .rates-list {
    .rate-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom:1px solid rgba(229, 231, 235, .5);

      .rate-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .currency-icon, .currency-flag {
          &.small {
            width: 24px;
            height: 24px;
          }
        }

        span {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .rate-right {
        text-align: right;

        .rate-value {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #262626;
        }

        .rate-change {
          font-size: 12px;

          &.positive {
            color: #52c41a;
          }

          &.negative {
            color: #ff4d4f;
          }

          &.neutral {
            color: #8c8c8c;
          }
        }

        .mini-chart {
          width: 40px;
          height: 16px;
          margin-top: 4px;
          background-color: #f0f0f0;

          &.positive {
            background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
          }

          &.negative {
            background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
          }
        }
      }
    }
  }
}

.calendar-section {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .view-all {
      color: #11253E;
      font-size: 12px;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .calendar-main {
    display: flex;
    gap: 20px;

    .calendar-events-left {
      flex: 1;
              border:1px solid #f0f0f0;
        border-radius: 6px;

      .event-item {
        margin-bottom: 16px;
        padding: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .event-date {
          font-size: 12px;
          font-weight: 500;
          color: #262626;
          margin-bottom: 6px;
        }

        .event-desc {
          font-size: 11px;
          color: #8c8c8c;
          line-height: 1.4;
        }
      }
    }

    .calendar-widget-right {
      flex: 1;

      .calendar-container {
        border: 1px solid #f0f0f0;
        border-radius: 6px;
        overflow: hidden;
      }

      /deep/ .ant-calendar-mini {
        border: none;
        border-radius: 6px;
      }

      /deep/ .ant-calendar-mini .ant-calendar-header {
        border-bottom: 1px solid #f0f0f0;
        padding: 12px 16px;
      }

      /deep/ .ant-calendar-mini .ant-calendar-body {
        padding: 8px 16px 16px;
      }

      .calendar-header-custom {
        padding: 8px;

        .calendar-controls {
          display: flex;
          align-items: center;
          justify-content: center;

          .calendar-month {
            margin: 0 16px;
            font-weight: 500;
          }
        }
      }
    }
  }
}

/deep/ .ant-card-body {
  padding: 16px;
}

/deep/ .ant-statistic-content {
  color: #000 !important;
}
</style>
