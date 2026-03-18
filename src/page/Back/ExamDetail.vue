<template>
  <div class="detail-container">
    <div class="detail-header">
      <div class="back-link" @click="$router.back()">
        <i class="el-icon-arrow-left"></i> 試卷名稱：{{ examName }}
      </div>
    </div>

    <div class="detail-section">
      <div class="section-header">
        <div class="header-title">
          <i class="fas fa-chart-bar"></i> 考試結果分佈
        </div>

        <div class="header-actions">
          <el-select v-if="userRole === 'global_leader'" v-model="selectedAlliance" placeholder="選擇聯盟"
            class="teal-select" @change="handleAllianceChange">
            <el-option v-for="item in allianceOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>

          <el-select v-if="userRole === 'global_leader' || userRole === 'union_leader'" v-model="selectedSchools"
            multiple collapse-tags placeholder="選擇查看學校 (可多選)" class="teal-select multi-select"
            @change="updateChartData">
            <el-option v-for="item in schoolOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>

          <el-select v-if="userRole === 'school_admin'" v-model="selectedClasses" multiple placeholder="選擇查看班級"
            class="teal-select" @change="updateChartData">
            <el-option v-for="item in classOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
      </div>

      <div class="chart-wrapper">
        <apexchart type="bar" height="350" :options="distChartOptions" :series="filteredDistSeries"></apexchart>
      </div>
    </div>

    <div class="detail-section">
      <div class="section-header">
        <div class="header-title">
          <i class="fas fa-table"></i> 試卷名稱成績分析
        </div>
        <button class="action-btn" @click="exportFullTable">
          <i class="fas fa-download"></i> 匯出報表
        </button>
      </div>

      <div id="export-table-container" style="background-color: white; padding: 10px; border-radius: 8px;">
        <el-table :data="schoolResultData" height="400" style="width: 100%" class="custom-table">
          <el-table-column v-if="userRole === 'global_leader'" type="expand">
            <template slot-scope="props">
              <div class="expand-table-wrapper" style="padding: 20px; background: #f9f9f9;">
                <h4 style="color: #2A9D8F; margin-bottom: 10px;">{{ props.row.allianceName }} - 學校明細</h4>
                <el-table :data="props.row.schools" border size="mini">
                  <el-table-column prop="school_name" label="學校名稱"></el-table-column>
                  <el-table-column prop="student_total" label="學生總人數" align="center"></el-table-column>
                  <el-table-column prop="participants" label="參與人數" align="center"></el-table-column>
                  <el-table-column label="平均分數" align="center">
                    <template slot-scope="sub">{{ sub.row.avg_score }} 分</template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>

          <el-table-column v-if="userRole === 'global_leader'" prop="allianceName" label="聯盟名稱"
            min-width="150"></el-table-column>
          <el-table-column v-if="userRole === 'union_leader'" prop="schoolName" label="學校名稱"
            min-width="150"></el-table-column>
          <el-table-column v-if="userRole === 'school_admin'" label="班級">
            <template slot-scope="scope">{{ scope.row.grade }}年{{ scope.row.classroom }}班</template>
          </el-table-column>

          <el-table-column prop="totalStudents" label="學生總人數" align="center" min-width="150"></el-table-column>
          <el-table-column prop="participants" label="參與人數" align="center" min-width="150"></el-table-column>
          <el-table-column label="平均分數" align="center" min-width="150">
            <template slot-scope="scope">
              <span class="status-pill green">{{ scope.row.avgScore }} 分</span>
            </template>
          </el-table-column>

          <el-table-column v-if="userRole === 'school_admin'" label="分析" align="center" min-width="120">
            <template slot-scope="scope">
              <el-button class="check-result-btn" @click="openClassDetail(scope.row)">
                查看班級成績
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-dialog :visible.sync="showDetailDialog" width="80%" custom-class="score-detail-dialog">
        <div class="dialog-inner">
          <div class="dialog-header-box">
            <span class="exam-tag">{{ examName }}</span>
            <span class="class-info">{{ dialogTitle }}</span>
          </div>

          <el-row :gutter="20" class="summary-cards">
            <el-col :span="6">
              <div class="stat-box">
                <p class="val">{{ currentDetailStats.participants }}</p>
                <p class="lab">參與人數</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-box">
                <p class="val green">{{ currentDetailStats.avgScore }}</p>
                <p class="lab">平均分數</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-box">
                <p class="val teal">{{ currentDetailStats.highest }}</p>
                <p class="lab">最高分</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-box">
                <p class="val gray">{{ currentDetailStats.lowest }}</p>
                <p class="lab">最低分</p>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="40">
            <el-col :span="14">
              <el-table :data="detailListData" size="small" height="350" class="student-detail-table">
                <el-table-column label="學生姓名" prop="name"></el-table-column>
                <el-table-column label="班級" prop="classroom" align="center"></el-table-column>
                <el-table-column label="分數" prop="score" align="center">
                  <template slot-scope="scope">
                    <span style="color: #2A9D8F; font-weight: bold;">{{ scope.row.score }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>

            <el-col :span="10">
              <h4 style="margin-bottom:15px; color: #606266;">成績分佈詳情</h4>
              <table class="distribution-table">
                <tr v-for="(count, range) in scoreDistribution" :key="range">
                  <td class="range">{{ range }} 分</td>
                  <td class="count">{{ count }} 人</td>
                </tr>
              </table>
            </el-col>
          </el-row>

          <div class="dialog-footer">
            <button class="action-btn" @click="exportClassScore">打印報表</button>
            <button class="close-btn" @click="showDetailDialog = false">關閉</button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import api from '@/config/api';


export default {
  name: 'ExamDetail',
  data() {
    return {
      userRole: localStorage.getItem('userRole') || 'school_admin',
      examName: this.$route.query.name || '未定義試卷',
      examId: this.$route.query.id || 1,

      rawStatsData: null, // 儲存 API 回傳的統計對象
      rawListData: [],    // 儲存 list API 的原始結果

      globalStats: { avg: 0, participants: 0, highest: 0, lowest: 0 },

      // 篩選器資料
      allianceOptions: [],
      schoolOptions: [],
      classOptions: [],
      selectedAlliance: '',
      selectedSchools: [],
      selectedClasses: [],

      // 表格與圖表數據
      schoolResultData: [],
      filteredDistSeries: [],

      // 彈窗狀態
      showDetailDialog: false,
      currentClassInfo: '',
      studentListData: [],
      scoreDistribution: {},

      distChartOptions: {
        chart: { type: 'bar', stacked: true, toolbar: { show: true } },
        plotOptions: { bar: { columnWidth: '20%', borderRadius: 2 } },
        xaxis: {
          categories: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99', '100'],
          title: { text: '成績區間' }
        },
        yaxis: { title: { text: '人數' } },
        legend: { position: 'bottom' },
        colors: ['#2A9D8F', '#E76F51', '#264653', '#F4A261', '#E9C46A']
      },
      dialogTitle: '',
      listLabel: '',
      detailListData: [],
      currentDetailStats: { participants: 0, avgScore: 0, highest: 0, lowest: 0 },
    };
  },
  mounted() {
    this.initFilterSettings();
    this.updateChartData();
  },
  methods: {
    initFilterSettings() {
      if (this.userRole === 'school_admin') {
        this.selectedClasses = [this.classOptions[0]];
      } else if (this.userRole === 'union_leader') {
        this.schoolOptions = [
          { id: '成功國小', name: '成功國小' },
          { id: '科學國小', name: '科學國小' }
        ];
        this.selectedSchools = ['成功國小'];
      }
    },
    exportFullTable() {
      const reportTitle = `${this.examName} - 成績分析報表`;
      const data = this.schoolResultData;
      const role = this.userRole;
      const isGlobal = role === 'global_leader';

      const printWindow = window.open('', '_blank');

      let tableHtml = '';

      data.forEach(item => {
        if (isGlobal) {
          // 總召模式：聯盟彙總行
          tableHtml += `
        <tr class="league-row">
          <td colspan="4">${item.allianceName} (聯盟彙總)</td>
        </tr>
        <tr class="summary-header">
          <td>學校總數: ${item.schoolCount} 間</td>
          <td>學生總數: ${item.totalStudents}</td>
          <td>參與人數: ${item.participants}</td>
          <td style="color: #2A9D8F; font-weight: bold;">平均分數: ${item.avgScore} 分</td>
        </tr>
      `;

          // 渲染下屬學校明細
          if (item.schools && item.schools.length > 0) {
            item.schools.forEach(school => {
              tableHtml += `
            <tr class="detail-row">
              <td style="text-align: left; padding-left: 30px;">└ ${school.school_name}</td>
              <td>${school.student_total}</td>
              <td>${school.participants}</td>
              <td style="font-weight: bold;">${school.avg_score} 分</td>
            </tr>
          `;
            });
          }
        } else {
          // 一般行政/老師模式：平鋪結構 (學校或班級)
          const label = (role === 'school_admin')
            ? `${item.grade}年${item.classroom}班`
            : item.schoolName;

          tableHtml += `
        <tr class="detail-row">
          <td style="text-align: left;">${label}</td>
          <td>${item.totalStudents}</td>
          <td>${item.participants}</td>
          <td style="font-weight: bold; color: #2A9D8F;">${item.avgScore} 分</td>
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
        /* 強制色彩設定 */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        
        body { font-family: "PingFang TC", "Microsoft JhengHei", sans-serif; padding: 20px; color: #333; line-height: 1.5; }
        .header-box { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2A9D8F; padding-bottom: 10px; }
        .header-box h2 { color: #2A9D8F; margin: 0; }
        .info-bar { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin: 10px 0; }
        
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: center; font-size: 13px; }
        th { background-color: #f8f9fa; font-weight: bold; }

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

        /* 明細行樣式 */
        .detail-row td { border-bottom: 1px solid #eee; }

        .btn-print { 
          background: #2A9D8F; color: white; border: none; padding: 8px 16px; 
          border-radius: 4px; cursor: pointer; margin-bottom: 20px; font-weight: bold;
        }

        @media print { .no-print { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">確認列印 / 存為 PDF</button>
      </div>
      <div class="header-box">
        <h2>${reportTitle}</h2>
      </div>
      <div class="info-bar">
        <span>報表類型：成績分析</span>
        <span>產生時間：${new Date().toLocaleString()}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">${firstColLabel}</th>
            <th>學生總人數</th>
            <th>參與人數</th>
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
    exportClassScore() {
      // 1. 準備數據字串
      // 成績分佈行
      let distRows = "";
      Object.entries(this.scoreDistribution).forEach(([range, count]) => {
        distRows += `<tr><td style="width:60%; font-weight:bold;">${range}</td><td>${count} 人</td></tr>`;
      });

      // 學生名單行
      let studentRows = "";
      this.studentListData.forEach((s) => {
        studentRows += `
        <tr>
          <td>${s.name}</td>
          <td>${s.classroom}</td>
          <td style="color:#2A9D8F; font-weight:bold;">${s.score}</td>
        </tr>`;
      });

      // 2. 打開新視窗
      const printWindow = window.open("", "_blank");

      // 3. 寫入完整 HTML 與 打印專用 CSS
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>成績分析報表 - ${this.examName}</title>
        <style>
          body { font-family: "PingFang TC", "Microsoft JhengHei", sans-serif; padding: 40px; color: #333; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 10px; }
          .exam-tag { background: #E0E0E0; padding: 5px 15px; border-radius: 5px; font-size: 24px; font-weight: bold; margin-right: 15px; }
          .class-info { font-size: 24px; font-weight: bold; }
          
          /* 統計卡片區域 */
          .summary-container { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 15px; }
          .stat-box { flex: 1; border: 1px solid #ccc; padding: 15px; text-align: center; border-radius: 10px; }
          .stat-val { font-size: 28px; font-weight: bold; display: block; }
          .stat-lab { font-size: 14px; color: #666; }
          
          /* 表格樣式 */
          .section-title { font-size: 18px; font-weight: bold; border-left: 8px solid #2A9D8F; padding-left: 12px; margin: 30px 0 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #333; padding: 10px; text-align: center; font-size: 14px; }
          th { background: #F5F7FA; }

          .new-page-section {
            page-break-before: always; 
            break-before: page;        
          }
          
          @media print {
            @page { size: A4; margin: 15mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="class-info">${this.currentClassInfo}</span>
          <h1 style="margin-top:10px;">${this.examName}</h1>
        </div>

        <div class="summary-container">
          <div class="stat-box"><span class="stat-val">156</span><span class="stat-lab">參與人數</span></div>
          <div class="stat-box"><span class="stat-val" style="color:#2ecc71;">82</span><span class="stat-lab">平均分數</span></div>
          <div class="stat-box"><span class="stat-val" style="color:#2A9D8F;">95</span><span class="stat-lab">最高分</span></div>
          <div class="stat-box"><span class="stat-val" style="color:#606266;">65</span><span class="stat-lab">最低分</span></div>
        </div>

        <div class="section-title">成績分佈</div>
        <table style="width: 100%; margin-left: 0;">
          <thead><tr><th>成績區間</th><th>人數</th></tr></thead>
          <tbody>${distRows}</tbody>
        </table>
<div class="new-page-section">
        <div class="section-title">學生明細 (全體人員)</div>
        <table>
          <thead>
            <tr><th>學生姓名</th><th>班級</th><th>分數</th></tr>
          </thead>
          <tbody>${studentRows}</tbody>
        </table>
</div>
        <script>
          // 確保圖片或資源加載完成後自動觸發打印
          window.onload = function() {
            window.print();
            // 打印完後若老師關閉打印視窗，可選擇是否自動關閉此分頁
            // window.close(); 
          };
        <\/script>
      </body>
      </html>
    `);

      //  關閉文件流以觸發渲染
      printWindow.document.close();
    },
    async fetchExamDetailData() {
      try {
        const [statsRes, listRes] = await Promise.all([
          api.post('/students/exam-stats/', { exam_id: this.examId }),
          api.get('/students/list/')
        ]);

        this.rawStatsData = statsRes.data;
        this.rawListData = listRes.data.results || [];

        // 1. 設定頂部總指標 (依身分取對應的 total_avg)
        const d = statsRes.data;
        this.globalStats.avg = d.global_avg_score || d.total_avg_score || 0;
        this.globalStats.participants = d.participants || 0;

        // 2. 根據身分進行資料平鋪與合併
        if (this.userRole === 'global_leader') {
          this.processGlobalData(d, this.rawListData);
        } else if (this.userRole === 'union_leader') {
          this.processUnionData(d, this.rawListData);
        } else {
          this.processTeacherData(d, this.rawListData);
        }
      } catch (err) {
        console.error("載入失敗", err);
      }
    },

    //  總召資料處理 
    processGlobalData(stats, list) {
      this.allianceOptions = (stats.leagues || []).map(l => ({ name: l.league_name, id: l.league_name }));
      this.schoolResultData = (stats.leagues || []).map(l => {
        const matchedLeague = list.find(ld => ld.league_name === l.league_name) || {};
        const listSchools = matchedLeague.schools || [];

        // 只累加「有考這份卷子」的學校人數
        const activeTotal = (l.schools || []).reduce((sum, s) => {
          if (s.participants > 0) {
            const matched = listSchools.find(ms => ms.school_name === s.school_name) || {};
            return sum + (matched.student_total || 0);
          }
          return sum;
        }, 0);

        return {
          allianceName: l.league_name,
          schoolCount: (l.schools || []).length,
          totalStudents: activeTotal,
          participants: l.participants,
          avgScore: l.league_avg_score,
          schools: l.schools.map(s => {
            const matched = listSchools.find(ms => ms.school_name === s.school_name) || {};
            return { ...s, student_total: matched.student_total || 0 };
          })
        };
      });
      this.selectedAlliance = this.allianceOptions[0]?.id;
      this.handleAllianceChange(this.selectedAlliance);
    },

    //  聯盟召集人資料處理 
    processUnionData(stats, list) {
      const leagueStats = Array.isArray(stats) ? stats[0] : stats.leagues[0];
      const matchedLeague = list.find(l => l.league_name === leagueStats.league_name) || {};

      this.schoolOptions = (leagueStats.schools || []).map(s => ({ name: s.school_name, id: s.school_name }));
      this.selectedSchools = this.schoolOptions.map(s => s.id);

      this.schoolResultData = (leagueStats.schools || []).map(s => {
        const matched = (matchedLeague.schools || []).find(ms => ms.school_name === s.school_name) || {};
        return {
          schoolName: s.school_name,
          totalStudents: matched.student_total || 0,
          participants: s.participants,
          avgScore: s.avg_score
        };
      });
      this.updateChartData();
    },

    //  老師資料處理 
    processTeacherData(stats, list) {
      // 1. 設定班級下拉選單
      this.classOptions = (stats.classes || []).map(c => `${c.grade}年${c.classroom}班`);
      this.selectedClasses = [...this.classOptions];

      // 2. 整合基礎資料與統計資料
      this.schoolResultData = (stats.classes || []).map(c => {
        // 匹配 list API 以獲取該班級的「學生總人數」
        const matchedClass = list.find(lc => lc.grade == c.grade && lc.classroom == c.classroom) || {};

        return {
          grade: c.grade,
          classroom: c.classroom,
          totalStudents: matchedClass.student_total || 0,
          participants: c.participants || 0,
          avgScore: c.avg_score || 0,
          // 儲存明細數據供彈窗使用
          highest_score: c.highest_score || 0,
          lowest_score: c.lowest_score || 0,
          students: c.students || [],
          score_distribution: c.score_distribution || {}
        };
      });
      this.updateChartData();
    },

    handleAllianceChange(val) {
      const league = this.rawStatsData.leagues.find(l => l.league_name === val);
      if (league) {
        this.schoolOptions = league.schools.map(s => ({ name: s.school_name, id: s.school_name }));
        this.selectedSchools = this.schoolOptions.map(s => s.id);
        this.updateChartData();
      }
    },

    updateChartData() {
      if (!this.rawStatsData) return;
      const categories = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99', '100'];

      let source = [];
      if (this.userRole === 'global_leader') {
        const league = this.rawStatsData.leagues.find(l => l.league_name === this.selectedAlliance);
        source = (league?.schools || []).filter(s => this.selectedSchools.includes(s.school_name));
      } else if (this.userRole === 'union_leader') {
        const league = Array.isArray(this.rawStatsData) ? this.rawStatsData[0] : this.rawStatsData.leagues[0];
        source = (league?.schools || []).filter(s => this.selectedSchools.includes(s.school_name));
      } else {
        source = (this.rawStatsData.classes || []).filter(c => this.selectedClasses.includes(`${c.grade}年${c.classroom}班`));
      }

      this.filteredDistSeries = source.map(item => ({
        name: item.school_name || `${item.grade}年${item.classroom}班`,
        data: categories.map(k => item.score_distribution[k] || 0)
      }));
    },
    openClassDetail(row) {
      // 1. 設定標題
      this.dialogTitle = `${row.grade} 年級 ${row.classroom} 班 成績明細`;

      // 2. 填充上方統計指標卡片 (確保與 Template 變數名對齊)
      this.currentDetailStats = {
        participants: row.participants,
        avgScore: row.avgScore,
        highest: row.highest_score, // 修正對應
        lowest: row.lowest_score     // 修正對應
      };

      // 3. 填充左側學生清單
      this.detailListData = (row.students || []).map(s => ({
        name: s.student_name,
        classroom: `${row.grade}年${row.classroom}班`,
        score: s.score
      }));

      // 4. 填充右側分佈 (確保區間排序正確)
      this.scoreDistribution = row.score_distribution || {};

      // 5. 顯示彈窗
      this.showDetailDialog = true;
    },

  },
  mounted() {
    this.fetchExamDetailData();
  }
};
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 24px;
  background-color: #F5F7FA;
  min-height: 100vh;
  margin-left: 90px;
  text-align: left;
}

.detail-header {
  @include flex-center;
  justify-content: flex-start;
  gap: 40px;
  margin-bottom: 30px;

  .back-link {
    font-weight: bold;
    color: $main-back-blue-text;
  }

  .back-link {
    font-size: 28px;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: $main-green;
    }
  }

}

.detail-section {
  background: #fff;
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
      gap: 8px;

      i {
        color: $main-green;
      }
    }
  }
}

.check-result-btn {
  background-color: $main-dark-blue;
  color: white !important;

  &:hover {
    background-color: #1b9e91 !important;
  }
}


.action-btn {
  @include back-system-action-btn
}

.custom-table {
  ::v-deep {
    th {
      background-color: transparent !important;
      font-weight: bold;
      color: $main-black-text;
      border-bottom: 2px solid #F0F2F5;
    }

    .bold-score {
      font-weight: bold;
      color: $main-black-text;
      font-size: 1.1em;
    }
  }
}

.chart-wrapper {
  width: 100%;
}

.header-actions {
  @include flex-center;
  gap: 12px;
}

.teal-select {
  min-width: 400px;
}

.score-detail-dialog {
  border-radius: 20px;

  .el-dialog__header {
    display: none;
  }

  .dialog-inner {
    padding: 10px;
  }
}

.dialog-header-box {
  flex-direction: column;
  @include flex-center;
  margin-bottom: 20px;

  .exam-tag {
    padding: 5px 15px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 24px;
  }

  .class-info {
    font-size: 24px;
    font-weight: bold;
  }
}

.summary-cards {
  margin-bottom: 30px;

  .stat-box {
    background: #fff;
    border: 1px solid #EBEEF5;
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .val {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }

    .lab {
      font-size: 14px;
      color: #999;
      margin: 5px 0 0;
    }

    .green {
      color: #2ecc71;
    }

    .teal {
      color: #2A9D8F;
    }

    .gray {
      color: #606266;
    }
  }
}

.distribution-table {
  width: 100%;
  border-collapse: collapse;

  td {
    border: 1px solid #333;
    padding: 4px 10px;
    text-align: center;
    font-weight: bold;

    &.range {
      width: 60%;
    }
  }
}

.dialog-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;

  .close-btn {
    @include back-system-action-btn;
    background: #2A9D8F;
  }
}


@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
  .detail-container {
    margin-left: 0;
  }

  .section-header {
    flex-direction: column;
    align-items: self-start !important;
    gap: 8px 0;

    .header-actions {
      flex-direction: column;
      width: 100%;

      .el-select {
        width: 100%;
      }
    }
  }
}
</style>