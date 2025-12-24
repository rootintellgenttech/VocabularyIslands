<template>
  <div class="achievement-island-page">
       <div class="return-last-page" @click="goBack">
            <i class="fas fa-angle-left"></i> 返回
        </div>
    <div class="main-content-wrap">
      <div class="header-section">
        <div class="header-main">
          <img :src="lighthouseImg" alt="燈塔" class="lighthouse-img">
<div class="top-info-wrap">
    <div class="first-row">
              <div class="header-text">
            <h1 class="page-title">我的成就島</h1>
            <p class="page-desc">探索我的學習成就，設定學習目標</p>
            
   
          </div>
  <div class="stats-badge">
          <div class="trophy-icon">
            <i class="fa-solid fa-trophy"></i>
          </div>
          <div class="stats-text">
            <span class="count">{{ completedCount }}/{{ achievements.length }}</span>
            <span class="label">完成率 {{ completionRate }}%</span>
          </div>
        </div>
          </div>
          <!-- <div class="second-row">
                <div class="pinned-section">
  <p class="section-label">釘選待完成的成就 ({{ pinnedList.length }}/5)</p>
  
  <vue-custom-scrollbar class="pinned-cards-wrapper" :settings="scrollSettings">
      <div 
        v-for="item in pinnedList" 
        :key="'pinned-' + item.id" 
        class="achievement-card is-pinned-style"
      >
        <div class="status-icon">
          <i class="fa-solid fa-thumbtack pin-btn active" @click="togglePin(item)"></i>
        </div>
        <div class="card-icon-wrap">
          <i :class="item.icon"></i>
        </div>
        <h4 class="card-title">{{ item.title }}</h4>
        <p class="card-desc">{{ item.desc }}</p>
        
        <div class="unfinished-mask">
          <span>待完成</span>
        </div>
      </div>
  </vue-custom-scrollbar>
</div>
          </div> -->
</div>
          
        </div>
        
      
      </div>

      <div class="main-content">
        <h3 class="group-title">所有成就</h3>
        <div class="achievement-grid">
        <div 
    v-for="item in sortedAchievements" 
    :key="item.id" 
    :class="['achievement-card', { 'is-completed': item.isCompleted }]"
  >
            <div class="status-icon">
              <i v-if="item.isCompleted" class="fa-solid fa-circle-check check-icon"></i>
              <!-- <i 
                v-else 
                :class="['fa-solid fa-thumbtack pin-btn', { 'active': item.isPinned }]" 
                @click="togglePin(item)"
              ></i> -->
            </div>

            <div class="card-icon-wrap">
              <i :class="item.icon"></i>
            </div>

            <h4 class="card-title">{{ item.title }}</h4>
            <p class="card-desc">{{ item.desc }}</p>

            <div v-if="!item.isCompleted" class="unfinished-mask">
              <span>待完成</span>
            </div>
          </div>
        </div>
      </div>    
    </div>
  </div>
</template>

<script>
import api from '@/config/api'; 

export default {
  name: 'AchievementIsland',
  props: {
    scrollSettings: {
            suppressScrollY: true,
            suppressScrollX: false,
            wheelPropagation: false
        }
  },
  data() {
    return {
      lighthouseImg: require('@/assets/image/lighthouse.png'),
     achievements: [
      { id: 1, title: '踏出第一步', desc: '堅持學習\n連續登入10天', icon: 'fa-solid fa-shoe-prints', isCompleted: false, isPinned: false, completed_at: null },
      { id: 2, title: '初次閃耀', desc: '連續簽到14天', icon: 'fa-solid fa-star', isCompleted: false, isPinned: false, completed_at: null },
      { id: 3, title: '月度冠軍', desc: '連續登入30天', icon: 'fa-solid fa-trophy', isCompleted: false, isPinned: false, completed_at: null },
      { id: 4, title: '學而時習之', desc: '累計簽到達60天', icon: 'fa-solid fa-calendar', isCompleted: false, isPinned: false, completed_at: null },
      { id: 5, title: '勤學學霸', desc: '累計簽到達90天', icon: 'fa-solid fa-book', isCompleted: false, isPinned: false, completed_at: null },
      { id: 6, title: '字母探險者', desc: '完成ABC字母島關卡\n並獲得所有星星', icon: 'fa-brands fa-fort-awesome', isCompleted: false, isPinned: false, completed_at: null },
      { id: 7, title: '300字霸總', desc: '完成300字島所有關卡\n並獲得所有星星', icon: 'fa-solid fa-user-tie', isCompleted: false, isPinned: false, completed_at: null },
      { id: 8, title: '初階小英雄', desc: '完成小英雄大本營所有\n關卡並獲得所有星星', icon: 'fa-solid fa-shield-halved', isCompleted: false, isPinned: false, completed_at: null },
      { id: 9, title: '聽力小老師', desc: '完成國小聽力海灣所有\n關卡並獲得所有星星', icon: 'fa-solid fa-ear-deaf', isCompleted: false, isPinned: false, completed_at: null },
      { id: 10, title: '國小里程碑', desc: '完成國小的所有島嶼\n並獲得所有星星', icon: 'fa-solid fa-medal', isCompleted: false, isPinned: false, completed_at: null },
      { id: 11, title: '800字勇者', desc: '完成800字島所有關卡\n並獲得所有星星', icon: 'fa-solid fa-user-ninja', isCompleted: false, isPinned: false, completed_at: null },
      { id: 12, title: '1200字王者', desc: '完成1200字島所有關卡\n並獲得所有星星', icon: 'fa-solid fa-chess', isCompleted: false, isPinned: false, completed_at: null },
      { id: 13, title: '會考大殿堂', desc: '完成會考大殿堂所有關卡\n並獲得所有星星', icon: 'fa-solid fa-web-awesome', isCompleted: false, isPinned: false, completed_at: null },
      { id: 14, title: '聽力大師', desc: '完成國中聽力海灣所有\n關卡並獲得所有星星', icon: 'fa-solid fa-headphones', isCompleted: false, isPinned: false, completed_at: null },
      { id: 15, title: '國中里程碑', desc: '完成國中的所有島嶼\n並獲得所有星星', icon: 'fa-solid fa-ranking-star', isCompleted: false, isPinned: false, completed_at: null },
    ]
    };
  },
  computed: {
    sortedAchievements() {
    return [...this.achievements].sort((a, b) => {
      // 1. 已完成排在未完成前面
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? -1 : 1;
      }
      // 2. 如果都已完成，按時間倒序排列（最新在前）
      if (a.isCompleted && b.isCompleted) {
        return new Date(b.completed_at) - new Date(a.completed_at);
      }
      return 0;
    });
  },
    // 獲取已釘選且未完成的成就
    pinnedList() {
      return this.achievements.filter(a => a.isPinned && !a.isCompleted);
    },
    completedCount() {
      return this.achievements.filter(a => a.isCompleted).length;
    },
    completionRate() {
      return Math.round((this.completedCount / this.achievements.length) * 100);
    }
  },
    mounted() {
    this.fetchAchievementsLog();
  },
  methods: {
        goBack() {
            this.$router.push('/home');
        },
        async fetchAchievementsLog() {
    try {
      const response = await api.get('/students/students/achievements/log/');
      const logs = response.data; // [{ "name": "...", "completed_at": "..." }]

      this.achievements = this.achievements.map(item => {
        // 在 API 中尋找對應標題的紀錄
        const record = logs.find(log => log.name === item.title);
        if (record) {
          return {
            ...item,
            isCompleted: true,
            completed_at: record.completed_at,
            isPinned: false // 已完成自動取消釘選
          };
        }
        return item;
      });
      console.log('成就紀錄更新完成');
    } catch (error) {
      console.error('獲取成就失敗:', error);
    }
  },
    togglePin(item) {
      if (item.isCompleted) return; // 已完成不能釘選
      
      if (!item.isPinned) {
        if (this.pinnedList.length >= 5) {
          this.$message.warning('最多只能釘選 5 個成就喔！');
          return;
        }
        item.isPinned = true;
      } else {
        item.isPinned = false;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.achievement-island-page {
    width: 1200px;
    margin: 4% auto;
    .return-last-page {
    padding: 0 0 24px;
}
}

.main-content-wrap{
    
    .header-section,.main-content{
 background: white;
  border-radius: 15px;
  padding: 30px;
    }
}

/* 頂部樣式 */
.header-section {
 
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.header-main {
  display: flex;
  width: 100%;
  gap: 30px;

  .header-text{
    color: $main-black-text;
  }
}

.main-content{
    .group-title{
            color: $main-black-text;
        margin-bottom: 12px;
    }
}

.lighthouse-img {
  width: 200px;
  object-fit: contain;
}


.pinned-cards-wrapper {
  display: flex;
  gap: 15px;
  padding: 5px;
  min-height: 200px;
  margin-top: 16px;
  width: 700px;
}

/* 讓釘選卡片維持固定寬度，不會被擠壓 */
.is-pinned-style {
  flex-shrink: 0; 
  width: 180px;
  height: 220px;
  background: #fdfdfd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}


.page-title {
  font-size: 28px;
    color: $main-black-text;
      margin: 0 0 10px 0;
}
.page-desc{
    border-bottom: 1px solid rgb(134, 131, 131);
    padding-bottom: 12px;
    width: 400px;
}

.pinned-grid {
  display: flex;
  gap: 15px;
  margin-top: 24px;
}

.card-title{
margin-top: 4px;
    font-size: 22px;
}
.mini-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  min-width: 180px;
}

/* 卡片與遮罩樣式 */
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: white;
  height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  position: relative;
  border: 1px solid #eef2f2;
  transition: transform 0.2s;
.card-icon-wrap i{
    font-size: 32px;
}
.card-title{
    color: $main-black-text;
}
.card-desc{
    color: $main-grey-text;
    white-space: pre-line;
}
}

.top-info-wrap{
    display: flex;
    flex-direction: column;
    width: 100%;
    .first-row{
        display: flex;
        justify-content: space-between;
            gap: 0 20px;
            
    }
    .second-row{
         .section-label{
        margin-top: 24px;
    }
    }
    .stats-badge{
   @include flex-center;
   gap: 0 12px;
    background: #18AC9D;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    i{
        font-size: 32px;
    }
    .stats-text{
        display: flex;
        flex-direction: column;
        .count{
            font-size: 20px;
            font-weight: 600;
        }
    }
}
}

/* 已完成藍色樣式 */
.achievement-card.is-completed {
  background-color: #4abcb1;
  .card-desc,.card-title{
    color:white;
}
}

.achievement-card.is-completed i {
  color: white !important;
}

/* 待完成遮罩 */
.unfinished-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  pointer-events: none; /* 讓點擊穿透到下層的 pin 鈕 */
}

.status-icon {
  position: absolute;
  top: 12px; right: 12px;
  z-index: 10;
}

.check-icon {
  color: white;
  font-size: 20px;
}

.pin-btn {
  cursor: pointer;
  color: #ccc;
  font-size: 18px;
  pointer-events: auto;
}

.pin-btn.active {
  color: #f1c40f; /* 釘選後變金色 */
}
</style>