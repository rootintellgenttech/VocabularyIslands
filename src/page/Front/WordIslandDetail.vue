<template>
    <div class="abc-page">
        <h1 class="page-title">{{ islandTitle }}</h1>
        <vue-custom-scrollbar class="islands-scroll-container" :settings="scrollSettings">
            <div class="island-map-container">

                <div class="unit-card-container back-to-island is-up" @click="goBack">
                    <div class="island-card">
                        <img :src="getBackIslandImage()" alt="返回島嶼" class="island-image" />
                    </div>
                    <button class="return-btn">{{ returnButtonText }}</button>
                </div>

                <div v-for="(item, index) in units" :key="item.id"
                    :class="['unit-card-container', { 'is-up': index % 2 !== 0 }]">
                    <div class="island-card">
                        <img :src="item.imgColor" :alt="item.name" :class="{ 'is-bw': item.progress === 0 }" />
                    </div>
                    <div class="stats-row">
                        <div class="stat-group">
                            <img src="../../assets/image/elementary/star.png" alt="⭐">
                            <span>{{ item.stars }}/{{ item.totalStars }}</span>
                        </div>
                    </div>
                    <div class="unit-title">{{ item.name }}</div>

                    <button class="enter-btn" @click="enterUnit(item)">
                        開始學習
                    </button>
                </div>
            </div>
        </vue-custom-scrollbar>
    </div>
</template>

<script>
export default {
    name: 'WordIslandDetail',
    props: {
        level: { type: String, required: true },
        wordCount: { type: String, required: true }
    },
    data() {
        return {
            islandTitle: '',
            returnButtonText: '返回國小島',
            units: [],
            imgBackPrimary: require('@/assets/image/home/elementary-island.png'),
            imgBackSecondary: require('@/assets/image/home/primary-island.png'),
            scrollSettings: {
                suppressScrollY: true,  // 關閉直向
                suppressScrollX: false, // 開啟橫向
                wheelPropagation: false // 防止滾動冒泡
            }
        };
    },
    watch: {
        level: 'loadIslandData',
        wordCount: 'loadIslandData',
    },
    mounted() {
        this.loadIslandData();
    },
    methods: {
        getBackIslandImage() {
            return this.level === 'primary' ? this.imgBackPrimary : this.imgBackSecondary;
        },
        loadIslandData() {
            const dataMap = {
                'primary-abc': {
                    title: 'ABC啟航島',
                    returnText: '返回國小島',
                    units: [
                        { id: 'af', name: 'A-F', progress: 1, stars: 10, totalStars: 15, imgColor: require('@/assets/image/elementary/a-c.png') },
                        { id: 'gl', name: 'G-L', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/g-i.png') },
                        { id: 'mr', name: 'M-R', progress: 1, stars: 20, totalStars: 50, imgColor: require('@/assets/image/elementary/m-o.png') },
                        { id: 'sz', name: 'S-Z', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/x-z.png') },
                        { id: 'final', name: 'ABC總復習', progress: 1, stars: 20, totalStars: 20, imgColor: require('@/assets/image/elementary/abc-final.png') },
                    ]
                },
                'primary-300': {
                    title: '300單字島',
                    returnText: '返回國小島',
                    units: [
                        { id: '01', name: '啟蒙小木屋', progress: 1, stars: 10, totalStars: 15, imgColor: require('@/assets/image/elementary/inspire-island.png') },
                        { id: '02', name: '魔法夢幻島', progress: 3, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/magic-island.png') },
                        { id: '03', name: '圖書館島', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/library-island.png') },
                        { id: '04', name: '大城市島', progress: 5, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/city-island.png') },
                        { id: '05', name: '許願星星島', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/wish-island.png') },
                        { id: '06', name: '300字複習', progress: 10, stars: 0, totalStars: 50, imgColor: require('@/assets/image/elementary/300-island.png') },
                    ]
                },
                'secondary-800': {
                    title: '800單字島',
                    returnText: '返回國中島',
                    units: [
                        { id: '01', name: '漂流群島', progress: 1, stars: 10, totalStars: 15, imgColor: require('@/assets/image/secondary/flow-island.png') },
                        { id: '02', name: '熔岩盆地', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/lava-island.png') },
                        { id: '03', name: '迴旋之塔', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/turn-island.png') },
                        { id: '04', name: '鏡像平原', progress: 5, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/vision-island.png') },
                        { id: '05', name: '永恆圖書館', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/eternity-island.png') },
                        { id: '06', name: '奇異峽谷', progress: 10, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/mystery-island.png') },
                        { id: '07', name: '靜默領域', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/quiet-island.png') },
                        { id: '08', name: '靜默領域', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/quiet-island.png') },
                        { id: '09', name: '800字複習', progress: 0, stars: 0, totalStars: 50, imgColor: require('@/assets/image/secondary/800-island.png') },
                    ]
                },
                'secondary-1200': {
                    title: '1200單字島',
                    returnText: '返回國中島',
                    units: []
                }
            };

            const key = `${this.level}-${this.wordCount}`;
            const data = dataMap[key];

            if (data) {
                this.islandTitle = data.title;
                this.returnButtonText = data.returnText;
                this.units = data.units;
            } else {
                console.error(`找不到 ${key} 的島嶼數據`);
            }
        },
        enterUnit(unit) {
            console.log(`進入單元: ${unit.id}`);
            this.$router.push({
                name: 'LessonDetail',
                params: {
                    level: this.level,
                    wordCount: this.wordCount,
                    unitId: unit.id
                }
            }).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    throw err;
                }
            });
        },
        goBack() {
            const backPath = this.level === 'primary' ? '/primaryisland' : '/secondaryisland';
            this.$router.push(backPath);
        }
    }
};
</script>

<style lang="scss" scoped>
.abc-page {
    .page-title {
        @include page-main-title
    }
}

.unit-card-container.back-to-island {
    .return-btn {
        @include common-btn
    }
}


.unit-card-container {
    width: 300px;
    text-align: center;
    position: relative;
    transition: transform 0.3s ease;
    cursor: pointer;
    transform: translateY(0);
    flex-direction: column;
    @include flex-center;
    flex-shrink: 0;

    &:hover {
        transform: translateY(-30px);
    }
}

.unit-card-container.is-up {
    transform: translateY(-120px);

    &:hover {
        transform: translateY(-60px);
    }
}


.unit-title {
    @include unit-title
}

.stats-row {
    @include island-stats-row
}


.enter-btn {
    @include enter-unit-yellow-btn
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .abc-page {
        .island-map-container {
            .island-card img {
                width: 150px;
            }

            .unit-card-container {
                flex-shrink: 0; 
                width: 150px;
                padding-top: 18px;

                .back-to-island .return-btn {
                    padding: 8px 16px;
                }
            }
        }
    }
}
</style>