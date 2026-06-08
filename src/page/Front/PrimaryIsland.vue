<template>
    <div class="primary-page">

        <div class="islands-grid">
            <main role="main" class="islands-grid">
                <div class="top-bar">
                    <h1 class="page-title">國小</h1>
                    <button class="back-btn" @click="goBack">
                        返回大廳
                    </button>
                </div>

            </main>

            <vue-custom-scrollbar class="islands-scroll-container" :settings="dynamicScrollSettings">
                <div class="island-map">
                    <div v-for="island in islands" :key="island.id" class="island-container">
                        <div class="island-card">
                            <img :src="island.imgColor" :class="{ 'is-bw': island.stars === 0 }"
                                :alt="`${island.name}關卡地圖`" class="island-image" />
                        </div>

                        <div class="stats-row">
                            <div class="stat-group">
                                <img src="../../assets/image/elementary/star.png" alt="" aria-hidden="true">
                                <span>{{ island.stars }}/{{ island.totalStars || 0 }}</span>
                            </div>
                            <!-- <div class="stat-group">
                                <img src="../../assets/image/elementary/book.png" alt="⭐">
                                <span>學習 {{ island.progress }}%</span>
                            </div> -->
                        </div>

                        <div class="island-title">{{ island.name }}</div>
                        <button class="enter-btn" @click="enterIsland(island.id)" :aria-label="`進入${island.name}學習`">
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

    data() {
        const levelOptions = [
            { name: '國小', value: 'primary' },
            { name: '國中', value: 'secondary' }
        ];

        return {
            windowWidth: window.innerWidth,
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
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.fetchIslandStars();
    },
    methods: {
        async fetchIslandStars() {
    try {
        const STATIC_TOTAL_CONFIG = {
            'abc': 65,
            '300': 180,
            'hero': 30,
            'listen': 30
        };

        const res = await api.get('/students/test-summary/');
        const allRemoteIslands = res.data.islands || [];

        this.islands = this.islands.map(isl => {
            let currentStars = 0;

            // 建立大廳島嶼名稱與後端可能回傳的「所有關卡名稱清單」對照表
            const islandNameMap = {
                'ABC啟航島': ['ABC啟航島', 'ABC 總復習'],
                '300字島': ['300字島', '300字複習'],
                '800字島': ['800字島', '800字複習'], // 預留未來國中島使用
                '1200字島': ['1200字島', '1200字複習'] // 預留未來國中島使用
            };

            // 取得當前島嶼需要加總的後端名稱陣列（若不在對照表內，就只查原本的名字）
            const targetNames = islandNameMap[isl.name] || [isl.name];

            // 遍歷目標名稱，把所有符合的後端關卡星星通通累加起來
            targetNames.forEach(name => {
                const matched = allRemoteIslands.find(i => i.island_name === name);
                if (matched) {
                    currentStars += (matched.total_stars || 0);
                }
            });

            return {
                ...isl,
                stars: currentStars,
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


@media (orientation: landscape) and (min-width: 768px) and (max-width: 1366px) {
    .islands-grid {
        .page-title {
            margin: 4% 0 0;
        }
    }
}

@media (orientation: landscape) and (max-height: 1199.98px) and (pointer: coarse) {
    .primary-page .islands-grid {
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