<template>
    <div class="analysis-container">
        <h2 class="page-title">競技島分析</h2>

        <div class="analysis-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-line"></i> 競技島嶼學生挑戰人數分析(統計每天有多少位學生挑戰)
                </div>
            </div>
            <div class="chart-wrapper">
                <apexchart type="bar" height="300" :options="stackedBarOptions" :series="stackedBarSeries"></apexchart>
            </div>
        </div>

        <div class="analysis-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-table"></i> 參與人數與總積分
                </div>
                <div class="header-actions">
                    <button class="action-btn export-btn" @click="exportFullTable('export-island-analysis')">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                </div>
            </div>
            <div id="export-island-analysis">
                <el-table height="300" :data="islandTableData" style="width: 100%" class="custom-table">
                    <el-table-column prop="alliance" label="聯盟名稱" :filters="allianceFilters"
                        :filter-method="filterHandler" min-width="150"></el-table-column>
                    <el-table-column prop="totalStudents" label="學生總數" align="center"></el-table-column>
                    <el-table-column prop="participants" label="參與人數" align="center"></el-table-column>
                    <el-table-column label="參與率" align="center">
                        <template slot-scope="scope">
                            <span class="status-pill green">{{ scope.row.participationRate }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalScore" label="總積分" align="right">
                        <template slot-scope="scope">
                            <span class="score-text">{{ scope.row.totalScore.toLocaleString() }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <div class="analysis-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-bar"></i> 競技島分析(顯示各校總積分數)
                </div>
                <div class="header-actions">
                    <el-select v-model="filterType" placeholder="聽力/閱讀" class="full-width-select header-select-box">
                        <el-option label="聽力測驗" value="listening"></el-option>
                        <el-option label="閱讀測驗" value="reading"></el-option>
                    </el-select>
                    <el-date-picker v-model="filterDate" type="date" placeholder="篩選日期"
                        class="custom-select teal-select">
                    </el-date-picker>
                </div>
            </div>
            <div class="chart-wrapper">
                <apexchart type="bar" height="350" :options="multiColorBarOptions" :series="multiColorBarSeries">
                </apexchart>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'IslandAnalysis',
    data() {
        return {
            filterType: '',
            filterDate: '',
            // --- 1. 堆疊柱狀圖數據 ---
            stackedBarSeries: [
                { name: 'xx學校', data: [44, 55, 41, 37, 22, 43] },
                { name: 'xxx學校', data: [13, 23, 20, 8, 13, 27] }
            ],
            stackedBarOptions: {
                chart: { type: 'bar', stacked: true, toolbar: { show: true } },
                colors: ['#2A9D8F', '#E76F51'],
                plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
                xaxis: { categories: ['日期', '1/1', '1/2', '1/3', '1/4', '1/5'] },
                legend: { position: 'bottom' },
                dataLabels: { enabled: false }
            },

            // --- 2. 表格數據 ---
            islandTableData: [
                { alliance: '聯盟名稱', totalStudents: 892, participants: 892, participationRate: '89%', totalScore: 1555555 },
                { alliance: '聯盟名稱', totalStudents: 756, participants: 756, participationRate: '91%', totalScore: 1555555 },
                { alliance: '聯盟名稱', totalStudents: 721, participants: 721, participationRate: '85%', totalScore: 1555555 },
                { alliance: '聯盟名稱', totalStudents: 878, participants: 878, participationRate: '88%', totalScore: 1555555 }
            ],

            // --- 3. 多色柱狀圖數據 ---
            multiColorBarSeries: [{
                name: '積分',
                data: [21000, 32000, 20000, 5000, 28000, 26000]
            }],
            multiColorBarOptions: {
                chart: { type: 'bar', toolbar: { show: true } },
                colors: ['#2A9D8F', '#E76F51', '#264653', '#8AB17D', '#A1A100', '#6366F1'],
                plotOptions: {
                    bar: {
                        distributed: true, // 讓每一根柱子顏色不同
                        columnWidth: '50%',
                        borderRadius: 4
                    }
                },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: ['參與人數', '參與人數', '參與人數', '參與人數', 'xxx學校', 'xxx學校'],
                    labels: { style: { fontSize: '12px' } }
                },
                legend: { show: false } // 隱藏圖例，因為顏色分布在 X 軸
            }
        };
    },
    computed: {
        allianceFilters() {
            const alliances = this.islandTableData.map(item => item.alliance);
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
        goToDetail(row) {
            console.log('查看試卷詳情:', row.name);
            this.$router.push({
                path: '/exam-detail',
                query: { name: row.name }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
$primary-teal: #2A9D8F;
$section-bg: #FFFFFF;

.analysis-container {
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

.analysis-section {
    background: $section-bg;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .section-header {
        @include flex-center;
        justify-content: space-between;
        margin-bottom: 25px;

        .header-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            display: flex;
            align-items: baseline;
            gap: 10px;

            i {
                color: #999;
            }
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }
    }
}

.action-btn {
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    @include flex-center;
    gap: 6px;

    &.export-btn {
        background-color: $primary-teal;
        color: white;

        &:hover {
            opacity: 0.9;
        }
    }
}

.teal-select {
    ::v-deep .el-input__inner {
        background-color: $primary-teal;
        color: white;
        border-radius: 8px;
        border: none;

        &::placeholder {
            color: rgba(255, 255, 255, 0.8);
        }
    }

    ::v-deep .el-input__icon {
        color: white;
    }
}



.header-select-box {
    width: 160px;
}

.full-width-select {
    ::v-deep .el-input__inner {
        background-color: $primary-teal;
        border-radius: 10px;
        border: 1px solid rgba($primary-teal, 0.2);
        color: white;

        &::placeholder {
            color: white;
            opacity: 1;
        }

        &::-webkit-input-placeholder {
            color: white;
        }

        &::-moz-placeholder {
            color: white;
        }

        &:-ms-input-placeholder {
            color: white;
        }
    }

    ::v-deep .el-input__icon {
        color: white;
    }
}


.score-text {
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
}

.status-pill {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;

    &.green {
        background-color: #E6F4F1;
        color: $primary-teal;
    }
}

.custom-table {
    ::v-deep th {
        background-color: transparent !important;
        font-weight: bold;
        color: #333;
        border-bottom: 2px solid #F0F2F5;
    }
}

@media (max-width: 1200px) {
    .section-header {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 15px;

        .header-actions {
            width: 100%;
            flex-wrap: wrap;
        }
    }
}
</style>