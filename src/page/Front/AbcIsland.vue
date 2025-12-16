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
    name: 'AbcIsland',
    data() {
        return {
            units: [
                {
                    id: 'af', name: 'A-F', route: 'lesson/af', progress: 1, stars: 10, totalStars: 15,
                    imgColor: require('@/assets/image/elementary/a-c.png'),
                },
                {
                    id: 'gl', name: 'G-L', route: 'lesson/gl', progress: 0, stars: 0, totalStars: 50,
                    imgColor: require('@/assets/image/elementary/g-i.png'),
                },
                {
                    id: 'mr', name: 'M-R', route: 'lesson/mr', progress: 1, stars: 20, totalStars: 50,
                    imgColor: require('@/assets/image/elementary/m-o.png'),
                },
                {
                    id: 'sz', name: 'S-Z', route: 'lesson/sz', progress: 0, stars: 0, totalStars: 50,
                    imgColor: require('@/assets/image/elementary/x-z.png'),
                },
                {
                    id: 'final', name: 'ABC總復習', route: 'lesson/final', progress: 1, stars: 20, totalStars: 20,
                    imgColor: require('@/assets/image/elementary/abc-final.png'),
                },
            ],
            scrollSettings: {
                suppressScrollY: true,  // 關閉直向滾動
                suppressScrollX: false, // 開啟橫向滾動
                wheelPropagation: false
            }
        };
    },
    methods: {
 enterUnit(unit) {
            console.log(`進入單元: ${unit.id}`);
            this.$router.push({
                name: 'LessonDetail',
                params: {
                    unitId: unit.id,
                    level: 'primary' 
                }
            }).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    throw err;
                }
            });
        },
        goBack() {
            // 返回到國小島嶼頁面
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
    width: 300px;
    text-align: center;
    position: relative;
    transition: transform 0.3s ease;
    transform: translateY(0);
    flex-direction: column;
    @include flex-center;

    &:hover {
        transform: translateY(-30px);
    }
}

.unit-card-container.is-up {
    transform: translateY(-80px);

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
                padding-top: 18px;

                .back-to-island .return-btn {
                    padding: 8px 16px;
                }
            }
        }
    }

}
</style>