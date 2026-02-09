<template>
    <div class="dashboard-container">
        <h2 class="page-title">儀錶板</h2>

        <el-row :gutter="20" class="stat-cards-row">
            <el-col :span="12" v-for="(item, index) in statsData" :key="index">
                <div class="stat-card">
                    <div class="stat-label">{{ item.label }}</div>
                    <div class="stat-value">{{ item.value }}</div>
                    <div class="stat-trend" :class="item.isIncrease ? 'trend-up' : 'trend-down'">
                        <i :class="item.isIncrease ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
                        {{ item.percentage }}
                    </div>
                </div>
            </el-col>
        </el-row>

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-line"></i> 學習成效比較
                </div>
                <div class="header-actions">
                    <button class="action-btn" @click="exportFullTable('export-learn')">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            <div id="export-learn">
                <el-table height="300" :data="learningData" style="width: 100%" class="custom-table">
                    <el-table-column prop="alliance" label="聯盟名稱" :filters="allianceFilters"
                        :filter-method="filterHandler" min-width="150"></el-table-column>
                    <el-table-column prop="schoolCount" label="已有注冊學校 / 應有注冊學校" align="center"></el-table-column>
                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
                    <el-table-column label="當天簽到率" align="center">
                        <template slot-scope="scope">
                            <span class="status-pill green">{{ scope.row.loginRate }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="completionRate" label="平均達成率" align="center"></el-table-column>
                </el-table>
            </div>
        </div>

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-bar"></i> 試煉殿堂考試概況
                </div>
                <div class="header-actions">
                    <button class="action-btn" @click="exportFullTable('export-status')">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            <div id="export-staus">
                <el-table height="300" :data="examData" style="width: 100%" class="custom-table">
                    <el-table-column prop="school" label="各校" min-width="150"></el-table-column>
                    <el-table-column prop="schoolCount" label="已有注冊學校 / 應有注冊學校" align="center"></el-table-column>
                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
                    <el-table-column prop="examCompleteCount" label="考試完成人數" align="center"></el-table-column>
                </el-table>
            </div>
        </div>

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-area"></i> 英語力學生簽到情況 (統計每天有多少位學生簽到)
                </div>
            </div>
            <div class="chart-wrapper">
                <apexchart type="line" height="350" :options="lineChartOptions" :series="lineSeries"></apexchart>
            </div>
        </div>
        <div v-if="userRole === 'teacher'" class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-bar"></i> 測驗練習 (計算各單元的完成星級數去計算)
                </div>
                <div class="header-actions">
                    <el-select v-model="filterSubject" placeholder="主題篩選" class="custom-select teal-select small">
                        <el-option label="全部主題" value="all"></el-option>
                        <el-option label="單字島嶼" value="islands"></el-option>
                        <el-option label="聽力海灣" value="listening"></el-option>
                    </el-select>
                </div>
            </div>

            <div id="export-teacher-practice" class="chart-container-white">
                <div class="chart-wrapper">
                    <apexchart type="bar" height="350" :options="practiceBarOptions" :series="practiceBarSeries">
                    </apexchart>
                </div>
            </div>
        </div>
        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-column"></i> 競技島嶼學生挑戰人數分析 (統計每天有多少位學生挑戰)
                </div>
            </div>
            <div class="chart-wrapper">
                <apexchart type="bar" height="350" :options="barChartOptions" :series="barSeries"></apexchart>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    name: 'TeacherDashboard',
    data() {
        return {
            userRole: localStorage.getItem('userRole') || 'teacher',
            filterSubject: 'all',
            // --- 老師專用：測驗練習堆疊圖數據 ---
            practiceBarSeries: [
                { name: '班級 A', data: [32, 45, 38, 25, 42, 35, 10, 5] },
                { name: '班級 B', data: [25, 30, 20, 18, 25, 28, 0, 0] }
            ],
            practiceBarOptions: {
                chart: {
                    type: 'bar',
                    stacked: true,
                    toolbar: { show: true }
                },
                colors: ['#2A9D8F', '#E76F51'],
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '40%',
                        borderRadius: 4
                    }
                },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: ['acb島嶼', '300字島', '小英雄大本營', '國小聽力海灣', '800字島', '1200字島', '會考大殿堂', '國中聽力海灣'],
                    labels: { rotate: -45, style: { fontSize: '12px' } }
                },
                yaxis: {
                    labels: {
                        formatter: (val) => val + "%"
                    },
                    min: 0,
                    max: 100
                },
                legend: { position: 'bottom' },
                tooltip: { y: { formatter: (val) => val + "%" } }
            },


            statsData: [
                { label: '學校總數', value: '28', percentage: '+2%', isIncrease: true },
                { label: '學生總數', value: '3,247', percentage: '-12%', isIncrease: false },
            ],

            // --- 表格 1 數據 ---
            learningData: [
                { alliance: '海之霸聯盟', schoolCount: 8, studentCount: 892, loginRate: '89%', completionRate: 85 },
                { alliance: '美濃書香聯盟', schoolCount: 7, studentCount: 756, loginRate: '91%', completionRate: 87 },
                { alliance: '山海聯盟', schoolCount: 6, studentCount: 721, loginRate: '85%', completionRate: 83 },
                { alliance: '南區聯盟', schoolCount: 7, studentCount: 878, loginRate: '88%', completionRate: 86 },
            ],

            // --- 表格 2 數據 ---
            examData: [
                { school: '海之霸聯盟', schoolCount: 8, studentCount: 892, examCompleteCount: 85 },
                { school: '美濃書香聯盟', schoolCount: 7, studentCount: 756, examCompleteCount: 87 },
                { school: '山海聯盟', schoolCount: 6, studentCount: 721, examCompleteCount: 83 },
                { school: '南區聯盟', schoolCount: 7, studentCount: 878, examCompleteCount: 86 },
            ],

            // --- 折線圖設定 (簽到) ---
            lineSeries: [
                { name: 'XX學校', data: [31, 40, 28, 51, 42, 109, 100] },
                { name: 'YY學校', data: [11, 32, 45, 32, 34, 52, 41] },
                { name: '全體', data: [45, 52, 38, 24, 33, 26, 21] }
            ],
            lineChartOptions: {
                chart: { type: 'line', toolbar: { show: true } },
                stroke: { curve: 'smooth', width: [3, 3, 2], dashArray: [0, 0, 5] },
                colors: ['#2A9D8F', '#E76F51', '#264653'],
                xaxis: { categories: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7'] },
                legend: { position: 'bottom' },
                grid: { borderColor: '#f1f1f1' }
            },

            // --- 柱狀圖設定 (挑戰) ---
            barSeries: [
                { name: 'XX學校', data: [44, 55, 41, 67, 22, 43] },
                { name: 'YY學校', data: [13, 23, 20, 8, 13, 27] }
            ],
            barChartOptions: {
                chart: { type: 'bar', stacked: true, toolbar: { show: true } },
                colors: ['#2A9D8F', '#E76F51'],
                plotOptions: {
                    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 }
                },
                xaxis: { categories: ['周一', '周二', '周三', '周四', '周五', '周六'] },
                legend: { position: 'bottom' },
                dataLabels: { enabled: false }
            }
        }
    },
    computed: {
        allianceFilters() {
            const alliances = this.learningData.map(item => item.alliance);
            return [...new Set(alliances)].map(name => ({
                text: name,
                value: name
            }));
        }
    },

    methods: {
        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },
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
    }
};
</script>

<style lang="scss" scoped>
.dashboard-container {
    padding: 24px;
    background-color: #F5F7FA;
    min-height: 100vh;
    margin-left: 90px;
    text-align: left;
}

.page-title {
    font-size: 32px;
    font-weight: bold;
    color: $main-back-blue-text;
    margin-bottom: 30px;
}

.stat-cards-row {
    margin-bottom: 24px;
}

.stat-card {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    @include main-box-shadow;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 120px;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }

    .stat-label {
        font-size: 16px;
        color: $main-grey-text;
        font-weight: 500;
    }

    .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: $main-black-text;
        margin-bottom: 4px;
    }


    .stat-trend {
        font-size: 16px;
        font-weight: 600;
        margin-top: auto;
        @include flex-center;
        gap: 2px;

        &.trend-up {
            color: #2ECC71;
        }

        &.trend-down {
            color: #E74C3C;
        }
    }
}

.dashboard-section {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    @include main-box-shadow;

    .section-header {
        @include flex-center;
        justify-content: space-between;
        margin-bottom: 20px;

        .header-title {
            font-size: 18px;
            font-weight: bold;
            color: $main-black-text;
            @include flex-center;
            gap: 10px;

            i {
                color: #999;
            }

        }

        .header-actions {
            display: flex;
            gap: 10px;
        }
    }
}

.action-btn {
@include back-system-action-btn
}

.custom-table {
    ::v-deep {
        th {
            background-color: transparent !important;
            border-bottom: 1px solid #EBEEF5;
            font-weight: bold;
            color: $main-black-text;
        }

        td {
            padding: 12px 0;
        }
    }
}

.status-pill {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;

    &.green {
        background-color: rgba(42, 157, 143, 0.1);
        color: $main-green;
    }
}

.teal-select.small {
    width: 150px;

    ::v-deep .el-input__inner {
        background-color: $main-green;
        color: white;
        border: none;
        border-radius: 8px;
    }

    ::v-deep .el-input__icon {
        color: white;
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .dashboard-container {
        margin-left: 0;
    }

    .stat-card {
        height: auto;
        margin-bottom: 12px;
    }
}
</style>