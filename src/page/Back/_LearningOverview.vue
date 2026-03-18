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
                    <button class="action-btn" @click="exportFullTable('export-overview')">
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

            // 學習成效表格數據
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
     exportFullTable(containerId) {
    const reportTitle = '學習成效比較報表';
    const data = this.learningData;
    const role = this.userRole || localStorage.getItem('userRole') || 'school_admin';
    const isGlobal = role === 'global_leader';

    // 1. 打開空白新視窗
    const printWindow = window.open('', '_blank');

    // 2. 構建表格內容 HTML
    let tableHtml = '';
    
    data.forEach(item => {
        if (isGlobal) {
            // 總召模式：聯盟彙總 + 學校明細
            tableHtml += `
                <tr class="league-row">
                    <td colspan="4" style="text-align: center;">${item.alliance} (聯盟彙總)</td>
                </tr>
                <tr class="summary-header">
                    <td>包含學校: ${item.schoolCount || 0} 間</td>
                    <td>學生總數: ${item.studentCount}</td>
                    <td>平均登入率: <span style="color: #2A9D8F;">${item.loginRate}</span></td>
                    <td>平均完成率: ${item.completionRate}%</td>
                </tr>
            `;

            // 如果有下屬學校數據則展開 (假設數據結構中有 schools 陣列)
            if (item.schools && item.schools.length > 0) {
                item.schools.forEach(school => {
                    tableHtml += `
                        <tr class="detail-row">
                            <td style="text-align: left; padding-left: 30px;">└ ${school.schoolName}</td>
                            <td>${school.studentCount}</td>
                            <td>${school.loginRate}</td>
                            <td>${school.completionRate}</td>
                        </tr>
                    `;
                });
            }
        } else {
            // 召集人/校管模式：平鋪結構
            const label = (role === 'school_admin') 
                ? (item.grade && item.classroom ? `${item.grade}${item.classroom}` : item.classroom)
                : (item.schoolName || item.alliance);
                
            tableHtml += `
                <tr class="detail-row">
                    <td style="text-align: left;">${label}</td>
                    <td>${item.studentCount}</td>
                    <td><span style="color: #2A9D8F; font-weight: bold;">${item.loginRate}</span></td>
                    <td>${item.completionRate}%</td>
                </tr>
            `;
        }
    });

    // 3. 定義第一欄標題
    const firstColLabel = isGlobal ? '名稱' : (role === 'school_admin' ? '班級' : '學校名稱');

    printWindow.document.write(`
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                /* 強制色彩與列印優化 */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { font-family: "Microsoft JhengHei", sans-serif; padding: 20px; color: #333; line-height: 1.5; }
                .report-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2A9D8F; padding-bottom: 10px; }
                .report-header h2 { color: #2A9D8F; margin: 0; }
                .info-bar { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin: 10px 0; }
                
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: center; font-size: 13px; }
                th { background-color: #f8f9fa; font-weight: bold; }

                /* 層級樣式 */
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
                <span>身分：${role === 'global_leader' ? '總召集人' : (role === 'union_leader' ? '聯盟召集人' : '管理員')}</span>
                <span>統計日期：${new Date().toLocaleString()}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">${firstColLabel}</th>
                        <th>學生總數</th>
                        <th>登入率</th>
                        <th>練習完成率</th>
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
        // 判斷該列的聯盟是否等於選中的值
        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },

    }
};
</script>

<style lang="scss" scoped>
.overview-container {
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
    margin-bottom: 30px;
}


.overview-card {
    background: #FFFFFF;
    border-radius: 16px;
    padding: 24px;
    @include main-box-shadow;
    @include flex-center;
    justify-content: space-between;
    border: 1px solid #EBEEF5;

    .stat-label {
        font-size: 16px;
        font-weight: bold;
        color: $main-black-text;
        margin-bottom: 12px;
    }

    .stat-main-value {
        font-size: 40px;
        font-weight: 800;
        margin-bottom: 4px;
    }

    .stat-subtext {
        font-size: 14px;
        color: $main-grey-text;
    }

    .icon-circle {
        font-size: 24px;
        opacity: 0.8;
    }
}


.overview-section {
    background: #FFFFFF;
    border-radius: 16px;
    padding: 24px;
    @include main-box-shadow;

    .section-header {
        @include flex-center;
        justify-content: space-between;
        margin-bottom: 25px;

        .header-title {
            font-size: 20px;
            font-weight: bold;
            color: $main-black-text;
            @include flex-center;
            gap: 10px;

            i {
                font-size: 18px;
                color: #999;
            }
        }
    }
}


.action-btn {
@include back-system-action-btn
}

.custom-table {
    ::v-deep th {
        background-color: transparent !important;
        border-bottom: 1.5px solid #F0F2F5;
        font-weight: bold;
        color: $main-black-text;
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
        color: $main-green;
    }
}


@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .overview-container {
        margin-left: 0;
    }

    .overview-card {
        margin-bottom: 15px;
    }
}
</style>