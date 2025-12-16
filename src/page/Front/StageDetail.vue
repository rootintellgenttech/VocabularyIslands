<template>
    <div class="lesson-detail-page">

        <div class="main-card">
            <div class="back-link" @click="goBack">
                <i class="fas fa-arrow-left"></i> 返回
            </div>

            <div class="card-header">
                <img :src="avatarPath" alt="Avatar" class="avatar-img">
                <div class="header-info">
                    <h2 class="lesson-title">{{ lessonData.name }}</h2>
                    <p class="lesson-description">{{ lessonData.description }}</p>
                </div>
            </div>
            <vue-custom-scrollbar class="level-scroll-container" :settings="scrollSettings">
                <div class="lesson-options">
                    <div v-for="(stage, index) in lessonData.options" :key="index" class="option-item"
                        @click="startStage(stage)">
                        
                        <div class="item-bottom">
                        <div class="bottom-left">
                            <img :src="getStageIcon(stage)" :alt="stage.label" class="main-icon" />
                            <span class="option-label">{{ stage.label }}</span>
                        </div>
                        <div class="bottom-right">
                            <div class="star-rating">
                            <i v-for="n in 5" :key="n"
                                :class="['fas', stage.stars >= n ? 'fa-star filled' : 'fa-star outline']">
                            </i>
                        </div>
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
    name: 'StageDetail',
    props: {
        // 接收路由參數
        unitId: { type: String, required: true },
        level: { type: String, required: true }
    },
    data() {
        return {
            avatarPath: require('@/assets/image/hero-avatar.png'),
            firePath: require('@/assets/image/fire.png'),
            knifePath: require('@/assets/image/knife.png'),

            lessonData: {
                name: '',
                description: '',
                options: []
            },
            scrollSettings: {
                suppressScrollY: true,  // 關閉直向
                suppressScrollX: false, // 開啟橫向
                wheelPropagation: false // 防止滾動冒泡
            }
        };
    },
    watch: {
        unitId: { immediate: true, handler() { this.loadData(); } },
        level: { immediate: true, handler() { this.loadData(); } }
    },
    methods: {
        // 根據 level 和 unitId 載入數據
        loadData() {
            console.log(`載入數據: Level=${this.level}, Unit=${this.unitId}`);

            const DATA_MAPPING = {
                'primary': {
                    'hero': {
                        name: '小英雄大本營',
                        description: '在限時內和沃特老師一起戰鬥依序完成關卡，獲得星星吧！每題15秒作答時間',
                        options: [
                            { type: 'hero-quiz', id: '01', label: '啟蒙小木屋', stars: 3, isReview: false },
                            { type: 'hero-quiz', id: '02', label: '魔法夢幻島', stars: 2, isReview: false },
                            { type: 'hero-quiz', id: '03', label: '圖書館島', stars: 4, isReview: false },
                            { type: 'hero-quiz', id: '04', label: '大城市島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: '05', label: '許願星星島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: '06', label: '300字複習', stars: 0, isReview: true }, // 總複習
                        ]
                    },
                    'listen': {
                        name: '聽力海灣', 
                        description: '和沃特老師一起完成關卡，獲得星星吧!',
                        options: [
                            { type: 'listening', id: '01', label: '第一關', stars: 2, isReview: false },
                            { type: 'listening', id: '02', label: '第二關', stars: 2, isReview: false },
                            { type: 'listening', id: '03', label: '第三關', stars: 0, isReview: false },
                            { type: 'listening', id: '04', label: '第四關', stars: 0, isReview: false },
                            { type: 'listening', id: '05', label: '第五關', stars: 0, isReview: false },
                            { type: 'review', label: '總復習', stars: 0, isReview: true },
                        ]
                    },
                },
                'secondary': {
                    'hero': {
                        name: '會考大殿堂', description: '和沃特老師一起戰鬥依序完成關卡，獲得星星吧！',
                        options: [
                            { type: 'hero-game', label: '第一關', stars: 5, isReview: false },
                            { type: 'hero-game', label: '第二關', stars: 0, isReview: false },
                            { type: 'hero-game', label: '第三關', stars: 0, isReview: false },
                            { type: 'hero-game', label: '第四關', stars: 0, isReview: false },
                            { type: 'hero-game', label: '第五關', stars: 0, isReview: false },
                            { type: 'review', label: '總複習', stars: 0, isReview: true },
                        ]

                    },
                    'listen': {
                        name: '國中聽力海灣', description: '和沃特老師一起依序完成關卡，獲得星星吧!',
                        options: [
                            { type: 'listening', label: '第一關', stars: 3, isReview: false },
                            { type: 'listening', label: '第二關', stars: 4, isReview: false },
                            { type: 'listening', label: '第三關', stars: 4, isReview: false },
                            { type: 'listening', label: '第四關', stars: 0, isReview: false },
                            { type: 'listening', label: '第五關', stars: 0, isReview: false },
                            { type: 'review', label: '總復習', stars: 0, isReview: true },
                        ]
                    },
                }
            };

            this.lessonData = DATA_MAPPING[this.level]?.[this.unitId] || { name: '錯誤', description: '找不到單元', options: [] };
        },
        goBack() {
            //  根據 level 決定返回路徑 
            const backPath = this.level === 'primary' ? '/primaryisland' : '/secondaryisland';
            this.$router.push(backPath);
        },
        getStageIcon(stage) {
            if (stage.isReview) {
                return this.knifePath;
            }
            // 其他全部回傳火焰 (不管 stars 是多少)
            return this.firePath;
        },

     startStage(stage) {
            console.log(`開始活動: ${stage.label}`);

            // 判斷跳轉路徑
            if (stage.type === 'hero-quiz') {
                this.$router.push({
                    name: 'HeroQuizPage',
                    params: { stageId: stage.id, stageName: stage.label, level: this.level }
                });
            } else if (stage.type === 'listening') {
                this.$router.push({
                    name: 'ListeningQuizPage',
                    params: { stageId: stage.id, stageName: stage.label, level: this.level }
                });
            } else {
                this.$router.push({
                    name: 'QuizPage',
                    params: {
                        unitId: `${this.level}-${this.unitId}`,
                        activityType: stage.type,
                        stageLabel: stage.label
                    }
                });
            }
        }
    }

};
</script>

<style lang="scss" scoped>
.lesson-detail-page {
    @include main-card-page
}

.main-card {
    @include lesson-detail-boxs-two-row 
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
.main-card{
    width: auto;
}
}
</style>