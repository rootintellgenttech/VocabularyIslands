<template>
  <div class="news-container">
    <div class="page-header">
      <h2 class="page-title">最新消息</h2>
      <button class="action-btn add-btn" @click="openAddDialog">
        新增並發布消息
      </button>
    </div>

    <div class="news-section">
      <el-table  height="600" :data="newsList" style="width: 100%" class="custom-table">
        <el-table-column prop="title" label="標題" min-width="150"></el-table-column>
        <el-table-column prop="type" label="類型" min-width="120" align="center"></el-table-column>
        <el-table-column prop="content" label="内容" min-width="300"></el-table-column>
        <el-table-column prop="date" label="發布日期" width="150" align="center"></el-table-column>
      </el-table>
    </div>

    <el-dialog 
      custom-class="custom-news-modal" 
      :visible.sync="addDialogVisible" 
      width="500px" 
      center
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="dialog-header-custom">
        <h3 class="title">發布消息</h3>
        <span class="publish-date">發布日期: {{ currentDay }}</span>
      </div>

      <div class="dialog-form">
        <div class="form-item">
          <label>標題</label>
          <input type="text" v-model="newMsg.title" placeholder="輸入標題" class="form-input">
        </div>

        <div class="form-item">
          <label>類型</label>
          <el-select v-model="newMsg.type" placeholder="下拉選單" class="full-width-select">
            <el-option label="系統更新" value="系統更新"></el-option>
            <el-option label="活動通知" value="活動通知"></el-option>
            <el-option label="維護通知" value="維護通知"></el-option>
          </el-select>
        </div>

        <div class="form-item">
          <label>文字說明</label>
          <textarea 
            v-model="newMsg.content" 
            placeholder="(消息文字說明，上限90個字元，含標點符號)" 
            maxlength="90"
            rows="5"
            class="form-textarea"
          ></textarea>
          <span class="word-count">{{ newMsg.content.length }}/90</span>
        </div>
      </div>

      <span slot="footer" class="dialog-footer two-btns">
        <el-button @click="addDialogVisible = false" class="btn-cancel">取消</el-button>
        <el-button @click="submitNews" class="btn-submit">發佈</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NewsManagement',
  data() {
    return {
      addDialogVisible: false,
      currentDay: '2025-01-24',
      newsList: [
        { title: '新島嶼開放', type: '類型', content: '文字說明(消息文字說明，上限90個字元，含標點符號)', date: '2025-01-05' },
        { title: '新島嶼開放', type: '類型', content: '文字說明(消息文字說明，上限90個字元，含標點符號)', date: '2025-01-05' },
        { title: '新島嶼開放', type: '類型', content: '文字說明(消息文字說明，上限90個字元，含標點符號)', date: '2025-01-05' },
      ],
      newMsg: {
        title: '',
        type: '',
        content: ''
      }
    };
  },
  methods: {
    openAddDialog() {
      this.newMsg = { title: '', type: '', content: '' };
      this.addDialogVisible = true;
    },
    submitNews() {
      if (!this.newMsg.title || !this.newMsg.content) {
        this.$message.warning('請填寫完整資訊');
        return;
      }
      
      const payload = {
        ...this.newMsg,
        date: this.currentDay
      };
      this.newsList.unshift(payload);
      
      this.addDialogVisible = false;
      this.$message.success('消息發布成功');
    }
  }
};
</script>

<style lang="scss" scoped>
$primary-teal: #4ABCB1;
$input-bg: #F0FAFF;

.news-container {
  padding: 24px;
  background-color: #F5F7FA;
  min-height: 100vh;
  margin-left: 90px;
}

.page-header {
  @include flex-center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #00332D;
}

.add-btn {
  background-color: $primary-teal;
  color: white;
  border: none;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  &:hover { opacity: 0.9;
 }
}

.news-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

::v-deep .custom-news-modal {
  border-radius: 20px;
  padding: 10px;

  .el-dialog__header { display: none; }

  .dialog-header-custom {
    @include flex-center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 10px;
    
    .title { font-size: 24px; color: #333; font-weight: bold; }
    .publish-date { color: #666; font-size: 14px; }
  }

  .form-item {
    margin-bottom: 20px;
    text-align: left;
    position: relative;

    label {
      display: block;
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }

    .form-input, .form-textarea {
      width: 100%;
      background-color: $input-bg;
      border: 1px solid rgba($primary-teal, 0.2);
      border-radius: 10px;
      padding: 12px 15px;
      outline: none;
      font-size: 14px;
      box-sizing: border-box;
    }

    .word-count {
      position: absolute;
      right: 10px;
      bottom: 10px;
      font-size: 12px;
      color: #999;
    }
  }

  .dialog-footer {
    display: flex;
    gap: 15px;
    justify-content: center;
    padding-bottom: 10px;

    .el-button {
      width: 140px;
      height: 45px;
      border-radius: 10px;
      font-size: 16px;
    }

    .btn-cancel { background: #F5F5F5; border: none; color: #666; }
    .btn-submit { background: $primary-teal; border: none; color: white; }
  }
}

.full-width-select {
  width: 100%;
  ::v-deep .el-input__inner {
    background-color: $input-bg;
    border-radius: 10px;
    border: 1px solid rgba($primary-teal, 0.2);
  }
}
</style>