<template>
  <div class="create-payout-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">Create Payout</h1>
      <a-button type="link" class="history-btn" @click="goToPayoutHistory">
        <a-icon type="file-text" />
        Payout History
      </a-button>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model="activeTab" class="payout-tabs">
      <a-tab-pane key="digital" tab="Digital Payout" />
      <a-tab-pane key="fiat" tab="Fiat Payout" />
    </a-tabs>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 余额卡片 -->
      <div class="balance-card">
        <div class="balance-header">
          <div class="coin-info">
            <div class="coin-icon">
              <img src="@/assets/icons/usdt.png" alt="USDT" />
            </div>
            <span class="coin-name">USDT</span>
            <a-button size="small" class="transfer-btn">Transfer</a-button>
          </div>
        </div>

        <div class="balance-content">
          <div class="balance-amount">12,345.67</div>
          <div class="balance-change">
            <span class="change-amount">+1,280.98</span>
            <span class="change-text">Received Today</span>
            <div class="change-chart">
              <div class="chart-line">
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <path
                    d="M0,15 Q15,10 30,12 Q45,8 60,5"
                    stroke="#52c41a"
                    stroke-width="2"
                    fill="none"
                  />
                </svg>
              </div>
              <span class="change-percent">+0.2828%</span>
            </div>
          </div>
        </div>
      </div>

      <a-button
        type="primary"
        class="create-payout-btn"
        @click="openCreatePayoutModal"
      >
        Create Digital Payout
      </a-button>

      <!-- 最近转账记录 -->
      <div class="recent-transfers">
        <h3 class="section-title">Recent Transfer</h3>

        <div class="transfers-table">
          <div class="table-header">
            <div class="col col-name">Recipient Name</div>
            <div class="col col-address">Address</div>
            <div class="col col-network">Network</div>
            <div class="col col-currency">Currency</div>
            <div class="col col-action">Action</div>
          </div>

          <div class="table-body">
            <div
              v-for="transfer in recentTransfers"
              :key="transfer.id"
              class="table-row"
            >
              <div class="col col-name">{{ transfer.recipientName }}</div>
              <div class="col col-address">{{ transfer.address }}</div>
              <div class="col col-network">
                <div class="network-tags">
                  <a-tag
                    v-for="network in transfer.networks"
                    :key="network"

                    size="small"
                  >
                    {{ network }}
                  </a-tag>
                </div>
              </div>
              <div class="col col-currency">{{ transfer.currency }}</div>
              <div class="col col-action">
                <a-button
                  type="link"
                  size="small"
                  @click="transferToRecipient(transfer)"
                >
                  Transfer
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Digital Payout Modal -->
    <a-modal
      :visible="showCreatePayoutModal"
      :footer="null"
      :closable="false"
      width="800px"
      centered
      class="create-payout-modal"
    >
      <CreateDigitalPayoutFlow
        v-if="showCreatePayoutModal"
        @close="closeCreatePayoutModal"
        @complete="handlePayoutComplete"
      />
    </a-modal>
  </div>
</template>

<script>
import CreateDigitalPayoutFlow from './CreateDigitalPayoutFlow'

export default {
  name: 'CreatePayoutPage',
  components: {
    CreateDigitalPayoutFlow
  },
  data () {
    return {
      activeTab: 'digital',
      showCreatePayoutModal: false,

      recentTransfers: [
        {
          id: 1,
          recipientName: 'Digital Solutions Inc',
          address: 'TPRgvk...JoCSck',
          networks: ['ERC-20', 'TRC-20'],
          currency: 'BTC, USDT'
        },
        {
          id: 2,
          recipientName: 'CryptoVendor Ltd',
          address: 'TPRgvk...JoCSck',
          networks: ['ERC-20', 'TRC-20'],
          currency: 'USDC, USDT'
        },
        {
          id: 3,
          recipientName: 'BlockChain Merchants',
          address: 'TPRgvk...JoCSck',
          networks: ['Bitcoin', 'TRC-20'],
          currency: 'BTC, USDT'
        },
        {
          id: 4,
          recipientName: 'BlockChain Merchants',
          address: 'TPRgvk...JoCSck',
          networks: ['Bitcoin', 'TRC-20'],
          currency: 'BTC, USDT'
        },
        {
          id: 5,
          recipientName: 'BlockChain Merchants',
          address: 'TPRgvk...JoCSck',
          networks: ['Bitcoin', 'TRC-20'],
          currency: 'BTC, USDT'
        },
        {
          id: 6,
          recipientName: 'BlockChain Merchants',
          address: 'TPRgvk...JoCSck',
          networks: ['Bitcoin', 'TRC-20'],
          currency: 'BTC, USDT'
        }
      ]
    }
  },

  methods: {
    openCreatePayoutModal () {
      this.showCreatePayoutModal = true
    },

    closeCreatePayoutModal () {
      this.showCreatePayoutModal = false
    },

    handlePayoutComplete () {
      this.showCreatePayoutModal = false
      this.$message.success('Payout created successfully!')
      // 可以在这里刷新数据
    },

    goToPayoutHistory () {
      this.$router.push('/payout-history')
    },

    transferToRecipient (transfer) {
      // 打开转账模态框并预填收款人信息
      console.log('Transfer to:', transfer.recipientName)
      this.openCreatePayoutModal()
    },

    getNetworkColor (network) {
      const colors = {
        'ERC-20': '',
        'TRC-20': '',
        'BEP-20': '',
        'Bitcoin': '',
        'Polygon': ''
      }
      return colors[network] || 'default'
    }
  }
}
</script>

<style lang="less" scoped>
.create-payout-page {
  min-height: 100vh;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.history-btn {
  font-size: 14px;
  color: #11253e;

  &:hover {
    color: #1a3554;
  }

  .anticon {
    margin-right: 8px;
  }
}

.payout-tabs {
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;

  /deep/ .ant-tabs-bar {
    border-bottom: 1px solid #f0f0f0;
  }

  /deep/ .ant-tabs-tab {
    font-size: 14px;
    font-weight: 500;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.balance-card {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
  border-radius: 12px;
  border: 0.5px solid var(--Line-Light, rgba(238, 239, 242, 1));
  padding: 24px;
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  width: 432px;
  height: 233px;

  .balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .coin-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .coin-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .coin-name {
        font-size: 18px;
        font-weight: 600;
        color: #262626;
      }

      .transfer-btn {
        background: #11253e;
        color: white;
        border: none;
        margin-left: 220px;
        border-radius: 6px;

        &:hover {
          background: #1a3554;
        }
      }
    }

  }

  .balance-content {
    .balance-amount {
      font-size: 36px;
      font-weight: 700;
      color: #262626;
      margin-bottom: 12px;
    }

    .balance-change {
      display: flex;
      align-items: center;
      gap: 16px;

      .change-amount {
        font-size: 16px;
        font-weight: 600;
        color: #52c41a;
      }

      .change-text {
        font-size: 14px;
        color: #8c8c8c;
      }

      .change-chart {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;

        .chart-line {
          padding: 2px;
        }

        .change-percent {
          font-size: 12px;
          color: #52c41a;
          font-weight: 500;
        }
      }
    }
  }
}

.recent-transfers {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 20px 0;
  }
}

.transfers-table {
  .table-header {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    .col {
      font-size: 14px;
      font-weight: 600;
      color: #8c8c8c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .table-body {
    .table-row {
      display: grid;
      grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f9f9f9;
      align-items: center;

      &:hover {
        background: #fafafa;
      }

      .col {
        font-size: 14px;
        color: #262626;

        &.col-name {
          font-weight: 500;
        }

        &.col-address {
          color: #8c8c8c;
          font-family: monospace;
        }
      }

      .network-tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
    }
  }
}

.create-payout-modal {
  /deep/ .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  /deep/ .ant-modal-body {
    padding: 0;
  }
}
    .create-payout-btn {
      background: #11253e;
      border-color: #11253e;
      font-weight: 500;
      position: absolute;
      right: 20px;
      height: 36px;
      border-radius: 6px;

      &:hover {
        background: #1a3554;
        border-color: #1a3554;
      }
    }

// 响应式设计
@media (max-width: 768px) {
  .create-payout-page {
    padding: 16px;
  }

  .balance-card {
    padding: 20px;

    .balance-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .balance-content {
      .balance-amount {
        font-size: 28px;
      }

      .balance-change {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .change-chart {
          margin-left: 0;
        }
      }
    }
  }

  .transfers-table {
    overflow-x: auto;

    .table-header,
    .table-row {
      min-width: 600px;
    }
  }
}
</style>
