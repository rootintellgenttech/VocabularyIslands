<template>
  <div class="detail-container">
    <div class="detail-header">
      <div class="back-link" @click="$router.back()">
        <i class="el-icon-arrow-left"></i> 試卷名稱：{{ examName }}
      </div>
      <div class="exam-range">試卷範圍</div>
    </div>

    <div class="detail-section">
      <div class="section-header">
        <div class="header-title">
          <i class="fas fa-chart-bar"></i> 考試結果分佈
        </div>
      </div>
      <div class="chart-wrapper">
        <apexchart type="bar" height="350" :options="distChartOptions" :series="distSeries"></apexchart>
      </div>
    </div>

 <div class="detail-section">
  <div class="section-header">
    <div class="header-title">
      <i class="fas fa-table"></i> 試卷名稱成績分析
    </div>
    <button class="action-btn export-btn" @click="exportTable">
      <i class="fas fa-download"></i> 匯出報表
    </button>
  </div>
  
  <div id="export-table-container" style="background-color: white; padding: 10px; border-radius: 8px;">
    <el-table :data="schoolResultData"  height="300" style="width: 100%" class="custom-table">
      <el-table-column prop="schoolName" label="學校名稱" min-width="150"></el-table-column>
      <el-table-column prop="totalStudents" label="學生總人數" align="center"></el-table-column>
      <el-table-column prop="participants" label="學生參與人數" align="center"></el-table-column>
      <el-table-column prop="avgScore" label="平均分數" align="center">
        <template slot-scope="scope">
          <span class="bold-score">{{ scope.row.avgScore }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</div>
  </div>
</template>

<script>
export default {
  name: 'ExamDetail',
  data() {
    return {
      examName: this.$route.query.name || '未定義試卷',
      // --- 柱狀圖數據 ---
      distSeries: [
        { name: 'xx學校', data: [70, 85, 78, 65, 75, 72] },
        { name: 'xxx學校', data: [82, 95, 85, 80, 84, 90] },
        { name: '全部', data: [40, 45, 42, 38, 41, 40] }
      ],
      distChartOptions: {
        chart: { type: 'bar', toolbar: { show: true } },
        colors: ['#2A9D8F', '#E76F51', '#333'],
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 2 } },
        xaxis: { categories: ['10-20', '21-30', '31-40', '41-50', '51-60', '61-70'], title: { text: '成績' } },
        yaxis: { title: { text: '人數' } },
        legend: { position: 'bottom' },
        dataLabels: { enabled: false }
      },
      // --- 表格數據 ---
      schoolResultData: [
           { schoolName: 'xx國小', totalStudents: 892, participants: 892, avgScore: 85 },
        { schoolName: 'xx國小', totalStudents: 756, participants: 756, avgScore: 60 },
        { schoolName: 'xx國小', totalStudents: 721, participants: 721, avgScore: 70 },
           { schoolName: 'xx國小', totalStudents: 892, participants: 892, avgScore: 85 },
        { schoolName: 'xx國小', totalStudents: 756, participants: 756, avgScore: 60 },
        { schoolName: 'xx國小', totalStudents: 721, participants: 721, avgScore: 70 },
        { schoolName: 'xx國小', totalStudents: 892, participants: 892, avgScore: 85 },
        { schoolName: 'xx國小', totalStudents: 756, participants: 756, avgScore: 60 },
        { schoolName: 'xx國小', totalStudents: 721, participants: 721, avgScore: 70 },
        { schoolName: 'xx國小', totalStudents: 878, participants: 878, avgScore: 50 },
        { schoolName: '總合', totalStudents: 69, participants: 878, avgScore: 50 }
      ]
    };
  },
methods: {
  async exportTable() {
    const target = document.getElementById('export-table-container');
    const tableBody = target.querySelector('.el-table__body-wrapper');
    const tableElement = target.querySelector('.el-table');

    if (!target) return;

    const loading = this.$loading({
      lock: true,
      text: '正在處理完整報表資料...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    try {
      const originalHeight = tableElement.style.height;
      const originalBodyOverflow = tableBody.style.overflow;
      tableElement.style.height = 'auto';
      tableBody.style.height = 'auto';
      tableBody.style.overflow = 'visible';

      await this.$nextTick();

      const canvas = await this.$html2canvas(target, {
        backgroundColor: 'white',
        useCORS: true,
        scale: 2,
        height: target.scrollHeight,
        windowHeight: target.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      });

      tableElement.style.height = originalHeight;
      tableBody.style.height = ''; 
      tableBody.style.overflow = originalBodyOverflow;

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${this.examName}_成績分析報表.png`;
      a.click();

    } catch (err) {
      console.error('導出失敗:', err);
      this.$message.error('導出失敗');
    } finally {
      loading.close();
    }
  }
}
};
</script>

<style lang="scss" scoped>
$primary-teal: #2A9D8F;

.detail-container {
  padding: 24px;
  background-color: #F5F7FA;
  min-height: 100vh;
  margin-left: 90px;
}

.detail-header {
  @include flex-center;
  justify-content: flex-start;
  gap: 40px;
  margin-bottom: 30px;

  .back-link {
    font-size: 28px;
    font-weight: bold;
    color: #00332D;
    cursor: pointer;
    &:hover { color: $primary-teal; }
  }

  .exam-range {
    font-size: 24px;
    font-weight: bold;
    color: #00332D;
  }
}

.detail-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  .section-header {
    @include flex-center;
    justify-content: space-between;
    margin-bottom: 20px;
    .header-title { font-size: 18px; font-weight: bold; @include flex-center; gap: 8px; }
  }
}

.action-btn{
  background-color: $primary-teal;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.custom-table {
  ::v-deep th { font-weight: bold; color: #333; border-bottom: 2px solid #F0F2F5; }
  .bold-score { font-weight: bold; color: #333; }
}
</style>