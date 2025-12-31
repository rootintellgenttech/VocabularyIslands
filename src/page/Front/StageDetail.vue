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
                   <p v-html="formattedDescription" class="lesson-description"></p>
                </div>
            </div>
            <vue-custom-scrollbar class="level-scroll-container" :settings="scrollSettings">
                <div class="lesson-options">
                    <div v-for="(stage, index) in lessonData.options" :key="index" class="option-item"
                        @click="startStage(stage)">

                        <div class="item-bottom">
                            <div class="bottom-left">
                                <img :src="getStageIcon(stage)" :alt="stage.label" class="main-icon"
                                    :class="{ 'is-bw': stage.stars <= 0 }" /> <span class="option-label">{{ stage.label
                                    }}</span>
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
import api from '@/config/api';

export default {
    name: 'StageDetail',
    props: {
        // 接收路由參數
        unitId: { type: String, required: true },
        level: { type: String, required: true },
        scrollSettings: {
            suppressScrollY: true,  // 關閉直向
            suppressScrollX: false, // 開啟橫向
            wheelPropagation: false // 防止滾動冒泡
        }
    },
    data() {
        return {
            avatarPath: require('@/assets/image/hero-avatar.png'),
            firePath: require('@/assets/image/fire.png'),
            lessonData: {
                name: '',
                description: '',
                options: []
            },
        };
    },
    computed: {
  formattedDescription() {
    return this.lessonData.description ? this.lessonData.description.replace(/\n/g, '<br>') : '';
  }
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
                // --- 國小 (Primary) ---
                'primary': {
                    'hero': {
                        name: '小英雄大本營',
                        description: '和沃特老師一起完成關卡，獲得星星吧！<br>共 20 題 | 限時 5 分鐘，每一題 15 秒作答',
                        options: [
                            // type: 'hero-quiz' -> 會導向 HeroQuizPage (有圖片分欄的介面)
                            { type: 'hero-quiz', id: '01', label: '啟蒙小木屋', stars: 3, isReview: false },
                            { type: 'hero-quiz', id: '02', label: '魔法夢幻島', stars: 2, isReview: false },
                            { type: 'hero-quiz', id: '03', label: '圖書館島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: '04', label: '大城市島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: '05', label: '許願星星島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: '06', label: '300字複習', stars: 0, isReview: true },
                        ]
                    },
                    'listen': {
                        name: '國小聽力海灣',
                        description: '和沃特老師一起完成關卡，獲得星星吧！<br>共 20 題 | 限時 5 分鐘，每一題 15 秒作答',
                         options: [
                            // type: 'listening' -> 會導向 QuizPage (有喇叭按鈕的介面)
                            { type: 'listening', id: '01', label: '啟蒙小木屋', stars: 2, isReview: false },
                            { type: 'listening', id: '02', label: '魔法夢幻島', stars: 2, isReview: false },
                            { type: 'listening', id: '03', label: '圖書館島', stars: 0, isReview: false },
                            { type: 'listening', id: '04', label: '大城市島', stars: 0, isReview: false },
                            { type: 'listening', id: '05', label: '許願星星島', stars: 0, isReview: false },
                            { type: 'listening', id: '06', label: '300字複習', stars: 0, isReview: true },
                        ]
                    },
                },

                // --- 國中 (Secondary) ---
                'secondary': {
                    'hero': {
                        name: '會考大殿堂',
                        description: '和沃特老師一起戰鬥依序完成關卡，挑戰會考題型！',
                        options: [
                            { type: 'hero-quiz', id: 'ms-h-01', label: '霧靄之境', stars: 5, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-02', label: '漂流群島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-03', label: '熔岩盆地', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-04', label: '迴旋之塔', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-05', label: '鏡像平原', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-06', label: '800字複習', stars: 0, isReview: true },
                            { type: 'hero-quiz', id: 'ms-h-07', label: '永恆圖書館', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-08', label: '奇異峽谷', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-09', label: '靜默領域', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-10', label: '黎光秘境島', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-11', label: '1200字總複習', stars: 0, isReview: true },
                            { type: 'hero-quiz', id: 'ms-h-12', label: '會考大殿堂-1', stars: 0, isReview: false },
                            { type: 'hero-quiz', id: 'ms-h-13', label: '會考大殿堂-2', stars: 0, isReview: false }
                        ]
                    },
                    'listen': {
                        name: '國中聽力海灣', description: '和沃特老師一起依序完成關卡，提升聽力能力!',
                        options: [
                            { type: 'listening', id: 'ms-l-01', label: '霧靄之境', stars: 3, isReview: false },
                            { type: 'listening', id: 'ms-l-02', label: '漂流群島', stars: 4, isReview: false },
                            { type: 'listening', id: 'ms-l-03', label: '熔岩盆地', stars: 4, isReview: false },
                            { type: 'listening', id: 'ms-l-04', label: '迴旋之塔', stars: 0, isReview: false },
                            { type: 'listening', id: 'ms-l-05', label: '鏡像平原', stars: 3, isReview: true },
                            { type: 'listening', id: 'ms-l-06', label: '800字複習', stars: 0, isReview: true },
                            { type: 'listening', id: 'ms-l-07', label: '永恆圖書館', stars: 0, isReview: false },
                            { type: 'listening', id: 'ms-l-08', label: '奇異峽谷', stars: 0, isReview: false },
                            { type: 'listening', id: 'ms-l-09', label: '靜默領域', stars: 0, isReview: true },
                            { type: 'listening', id: 'ms-l-10', label: '黎光秘境島', stars: 0, isReview: false },
                            { type: 'listening', id: 'ms-l-11', label: '1200單字複習', stars: 0, isReview: true },
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
            return this.firePath;
        },

        startStage(stage) {
            console.log(`開始活動: ${stage.label}, 類型: ${stage.type}`);

            // 1. 英雄填空題 (HeroQuizPage)
            if (stage.type === 'hero-quiz') {
                this.$router.push({
                    name: 'HeroQuizPage',
                    params: {
                        stageId: stage.id,
                        stageName: stage.label,
                        level: this.level,
                        unitName: this.lessonData.name
                    }
                });
            }
            // 2. 聽力測驗 & 其他 (QuizPage)
            else {
                this.$router.push({
                    name: 'QuizPage',
                    params: {
                        unitId: stage.id,
                        activityType: stage.type,
                        level: this.level,
                        stageLabel: stage.label,
                        unitName: this.lessonData.name
                    }
                });
            }
        },
async fetchUserStars() {
    try {
        const res = await api.get('/students/test-summary/');
        
        // 【關鍵】嚴格比對島嶼名稱。
        // 例如：你在「會考大殿堂」，this.lessonData.name 就是「會考大殿堂」。
        // API 必須剛好有名稱為「會考大殿堂」的 island_name 才會進入。
        const islandData = res.data.islands.find(i => i.island_name === this.lessonData.name);

        if (islandData && islandData.units) {
            this.lessonData.options = this.lessonData.options.map(opt => {
                // 在會考/聽力模式中，API 的 unit_name 對應我們前端的 opt.label (例如：霧靄之境)
                const matchedUnit = islandData.units.find(u => u.unit_name === opt.label);
                
                return {
                    ...opt,
                    // 只拿該島嶼下的該單元星星，不會抓到 800字島的
                    stars: matchedUnit ? matchedUnit.total_stars : 0 
                };
            });
        }
        console.log(`[${this.lessonData.name}] 星星更新成功`);
    } catch (err) {
        console.error('StageDetail 星星獲取失敗:', err);
    }
}
},
watch: {
    unitId: {
        immediate: true,
        handler() {
            this.loadData();
            // 使用 nextTick 確保 DOM 和數據初始化後再呼叫 API
            this.$nextTick(() => { 
                this.fetchUserStars(); 
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
    .main-card {
        width: auto;
    }
}
</style>