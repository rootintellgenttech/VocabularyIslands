<template>
    <div class="home-page">
        <div class="main-content">
            <h1 class="page-title">大廳</h1>

            <vue-custom-scrollbar class="islands-scroll-container" :settings="dynamicScrollSettings" role="region"
                aria-label="島嶼選擇滑動區" tabindex="0">
                <div class="island-map-container">
                    <div v-for="island in islands" :key="island.name" class="island-container">
                        <div class="island-card">
                            <img :src="island.imagePath" :alt="`${island.name}地圖圖示`" class="island-image">
                            <div class="action-section">
                                <h2 class="island-name">{{ island.name }}</h2>
                                <button class="enter-btn" @click="goToIsland(island.route)"
                                    :aria-label="`進入${island.name}`">
                                    進入學習
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </vue-custom-scrollbar>

        </div>
    </div>
</template>

<script>
import "vue-custom-scrollbar/dist/vueScrollbar.css"


export default {
    name: 'Home',
    data() {
        return {
            isMenuExpanded: false,
            windowWidth: window.innerWidth,
            islands: [
                {
                    name: '國小島',
                    imagePath: require('../../assets/image/home/elementary-island.png'),
                    route: '/primaryisland',
                },
                {
                    name: '國中島',
                    imagePath: require('../../assets/image/home/primary-island.png'),
                    route: '/secondaryisland',
                },
                {
                    name: '試煉殿堂',
                    imagePath: require('../../assets/image/home/exam-island.png'),
                    route: '/trial-hall',
                },
                {
                    name: '競技島',
                    imagePath: require('../../assets/image/home/fight-island.png'),
                    route: '/competition',
                },
                {
                    name: '成就島',
                    imagePath: require('../../assets/image/home/achievement-island.png'),
                    route: '/achievementIsland',
                },
            ],
        };
    },
    computed: {
        dynamicScrollSettings() {
            if (this.windowWidth <= 768) {
                return {
                    suppressScrollX: true,  // 禁用橫向
                    suppressScrollY: false, // 允許縱向
                    wheelPropagation: true
                };
            }
            // 電腦版一般情況
            return {
                suppressScrollX: false, // 啟用橫向
                suppressScrollY: true,  // 禁用縱向（由頁面主滾動條處理）
                wheelPropagation: false
            };
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        handleResize() {
            this.windowWidth = window.innerWidth;
        },
        goToIsland(path) {
            if (path) {
                this.$router.push(path).catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            } else {
                console.warn('此島嶼尚未設定路由！');
            }
        },
        toggleMenu() {
            this.isMenuExpanded = !this.isMenuExpanded;
        },
    }
};
</script>

<style lang='scss' scoped>
.main-content {
    .page-title {
        @include page-main-title
    }
}

.islands-scroll-container {
    width: 100%;
    height: 650px;
    overflow: hidden;
    position: relative;
}


.island-map-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: max-content;
    padding: 2rem;
    gap: 2rem;

    .action-section {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .island-container {
        width: 300px;
        text-align: center;
        flex: 0 0 auto;
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;

        &:hover {
            transform: translateY(-10px) scale(1.05);
        }

        .island-card {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .island-image {
            width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: contain;
            margin-bottom: 1rem;
        }

        .island-name {
            @include unit-title;
            word-wrap: break-word;
            white-space: normal;
        }

        .enter-btn {
            @include common-btn;
        }
    }
}


@media (orientation: landscape) and (min-width: 768px) and (max-width: 1366px) {
    .islands-grid .top-bar {
        margin-bottom: 0;
    }

    .island-map-container {
        margin-top: 0;
    }
}


@media (max-width: 768px) {
    .islands-scroll-container {
        height: auto;
        overflow: visible !important;
    }

    .island-map-container {
        margin-top: 0;
        flex-wrap: wrap;
        width: 100%;
        justify-content: center;
        gap: 2rem;

        .island-container {
            flex: 0 0 100%;
            max-width: 300px;
        }
    }
}

@media (orientation: landscape) and (max-height: 47.9988rem) and (pointer: coarse) {
    .islands-scroll-container {
        margin: 0 1.25rem 1.25rem;
    }

    .island-map-container {
        gap: 1rem 5%;
        padding: 0 0 2.5rem;

        .island-card img {
            width: 9.375rem;
        }
    }
}
</style>