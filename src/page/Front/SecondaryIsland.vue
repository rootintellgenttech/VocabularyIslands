<template>
    <div class="secondary-page">

        <div class="islands-grid">
            <div class="top-bar">
                <h1 class="page-title">國中</h1> <button class="back-btn" @click="goBack">
                    返回大廳
                </button>
            </div>
            <vue-custom-scrollbar class="islands-scroll-container" :settings="dynamicScrollSettings">
                <div class="island-map">
                    <div v-for="island in islands" :key="island.id" class="island-container">
                        <div class="island-card">
                            <img :src="island.imgColor" :class="{ 'is-bw': island.stars === 0 }" alt="Island Image"
                                class="island-image" />
                        </div>

                        <div class="stats-row">
                            <div class="stat-group">
                                <img src="../../assets/image/elementary/star.png" alt="⭐">
                                <span>{{ island.stars }}/{{ island.totalStars }}</span>
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
    name: 'SecondaryIsland',

    data() {
        const levelOptions = [
            { name: '國小', value: 'primary' },
            { name: '國中', value: 'secondary' }
        ];

        return {
            windowWidth: window.innerWidth,
            selectedLevel: levelOptions[1],
            levelOptions: levelOptions,
            islands: [
                { id: '800', name: '800字島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/800-island.png') },
                { id: '1200', name: '1200字島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/1200-island.png') },
                { id: 'hero', name: '會考大殿堂', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/exam-island.png') },
                { id: 'listen', name: '國中聽力海灣', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/hear-island.png') }
            ]
        };
    },
    computed: {
        dynamicScrollSettings() {
            // 小於 768 時 (包含 400% 放大)：關閉橫向、開啟直向
            if (this.windowWidth <= 768) {
                return { suppressScrollY: false, suppressScrollX: true, wheelPropagation: false };
            }
            // 電腦版正常時：開啟橫向、關閉直向
            return { suppressScrollY: true, suppressScrollX: false, wheelPropagation: false };
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.fetchIslandStars();
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        handleResize() {
            this.windowWidth = window.innerWidth;
        },
        async fetchIslandStars() {
            try {
                const EXPECTED_CONFIG = {
                    '800': 55,    // (11-1)*5 + 5 = 55 關
                    '1200': 48,   // (11-1)*4 + 8 = 48 關
                    'hero': 13,   // 會考大殿堂共有 13 關
                    'listen': 11  // 國中聽力海灣共有 11 關
                };

                const res = await api.get('/students/test-summary/');
                this.islands = this.islands.map(isl => {
                    const matchedIsland = res.data.islands.find(i => i.island_name === isl.name);
                    let earnedStars = matchedIsland ? matchedIsland.total_stars : 0;
                    let totalPossibleStars = (EXPECTED_CONFIG[isl.id] || 0) * 5;

                    return { ...isl, stars: earnedStars, totalStars: totalPossibleStars };
                });
            } catch (err) { console.error('國中島嶼更新失敗', err); }
        },
        enterIsland(id) {
            if (id === 'listen') {
                this.$router.push({ name: 'SecondaryListenDetail' });
            } else if (id === 'hero') {
                this.$router.push({ name: 'SecondaryHeroDetail' });
            } else if (id === '800' || id === '1200') {
                this.$router.push({
                    name: 'WordIslandDetail',
                    params: { level: 'secondary', wordCount: id }
                });
            }
        },
        goBack() {
            this.$router.push('/home');
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

.islands-scroll-container {
    height: 550px;
    overflow: hidden;
    position: relative;
}

.island-map {
    display: flex;
    flex-wrap: nowrap;
    width: max-content;
    gap: 4rem;
    padding-left: 8%;
    padding-top: 2%;
    justify-content: start !important;

    .island-container {
        flex: 0 0 auto;
        width: 300px;
    }
}


@media (orientation: landscape) and (max-height: 1199.98px) and (pointer: coarse) {
    .secondary-page .islands-grid {
        @include md-island-layout
    }
}


@media (max-width: 768px) {
    .islands-scroll-container {
        height: auto !important;
        overflow: visible !important;
        touch-action: auto;
        margin: 0;
    }

    .island-map {
        flex-direction: column;
        flex-wrap: nowrap;
        width: 100%;
        align-items: center !important;
        padding: 2rem 0;
        gap: 3rem;

        .island-container {
            width: 100%;
            max-width: 300px;
        }
    }
}
</style>