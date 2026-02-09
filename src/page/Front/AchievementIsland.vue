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
          <div v-for="item in sortedAchievements" :key="item.id"
            :class="['achievement-card', { 'is-completed': item.isCompleted, 'can-claim': item.canClaim }]"
            @click="item.canClaim ? claimAchievement(item) : null">
            <div class="status-icon">
              <i v-if="item.isCompleted" class="fa-solid fa-circle-check check-icon"></i>
              <i v-else-if="item.canClaim" class="fa-solid fa-gift gift-icon"></i>
            </div>

            <div class="card-icon-wrap">
              <i :class="item.icon"></i>
            </div>

            <h4 class="card-title">{{ item.title }}</h4>
            <p class="card-desc">{{ item.desc }}</p>

            <div v-if="!item.isCompleted" class="progress-info">
              {{ item.currentVal }} / {{ item.target }}
            </div>

            <div v-if="!item.isCompleted" class="unfinished-mask">
              <span v-if="item.canClaim" class="claim-text">點擊兌換</span>
              <span v-else>未達成</span>
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
  data() {
    return {
      lighthouseImg: require('@/assets/image/lighthouse.png'),
      studentStats: {
        attendance_days: 0,
        island_stars: {}
      },
      achievements: [
        { id: 1, title: '踏出第一步', desc: '堅持學習\n連續登入10天', icon: 'fa-solid fa-shoe-prints', target: 10, category: 'attendance' },
        { id: 2, title: '初次閃耀', desc: '連續簽到14天', icon: 'fa-solid fa-star', target: 14, category: 'attendance' },
        { id: 3, title: '月度冠軍', desc: '連續登入30天', icon: 'fa-solid fa-trophy', target: 30, category: 'attendance' },
        { id: 4, title: '學而時習之', desc: '累計簽到達60天', icon: 'fa-solid fa-calendar', target: 60, category: 'attendance' },
        { id: 5, title: '勤學學霸', desc: '累計簽到達90天', icon: 'fa-solid fa-book', target: 90, category: 'attendance' },
        { id: 6, title: '字母探險者', desc: '完成ABC字母島關卡\n獲得 65 顆星星', icon: 'fa-brands fa-fort-awesome', target: 65, category: 'stars', islandKey: 'ABC啟航島' },
        { id: 7, title: '300字霸總', desc: '完成300字島所有關卡\n獲得 180 顆星星', icon: 'fa-solid fa-user-tie', target: 180, category: 'stars', islandKey: '300字島' },
        { id: 8, title: '初階小英雄', desc: '完成小英雄大本營所有\n獲得 30 顆星星', icon: 'fa-solid fa-shield-halved', target: 30, category: 'stars', islandKey: '小英雄大本營' },
        { id: 9, title: '聽力小老師', desc: '完成國小聽力海灣所有\n獲得 30 顆星星', icon: 'fa-solid fa-ear-deaf', target: 30, category: 'stars', islandKey: '國小聽力海灣' },
        { id: 10, title: '國小里程碑', desc: '完成國小的所有島嶼\n獲得 305 顆星星', icon: 'fa-solid fa-medal', target: 305, category: 'stars_all', includes: ['ABC啟航島', '300字島', '小英雄大本營', '國小聽力海灣'] },
        { id: 11, title: '800字勇者', desc: '完成800字島所有關卡\n獲得 275 顆星星', icon: 'fa-solid fa-user-ninja', target: 275, category: 'stars', islandKey: '800字島' },
        { id: 12, title: '1200字王者', desc: '完成1200字島所有關卡\n獲得 240 顆星星', icon: 'fa-solid fa-chess', target: 240, category: 'stars', islandKey: '1200字島' },
        { id: 13, title: '會考大殿堂', desc: '完成會考大殿堂所有關卡\n獲得 65 顆星星', icon: 'fa-solid fa-web-awesome', target: 65, category: 'stars', islandKey: '會考大殿堂' },
        { id: 14, title: '聽力大師', desc: '完成國中聽力海灣所有\n獲得 55 顆星星', icon: 'fa-solid fa-headphones', target: 55, category: 'stars', islandKey: '國中聽力海灣' },
        { id: 15, title: '國中里程碑', desc: '完成國中的所有島嶼\n獲得 635 顆星星', icon: 'fa-solid fa-ranking-star', target: 635, category: 'stars_all', includes: ['800字島', '1200字島', '會考大殿堂', '國中聽力海灣'] },
      ]
    };
  },
  computed: {
    completedCount() {
      return this.achievements.filter(item => item.isCompleted).length;
    },
    //計算完成率 (百分比)
    completionRate() {
      if (this.achievements.length === 0) return 0;
      const rate = (this.completedCount / this.achievements.length) * 100;
      return Math.round(rate); // 取整數
    },
    // 判定哪些成就是「可兌換」的
    processedAchievements() {
      return this.achievements.map(item => {
        let currentVal = 0;
        if (item.category === 'attendance') {
          currentVal = this.studentStats.attendance_days || 0;
        } else if (item.category === 'stars') {
          currentVal = this.studentStats.island_stars[item.islandKey] || 0;
        } else if (item.category === 'stars_all') {
          currentVal = item.includes.reduce((acc, key) => acc + (this.studentStats.island_stars[key] || 0), 0);
        }

        const canClaim = !item.isCompleted && currentVal >= item.target;
        return { ...item, currentVal, canClaim };
      });
    },
    // 排序：已完成 -> 可兌換 -> 未完成
    sortedAchievements() {
      return [...this.processedAchievements].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? -1 : 1;
        if (a.canClaim !== b.canClaim) return a.canClaim ? -1 : 1;
        return 0;
      });
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.fetchDashboard();
      await this.fetchAchievementsLog();
    },

    // 獲取已完成的紀錄
    async fetchAchievementsLog() {
      try {
        const response = await api.get('/students/students/achievements/log/');
        const logs = response.data; // 格式預期為 [{ "name": "...", "completed_at": "..." }]

        // 更新 achievements 陣列中的完成狀態
        this.achievements = this.achievements.map(item => {
          const record = logs.find(log => log.name === item.title);
          if (record) {
            return {
              ...item,
              isCompleted: true,
              completed_at: record.completed_at
            };
          }
          return item;
        });
      } catch (error) {
        console.error('獲取成就紀錄失敗:', error);
      }
    },

    async fetchDashboard() {
      try {
        const response = await api.get('/students/dashboard/student/');
        this.studentStats = response.data;
      } catch (error) {
        console.error('獲取儀表板數據失敗:', error);
      }
    },

    async claimAchievement(item) {
      if (!item.canClaim) return;
      try {
        await api.post('/students/students/achievements/', { name: item.title });
        this.$message.success(`恭喜獲得成就：${item.title}！`);
        await this.fetchAchievementsLog();
      } catch (error) {
        console.error('兌換失敗:', error);
        this.$message.error('兌換失敗，請稍後再試');
      }
    },

    goBack() {
      this.$router.push('/home');
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
  padding-left: 100px;
}

.main-content-wrap {
  width: 1200px;
  margin: 4% auto;

  .header-section,
  .main-content {
    background: white;
    border-radius: 14px;
    padding: 30px;
  }
}

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

  .header-text {
    color: $main-black-text;
  }
}

.main-content {
  .group-title {
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
  font-size: 32px;
  color: $main-black-text;
  margin: 0 0 10px 0;
}

.page-desc{
  margin: 0;
  font-size: 20px;
}

// .page-desc{
//     border-bottom: 1px solid rgb(134, 131, 131);
//     padding-bottom: 12px;
//     width: 400px;
// }

.pinned-grid {
  display: flex;
  gap: 15px;
  margin-top: 24px;
}

.card-title {
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

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: white;
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 16px;
  padding: 25px 15px;
  text-align: center;
  position: relative;
  border: 1px solid #eef2f2;
  transition: transform 0.2s;

  .card-icon-wrap i {
    font-size: 32px;
  }

  .card-title {
   margin:16px 0 8px;
    color: $main-black-text;
  }

  .card-desc {
    color: $main-grey-text;
    white-space: pre-line;
    margin: 0;
  }
}

.top-info-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;

  .first-row {
    display: flex;
    justify-content: space-between;
    gap: 0 20px;

  }

  .second-row {
    .section-label {
      margin-top: 24px;
    }
  }

  .stats-badge {
    @include flex-center;
    gap: 0 12px;
    background: #18AC9D;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;

    i {
      font-size: 32px;
    }

    .stats-text {
      display: flex;
      flex-direction: column;

      .count {
        font-size: 20px;
        font-weight: 600;
      }
    }
  }
}

/* 已完成藍色樣式 */
.achievement-card.is-completed {
  background-color: #4abcb1;

  .card-desc,
  .card-title {
    color: white;
  }
}

.achievement-card.is-completed i {
  color: white !important;
}

.unfinished-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  pointer-events: none;
}

.status-icon {
  position: absolute;
  top: 12px;
  right: 12px;
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
  color: #f1c40f;
}


.achievement-card.can-claim {
  border: 2px solid #f1c40f;
  cursor: pointer;
  animation: pulse 2s infinite;

  &:hover {
    background-color: #5fb5acb3;
  }

  .unfinished-mask {
    background: rgba(24, 172, 157, 0.7);
  }

  .claim-text {
    font-size: 20px;
    color: white;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    font-weight: 800;

  }
}

.progress-info {
  font-size: 16px;
  color: #706868;
  margin-top: 4px;
  z-index: 1;
}

.gift-icon {
  color: #f1c40f;
  font-size: 24px;
  animation: bounce 1s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.4);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(241, 196, 15, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(241, 196, 15, 0);
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@media (orientation: landscape) and (max-height: 1199.98px) and (pointer: coarse) {
  .achievement-island-page {
    padding: 0 6% 0 12%;

    .main-content-wrap {
      width: 100%;
    }
  }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
  .achievement-island-page {
    padding: 0 8% !important;

    .main-content-wrap {
      width: 100%;

      .top-info-wrap .first-row {
        flex-direction: column;
        gap: 24px 0;
      }
    }
  }
}
</style>