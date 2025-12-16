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
                            <img :src="island.imgColor" :class="{ 'is-bw': island.progress < 100 }" alt="Island Image"
                                class="island-image" />
                        </div>

                        <div class="stats-row">
                            <div class="stat-group">
                                <img src="../../assets/image/elementary/star.png" alt="⭐">
                                <span>{{ island.stars }}/50</span>
                            </div>
                            <div class="stat-group">
                                <img src="../../assets/image/elementary/book.png" alt="⭐">
                                <span>學習 {{ island.progress }}%</span>
                            </div>
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
export default {
    name: 'PrimaryIsland',
    data() {
        const levelOptions = [
            { name: '國小', value: 'primary' },
            { name: '國中', value: 'secondary' }
        ];

        return {
            scrollSettings: {
                suppressScrollY: false, // 開啟縱向
                suppressScrollX: true,  // 關閉橫向
                wheelPropagation: false
            },
            selectedLevel: levelOptions[0], // 預設選擇國小
            levelOptions: levelOptions,
            islands: [
                {
                    id: 'abc',
                    name: 'ABC啟航島',
                    progress: 20, // 未滿 100，顯示黑白
                    stars: 10,
                    imgColor: require('@/assets/image/elementary/abc-island.png'),
                },
                {
                    id: '300',
                    name: '300單字島',
                    progress: 100, // 滿 100，顯示彩色
                    stars: 50,
                    imgColor: require('@/assets/image/elementary/300-island.png'),
                },
                {
                    id: 'hero',
                    name: '小英雄大本營',
                    progress: 0,
                    stars: 0,
                    imgColor: require('@/assets/image/elementary/hero-island.png'),
                },
                {
                    id: 'listen',
                    name: '聽力海灣島',
                    progress: 85,
                    stars: 40,
                    imgColor: require('@/assets/image/elementary/hear-island.png'),
                }
            ]
        };
    },
    methods: {
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