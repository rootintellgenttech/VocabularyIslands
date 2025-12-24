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
                    <img :src="item.imgColor" :alt="item.name" :class="{ 'is-bw': item.stars === 0 }" />
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
import api from '@/config/api';

export default {
    name: 'WordIslandDetail',
    props: {
        level: { type: String, required: true },
        wordCount: { type: String, required: true },
        scrollSettings: {
            suppressScrollY: true,
            suppressScrollX: false,
            wheelPropagation: false
        }
    },
    data() {
        return {
            islandTitle: '',
            returnButtonText: '返回國小島',
            units: [],
            imgBackPrimary: require('@/assets/image/home/elementary-island.png'),
            imgBackSecondary: require('@/assets/image/home/primary-island.png'),
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
                    title: 'ABC啟航島', returnText: '返回國小島',
                    units: [
                        { id: 'af', name: 'A-F', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/a-c.png') },
                        { id: 'gl', name: 'G-L', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/g-i.png') },
                        { id: 'mr', name: 'M-R', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/m-o.png') },
                        { id: 'sz', name: 'S-Z', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/x-z.png') },
                        { id: 'final', name: 'ABC 總復習', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/abc-final.png') },
                    ]
                },
                'primary-300': {
                    title: '300字島', returnText: '返回國小島',
                    units: [
                        { id: '01', name: '啟蒙小木屋', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/inspire-island.png') },
                        { id: '02', name: '魔法夢幻島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/magic-island.png') },
                        { id: '03', name: '圖書館島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/library-island.png') },
                        { id: '04', name: '大城市島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/city-island.png') },
                        { id: '05', name: '許願星星島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/wish-island.png') },
                        { id: '06', name: '300字複習', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/300-island.png') },
                    ]
                },
                'secondary-800': {
                    title: '800字島', returnText: '返回國中島',
                    units: [
                        { id: '01', name: '霧靄之境', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/mist-island.png') },
                        { id: '02', name: '漂流群島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/flow-island.png') },
                        { id: '03', name: '熔岩盆地', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/lava-island.png') },
                        { id: '04', name: '迴旋之塔', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/turn-island.png') },
                        { id: '05', name: '鏡像平原', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/vision-island.png') },
                        { id: '06', name: '800字複習', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/800-island.png') },
                    ]
                },
                'secondary-1200': {
                    title: '1200字島', returnText: '返回國中島',
                    units: [
                        { id: '01', name: '永恆圖書館', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/eternity-island.png') },
                        { id: '02', name: '奇異峽谷', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/eternity-island.png') },
                        { id: '03', name: '靜默領域', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/quiet-island.png') },
                        { id: '04', name: '黎光秘境島', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/ufo-island.png') },
                        { id: '05', name: '1200字複習', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/secondary/1200-island.png') },
                    ]
                }
            };

            const key = `${this.level}-${this.wordCount}`;
            const data = dataMap[key];
            if (data) {
                this.islandTitle = data.title;
                this.returnButtonText = data.returnText;
                this.units = data.units;
            }
            this.$nextTick(() => { this.updateStarsFromApi(); });
        },
async updateStarsFromApi() {
    try {
        const res = await api.get('/students/test-summary/');
        const islandData = res.data.islands.find(i => i.island_name === this.islandTitle);
        if (!islandData) return;

        this.units = this.units.map(unit => {
            const matchedUnit = islandData.units.find(u => u.unit_name === unit.name);
            const configLength = this.getStageLabelsByUnitId(unit.id);
            
            // --- 國中/國小通用邏輯 ---
            // 判斷是否為總複習單元 (Final Mode)
            // 國小 300 是 '06', 國中 800 是 '06', 國中 1200 是 '05', ABC 是 'final'
            const isFinalUnit = ['final', '06', '05'].includes(unit.id);

            let totalChallengeStages = configLength;
            if (!isFinalUnit) {
                // 非複習單元，第一個標籤是「學習」，所以要減 1
                totalChallengeStages = configLength > 0 ? configLength - 1 : 0;
            }

            return {
                ...unit,
                stars: matchedUnit ? matchedUnit.total_stars : 0,
                totalStars: totalChallengeStages * 5 
            };
        });
    } catch (err) { console.error(err); }
},

getStageLabelsByUnitId(id) {
    const options300 = { '01': 7, '02': 7, '03': 7, '04': 7, '05': 7, '06': 5 };
    const options800 = { '01': 11, '02': 11, '03': 11, '04': 11, '05': 11, '06': 5 };
    const options1200 = { '01': 11, '02': 11, '03': 11, '04': 11, '05': 8 };
    const optionsABC = { 'af': 3, 'gl': 3, 'mr': 3, 'sz': 3, 'final': 5 };

    let count = 0;
    if (this.wordCount === 'abc') count = optionsABC[id];
    else if (this.wordCount === '300') count = options300[id];
    else if (this.wordCount === '800') count = options800[id];
    else if (this.wordCount === '1200') count = options1200[id];

    return count || 0; 
},

        enterUnit(unit) {
            this.$router.push({
                name: 'LessonDetail',
                params: { level: this.level, wordCount: this.wordCount, unitId: unit.id }
            }).catch(err => { if (err.name !== 'NavigationDuplicated') throw err; });
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
@include island-design
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
            margin-top: 18%;
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