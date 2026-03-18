<template>
  <div class="analysis-container">
    <h2 class="page-title">試煉殿堂考試分析</h2>

    <div class="analysis-section">
      <div class="section-header">
        <div class="header-title">試卷列表</div>
      </div>

      <el-table @row-click="goToDetail" :data="filteredExamListData" style="width: 100%" height="300"
        class="custom-table list-table">
        <el-table-column prop="name" label="試卷名稱" min-width="150"></el-table-column>
        <el-table-column label="檢測時程" min-width="180">
          <template slot-scope="scope">
            <div class="time-column">
              <i class="far fa-calendar-alt"></i> {{ scope.row.date }}<br>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="時長" align="center"></el-table-column>
        <el-table-column prop="participants" label="參與人數" align="center">
          <template slot-scope="scope">
            {{ scope.row.participants || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均分數" align="center">
          <template slot-scope="scope">
            <span :class="{ 'teal-text': scope.row.avgScore }">
              {{ scope.row.avgScore ? scope.row.avgScore + '分' : '-' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- <div class="analysis-section">
      <div class="section-header">
        <div class="header-title"><i class="fas fa-chart-line"></i> 試煉殿堂考試概況</div>
        <div class="header-actions">
          <button class="action-btn" @click="exportFullTable('export-analysis')"><i class="fas fa-download"></i> 匯出報表</button>
        </div>
      </div>
      <div id="export-analysis">
<el-table :data="examOverviewData" height="400" style="width: 100%" class="custom-table">
  
  <el-table-column v-if="userRole === 'global_leader'" type="expand">
    <template slot-scope="props">
      <div class="expand-table-wrapper">
        <h4 class="expand-title">{{ props.row.alliance }} - 學校平均分排名</h4>
        <el-table :data="props.row.schools" border size="mini">
          <el-table-column prop="school_name" label="學校名稱"></el-table-column>
          <el-table-column prop="participants" label="已完成人數" align="center"></el-table-column>
          <el-table-column label="平均分數" align="center">
             <template slot-scope="sub">
                {{ (sub.row.avg_score !== undefined && sub.row.avg_score !== null) ? sub.row.avg_score : '0' }} 分
             </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </el-table-column>

  <el-table-column v-if="userRole === 'global_leader'" prop="alliance" label="聯盟名稱" min-width="150"></el-table-column>
  <el-table-column prop="completedCount" label="考試完成人數" align="center"></el-table-column>
  
  <el-table-column prop="avgScore" label="平均分數" align="center">
    <template slot-scope="scope">
      <span class="status-pill green">
        {{ (scope.row.avgScore !== undefined && scope.row.avgScore !== null) ? scope.row.avgScore : '0' }} 分
      </span>
    </template>
  </el-table-column>
</el-table>
      </div>
    </div> -->
    <!-- 
    <div class="analysis-section">
      <div class="section-header">
        <div class="header-title">
          <i class="fas fa-chart-bar"></i> 試煉殿堂(考試情況)
        </div>
        <div class="header-actions">
          <button class="action-btn">篩選試卷(搜尋名稱)</button>
        </div>
      </div>
      <div class="chart-wrapper">
        <apexchart type="bar" height="350" :options="groupBarOptions" :series="groupBarSeries"></apexchart>
      </div>
    </div> -->
  </div>
</template>

<script>
import api from '@/config/api';

const EXAM_MASTER_SETTINGS = {
  '1': {
    'EngToChi': { time: 15 },
    'ChiToEng': { time: 15 },
    'Listening': { time: 5 }
  },
  '2': {
    'EngToChi': { time: 10 },
    'ChiToEng': { time: 10 },
    'Listening': { time: 5 },
    'ContextFill': { time: 15 }
  },
  '3': {
    'EngToChi': { time: 10 },
    'ChiToEng': { time: 10 },
    'Listening': { time: 5 },
    'ContextFill': { time: 15 }
  }
};


export default {
  name: 'ExamAnalysis',
  data() {
    return {
      userRole: localStorage.getItem('userRole') || 'school_admin',
      schoolType: localStorage.getItem('schoolType') || 'primary',

      // 試卷列表
      rawExamList: [
        { id: 1, name: '國小英語單字檢測-2', date: '05.01 - 06.02', type: 'primary', participants: 0, avgScore: null },
        { id: 2, name: '7年級英語單字檢測-2', date: '05.01 - 06.02', type: 'junior', participants: 0, avgScore: null },
        { id: 3, name: '8年級英語單字檢測-2', date: '05.01 - 06.02', type: 'junior', participants: 0, avgScore: null }
      ],
      examOverviewData: [],
      allExamsStatsCache: {},
      allianceOptions: [],

      // 總召下拉選單用的獨立狀態
      participantSchoolOptions: [],
      selectedParticipantSchools: [],
      selectedExamId: 1,      // 當前選中的試卷 ID
    };
  },
  computed: {
    // 根據身分與學校類型過濾後的列表
    filteredExamListData() {
      let list = (this.userRole === 'global_leader')
        ? this.rawExamList
        : (this.schoolType === 'primary'
          ? this.rawExamList.filter(item => item.type === 'primary')
          : this.rawExamList.filter(item => item.type === 'junior'));

      return list.map(exam => {
        const settings = EXAM_MASTER_SETTINGS[exam.id];
        const totalMinutes = settings ? Object.values(settings).reduce((sum, item) => sum + item.time, 0) : 0;
        return { ...exam, duration: `${totalMinutes}分鐘` };
      });
    },
    filteredOverviewData() {
      if (this.userRole === 'school_admin') {
        // 學校管理員：顯示班級資訊
        return [
          { grade: '6年', classroom: '1班', studentCount: 30, completedCount: 28 },
          { grade: '6年', classroom: '2班', studentCount: 25, completedCount: 25 },
          { grade: '6年', classroom: '3班', studentCount: 28, completedCount: 20 }
        ];
      } else if (this.userRole === 'union_leader') {
        // 聯盟召集人：顯示各校資訊
        return [
          { schoolName: '海之鄉國小', studentCount: 892, completedCount: 85 },
          { schoolName: '美濃國小', studentCount: 756, completedCount: 87 },
          { schoolName: '山海國小', studentCount: 721, completedCount: 83 }
        ];
      } else {
        // 總召集人/教育部：顯示聯盟與學校
        return [
          { alliance: '海之鄉聯盟', schoolName: '海之鄉國小', studentCount: 892, completedCount: 85 },
          { alliance: '美濃書香聯盟', schoolName: '美濃國小', studentCount: 756, completedCount: 87 },
          { alliance: '山海聯盟', schoolName: '山海國小', studentCount: 721, completedCount: 83 }
        ];
      }
    }
  },
  methods: {
    exportFullTable(containerId) {
      // 1. 取得當前選中的試卷資訊
      const currentExam = this.rawExamList.find(e => e.id === this.selectedExamId);
      const reportTitle = currentExam ? `${currentExam.name} - 考試概況報表` : '試煉殿堂考試概況報表';
      const data = this.examOverviewData;
      const role = this.userRole;

      // 2. 打開空白新視窗
      const printWindow = window.open('', '_blank');

      // 3. 根據身分動態生成 HTML
      let tableHtml = '';

      data.forEach(item => {
        if (role === 'global_leader') {
          // 總召模式：聯盟彙總 + 學校明細 (Expand 結構)
          tableHtml += `
        <tr class="league-row">
          <td colspan="3">${item.alliance} (聯盟彙總)</td>
        </tr>
        <tr class="summary-header">
          <td>包含學校: ${item.schoolCount} 間</td>
          <td>完成人數: ${item.completedCount}</td>
          <td style="color: #2A9D8F;">平均分數: ${item.avgScore} 分</td>
        </tr>
      `;
          // 渲染學校明細
          if (item.schools && item.schools.length > 0) {
            item.schools.forEach(school => {
              tableHtml += `
            <tr class="detail-row">
              <td style="text-align: left; padding-left: 30px;">└ ${school.school_name}</td>
              <td>${school.participants}</td>
              <td style="font-weight: bold;">${school.avg_score} 分</td>
            </tr>
          `;
            });
          }
        } else if (role === 'union_leader') {
          // 聯盟召集人模式：顯示各校列表
          tableHtml += `
        <tr class="detail-row">
          <td style="text-align: left;">${item.schoolName}</td>
          <td>${item.completedCount}</td>
          <td style="font-weight: bold; color: #2A9D8F;">${item.avgScore} 分</td>
        </tr>
      `;
        } else {
          // 校管模式：顯示班級列表
          tableHtml += `
        <tr class="detail-row">
          <td style="text-align: left;">${item.grade}${item.classroom}</td>
          <td>${item.completedCount}</td>
          <td style="font-weight: bold; color: #2A9D8F;">${item.avgScore} 分</td>
        </tr>
      `;
        }
      });

      // 4. 定義表格標題欄位
      const firstColLabel = role === 'global_leader' ? '名稱' : (role === 'union_leader' ? '學校名稱' : '班級名稱');

      printWindow.document.write(`
    <html>
    <head>
      <title>${reportTitle}</title>
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: "PingFang TC", "Microsoft JhengHei", sans-serif; padding: 20px; color: #333; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2A9D8F; padding-bottom: 10px; }
        .header h2 { color: #2A9D8F; margin: 0; }
        .info-bar { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin: 10px 0; }
        
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 13px; }
        th { background-color: #f8f9fa; font-weight: bold; }

        .league-row td { 
          background-color: #2A9D8F !important; 
          color: white !important; 
          font-weight: bold; 
          text-align: left; 
          padding-left: 15px;
          font-size: 14px;
        }
        .summary-header td { background-color: #E9F5F4 !important; font-weight: bold; }
        .detail-row td { border-bottom: 1px solid #eee; }

        .print-btn {
          background: #2A9D8F; color: white; border: none; padding: 8px 16px; 
          border-radius: 4px; cursor: pointer; margin-bottom: 20px;
        }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">確認列印 / 存為 PDF</button>
      </div>
      <div class="header">
        <h2>${reportTitle}</h2>
      </div>
      <div class="info-bar">
        <span>身分：${this.userRole === 'global_leader' ? '總召集人' : (this.userRole === 'union_leader' ? '聯盟召集人' : '學校管理員')}</span>
        <span>產生時間：${new Date().toLocaleString()}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 40%;">${firstColLabel}</th>
            <th>完成人數</th>
            <th>平均分數</th>
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
    async fetchData() {
      try {
        const res = await api.get('/students/list/');
        const rawData = res.data || {};
        const results = rawData.results || [];

        if (rawData.level === 'league') {
          // 總召模式：生成聯盟選項與匯總數據
          this.allianceOptions = results.map(l => l.league_name);

          this.examOverviewData = results.map(league => {
            const schools = league.schools || [];
            // 計算匯總：從子學校累加
            const sTotal = schools.reduce((sum, s) => sum + (Number(s.student_total) || 0), 0);
            const cTotal = schools.reduce((sum, s) => sum + (Number(s.today_competition_participants) || 0), 0);

            return {
              alliance: league.league_name,
              schoolCount: league.school_total || schools.length,
              studentCount: sTotal,
              completedCount: cTotal,
              schools: schools
            };
          });
        } else {
          // 老師/校管模式
          this.examOverviewData = results.map(item => ({
            grade: item.grade ? `${item.grade}年` : null,
            classroom: item.classroom ? `${item.classroom}班` : null,
            schoolName: item.school_name || '',
            studentCount: item.student_total || 0,
            completedCount: item.today_competition_participants || 0
          }));
        }
      } catch (err) {
        console.error('獲取概況失敗', err);
      }
    },
    async fetchAllExamStats() {
      try {
        const requests = this.rawExamList.map(exam =>
          api.post('/students/exam-stats/', { exam_id: exam.id })
            .then(res => ({ id: exam.id, data: res.data }))
            .catch(() => ({ id: exam.id, data: null }))
        );

        const results = await Promise.all(requests);

        // 1. 更新上方「試卷列表」的匯總數字
        this.rawExamList = this.rawExamList.map(exam => {
          const stats = results.find(r => r.id === exam.id);
          if (stats && stats.data) {
            this.allExamsStatsCache[exam.id] = stats.data; // 存入緩存

            let avg = 0;
            let part = 0;
            const d = stats.data;

            if (this.userRole === 'global_leader') {
              avg = d.global_avg_score;
              part = d.participants;
            } else if (this.userRole === 'union_leader') {
              // 召集人回傳的是陣列，取第一筆
              avg = d[0]?.league_avg_score || 0;
              part = d[0]?.participants || 0;
            } else {
              // 校管
              avg = d.total_avg_score;
              part = d.participants;
            }
            return { ...exam, avgScore: avg, participants: part };
          }
          return exam;
        });

        // 2. 預設顯示第一份試卷的詳細概況
        if (this.rawExamList.length > 0) {
          this.updateBottomTable(this.rawExamList[0].id);
        }
      } catch (err) {
        console.error('統計數據加載失敗', err);
      }
    },
    // 根據選中的試卷更新下方表格
    updateBottomTable(examId) {
      const data = this.allExamsStatsCache[examId];
      if (!data) return;

      this.selectedExamId = examId;

      if (this.userRole === 'global_leader') {
        // 總召模式
        this.examOverviewData = (data.leagues || []).map(l => ({
          alliance: l.league_name,
          schoolCount: (l.schools || []).length,
          completedCount: l.participants || 0,
          avgScore: l.league_avg_score ?? 0,
          schools: (l.schools || []).map(s => ({
            ...s,
            avg_score: s.avg_score ?? 0
          }))
        }));
      } else if (this.userRole === 'union_leader') {
        // 召集人模式
        const league = Array.isArray(data) ? data[0] : (data.leagues ? data.leagues[0] : {});
        this.examOverviewData = (league.schools || []).map(s => ({
          schoolName: s.school_name,
          completedCount: s.participants || 0,
          avgScore: s.avg_score ?? 0
        }));
      } else {
        // 學校管理員模式
        this.examOverviewData = (data.classes || []).map(c => ({
          grade: c.grade + '年',
          classroom: c.classroom + '班',
          completedCount: c.participants || 0,
          avgScore: c.avg_score ?? 0
        }));
      }
    },
    handleExamClick(row) {
      this.updateBottomTable(row.id);
    },
    goToDetail(row) {
      console.log('查看試卷詳情, ID:', row.id, '名稱:', row.name);
      this.$router.push({
        path: '/exam-detail',
        query: {
          id: row.id,
          name: row.name
        }
      });
    }
  },
  mounted() {
    this.fetchData();
    this.fetchAllExamStats();
  },
};
</script>

<style lang="scss" scoped>
.analysis-container {
  padding: 24px;
  background-color: #F5F7FA;
  min-height: 100vh;
  margin-left: 90px;
  text-align: left;

  .page-title {
    font-size: 32px;
    font-weight: bold;
    color: $main-back-blue-text;
    margin-bottom: 30px;
  }
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
    margin-bottom: 20px;

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
      gap: 10px;
    }
  }
}

.custom-table {
  width: 100%;

  ::v-deep {
    .el-table__row {
      cursor: pointer;
    }

    th {
      background-color: transparent !important;
      color: $main-black-text;
      font-weight: bold;
      border-bottom: 1.5px solid #F0F2F5;
    }

    .teal-text {
      color: $main-green;
      font-weight: bold;
    }
  }

  .time-column {
    color: $main-grey-text;

    i {
      width: 16px;
      color: #999;
    }
  }
}

.action-btn {
  @include back-system-action-btn
}

.teal-select.small {
  width: 130px;

  ::v-deep .el-input__inner {
    background-color: #F5F7FA;
    border: none;
    border-radius: 8px;
    height: 36px;
    line-height: 36px;
  }
}

.chart-wrapper {
  width: 100%;
  margin-top: 10px;
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
  .analysis-container {
    margin-left: 0;
  }
}
</style>