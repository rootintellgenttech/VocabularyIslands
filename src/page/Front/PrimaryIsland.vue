<template>
    <div class="primary-page">

        <div class="islands-grid">
            <div class="top-bar">
                <h1 class="page-title">國小</h1>
                <button class="back-btn" @click="goBack">
                    返回大廳
                </button>
            </div>
            
            <vue-custom-scrollbar class="islands-scroll-container" :settings="scrollSettings">
                <div class="island-map">
                    <div v-for="island in islands" :key="island.id" class="island-container">
                        <div class="island-card">
                        <img :src="island.imgColor" 
         :class="{ 'is-bw': island.stars === 0 }" 
         alt="Island Image"
         class="island-image" />
                        </div>

                        <div class="stats-row">
                          <div class="stat-group">
        <img src="../../assets/image/elementary/star.png" alt="⭐">
        <span>{{ island.stars }}/{{ island.totalStars || 0 }}</span>
    </div>
                            <!-- <div class="stat-group">
                                <img src="../../assets/image/elementary/book.png" alt="⭐">
                                <span>學習 {{ island.progress }}%</span>
                            </div> -->
                        </div>

                        <div class="island-title">{{ island.name }}</div>

                        <button class="enter-btn" @click="enterIsland(island.id)">
                            進入學習
                        </button>
                    </div>
                </div>
            </vue-custom-scrollbar>
        </div>
    </div>
</template>

<script>
import api from '@/config/api';

export default {
    name: 'PrimaryIsland',
      props:{
            scrollSettings: {
                suppressScrollY: true,  // 關閉直向滾動
                suppressScrollX: false, // 開啟橫向滾動
                wheelPropagation: false
            }
    },
    data() {
        const levelOptions = [
            { name: '國小', value: 'primary' },
            { name: '國中', value: 'secondary' }
        ];

        return {
            selectedLevel: levelOptions[0], // 預設選擇國小
            levelOptions: levelOptions,
          islands: [
                {
                    id: 'abc',
                    name: 'ABC啟航島',
                    progress: 20,
                    stars: 0,
                    totalStars: 0, 
                    imgColor: require('@/assets/image/elementary/abc-island.png'),
                },
                {
                    id: '300',
                    name: '300字島',
                    progress: 0,
                    stars: 0,
                    totalStars: 0, 
                    imgColor: require('@/assets/image/elementary/300-island.png'),
                },
                {
                    id: 'hero',
                    name: '小英雄大本營',
                    progress: 0,
                    stars: 0,
                    totalStars: 0, 
                    imgColor: require('@/assets/image/elementary/hero-island.png'),
                },
                {
                    id: 'listen',
                    name: '國小聽力海灣',
                    progress: 0,
                    stars: 0,
                    totalStars: 0, 
                    imgColor: require('@/assets/image/elementary/hear-island.png'),
                }
            ]
        };
    },
    mounted() {
        this.fetchIslandStars();
    },
    methods: {
async fetchIslandStars() {
    try {
        // 定義每個島嶼「完整配置」的總關卡數
        // 300字島: 6單元 * 6關 = 36關 -> 180星
        // ABC島: 13關 -> 65星
        const STATIC_TOTAL_CONFIG = {
            'abc': 65,
            '300': 180, 
            'hero': 30,
            'listen': 30
        };

        const res = await api.get('/students/test-summary/');
        this.islands = this.islands.map(isl => {
            const matchedIsland = res.data.islands.find(i => i.island_name === isl.name);
            
            return {
                ...isl,
                stars: matchedIsland ? matchedIsland.total_stars : 0,
                // 使用靜態配置的總分母，確保不會因為 API 沒記錄而變小
                totalStars: STATIC_TOTAL_CONFIG[isl.id] || 0 
            };
        });
    } catch (err) {
        console.error('更新島嶼星星失敗:', err);
    }
},
   goBack() {
            this.$router.push('/home'); // 回到大廳
        },
        enterIsland(id) {
            console.log(`Enter island: ${id}`);
            if (id === 'abc') {
                this.$router.push('/abc-island');
            } else if (id === 'listen') {
                this.$router.push({ name: 'PrimaryListenDetail' });
            } else if (id === 'hero') {
                this.$router.push({ name: 'PrimaryHeroDetail' });
           } else if (id === 'hero') {
                this.$router.push({ name: 'PrimaryHeroDetail' });
            } else if (id === '300') { 
                this.$router.push({ 
                    name: 'WordIslandDetail', 
                    params: { level: 'primary', wordCount: '300' } 
                });
            } else {
                // 這裡處理進入其他島嶼的邏輯
                // this.$router.push(`/game/${id}`);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.islands-grid {
@include island-main-grid
}


.stats-row {
@include island-stats-row
}

.island-title {
 @include blue-island-title
}

.enter-btn {
    @include common-btn
}


@media (orientation: landscape) and (max-height: 1199.98px) and (pointer: coarse) {
    .primary-page .islands-grid {
        @include md-island-layout
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .primary-page {
        @include sm-island-layout
    }
}
</style>