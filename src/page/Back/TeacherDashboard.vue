<template>
    <div class="dashboard-container">
        <h2 class="page-title">儀錶板</h2>

        <el-row :gutter="20" class="stat-cards-row">
            <el-col :xs="12" :sm="12" :md="6" v-for="(item, index) in statsData" :key="index">
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
                <button class="action-btn export-btn">
                    <i class="fas fa-download"></i> 匯出報表
                </button>
            </div>
            <el-table :data="learningData" style="width: 100%" class="custom-table">
                <el-table-column prop="alliance" label="聯盟名稱(可以篩選)" min-width="150"></el-table-column>
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

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-bar"></i> 試煉殿堂 考試概況
                </div>
                <div class="header-actions">
                    <button class="action-btn filter-btn">篩選條件</button>
                    <button class="action-btn export-btn">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            <el-table :data="examData" style="width: 100%" class="custom-table">
                <el-table-column prop="school" label="各校" min-width="150"></el-table-column>
                <el-table-column prop="schoolCount" label="學校名稱" align="center"></el-table-column>
                <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
                <el-table-column prop="examCompleteCount" label="考試完成人數" align="center"></el-table-column>
            </el-table>
        </div>

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-area"></i> 英語力學生簽到情況 (統計每天有多少位學生簽到)
                </div>
                <button class="action-btn export-btn">
                    <i class="fas fa-download"></i> 匯出報表
                </button>
            </div>
            <div class="chart-wrapper">
                <apexchart type="line" height="350" :options="lineChartOptions" :series="lineSeries"></apexchart>
            </div>
        </div>

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-column"></i> 競技島嶼學生挑戰人數分析 (統計每天有多少位學生挑戰)
                </div>
                <button class="action-btn export-btn">
                    <i class="fas fa-download"></i> 匯出報表
                </button>
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
            // --- 頂部數據 ---
            statsData: [
                { label: '總班級數', value: '4', percentage: '+6%', isIncrease: true },
                { label: '學校總數', value: '28', percentage: '+2%', isIncrease: true },
                { label: '教師總數', value: '156', percentage: '+8%', isIncrease: true },
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
                { name: '全體', data: [45, 52, 38, 24, 33, 26, 21] } // 虛線模擬
            ],
            lineChartOptions: {
                chart: { type: 'line', toolbar: { show: false } },
                stroke: { curve: 'smooth', width: [3, 3, 2], dashArray: [0, 0, 5] }, // 第三條線設為虛線
                colors: ['#2A9D8F', '#E76F51', '#264653'], // 自定義顏色
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
                chart: { type: 'bar', stacked: true, toolbar: { show: false } }, // 設定為堆疊
                colors: ['#2A9D8F', '#E76F51'],
                plotOptions: {
                    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 }
                },
                xaxis: { categories: ['周一', '周二', '周三', '周四', '周五', '周六'] },
                legend: { position: 'bottom' },
                dataLabels: { enabled: false }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
$card-bg: #FFFFFF;
$primary-green: #2A9D8F;
$trend-green: #2ECC71;
$trend-red: #E74C3C;

.dashboard-container {
    padding: 24px;
    background-color: #F5F7FA;
    min-height: 100vh;
    margin-left: 90px;
    transition: margin-left 0.3s ease;

}

.page-title {
    font-size: 24px;
    font-weight: bold;
    color: $primary-green;
    margin-bottom: 24px;
    text-align: left;
}

.stat-cards-row {
    margin-bottom: 24px;
}

.stat-card {
    background: $card-bg;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 120px;
    position: relative;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-2px);
    }

    .stat-label {
        font-size: 16px;
        color: $main-grey-text;
        font-weight: 500;
        text-align: left;
    }

    .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: $main-black-text;
      margin-bottom: 8px;
        text-align: left;
    }

    .stat-trend {
        font-size: 16px;
        font-weight: 600;
        margin-top: auto;
        text-align: left;

        &.trend-up {
            color: $trend-green;
        }

        &.trend-down {
            color: $trend-red;
        }

        i {
            margin-right: 2px;
        }
    }
}

.dashboard-section {
    background: $card-bg;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .section-header {
        @include flex-center;
        justify-content: space-between;
        margin-bottom: 20px;

        .header-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
           @include flex-center;
            gap: 10px;

            i {
                font-size: 16px;
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
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 16px;
    cursor: pointer;
    transition: opacity 0.2s;
    font-weight: 500;
    @include flex-center;
    gap: 6px;

    &.export-btn {
        background-color: $primary-green;
        color: white;

        &:hover {
            opacity: 0.9;
        }
    }

    &.filter-btn {
        background-color: #E0F2F1;
        color: $primary-green;

        &:hover {
            background-color: #d0ebea;
        }
    }
}

.custom-table {
    ::v-deep th {
        background-color: transparent !important;
        border-bottom: 1px solid #EBEEF5;
        font-weight: bold;
        color: #333;
    }

    ::v-deep td {
        padding: 12px 0;
    }
}

.status-pill {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;

    &.green {
        background-color: rgba($primary-green, 0.1);
        color: $primary-green;
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {

    .dashboard-container {
        margin-left: 0;
        padding: 16px;
    }

    .stat-card {
        height: auto;
        margin-bottom: 12px;
    }


}
</style>