<template>
  <div class="analysis-container">
    <h2 class="page-title">試煉殿堂考試分析</h2>

    <div class="analysis-section">
      <div class="section-header">
        <div class="header-title">試卷列表</div>
        <el-select v-model="filterStatus" placeholder="全部狀態" class="custom-select teal-select small">
          <el-option label="全部狀態" value="all"></el-option>
          <el-option label="進行中" value="active"></el-option>
          <el-option label="已結束" value="ended"></el-option>
        </el-select>
      </div>
      <el-table @row-click="goToDetail" :data="examListData" style="width: 100%" height="300"
        class="custom-table list-table">
        <el-table-column prop="name" label="試卷名稱" min-width="120"></el-table-column>
        <el-table-column label="檢測時程" min-width="180">
          <template slot-scope="scope">
            <div class="time-column">
              <i class="far fa-calendar-alt"></i> {{ scope.row.date }}<br>
              <i class="far fa-clock"></i> {{ scope.row.time }}
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
            <span :class="{ 'teal-text': scope.row.avgScore }">{{ scope.row.avgScore ? scope.row.avgScore + '分' : '-'
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="analysis-section">
      <div class="section-header">
        <div class="header-title">
          <i class="fas fa-chart-line"></i> 試煉殿堂考試概況
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="exportFullTable('export-analysis')">
            <i class="fas fa-download"></i> 匯出報表
          </button>
        </div>
      </div>
      <div id="export-analysis">
        <el-table :data="overviewTableData" height="300" style="width: 100%" class="custom-table">
          <el-table-column prop="alliance" label="各校" min-width="150"></el-table-column>
          <el-table-column prop="schoolName" label="學校名稱" align="center"></el-table-column>
          <el-table-column prop="studentCount" label="學生總數" align="center"></el-table-column>
          <el-table-column prop="completedCount" label="考試完成人數" align="center"></el-table-column>
        </el-table>
      </div>
    </div>

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
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamAnalysis',
  data() {
    return {
      filterStatus: 'all',
      examListData: [
        { name: '1-1', date: '2024-01-15', time: '09:00 - 17:00', duration: '30分', participants: 156, avgScore: 82 },
        { name: '1-2', date: '2024-01-20', time: '09:00 - 17:00', duration: '30分', participants: 0, avgScore: 0 },
        { name: '1-3', date: '2024-01-18', time: '08:30 - 12:00', duration: '60分', participants: 89, avgScore: 0 },
        { name: '2-1', date: '2024-01-22', time: '09:00 - 17:00', duration: '45分', participants: 0, avgScore: 0 },
      ],
      overviewTableData: [
        { alliance: '海之鄉聯盟', schoolName: '8', studentCount: 892, completedCount: 85 },
        { alliance: '美濃書香聯盟', schoolName: '7', studentCount: 756, completedCount: 87 },
        { alliance: '山海聯盟', schoolName: '6', studentCount: 721, completedCount: 83 },
        { alliance: '鄰區聯盟', schoolName: '7', studentCount: 878, completedCount: 86 },
      ],
      groupBarSeries: [
        { name: 'xx學校', data: [15, 25, 20, 10] },
        { name: 'xxx學校', data: [10, 12, 15, 22] },
        { name: '全部', data: [30, 40, 35, 32] }
      ],
      groupBarOptions: {
        chart: { type: 'bar', toolbar: { show: true } },
        colors: ['#2A9D8F', '#E76F51', '#999'],
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 2 } },
        dataLabels: { enabled: false },
        xaxis: { categories: ['0-10', '11-20', '21-30', '31-40'] },
        legend: { position: 'bottom' },
      }
    };
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
    font-size: 13px;
    line-height: 1.6;
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
.analysis-container{
  margin-left: 0;
}
}
</style>