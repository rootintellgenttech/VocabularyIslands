<template>
    <div class="overview-container">
        <h2 class="page-title">學習總覽</h2>

        <el-row :gutter="30" class="stat-cards-row">
            <el-col :xs="24" :sm="8" v-for="(item, index) in overviewStats" :key="index">
                <div class="overview-card">
                    <div class="card-left">
                        <div class="stat-label">{{ item.label }}</div>
                        <div class="stat-main-value" :style="{ color: item.color }">
                            {{ item.value }}
                        </div>
                        <div class="stat-subtext">{{ item.subtext }}</div>
                    </div>
                    <div class="card-right">
                        <div class="icon-circle" :style="{ color: item.color }">
                            <i :class="item.icon"></i>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <div class="overview-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-line"></i> 學習成效比較
                </div>
                <div class="header-actions">
                    <button class="action-btn export-btn" @click="exportFullTable('export-overview')">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            <div id="export-overview">
                <el-table height="300" :data="learningData" style="width: 100%" class="custom-table">
                    <el-table-column prop="alliance" label="聯盟名稱" min-width="180" :filters="allianceFilters"
                        :filter-method="filterHandler" filter-placement="bottom-end">
                    </el-table-column>

                    <el-table-column prop="schoolCount" label="學校名稱" align="center"></el-table-column>
                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>

                    <el-table-column label="登入率" align="center">
                        <template slot-scope="scope">
                            <span class="status-pill green">{{ scope.row.loginRate }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="completionRate" label="練習完成率" align="center"></el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LearningOverview',
    data() {
        return {
            overviewStats: [
                {
                    label: '學生簽到率',
                    value: '85%',
                    subtext: '本週平均',
                    icon: 'fas fa-users',
                    color: '#2A9D8F'
                },
                {
                    label: '學生練習完成率',
                    value: '72%',
                    subtext: '本週平均',
                    icon: 'fas fa-book-open',
                    color: '#F4A261'
                },
                {
                    label: '學生總數',
                    value: '120',
                    subtext: '4 個班級',
                    icon: 'fas fa-user-friends',
                    color: '#E76F51'
                }
            ],

            // --- 學習成效表格數據 ---
            learningData: [
                { alliance: '海之鄉聯盟', schoolCount: 8, studentCount: 892, loginRate: '89%', completionRate: 85 },
                { alliance: '美濃書香聯盟', schoolCount: 7, studentCount: 756, loginRate: '91%', completionRate: 87 },
                { alliance: '山海聯盟', schoolCount: 6, studentCount: 721, loginRate: '85%', completionRate: 83 },
                { alliance: '鄰區聯盟', schoolCount: 7, studentCount: 878, loginRate: '88%', completionRate: 86 },
            ]
        };
    },
    computed: {
        // 自動根據資料生成篩選選單
        allianceFilters() {
            const alliances = this.learningData.map(item => item.alliance);
            // 使用 Set 移除重複名稱，並轉換成 Element UI 要求的格式
            return [...new Set(alliances)].map(name => ({
                text: name,
                value: name
            }));
        }
    },
    methods: {
        async exportFullTable(containerId) {
            const target = document.getElementById(containerId);
            if (!target) return;

            const tableEl = target.querySelector('.el-table');
            const tableBody = target.querySelector('.el-table__body-wrapper');

            const loading = this.$loading({
                lock: true,
                text: '正在生成完整截圖...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            try {
                const originalTableHeight = tableEl.style.height;
                const originalBodyHeight = tableBody.style.height;
                const originalOverflow = tableBody.style.overflow;

                tableEl.style.height = 'auto';
                tableBody.style.height = 'auto';
                tableBody.style.overflow = 'visible';

                await this.$nextTick();

                const canvas = await this.$html2canvas(target, {
                    backgroundColor: 'white',
                    useCORS: true,
                    scale: 2,
                    scrollY: 0,
                    scrollX: 0,
                    x: 0,
                    y: 0,
                    height: target.scrollHeight,
                    windowHeight: target.scrollHeight
                });

                tableEl.style.height = originalTableHeight;
                tableBody.style.height = originalBodyHeight;
                tableBody.style.overflow = originalOverflow;

                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `報表匯出_${new Date().getTime()}.png`;
                link.click();

            } catch (error) {
                console.error('匯出失敗', error);
                this.$message.error('匯出失敗，請重試');
            } finally {
                loading.close();
            }
        },
        // 篩選邏輯：判斷該列的聯盟是否等於選中的值
        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },

    }
};
</script>

<style lang="scss" scoped>
$primary-teal: #2A9D8F;
$card-bg: #FFFFFF;

.overview-container {
    padding: 24px;
    background-color: #F5F7FA;
    min-height: 100vh;
    margin-left: 90px;
    transition: margin-left 0.3s ease;
}

.page-title {
    font-size: 32px;
    font-weight: bold;
    color: #00332D;
    margin-bottom: 30px;
    text-align: left;
}

.stat-cards-row {
    margin-bottom: 30px;
}

.overview-card {
    background: $card-bg;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #EBEEF5;

    .stat-label {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin-bottom: 12px;
    }

    .stat-main-value {
        font-size: 40px;
        font-weight: 800;
        margin-bottom: 4px;
    }

    .stat-subtext {
        font-size: 14px;
        color: #999;
    }

    .icon-circle {
        font-size: 24px;
        opacity: 0.8;
    }
}

.overview-section {
    background: $card-bg;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .section-header {
        @include flex-center;
        justify-content: space-between;
        margin-bottom: 25px;

        .header-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            display: flex;
            align-items: baseline;
            gap: 10px;

            i {
                font-size: 18px;
                color: #999;
            }
        }
    }
}

.action-btn {
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    @include flex-center;
    gap: 8px;

    &.export-btn {
        background-color: $primary-teal;
        color: white;

        &:hover {
            opacity: 0.9;
        }
    }
}

.custom-table {
    ::v-deep th {
        background-color: transparent !important;
        border-bottom: 1.5px solid #F0F2F5;
        font-weight: bold;
        color: #333;
        font-size: 15px;
    }
}

.status-pill {
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;

    &.green {
        background-color: #E6F4F1;
        color: $primary-teal;
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .overview-container {
        margin-left: 0;
        padding: 16px;
    }

    .overview-card {
        margin-bottom: 15px;
    }
}
</style>