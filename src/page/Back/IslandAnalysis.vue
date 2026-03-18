<template>
    <div class="analysis-container">
        <h2 class="page-title">競技島分析</h2>

        <div class="analysis-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-column"></i> 競技島嶼學生今日挑戰人數
                </div>
                <div v-if="userRole === 'global_leader'" class="header-actions">
                    <el-select v-model="selectedParticipantAlliance" placeholder="選擇聯盟" class="teal-select"
                        @change="handleParticipantAllianceChange">
                        <el-option v-for="item in allianceOptions" :key="item" :label="item" :value="item"></el-option>
                    </el-select>

                    <el-select v-model="selectedParticipantSchools" multiple collapse-tags placeholder="選擇學校"
                        class="teal-select multi-select" @change="updateParticipantChart">
                        <div class="select-all-box">
                            <el-button type="text" @click="selectParticipantAll">全選</el-button>
                            <el-button type="text" @click="deselectParticipantAll"
                                style="color: #F56C6C;">取消全選</el-button>
                        </div>
                        <el-option v-for="item in participantSchoolOptions" :key="item" :label="item"
                            :value="item"></el-option>
                    </el-select>
                </div>
            </div>

            <div class="chart-wrapper scrollable-chart-container">
                <div :style="{ width: participantChartWidth, minWidth: '100%' }">
                    <apexchart type="bar" height="350" :options="stackedBarOptions" :series="stackedBarSeries">
                    </apexchart>
                </div>
            </div>
        </div>

        <div class="analysis-section">
            <div class="section-header">
                <div class="header-title"><i class="fas fa-table"></i> 參與人數與總積分</div>
                <button class="action-btn" @click="exportFullTable('export-island-analysis')"> <i
                        class="fas fa-download"></i> 匯出報表</button>
            </div>
            <div id="export-island-analysis">
                <el-table height="400" :data="islandTableData" style="width: 100%" class="custom-table">

                    <el-table-column v-if="userRole === 'global_leader'" type="expand">
                        <template slot-scope="props">
                            <div class="expand-table-wrapper">
                                <h4 class="expand-title">{{ props.row.alliance }} - 學校明細</h4>
                                <el-table :data="props.row.schools" border size="mini" style="width: 100%">
                                    <el-table-column prop="school_name" label="學校名稱"></el-table-column>
                                    <el-table-column prop="student_total" label="學生總數" align="center"></el-table-column>
                                    <el-table-column prop="today_competition_participants" label="參與人數"
                                        align="center"></el-table-column>
                                    <el-table-column label="參與率" align="center">
                                        <template slot-scope="sub">
                                            {{ sub.row.student_total > 0 ? ((sub.row.today_competition_participants /
                                                sub.row.student_total) * 100).toFixed(0) + '%' : '0%' }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="competition_total_score" label="總積分" align="center">
                                        <template slot-scope="sub">{{ sub.row.competition_total_score.toLocaleString()
                                        }}</template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column v-if="userRole === 'global_leader'" prop="alliance" label="聯盟名稱"
                        min-width="150"></el-table-column>

                    <el-table-column
                        :label="userRole === 'global_leader' ? '學校數量' : (userRole === 'school_admin' ? '班級' : '學校名稱')"
                        align="center">
                        <template slot-scope="scope">
                            <span v-if="userRole === 'global_leader'">{{ scope.row.schoolCount }} 間</span>
                            <span v-else>{{ userRole === 'school_admin' ? scope.row.classroom : scope.row.schoolName
                            }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="totalStudents" label="學生總數" align="center"></el-table-column>
                    <el-table-column prop="participants" label="參與人數" align="center"></el-table-column>
                    <el-table-column label="參與率" align="center">
                        <template slot-scope="scope"><span class="status-pill green">{{ scope.row.participationRate
                        }}</span></template>
                    </el-table-column>
                    <el-table-column prop="totalScore" label="總積分" align="center">
                        <template slot-scope="scope"><strong>{{ scope.row.totalScore.toLocaleString()
                        }}</strong></template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <div class="analysis-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-bar"></i> 競技島分析(今日挑戰者平均分數)
                </div>
                <div v-if="userRole === 'global_leader'" class="header-actions">
                    <el-select v-model="selectedScoreAlliance" placeholder="選擇聯盟" class="teal-select"
                        @change="handleScoreAllianceChange">
                        <el-option v-for="item in allianceOptions" :key="item" :label="item" :value="item"></el-option>
                    </el-select>

                    <el-select v-model="selectedScoreSchools" multiple collapse-tags placeholder="選擇學校"
                        class="teal-select" @change="updateScoreChart">
                        <div class="select-all-box">
                            <el-button type="text" @click="selectScoreAll">全選</el-button>
                            <el-button type="text" @click="deselectScoreAll" style="color: #F56C6C;">取消全選</el-button>
                        </div>
                        <el-option v-for="item in scoreSchoolOptions" :key="item" :label="item"
                            :value="item"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="chart-wrapper scrollable-chart-container">
                <div :style="{ width: scoreChartWidth, minWidth: '100%' }">
                    <apexchart type="bar" height="350" :options="multiColorBarOptions" :series="multiColorBarSeries">
                    </apexchart>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/config/api';

const getChartLabelsAndValues = (res, role, targetField) => {
    let categories = [];
    let values = [];
    if (res.data.level === 'league') {
        res.data.results.forEach(league => {
            (league.schools || []).forEach(school => {
                categories.push(school.school_name);
                values.push(school[targetField] || 0);
            });
        });
    } else {
        res.data.results.forEach(item => {
            const label = role === 'school_admin' ? `${item.grade}年${item.classroom}班` : item.school_name;
            categories.push(label);
            values.push(item[targetField] || 0);
        });
    }
    return { categories, values };
};


export default {
    name: 'IslandAnalysis',
    data() {
        return {
            userRole: localStorage.getItem('userRole') || 'school_admin',

            // 初始化數據為空
            rawListData: [],
            allianceOptions: [],
            islandTableData: [],

            // 圖表 1 狀態
            selectedParticipantAlliance: '',
            participantSchoolOptions: [],
            selectedParticipantSchools: [],
            stackedBarSeries: [],
            stackedBarOptions: {},

            // 圖表 2 狀態
            selectedScoreAlliance: '',
            scoreSchoolOptions: [],
            selectedScoreSchools: [],
            multiColorBarSeries: [],
            multiColorBarOptions: {},

            participantCount: 0,
            scoreCount: 0
        };
    },
    computed: {
        // 挑戰人數圖表寬度：如果是總召看選中的，如果是管理員看全部結果
        participantChartWidth() {
            const count = this.userRole === 'global_leader'
                ? this.selectedParticipantSchools.length
                : (this.rawListData ? this.rawListData.length : 0);
            return count > 12 ? `${count * 75}px` : '100%';
        },
        // 平均分數圖表寬度
        scoreChartWidth() {
            const count = this.userRole === 'global_leader'
                ? this.selectedScoreSchools.length
                : (this.rawListData ? this.rawListData.length : 0);
            return count > 12 ? `${count * 75}px` : '100%';
        },
        allianceFilters() {
            const alliances = this.islandTableData.map(item => item.alliance);
            return [...new Set(alliances)].map(name => ({ text: name, value: name }));
        }
    },
    mounted() {
        this.fetchBaseData();
    },
    methods: {
        async fetchBaseData() {
            try {
                const res = await api.get('/students/list/');
                const rawData = res.data || {};
                this.rawListData = rawData.results || [];

                if (rawData.level === 'league' && this.userRole === 'global_leader') {
                    // 總召：動態載入聯盟選項並預設選取第一個
                    this.allianceOptions = this.rawListData.map(l => l.league_name);
                    const defaultName = this.allianceOptions[0];

                    if (defaultName) {
                        this.selectedParticipantAlliance = defaultName;
                        this.selectedScoreAlliance = defaultName;
                        this.handleParticipantAllianceChange(defaultName);
                        this.handleScoreAllianceChange(defaultName);
                    }
                } else {
                    // 其他身分：直接渲染
                    this.renderParticipantChart(this.rawListData);
                    this.renderScoreChart(this.rawListData);
                }

                this.processTableData(rawData);
            } catch (err) { console.error('數據加載失敗', err); }
        },

        // 挑戰人數控制 (僅總召可見)
        handleParticipantAllianceChange(name) {
            const league = this.rawListData.find(l => l.league_name === name);
            if (league) {
                this.participantSchoolOptions = league.schools.map(s => s.school_name);
                this.selectedParticipantSchools = [...this.participantSchoolOptions];
                this.updateParticipantChart();
            }
        },
        selectParticipantAll() {
            this.selectedParticipantSchools = [...this.participantSchoolOptions];
            this.updateParticipantChart();
        },
        deselectParticipantAll() {
            this.selectedParticipantSchools = [];
            this.updateParticipantChart();
        },
        updateParticipantChart() {
            const league = this.rawListData.find(l => l.league_name === this.selectedParticipantAlliance);
            if (!league) return;
            const schools = league.schools.filter(s => this.selectedParticipantSchools.includes(s.school_name));
            this.renderParticipantChart(schools);
        },

        // 平均分數控制 (僅總召可見)
        handleScoreAllianceChange(name) {
            const league = this.rawListData.find(l => l.league_name === name);
            if (league && league.schools) {
                this.scoreSchoolOptions = league.schools.map(s => s.school_name);
                this.selectedScoreSchools = [...this.scoreSchoolOptions];
                this.updateScoreChart();
            }
        },
        selectScoreAll() {
            this.selectedScoreSchools = [...this.scoreSchoolOptions];
            this.updateScoreChart();
        },
        deselectScoreAll() {
            this.selectedScoreSchools = [];
            this.updateScoreChart();
        },
        updateScoreChart() {
            const league = this.rawListData.find(l => l.league_name === this.selectedScoreAlliance);
            if (!league) return;
            const schools = league.schools.filter(s => this.selectedScoreSchools.includes(s.school_name));
            this.renderScoreChart(schools);
        },

        getCommonBarOptions(categories, unit) {
            return {
                chart: { type: 'bar', toolbar: { show: true }, animations: { enabled: true, speed: 800 } },
                colors: ['#2A9D8F', '#E76F51', '#264653', '#F4A261', '#E9C46A', '#6366F1', '#A8DADC'],
                plotOptions: {
                    bar: { columnWidth: '70%', distributed: true, borderRadius: 4, dataLabels: { position: 'center' } }
                },
                dataLabels: {
                    enabled: true,
                    style: { fontSize: '12px', colors: ['#FFFFFF'], fontWeight: 'bold' },
                    formatter: (val) => val > 0 ? val : ''
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        show: true, rotate: -45, rotateAlways: true, hideOverlappingLabels: false,
                        trim: false, minHeight: 100, style: { fontSize: '12px', fontWeight: 500 }
                    },
                    axisBorder: { show: true }, axisTicks: { show: true }
                },
                yaxis: { labels: { formatter: (val) => Math.floor(val) }, title: { text: unit } },
                legend: { show: true, position: 'bottom', horizontalAlign: 'center' },
                grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                tooltip: { theme: 'light', y: { formatter: (val) => val + ' ' + unit } }
            };
        },

        // 處理身分標籤
        renderParticipantChart(dataArray) {
            const categories = dataArray.map(item => item.school_name || `${item.grade}年${item.classroom}班`);
            const values = dataArray.map(item => item.today_competition_participants || 0);
            this.participantCount = categories.length;
            this.stackedBarOptions = this.getCommonBarOptions(categories, '人');
            this.stackedBarSeries = [{ name: '今日挑戰人數', data: values }];
        },
        renderScoreChart(dataArray) {
            const categories = dataArray.map(item => item.school_name || `${item.grade}年${item.classroom}班`);
            const values = dataArray.map(item => {
                const p = Number(item.today_competition_participants) || 0;
                const score = Number(item.competition_total_score) || 0;
                return p > 0 ? Number((score / p).toFixed(1)) : 0;
            });
            this.scoreCount = categories.length;
            this.multiColorBarOptions = this.getCommonBarOptions(categories, '分');
            this.multiColorBarSeries = [{ name: '今日挑戰者平均分', data: values }];
        },

        // 處理中間的參與人數表格
        processTableData(resData) {
            const rawResults = resData.results || [];
            if (resData.level === 'league') {
                this.islandTableData = rawResults.map(league => {
                    const schools = league.schools || [];
                    const sTotal = schools.reduce((sum, s) => sum + (Number(s.student_total) || 0), 0);
                    const pTotal = schools.reduce((sum, s) => sum + (Number(s.today_competition_participants) || 0), 0);
                    const scoreTotal = schools.reduce((sum, s) => sum + (Number(s.competition_total_score) || 0), 0);
                    return {
                        alliance: league.league_name,
                        schoolCount: league.school_total || schools.length,
                        totalStudents: sTotal,
                        participants: pTotal,
                        participationRate: sTotal > 0 ? ((pTotal / sTotal) * 100).toFixed(0) + '%' : '0%',
                        totalScore: scoreTotal,
                        schools: schools
                    };
                });
            } else {
                this.islandTableData = rawResults.map(item => ({
                    classroom: item.classroom,
                    schoolName: item.school_name,
                    totalStudents: Number(item.student_total) || 0,
                    participants: Number(item.today_competition_participants) || 0,
                    participationRate: Number(item.student_total) > 0 ? ((Number(item.today_competition_participants) / Number(item.student_total)) * 100).toFixed(0) + '%' : '0%',
                    totalScore: Number(item.competition_total_score) || 0
                }));
            }
        },

        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },
        exportFullTable(containerId) {
            const reportTitle = '競技島嶼參與人數與總積分報表';
            const data = this.islandTableData;
            const role = this.userRole;
            const isGlobal = role === 'global_leader';

            const printWindow = window.open('', '_blank');

            let tableHtml = '';

            data.forEach(item => {
                if (isGlobal) {
                    // 總召模式：聯盟彙總 + 學校明細
                    tableHtml += `
                <tr class="league-row">
                    <td colspan="5" style="text-align: center;">${item.alliance} (聯盟彙總)</td>
                </tr>
                <tr class="summary-header">
                    <td>學校數量: ${item.schoolCount} 間</td>
                    <td>學生總數: ${item.totalStudents}</td>
                    <td>參與人數: ${item.participants}</td>
                    <td>參與率: ${item.participationRate}</td>
                    <td>總積分: ${item.totalScore.toLocaleString()}</td>
                </tr>
            `;

                    if (item.schools && item.schools.length > 0) {
                        item.schools.forEach(school => {
                            const pRate = school.student_total > 0
                                ? ((school.today_competition_participants / school.student_total) * 100).toFixed(0) + '%'
                                : '0%';
                            tableHtml += `
                        <tr class="detail-row">
                            <td style="text-align: left; padding-left: 30px;">${school.school_name}</td>
                            <td>${school.student_total}</td>
                            <td>${school.today_competition_participants}</td>
                            <td>${pRate}</td>
                            <td style="text-align: right;">${school.competition_total_score.toLocaleString()}</td>
                        </tr>
                    `;
                        });
                    }
                } else {
                    // 召集人/校管模式：平鋪結構
                    const label = (role === 'school_admin') ? item.classroom : item.schoolName;
                    tableHtml += `
                <tr class="detail-row">
                    <td style="text-align: left;">${label}</td>
                    <td>${item.totalStudents}</td>
                    <td>${item.participants}</td>
                    <td>${item.participationRate}</td>
                    <td style="text-align: right; font-weight: bold; color: #2A9D8F;">
                        ${item.totalScore.toLocaleString()}
                    </td>
                </tr>
            `;
                }
            });

            const firstColLabel = isGlobal ? '名稱' : (role === 'school_admin' ? '班級' : '學校名稱');

            printWindow.document.write(`
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                /* 強制背景色彩與打印優化 */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { font-family: "Microsoft JhengHei", sans-serif; padding: 20px; color: #333; line-height: 1.5; }
                .report-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2A9D8F; padding-bottom: 10px; }
                .report-header h2 { color: #2A9D8F; margin: 0; }
                .info-bar { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin: 10px 0; }
                
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: center; font-size: 13px; }
                th { background-color: #f8f9fa; font-weight: bold; }

                /* 樣式切換 */
                .league-row td { 
                    background-color: #2A9D8F !important; color: black; 
                    font-weight: bold; font-size: 16px;
                }
                .summary-header td { 
                    background-color: #E9F5F4 !important; font-weight: bold; color: #264653 !important;
                }
                .detail-row td { border-bottom: 1px solid #eee; }

                .print-btn {
                    background: #2A9D8F; color: white; border: none; padding: 10px 20px;
                    border-radius: 4px; cursor: pointer; margin-bottom: 20px; font-weight: bold;
                }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="no-print">
                <button class="print-btn" onclick="window.print()">確認列印 / 存為 PDF</button>
            </div>
            <div class="report-header">
                <h2>${reportTitle}</h2>
            </div>
            <div class="info-bar">
                <span>身分：${role === 'global_leader' ? '總召集人' : (role === 'union_leader' ? '聯盟召集人' : '學校管理員')}</span>
                <span>產生時間：${new Date().toLocaleString()}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">${firstColLabel}</th>
                        <th>學生總數</th>
                        <th>參與人數</th>
                        <th>參與率</th>
                        <th>總積分</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableHtml}
                </tbody>
            </table>
        </body>
        </html>
    `);

            printWindow.document.close();
        },
        // 當「學校」多選切換或全選/取消全選時，統一更新兩張圖
        updateChartByFilter() {
            const targetLeague = this.rawListData.find(l => l.league_name === this.selectedAllianceName);
            if (!targetLeague) return;

            // 篩選出目前選中的學校資料
            const filteredSchools = targetLeague.schools.filter(s =>
                this.selectedSchoolNames.includes(s.school_name)
            );

            //更新第一張圖：今日挑戰人數
            this.renderStackedChart(filteredSchools);

            //更新第二張圖：平均分數
            this.renderMultiColorChart(filteredSchools);
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
.analysis-container {
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

.analysis-section {
    background: #FFFFFF;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    @include main-box-shadow;

    .section-header {
        @include flex-center;
        justify-content: space-between;
        margin-bottom: 25px;

        .header-title {
            font-size: 18px;
            font-weight: bold;
            color: $main-black-text;
            @include flex-center;
            gap: 10px;

            i {
                color: $main-green;
            }
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }
    }
}


.action-btn {
    @include back-system-action-btn
}

.header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}


::v-deep .el-table__expanded-cell {
    padding: 0 !important;
}

.status-pill {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;

    &.green {
        background-color: #E6F4F1;
        color: $main-green;
    }
}

.score-text {
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
    color: $main-black-text;
}

.custom-table {
    ::v-deep th {
        background-color: transparent !important;
        font-weight: bold;
        color: $main-black-text;
        border-bottom: 2px solid #F0F2F5;
    }
}


.apexcharts-canvas {
    margin: 0 auto;
}

@media (max-width: 1200px) {
    .analysis-section .section-header {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 15px;

        .header-actions {
            width: 100%;
            flex-wrap: wrap;
        }
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .analysis-container {
        margin-left: 0;
    }
}
</style>