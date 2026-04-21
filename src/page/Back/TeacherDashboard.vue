<template>
    <div class="dashboard-container">
        <h2 class="page-title">儀錶板</h2>

        <el-row :gutter="20" class="stat-cards-row">
            <el-col :span="24 / statsData.length" v-for="(item, index) in statsData" :key="index">
                <div class="stat-card">
                    <div class="stat-label">{{ item.label }}</div>
                    <div class="stat-value">{{ item.value ? item.value.toLocaleString() : 0 }}</div>
                    <div v-if="item.percentage" class="stat-trend" :class="item.isIncrease ? 'trend-up' : 'trend-down'">
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
                <el-table height="500" ref="learnTable" :data="learningData" style="width: 100%" class="custom-table">

                    <el-table-column v-if="userRole === 'global_leader'" type="expand">
                        <template slot-scope="props">
                            <div class="expand-table-wrapper">
                                <h4 class="expand-title">{{ props.row.alliance }} - 學校明細</h4>
                                <el-table :data="props.row.schools" border size="mini">
                                    <el-table-column prop="schoolName" label="學校名稱"></el-table-column>
                                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
                                    <el-table-column label="登入率" align="center">
                                        <template slot-scope="sub">
                                            <span class="status-pill green">{{ sub.row.loginRate }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="completionRate" label="練習完成率"
                                        align="center"></el-table-column>
                                </el-table>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column v-if="userRole === 'global_leader'" prop="alliance" label="聯盟名稱"
                        min-width="150"></el-table-column>

                    <el-table-column v-if="userRole === 'school_admin'" prop="grade" label="年級"></el-table-column>
                    <el-table-column v-if="userRole !== 'global_leader'"
                        :prop="userRole === 'school_admin' ? 'classroom' : 'schoolName'"
                        :label="userRole === 'school_admin' ? '班級' : '學校名稱'">
                    </el-table-column>

                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>

                    <el-table-column label="平均登入率" align="center">
                        <template slot-scope="scope">
                            <span class="status-pill green">{{ scope.row.loginRate }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="completionRate" label="平均完成率" align="center"></el-table-column>
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
            <div id="export-status">
                <el-table ref="statusTable" height="500" :data="examData" style="width: 100%" class="custom-table">

                    <el-table-column v-if="userRole === 'global_leader'" type="expand">
                        <template slot-scope="props">
                            <div class="expand-table-wrapper" style="padding: 20px 50px; background: #f9f9f9;">
                                <h4 style="color: #2A9D8F; margin-bottom: 10px;">{{ props.row.alliance }} - 考試明細</h4>
                                <el-table :data="props.row.schools" border size="mini">
                                    <el-table-column prop="schoolName" label="學校名稱"></el-table-column>
                                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
                                    <el-table-column prop="examCompleteCount" label="考試完成人數"
                                        align="center"></el-table-column>
                                    <el-table-column label="完成率" align="center">
                                        <template slot-scope="sub">
                                            {{ sub.row.studentCount > 0 ? Math.round((sub.row.examCompleteCount /
                                                sub.row.studentCount) * 100) : 0 }}%
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column v-if="userRole === 'global_leader'" prop="alliance" label="聯盟名稱"
                        min-width="150"></el-table-column>

                    <el-table-column v-if="userRole === 'school_admin'" prop="grade" label="年級"></el-table-column>
                    <el-table-column v-if="userRole !== 'global_leader'"
                        :prop="userRole === 'school_admin' ? 'classroom' : 'schoolName'"
                        :label="userRole === 'school_admin' ? '班級' : '學校名稱'">
                    </el-table-column>

                    <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
                    <el-table-column prop="examCompleteCount" label="考試總完成人數" align="center"></el-table-column>
                </el-table>
            </div>
        </div>

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-area"></i> 英語力學生簽到人數 (統計當天)
                </div>
                <div v-if="userRole === 'global_leader'" class="header-actions">
                    <el-select v-model="selectedAttendanceAlliance" placeholder="選擇聯盟" class="teal-select"
                        @change="handleAttendanceAllianceChange">
                        <el-option v-for="item in allianceOptions" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    <el-select v-model="selectedAttendanceSchools" multiple collapse-tags placeholder="選擇學校"
                        class="teal-select multi-select" @change="updateAttendanceChart">
                        <div class="select-all-box">
                            <el-button type="text" @click="selectAttendanceAll">全選</el-button>
                            <el-button type="text" @click="deselectAttendanceAll"
                                style="color: #F56C6C;">取消全選</el-button>
                        </div>
                        <el-option v-for="item in attendanceSchoolOptions" :key="item" :label="item"
                            :value="item"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="chart-wrapper scrollable-chart-container" style="background: white; padding: 10px;">
                <div :style="{ width: attendanceChartWidth, minWidth: '100%' }">
                    <apexchart type="bar" height="350" :options="lineChartOptions" :series="lineSeries"></apexchart>
                </div>
            </div>
        </div>

        <!-- <div v-if="userRole === 'teacher'" class="dashboard-section">
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
        </div> -->

        <div class="dashboard-section">
            <div class="section-header">
                <div class="header-title">
                    <i class="fas fa-chart-column"></i> 競技島嶼學生挑戰人數 (統計當天)
                </div>
                <div v-if="userRole === 'global_leader'" class="header-actions">
                    <el-select v-model="selectedChallengeAlliance" placeholder="選擇聯盟" class="teal-select"
                        @change="handleChallengeAllianceChange">
                        <el-option v-for="item in allianceOptions" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    <el-select v-model="selectedChallengeSchools" multiple collapse-tags placeholder="選擇學校"
                        class="teal-select multi-select" @change="updateChallengeChart">
                        <div class="select-all-box">
                            <el-button type="text" @click="selectChallengeAll">全選</el-button>
                            <el-button type="text" @click="deselectChallengeAll"
                                style="color: #F56C6C;">取消全選</el-button>
                        </div>
                        <el-option v-for="item in challengeSchoolOptions" :key="item" :label="item"
                            :value="item"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="chart-wrapper scrollable-chart-container">
                <div :style="{ width: challengeChartWidth, minWidth: '100%' }">
                    <apexchart type="bar" height="350" :options="barChartOptions" :series="barSeries"></apexchart>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import api from '@/config/api';

// 獲取圖表標籤與數值的助手函數
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
    name: 'TeacherDashboard',
    data() {
        return {
            userRole: localStorage.getItem('userRole') || 'school_admin',
            filterSubject: 'all',

            statsData: [],
            learningData: [],
            examData: [],

            // 圖表數據初始化
            lineSeries: [],
            lineChartOptions: {},
            barSeries: [],
            barChartOptions: {},

            // 狀態控制變數
            attendanceCount: 0,
            challengeCount: 0,
            rawListData: null,
            allianceOptions: [],

            selectedAttendanceAlliance: '',
            attendanceSchoolOptions: [],
            selectedAttendanceSchools: [],

            selectedChallengeAlliance: '',
            challengeSchoolOptions: [],
            selectedChallengeSchools: [],
        }
    },
    computed: {
        attendanceChartWidth() {
            return this.attendanceCount > 10 ? `${this.attendanceCount * 85}px` : '100%';
        },
        challengeChartWidth() {
            return this.challengeCount > 10 ? `${this.challengeCount * 85}px` : '100%';
        }
    },
    async mounted() {

        try {
            // 同步載入所有基礎數據
            const results = await Promise.all([
                this.fetchSummaryData(),
                this.fetchLearningData(),
                this.fetchExamData()
            ]);
            // console.log('1. [Promise.all 基礎數據] 已全部回傳');

            // 載入列表數據並渲染圖表
            const res = await api.get('/students/list/');
            // console.log('2. [API: /students/list/] 原始回傳:', res.data);

            this.rawListData = res.data.results || [];

            if (res.data.level === 'league' && this.userRole === 'global_leader') {
                // console.log('3. [身分判定] 總召集人模式 (聯盟層級)');
                this.allianceOptions = this.rawListData.map(l => l.league_name);
                const defaultLeague = this.allianceOptions[0];

                this.selectedAttendanceAlliance = defaultLeague;
                this.handleAttendanceAllianceChange(defaultLeague);

                this.selectedChallengeAlliance = defaultLeague;
                this.handleChallengeAllianceChange(defaultLeague);
            } else {
                // console.log('3. [身分判定] 召集人/管理員模式 (學校/班級層級)');
                this.renderAttendanceChart(this.rawListData);
                this.renderChallengeChart(this.rawListData);
            }
        } catch (err) {
            console.error('===== [儀錶板載入異常] =====', err);
        }
    },
    methods: {
        async fetchSummaryData() {
            try {
                const res = await api.get('/students/summary/');
                const data = res.data || {};
                const role = this.userRole;
                const safeNum = (val) => {
                    const n = Number(val);
                    return isNaN(n) ? 0 : n;
                };

                if (role === 'global_leader') {
                    this.statsData = [
                        { label: '聯盟總數', value: safeNum(data.league_total), percentage: '', isIncrease: true },
                        { label: '學校總數', value: safeNum(data.school_total), percentage: '', isIncrease: true },
                        { label: '學生總數', value: safeNum(data.student_total), percentage: '', isIncrease: true },
                        { label: '總累積星星', value: safeNum(data.total_stars), percentage: '', isIncrease: true }
                    ];
                } else if (role === 'union_leader') {
                    this.statsData = [
                        { label: '學校總數', value: safeNum(data.school_total), percentage: '', isIncrease: true },
                        { label: '學生總數', value: safeNum(data.student_total), percentage: '', isIncrease: true },
                        { label: '總累積星星', value: safeNum(data.total_stars), percentage: '', isIncrease: true }
                    ];
                } else {
                    this.statsData = [
                        { label: '總班級數', value: safeNum(data.class_total), percentage: '', isIncrease: true },
                        { label: '學生總數', value: safeNum(data.student_total), percentage: '', isIncrease: true },
                        { label: '今日簽到人數', value: safeNum(data.today_participation), percentage: '', isIncrease: true },
                        { label: '今日總積分', value: safeNum(data.competition_total_score), percentage: '', isIncrease: true },
                        { label: '總累積星星', value: safeNum(data.total_stars), percentage: '', isIncrease: true }
                    ];
                }
            } catch (err) {
                console.error('獲取總覽失敗', err);
            }
        },

        // 獲取學習成效表格 (計算登入率與完成率)
        async fetchLearningData() {
            try {
                const res = await api.get('/students/list/');
                const PERSONAL_MAX_STARS = 205;
                let finalData = [];
                const results = res.data.results || [];


                if (res.data.level === 'league' && this.userRole === 'global_leader') {
                    finalData = res.data.results.map(league => {

                        const schools = (league.schools || []).map(s => ({
                            schoolName: s.school_name,
                            studentCount: s.student_total || 0,
                            loginRate: s.student_total > 0
                                ? Math.round((s.today_participation / s.student_total) * 100) + '%'
                                : '0%',
                            completionRate: (s.student_total * PERSONAL_MAX_STARS) > 0
                                ? ((s.total_stars / (s.student_total * PERSONAL_MAX_STARS)) * 100).toFixed(1) + '%'
                                : '0.0%'
                        }));

                        const totalStudents = schools.reduce((sum, s) => sum + s.studentCount, 0);
                        const totalTodayLogin = (league.schools || []).reduce((sum, s) => sum + (s.today_participation || 0), 0);
                        const totalStars = (league.schools || []).reduce((sum, s) => sum + (s.total_stars || 0), 0);

                        return {
                            alliance: league.league_name,
                            studentCount: totalStudents,
                            loginRate: totalStudents > 0
                                ? Math.round((totalTodayLogin / totalStudents) * 100) + '%'
                                : '0%',
                            completionRate: (totalStudents * PERSONAL_MAX_STARS) > 0
                                ? ((totalStars / (totalStudents * PERSONAL_MAX_STARS)) * 100).toFixed(1) + '%'
                                : '0.0%',
                            schools: schools
                        };
                    });
                } else if (this.userRole === 'union_leader') {
                    // 召集人
                    const source = res.data.level === 'league' ? results[0].schools : results;

                    finalData = results.map(s => ({
                        schoolName: s.school_name,
                        studentCount: s.student_total || 0,
                        loginRate: s.student_total > 0
                            ? Math.round((s.today_participation / s.student_total) * 100) + '%'
                            : '0%',
                        completionRate: (s.student_total * PERSONAL_MAX_STARS) > 0
                            ? ((s.total_stars / (s.student_total * PERSONAL_MAX_STARS)) * 100).toFixed(1) + '%'
                            : '0.0%'
                    }));
                }
                else {
                    // 學校管理員/老師
                    finalData = results.map(item => ({
                        grade: item.grade ? `${item.grade}年` : null,
                        classroom: item.classroom ? `${item.classroom}班` : null,
                        studentCount: item.student_total || 0,
                        loginRate: item.student_total > 0
                            ? Math.round((item.today_participation / item.student_total) * 100) + '%'
                            : '0%',
                        completionRate: (item.student_total * PERSONAL_MAX_STARS) > 0
                            ? ((item.total_stars / (item.student_total * PERSONAL_MAX_STARS)) * 100).toFixed(1) + '%'
                            : '0.0%'
                    }));
                }
                this.learningData = finalData;
            } catch (err) {
                console.error('學習成效獲取失敗', err);
            }
        },
        //  獲取考試概況表格
        async fetchExamData() {
            try {
                const res = await api.get('/students/list/');
                let finalData = [];
                const results = res.data.results || [];

                if (res.data.level === 'league' && this.userRole === 'global_leader') {
                    // 總召專用：彙總聯盟數據
                    finalData = res.data.results.map(league => {
                        const schoolsData = (league.schools || []).map(s => ({
                            schoolName: s.school_name,
                            studentCount: s.student_total || 0,
                            examCompleteCount: s.today_competition_participants || 0
                        }));

                        // 累加該聯盟的總和
                        const totalStudents = schoolsData.reduce((sum, s) => sum + s.studentCount, 0);
                        const totalComplete = schoolsData.reduce((sum, s) => sum + s.examCompleteCount, 0);

                        return {
                            alliance: league.league_name,
                            studentCount: totalStudents,
                            examCompleteCount: totalComplete,
                            schools: schoolsData
                        };
                    });
                } else if (this.userRole === 'union_leader') {
                    // 縂召集人
                    finalData = results.map(s => ({
                        schoolName: s.school_name,
                        studentCount: s.student_total || 0,
                        examCompleteCount: s.today_competition_participants || 0
                    }));
                }
                else {
                    // 老師模式
                    finalData = results.map(item => ({
                        grade: item.grade ? `${item.grade}年` : null,
                        classroom: item.classroom ? `${item.classroom}班` : null,
                        studentCount: item.student_total || 0,
                        examCompleteCount: item.today_competition_participants || 0
                    }));
                }
                this.examData = finalData;
            } catch (err) {
                console.error('考試數據獲取失敗', err);
            }
        },
        //簽到人數圖
        async fetchAttendanceData() {
            try {
                const res = await api.get('/students/list/');
                const { categories, values } = getChartLabelsAndValues(res, this.userRole, 'today_participation');

                this.lineChartOptions = {
                    chart: {
                        type: 'bar',
                        toolbar: { show: true },
                        animations: { enabled: true, easing: 'easeinout', speed: 800 }
                    },
                    colors: ['#2A9D8F', '#E76F51', '#264653', '#F4A261', '#E9C46A', '#6366F1', '#A8DADC'],
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '12px',
                            colors: ['#FFFFFF'],
                            fontWeight: 'bold'
                        },
                        offsetY: 0,
                        formatter: (val) => val > 0 ? val : ''
                    },
                    plotOptions: {
                        bar: {
                            columnWidth: '20%',
                            borderRadius: 4,
                            distributed: true,
                            dataLabels: {
                                position: 'center'
                            }
                        }
                    },
                    xaxis: {
                        categories: categories,
                        labels: {
                            rotate: 0,
                            style: { fontSize: '12px', fontWeight: 500 }
                        }
                    },
                    yaxis: {
                        labels: { formatter: (val) => Math.floor(val) }
                    },
                    legend: { show: true },
                    grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                    tooltip: {
                        theme: 'light',
                        y: { formatter: (val) => val + " 人" }
                    }
                };

                this.lineSeries = [{ name: '今日簽到人數', data: values }];
            } catch (err) {
                console.error('簽到圖表獲取失敗', err);
            }
        },

        // 挑戰人數圖
        async fetchChallengeData() {
            const res = await api.get('/students/list/');
            const { categories, values } = getChartLabelsAndValues(res, this.userRole, 'today_competition_participants');

            // 更新數量以觸發寬度計算
            this.challengeCount = categories.length;

            this.barChartOptions = {
                chart: {
                    type: 'bar',
                    toolbar: { show: true },
                    animations: { enabled: true }
                },
                colors: ['#2A9D8F', '#E76F51', '#264653', '#F4A261', '#E9C46A', '#6366F1'],
                plotOptions: {
                    bar: {
                        columnWidth: '20%',
                        borderRadius: 4,
                        distributed: true,
                        dataLabels: { position: 'center' }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: ['#FFFFFF'],
                        fontSize: '12px',
                        fontWeight: 'bold'
                    },
                    formatter: (val) => val > 0 ? val : ''
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        rotate: 0,
                        style: { fontSize: '12px' },
                        trim: true
                    }
                },
                yaxis: { labels: { formatter: (val) => Math.floor(val) } },
                legend: { show: true },
                tooltip: { theme: 'light', y: { formatter: (val) => val + " 人" } }
            };
            this.barSeries = [{ name: '今日挑戰人數', data: values }];
        },
        filterHandler(value, row, column) {
            const property = column['property'];
            return row[property] === value;
        },
        exportFullTable(containerId) {
            const isLearn = containerId === 'export-learn';
            const reportTitle = isLearn ? '學習成效比較報表' : '考試概況報表';
            const data = isLearn ? this.learningData : this.examData;
            const role = this.userRole;

            const printWindow = window.open('', '_blank');

            let tableHtml = '';

            data.forEach(item => {
                if (role === 'global_leader') {
                    //  總召模式：聯盟彙總行 + 學校明細 
                    tableHtml += `
                <tr class="league-row">
                    <td colspan="4" style="text-align: center;">${item.alliance} (聯盟彙總)</td>
                </tr>
                <tr class="summary-header">
                    <td>學生總數: ${item.studentCount}</td>
                    <td>${isLearn ? '平均登入率: ' + item.loginRate : '總完成人數: ' + item.examCompleteCount}</td>
                    <td colspan="2">${isLearn ? '平均完成率: ' + item.completionRate : ''}</td>
                </tr>
            `;

                    // 渲染該聯盟下的所有學校
                    if (item.schools && item.schools.length > 0) {
                        item.schools.forEach(school => {
                            const rate = isLearn
                                ? school.loginRate
                                : (school.studentCount > 0 ? Math.round((school.examCompleteCount / school.studentCount) * 100) + '%' : '0%');

                            tableHtml += `
                        <tr class="school-row">
                            <td style="text-align: left; padding-left: 30px;">└ ${school.schoolName}</td>
                            <td>${school.studentCount}</td>
                            <td>${rate}</td>
                            <td>${isLearn ? school.completionRate : '-'}</td>
                        </tr>
                    `;
                        });
                    }
                } else {
                    //  召集人/學校管理員模式：平鋪結構 
                    const label = (role === 'school_admin') ? `${item.grade}${item.classroom}` : item.schoolName;
                    const rate = isLearn ? item.loginRate : (item.studentCount > 0 ? Math.round((item.completedCount / item.studentCount) * 100) + '%' : '0%');

                    tableHtml += `
                <tr class="school-row">
                    <td style="text-align: left;">${label}</td>
                    <td>${item.studentCount}</td>
                    <td>${rate}</td>
                    <td>${isLearn ? item.completionRate : '-'}</td>
                </tr>
            `;
                }
            });

            // 根據身分決定第一欄標題
            const firstColLabel = (role === 'global_leader') ? '名稱' : (role === 'school_admin' ? '班級' : '學校名稱');

            printWindow.document.write(`
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { font-family: "Microsoft JhengHei", sans-serif; padding: 20px; color: #333; }
                h2 { text-align: center; color: #2A9D8F; margin-bottom: 5px; }
                .report-info { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 15px; border-bottom: 2px solid #2A9D8F; padding-bottom: 10px; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; word-break: break-all; font-size: 13px; }
                th { background-color: #f4f4f4; font-weight: bold; }
                
                /* 聯盟行樣式 */
        .league-row td { 
          background-color: #2A9D8F !important; 
          font-weight: bold; 
          font-size: 16px;
        }
        
        /* 彙總行樣式 */
        .summary-header td { 
          background-color: #E9F5F4 !important; 
          font-weight: bold; 
          color: #264653 !important;
        }
                .school-row td { border-bottom: 1px solid #eee; }

                .btn-box { margin-bottom: 20px; }
                .print-btn { padding: 10px 20px; background: #2A9D8F; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }

                @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="no-print btn-box">
                <button class="print-btn" onclick="window.print()">確認列印 / 存為 PDF</button>
            </div>
            <h2>${reportTitle}</h2>
            <div class="report-info">
                <span>身分：${role === 'global_leader' ? '總召集人' : (role === 'union_leader' ? '聯盟召集人' : '學校管理員')}</span>
                <span>統計日期：${new Date().toLocaleString()}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">${firstColLabel}</th>
                        <th>學生總數</th>
                        <th>${isLearn ? '登入率' : '考試完成率'}</th>
                        <th>${isLearn ? '練習完成率' : '備註'}</th>
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
        handleAttendanceAllianceChange(name) {
            const league = this.rawListData.find(l => l.league_name === name);
            if (league) {
                this.attendanceSchoolOptions = league.schools.map(s => s.school_name);
                this.selectedAttendanceSchools = [...this.attendanceSchoolOptions];
                this.updateAttendanceChart();
            }
        },
        selectAttendanceAll() { this.selectedAttendanceSchools = [...this.attendanceSchoolOptions]; this.updateAttendanceChart(); },
        deselectAttendanceAll() { this.selectedAttendanceSchools = []; this.updateAttendanceChart(); },
        updateAttendanceChart() {
            const league = this.rawListData.find(l => l.league_name === this.selectedAttendanceAlliance);
            const filtered = league.schools.filter(s => this.selectedAttendanceSchools.includes(s.school_name));
            this.renderAttendanceChart(filtered);
        },

        // --- 挑戰圖控制 ---
        handleChallengeAllianceChange(name) {
            const league = this.rawListData.find(l => l.league_name === name);
            if (league) {
                this.challengeSchoolOptions = league.schools.map(s => s.school_name);
                this.selectedChallengeSchools = [...this.challengeSchoolOptions];
                this.updateChallengeChart();
            }
        },
        selectChallengeAll() { this.selectedChallengeSchools = [...this.challengeSchoolOptions]; this.updateChallengeChart(); },
        deselectChallengeAll() { this.selectedChallengeSchools = []; this.updateChallengeChart(); },
        updateChallengeChart() {
            const league = this.rawListData.find(l => l.league_name === this.selectedChallengeAlliance);
            const filtered = league.schools.filter(s => this.selectedChallengeSchools.includes(s.school_name));
            this.renderChallengeChart(filtered);
        },

        // --- 核心渲染 ---
        renderAttendanceChart(dataArray) {
            const categories = dataArray.map(item => item.school_name || `${item.grade}年${item.classroom}班`);
            const values = dataArray.map(item => item.today_participation || 0);
            this.attendanceCount = categories.length;
            this.lineChartOptions = this.getCommonBarOptions(categories, '人');
            this.lineSeries = [{ name: '今日簽到人數', data: values }];
        },

        renderChallengeChart(dataArray) {
            const categories = dataArray.map(item => item.school_name || `${item.grade}年${item.classroom}班`);
            const values = dataArray.map(item => item.today_competition_participants || 0);
            this.challengeCount = categories.length;
            this.barChartOptions = this.getCommonBarOptions(categories, '人');
            this.barSeries = [{ name: '今日挑戰人數', data: values }];
        },
        getCommonBarOptions(categories, unit) {
            return {
                chart: {
                    type: 'bar',
                    toolbar: { show: true },
                    animations: { enabled: true, easing: 'easeinout', speed: 800 }
                },
                colors: ['#2A9D8F', '#E76F51', '#264653', '#F4A261', '#E9C46A', '#6366F1', '#A8DADC'],
                plotOptions: {
                    bar: {
                        columnWidth: '20%',
                        distributed: true,
                        borderRadius: 4,
                        dataLabels: { position: 'center' }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: { fontSize: '12px', colors: ['#FFFFFF'], fontWeight: 'bold' },
                    formatter: (val) => val > 0 ? val : ''
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        show: true,
                        rotate: -45,
                        rotateAlways: true,
                        hideOverlappingLabels: false,
                        trim: false,
                        minHeight: 100,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500,
                        }
                    },
                    axisBorder: { show: true },
                    axisTicks: { show: true }
                },
                yaxis: {
                    labels: { formatter: (val) => Math.floor(val) },
                    title: { text: unit }
                },
                legend: {
                    show: true,
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '12px',
                    // 如果希望 Legend 不要列出所有學校，
                    // 而是只列出 Series 名稱，可以取消這個註釋
                    /*
                    formatter: function(seriesName, opts) {
                        return seriesName; 
                    }
                    */
                },
                grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                tooltip: {
                    theme: 'light',
                    y: { formatter: (val) => val + ' ' + unit }
                }
            };
        }
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
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;

    .el-col {
        flex: 1;
        max-width: 100%;
    }
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