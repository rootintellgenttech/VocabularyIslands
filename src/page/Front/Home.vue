<template>
    <div class="home-page">
        <div class="main-content">
            <h1 class="page-title">大廳</h1>
            <vue-custom-scrollbar class="islands-scroll-container" :settings="scrollSettings">
                <div class="island-map-container">
                    <div v-for="island in islands" :key="island.name" class="island-container">
                        <div class="island-card">
                            <img :src="island.imagePath" :alt="`${island.name}地圖圖示`" class="island-image">
                            <div class="action-section">
                                <h2 class="island-name">{{ island.name }}</h2>
                                <button class="enter-btn" @click="goToIsland(island.route)"
                                    :aria-label="`進入${island.name}學習`">
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
export default {
    name: 'Home',
    props: {
        scrollSettings: {
            suppressScrollY: true,
            suppressScrollX: false,
            wheelPropagation: false
        }
    },
    data() {
        return {
            // 側邊欄是否展開，初始為 false (收合)
            isMenuExpanded: false,
            // 島嶼資料
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
                    imagePath: require('../../assets/image/home/exam-island.png'), route: '/trial-hall',
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
    methods: {
        goToIsland(path) {
            if (path) {
                this.$router.push(path).catch(err => {
                    // 避免導航到相同路由時控制台出現警告
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            } else {
                console.warn('此島嶼尚未設定路由！');
            }
        },
        // 切換側邊欄的展開/收合狀態
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
    margin: 5% 5% 0 8%;
}

.island-map-container {
    display: flex;
    flex-wrap: nowrap;
    align-items: end;
    gap: 0 8%;
    margin-top: calc(8% - 5%);
    padding: 0 2rem 1.5rem;

    .action-section {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .island-container {
        width: 18.75rem;
        text-align: center;
        position: relative;
        transition: transform 0.3s ease;
        transform: translateY(0);
        flex-direction: column;
        @include flex-center;

        &:hover {
            transform: translateY(-0.625rem) scale(1.05);
        }


        .island-name {
            @include unit-title
        }

        .enter-btn {
            @include common-btn
        }
    }
}


@media (orientation: landscape) and (max-height: 74.9988rem) and (pointer: coarse) {

    .island-map-container {
        gap: 0 12%;
        padding: 0 8% 1.5rem;
    }

    .island-container {
        width: 12.5rem;
    }

}


@media (orientation: landscape) and (max-height: 47.9988rem) and (pointer: coarse) {

    .islands-scroll-container {
        margin: 0 1.25rem 1.25rem;
    }

    .island-map-container {
        gap: 0 5%;
        padding: 0 0 2.5rem;

        .island-card img {
            width: 9.375rem;
        }

    }

}
</style>