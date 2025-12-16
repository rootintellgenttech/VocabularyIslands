<template>
    <div class="secondary-page">

        <div class="islands-grid">
            <div class="top-bar">
                <h1 class="page-title">國中</h1> <button class="back-btn" @click="goBack">
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
    name: 'SecondaryIsland',
    data() {
        const levelOptions = [
            { name: '國小', value: 'primary' },
            { name: '國中', value: 'secondary' }
        ];

        return {
            selectedLevel: levelOptions[1],
            scrollSettings: {
                suppressScrollY: false, // 開啟縱向
                suppressScrollX: true,  // 關閉橫向
                wheelPropagation: false
            },
            levelOptions: levelOptions,
            islands: [
                {
                    id: '800',
                    name: '800單字島',
                    progress: 100,
                    stars: 90,
                    imgColor: require('@/assets/image/secondary/800-island.png'),
                },
                {
                    id: '1200',
                    name: '1200單字島',
                    progress: 20,
                    stars: 20,
                    imgColor: require('@/assets/image/secondary/1200-island.png'),
                },
                {
                    id: 'hero',
                    name: '會考大殿堂',
                    progress: 20,
                    stars: 20,
                    imgColor: require('@/assets/image/secondary/exam-island.png'),
                },
                {
                    id: 'listen',
                    name: '聽力海灣島',
                    progress: 20,
                    stars: 20,
                    imgColor: require('@/assets/image/secondary/hear-island.png'),
                }
            ]
        };
    },
    methods: {
        goBack() {
            this.$router.push('/home');
        },
        enterIsland(id) {
            console.log(`Enter secondary island: ${id}`);
            if (id === 'abc') {
                this.$router.push('/abc-island');
            } else if (id === 'listen') {
                this.$router.push({ name: 'SecondaryListenDetail' });
            } else if (id === 'hero') {
                this.$router.push({ name: 'SecondaryHeroDetail' });
         } else if (id === '800' || id === '1200') { 
                this.$router.push({ 
                    name: 'WordIslandDetail', 
                    params: { level: 'secondary', wordCount: id } 
                    // level: 'secondary', wordCount: '800' 或 '1200'
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
    .secondary-page .islands-grid {
        @include md-island-layout
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .secondary-page {
        @include sm-island-layout
    }
}
</style>