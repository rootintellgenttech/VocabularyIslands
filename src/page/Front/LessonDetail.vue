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
               <div v-for="(option, index) in lessonData.options" :key="index" 
    class="option-item"
    :class="{ 
        'is-learn-mode': option.type === 'learn',
        'is-final-mode': unitId === 'final' || unitId === '06'  
    }"
    @click="startActivity(option.type, option.label)">
<template v-if="unitId === 'final' || unitId === '06'">
                            <div class="item-single-row">
                            <div class="single-left">
                                <img :src="option.iconPath" :alt="option.label" class="main-icon"
                                    :class="{ 'is-bw': option.stars === 0 }" />
                                <span class="option-label">{{ option.label }}</span>
                            </div>
                            <div class="single-right">
                                <div class="star-rating">
                                    <i v-for="n in 5" :key="n"
                                        :class="['fas', option.stars >= n ? 'fa-star filled' : 'fa-star outline']">
                                    </i>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div class="item-top">
                            <div class="top-left">
                                <img :src="option.iconPath" :alt="option.label" class="main-icon"
                                    :class="{ 'is-bw': option.stars === 0 }" />
                                <span class="option-label">{{ option.label }}</span>
                            </div>
                            <div class="top-right">
                                <span class="action-text">{{ option.type === 'learn' ? '總學習' : '學習' }}</span>
                            </div>
                        </div>

                        <div class="item-bottom" v-if="option.type !== 'learn'">
                            <div class="bottom-left">
                                <img :src="firePath" alt="Challenge" class="fire-icon"
                                    :class="{ 'is-bw': option.stars === 0 }" />
                                <span class="challenge-label" :class="{ 'is-bw': option.stars === 0 }">挑戰</span>
                            </div>
                            <div class="bottom-right">
                                <div class="star-rating">
                                    <i v-for="n in 5" :key="n"
                                        :class="['fas', option.stars >= n ? 'fa-star filled' : 'fa-star outline']">
                                    </i>
                                </div>
                            </div>
                        </div>
                    </template>

                </div>
            </div>
        </vue-custom-scrollbar>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LessonDetail',
    props: {
        unitId: {
            type: String,
            required: true
        },
        level: {
            type: String,
            default: 'primary' // 預設為 primary 以防萬一
        },
          scrollSettings: {
                suppressScrollY: true,  // 關閉直向
                suppressScrollX: false, // 開啟橫向
                wheelPropagation: false // 防止滾動冒泡
            }
    },
    data() {
        return {
            // 圖片路徑
            avatarPath: require('@/assets/image/elementary/avatar.png'),
            bookPath: require('@/assets/image/book.png'),
            firePath: require('@/assets/image/fire.png'),
            knifePath: require('@/assets/image/knife.png'),

            lessonData: {
                name: '',
                description: '',
                options: []
            }
        };
    },
    watch: {
        unitId: {
            immediate: true,
            handler(newUnitId) {
                this.loadLessonData(newUnitId);
            }
        }
    },
    methods: {
        // LessonDetail.vue Script 的 loadLessonData 部分
        loadLessonData(id) {
            const book = this.bookPath;
            const fire = this.firePath;
            const dataMap = {
                'af': {
                    name: 'A-F',
                    description: '協助沃特老師一起修復 A-F 的字母吧!',
                    options: [
                        { type: 'learn', label: 'A-F', iconPath: book, stars: 1 },
                        { type: 'quiz', label: 'A-C', iconPath: book, stars: 3 },
                        { type: 'quiz', label: 'D-F', iconPath: book, stars: 0 },
                    ]
                },
                'gl': {
                    name: 'G-L',
                    description: '探索 G-L 的單字世界',
                    options: [
                        { type: 'learn', label: 'G-L', iconPath: book, stars: 0 },
                        { type: 'quiz', label: 'G-I', iconPath: book, stars: 0 },
                        { type: 'quiz', label: 'J-L', iconPath: book, stars: 0 },
                    ]
                },
                'mr': {
                    name: 'M-R',
                    description: '挑戰 M-R 的發音與單字',
                    options: [
                        { type: 'learn', label: 'M-R', iconPath: book, stars: 0 },
                        { type: 'quiz', label: 'M-O', iconPath: book, stars: 0 },
                        { type: 'quiz', label: 'P-R', iconPath: book, stars: 0 },
                    ]
                },
                'sz': {
                    name: 'S-Z',
                    description: '完成 S-Z 的最終拼圖',
                    options: [
                        { type: 'learn', label: 'S-Z', iconPath: book, stars: 0 },
                        { type: 'quiz', label: 'S-U', iconPath: book, stars: 0 },
                        { type: 'quiz', label: 'V-Z', iconPath: book, stars: 0 },
                    ]
                },
                'final': {
                    name: 'ABC 總復習',
                    description: '驗收你的學習成果！挑戰所有字母吧！',
                    options: [
                        { type: 'quiz', label: 'A-Z 挑戰', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: 'A-F 挑戰', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: 'G-L 挑戰', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: 'M-R 挑戰', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: 'S-Z 挑戰', iconPath: fire, stars: 0 },
                    ]
                },
         // --- 300 單字島單元 ---
                // ID: 01 - 啟蒙小木屋
                '01': {
                    name: '啟蒙小木屋',
                    description: '開啟你的英語啟蒙之旅！',
                    options: [
                        { type: 'learn', label: '啟蒙小木屋', iconPath: book, stars: 1 },
                        { type: 'quiz', label: '優雅小木屋', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '溫暖糖果屋', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '煙燻小木屋', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '學習小木屋', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '精緻娃娃屋', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '魔法小水屋', iconPath: book, stars: 0 },
                    ]
                },
                // ID: 02 - 魔法夢幻島
                '02': {
                    name: '魔法夢幻島',
                    description: '探索充滿驚喜的魔法世界！',
                    options: [
                        { type: 'learn', label: '魔法夢幻島', iconPath: book, stars: 0 }, 
                        { type: 'quiz', label: '魔術棒', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '魔法球', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '魔術箱', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '魔術帽', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '魔術兔兔', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '魔術師', iconPath: book, stars: 0 },
                    ]
                },
                // ID: 03 - 圖書館島
                '03': {
                    name: '圖書館島',
                    description: '沈浸在書香氣息的知識海洋！',
                    options: [
                        { type: 'learn', label: '圖書館島', iconPath: book, stars: 0 }, 
                        { type: 'quiz', label: '在大門的書', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '安靜的書', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '會飛的書', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '跑來跑去的書', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '貪吃的書', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '聰明的書', iconPath: book, stars: 0 },
                    ]
                },
                // ID: 04 - 大城市島
                '04': {
                    name: '大城市島',
                    description: '體驗繁華都市的英語生活！',
                    options: [
                        { type: 'learn', label: '大城市島', iconPath: book, stars: 0 }, 
                        { type: 'quiz', label: '都市中心', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '高樓大廈', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '辦公大樓', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '流行中心', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '時尚大廳', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '大城小事', iconPath: book, stars: 0 },
                    ]
                },
                // ID: 05 - 許願星星島
                '05': {
                    name: '許願星星島',
                    description: '向星星許下你的英語進步願望！',
                    options: [
                        { type: 'learn', label: '許願星星島', iconPath: book, stars: 0 }, 
                        { type: 'quiz', label: '閃亮星星', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '流星', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '海底星星', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '月亮星星', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '星星樹', iconPath: book, stars: 0 },
                        { type: 'quiz', label: '許願星星', iconPath: book, stars: 0 },
                    ]
                },
                // ID: 06 - 300字複習 (總複習模式，單行顯示)
                '06': {
                    name: '300字複習',
                    description: '這裡集結了 300 字島的所有島嶼，快來跟我一起複習吧!',
                    options: [
                        { type: 'quiz', label: '300字挑戰', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: '啟蒙小木屋', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: '魔法夢幻島', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: '圖書館島', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: '大城市島', iconPath: fire, stars: 0 },
                        { type: 'quiz', label: '許願星星島', iconPath: fire, stars: 0 },
                    ]
                }
            };
            
            this.lessonData = dataMap[id] || { 
                name: '未知單元', 
                description: '找不到此單元數據', 
                options: [] 
            };
        },
        goBack() {
            // const backPath = this.level === 'primary' ? '/primaryisland' : '/secondaryisland';
            // this.$router.push(backPath);
            this.$router.go(-1);
        },
        startActivity(type) {
            console.log(`開始活動: ${type}，單元: ${this.unitId}`);

            let routeName = 'QuizPage';

            if (type === 'learn') {
                routeName = 'LearnPage';
            }

            this.$router.push({
                name: routeName,
                params: { unitId: this.unitId, activityType: type, level: this.level }
            }).catch(err => {
                if (err.name !== 'NavigationDuplicated') {
                    throw err;
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.lesson-detail-page {
    @include main-card-page;
}


.main-card {
    @include lesson-detail-boxs-two-row 
}
</style>