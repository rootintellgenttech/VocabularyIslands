<template>
    <div class="abc-page">
        <h1 class="page-title">ABC啟航島</h1>
        <vue-custom-scrollbar class="islands-scroll-container" :settings="scrollSettings">
            <div class="island-map-container">

                <div class="unit-card-container back-to-island is-up" @click="goBack">
                    <div class="island-card">
                        <img src="@/assets/image/home/elementary-island.png" alt="返回國小島嶼" class="island-image" />
                    </div>
                    <button class="return-btn">返回國小島</button>
                </div>
                <div v-for="(item, index) in units" :key="item.id"
                    :class="['unit-card-container', { 'is-up': index % 2 !== 0 || index === units.length - 1 }]">
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
    name: 'AbcIsland',
    props: {
        scrollSettings: {
            suppressScrollY: true,
            suppressScrollX: false,
            wheelPropagation: false
        }
    },
    data() {
        return {
            islandTitle: 'ABC啟航島',
            units: [
                { id: 'af', name: 'A-F', route: 'lesson/af', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/a-c.png') },
                { id: 'gl', name: 'G-L', route: 'lesson/gl', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/g-i.png') },
                { id: 'mr', name: 'M-R', route: 'lesson/mr', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/m-o.png') },
                { id: 'sz', name: 'S-Z', route: 'lesson/sz', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/x-z.png') },
                { id: 'final', name: 'ABC 總復習', route: 'lesson/final', progress: 0, stars: 0, totalStars: 0, imgColor: require('@/assets/image/elementary/abc-final.png') },
            ],
        };
    },
    mounted() {
        this.updateStarsFromApi();
    },
    methods: {
        async updateStarsFromApi() {
            try {
                const ABC_TOTAL_MAP = {
                    'A-F': 10,
                    'G-L': 10,
                    'M-R': 10,
                    'S-Z': 10,
                    'ABC 總復習': 25
                };

                const res = await api.get('/students/test-summary/');

                //取得 "ABC啟航島" 資料 (用於 A-F, G-L 等)
                const abcData = res.data.islands.find(i => i.island_name === "ABC啟航島");

                //取得 "ABC 總復習" 資料
                const abcFinalData = res.data.islands.find(i => i.island_name === "ABC 總復習");

                this.units = this.units.map(unit => {
                    let matched = null;

                    // 如果是 "ABC 總復習"，直接拿該島嶼的 total_stars
                    if (unit.name === 'ABC 總復習') {
                        if (abcFinalData) {
                            matched = { total_stars: abcFinalData.total_stars };
                        }
                    }
                    // 其他一般單元 (A-F, G-L...)，去 "ABC啟航島" 裡面找
                    else if (abcData) {
                        matched = abcData.units.find(u => u.unit_name === unit.name);
                    }

                    return {
                        ...unit,
                        stars: matched ? matched.total_stars : 0,
                        totalStars: ABC_TOTAL_MAP[unit.name] || 0
                    };
                });

            } catch (err) {
                console.error('更新星星失敗:', err);
            }
        },
        enterUnit(unit) {
            console.log('--- AbcIsland Navigation Debug ---');
            console.log('Target Unit ID:', unit.id); // 這裏應該是 af, gl, mr, sz 或 final
            console.log('Target Unit Name:', unit.name);

            this.$router.push({
                name: 'LessonDetail',
                params: { level: 'primary', wordCount: 'abc', unitId: unit.id }
            }).catch(err => { if (err.name !== 'NavigationDuplicated') throw err; });
        },
        goBack() {
            this.$router.push('/primaryisland');
        },
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
    @include island-design;

    &:not(.is-up) {
        transform: translateY(-80px);

        &:has(.enter-btn:hover) {
            transform: translateY(-117px);

            .enter-btn {
                transform: translateY(37px);
            }
        }
    }

    &.is-up {
        transform: translateY(-120px);

        &:has(.enter-btn:hover) {
            transform: translateY(-160px);

            .enter-btn {
                transform: translateY(40px);
            }
        }
    }
}

.unit-title {
    @include unit-title
}

.stats-row {
    @include island-stats-row
}


.enter-btn {
    @include enter-unit-yellow-btn;
    transition: transform 0.3s ease;
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .abc-page {


        .island-map-container {

            .island-card img {
                width: 150px;
            }

            .unit-card-container {
                padding-top: 18px;

                .back-to-island .return-btn {
                    padding: 8px 16px;
                }
            }
        }
    }

}
</style>