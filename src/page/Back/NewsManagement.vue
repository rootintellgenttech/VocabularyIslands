<template>
  <div class="news-container">
    <div class="page-header">
      <h2 class="page-title">最新消息</h2>
      <button class="add-btn" @click="openAddDialog">
        新增並發布消息
      </button>
    </div>

    <div class="news-section">
      <el-table height="600" :data="newsList" style="width: 100%" class="custom-table">
        <el-table-column prop="title" label="標題" min-width="150"></el-table-column>
        <el-table-column prop="type" label="類型" min-width="120" align="center"></el-table-column>
        <el-table-column prop="content" label="内容" min-width="300"></el-table-column>
        <el-table-column prop="date" label="發布日期" width="150" align="center"></el-table-column>
      </el-table>
    </div>

    <el-dialog custom-class="custom-news-modal" :visible.sync="addDialogVisible" width="500px" center
      :close-on-click-modal="false" append-to-body>
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
          <textarea v-model="newMsg.content" placeholder="(消息文字說明，上限90個字元，含標點符號)" maxlength="90" rows="5"
            class="form-textarea"></textarea>
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
.news-container {
  padding: 24px;
  background-color: #F5F7FA;
  min-height: 100vh;
  margin-left: 90px;
  text-align: left;
}

.page-header {
  @include flex-center;
  justify-content: space-between;
  margin-bottom: 30px;

  .page-title {
    font-size: 32px;
    font-weight: bold;
    color: $main-back-blue-text;
    margin-bottom: 0;
  }
}


.add-btn {
  background-color: #4ABCB1;
  color: white;
  border: none;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  @include main-box-shadow;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}



.news-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  @include main-box-shadow;
}


::v-deep .custom-news-modal {
  border-radius: 20px;
  overflow: hidden;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 30px;
  }

  .dialog-header-custom {
    @include flex-center;
    justify-content: space-between;
    margin-bottom: 25px;

    .title {
      font-size: 24px;
      color: $main-black-text;
      font-weight: bold;
      margin: 0;
    }

    .publish-date {
      color: $main-grey-text;
      font-size: 14px;
    }
  }


  .form-item {
    margin-bottom: 20px;
    text-align: left;
    position: relative;

    label {
      display: block;
      font-weight: bold;
      margin-bottom: 8px;
      color: $main-black-text;
    }


    .form-input,
    .form-textarea,
    .el-input__inner {
      width: 100%;
      background-color: #F0FAFF !important;
      border: 1px solid rgba(74, 188, 177, 0.2);
      border-radius: 10px;
      padding: 12px 15px;
      outline: none;
      font-size: 14px;
      box-sizing: border-box;
      color: $main-black-text;

      &:focus {
        border-color: #4ABCB1;
      }
    }

    .form-textarea {
      resize: none;
    }

    .word-count {
      position: absolute;
      right: 12px;
      bottom: 12px;
      font-size: 12px;
      color: #999;
      background: rgba(240, 250, 255, 0.8);
      padding: 2px 4px;
    }
  }

  .dialog-footer {
    display: flex;
    gap: 15px;
    justify-content: center;
    padding: 10px 0 20px;

    .el-button {
      width: 140px;
      height: 45px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: bold;
      border: none;
    }

    .btn-cancel {
      background: #F5F5F5;
      color: #666;

      &:hover {
        background: #E0E0E0;
      }
    }

    .btn-submit {
      background: #4ABCB1;
      color: white;
      @include main-box-shadow;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.full-width-select {
  width: 100%;
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
  .news-container {
    margin-left: 0;
  }
}
</style>