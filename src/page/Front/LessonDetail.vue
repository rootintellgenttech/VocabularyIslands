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
                    <div v-for="(option, index) in lessonData.options" :key="index" class="option-item" :class="{
                        'is-learn-mode': option.type === 'learn',
                        'is-final-mode': ['final', '06', '800-06', '1200-05'].includes(currentKey)
                    }">

                        <template
                            v-if="option.type === 'learn' || ['final', '06', '800-06', '1200-05'].includes(currentKey)">
                            <div class="item-single-row" @click="startActivity(option.type, option)">
                                <div class="single-left">
                                    <img :src="option.iconPath" :alt="option.label" class="main-icon" />
                                    <span class="option-label">{{ option.label }}</span>
                                </div>
                                <div class="single-right">
                                    <span v-if="option.type === 'learn'" class="action-text">總學習</span>
                                    <div v-else class="star-rating">
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
                                    <img :src="option.iconPath" :alt="option.label" class="main-icon" />
                                    <span class="option-label">{{ option.label }}</span>
                                </div>
                                <div class="top-right" @click.stop="startActivity('learn', option)">
                                    <span class="action-text">學習</span>
                                </div>
                            </div>

                            <div class="item-bottom" @click.stop="startActivity('quiz', option)">
                                 <div class="bottom-right">
                                    <div class="star-rating">
                                        <img :src="firePath" alt="Challenge" class="fire-icon"
                                        :class="{ 'is-bw': option.stars <= 0 }" />
                                        <i v-for="n in 5" :key="n"
                                            :class="['fas', option.stars >= n ? 'fa-star filled' : 'fa-star outline']">
                                        </i>
                                    </div>
                                </div>
                                <div class="bottom-left">
                                    
                                    <span class="challenge-label" :class="{ 'is-bw': option.stars <= 0 }">挑戰</span>
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
import api from '@/config/api';

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
        wordCount: {
            type: String,
            default: '300'
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
            },
            userStats: null,
        };
    },
    watch: {
        unitId: {
            immediate: true,
            handler(newUnitId) {
                this.loadLessonData(newUnitId);
                this.fetchUserStars();
            }
        }
    },
    methods: {
        loadLessonData(id) {
            const book = this.bookPath;
            const fire = this.firePath;

            // 輔助函式：創建 quiz option 陣列 (測試邏輯)
            const createQuizOptions = (labels, icon, type = 'quiz') => {
                // 第一個 Label 通常是 Learn Mode 的總標籤
                const options = [{ type: 'learn', label: labels[0], iconPath: book, stars: 0 }];

                // 後續為 Quiz 關卡
                for (let i = 1; i < labels.length; i++) {

                    // ⭐️ 測試邏輯 START ⭐️
                    let starsCount = 0;
                    if (labels[i] === '藍色晶體') {
                        starsCount = 4; // 給予藍色晶體 4 顆星
                    } else if (labels[i] === '優雅小木屋') {
                        starsCount = 2; // 給予優雅小木屋 2 顆星 (測試 300 字島)
                    }
                    // ⭐️ 測試邏輯 END ⭐️

                    options.push({ type: type, label: labels[i], iconPath: icon, stars: starsCount });
                }
                return options;
            };
            // 輔助函式：創建複習/挑戰選項陣列 (單行模式)
            const createFinalOptions = (labels, icon) => {
                return labels.map(label => ({
                    type: 'quiz', 
                    label: label,
                    iconPath: icon,
                    stars: 0
                }));
            };

            // --- 國小 ABC 關卡名稱 ---
            const optionsABC = {
                'af': ['A-F', 'A-C', 'D-F'],
                'gl': ['G-L', 'G-I', 'J-L'],
                'mr': ['M-R', 'M-O', 'P-R'],
                'sz': ['S-Z', 'S-U', 'V-Z'],
                'final': ['A-Z', 'A-F', 'G-L', 'M-R', 'S-Z']
            };

            // --- 國小 300 字島關卡名稱 ---
            const options300 = {
                '01': ['啟蒙小木屋', '優雅小木屋', '溫暖糖果屋', '煙燻小木屋', '學習小木屋', '精緻娃娃屋', '魔法小水屋'],
                '02': ['魔法夢幻島', '魔術棒', '魔法球', '魔術箱', '魔術帽', '魔術兔兔', '魔術師'],
                '03': ['圖書館島', '在大門的書', '安靜的書', '會飛的書', '跑來跑去的書', '貪吃的書', '聰明的書'],
                '04': ['大城市島', '都市中心', '高樓大廈', '辦公大樓', '流行中心', '時尚大廳', '大城小事'],
                '05': ['許願星星島', '閃亮星星', '流星', '海底星星', '月亮星星', '星星樹', '許願星星'],
                '06': ['啟蒙小木屋', '魔法夢幻島', '圖書館島', '大城市島', '許願星星島']
            };

            // --- 國中 800 字島關卡名稱 ---
            const options800 = {
                '01': ['霧靄之境', '晨曦薄霧', '幽谷迴音', '迷失航線', '沉睡遺跡', '寂靜邊緣', '星塵微光', '虛空通道', '幻影倒影', '藍色晶體', '恍然大悟'],
                '02': ['漂流群島', '海潮呢喃', '風蝕之石', '遠方燈塔', '琥珀沙灘', '破曉啟航', '珊瑚迷宮', '船歌餘韻', '深海裂縫', '彩虹泡沫', '遺忘之錨'],
                '03': ['熔岩盆地', '赤紅脈動', '灰燼之舞', '炙熱邊界', '焦土遺跡', '沉默噴發', '黑曜石階', '地心迴廊', '硫磺氣息', '鐵鏽之雨', '火山淚滴'],
                '04': ['迴旋之塔', '階梯盡頭', '高空密語', '無重力廳', '鐘擺之影', '天頂之窗', '扭曲視野', '古老機件', '邏輯迷宮', '第七封印', '無限符號'],
                '05': ['鏡像平原', '對稱邊界', '雙重倒影', '欺騙之眼', '錯置圖案', '破碎真實', '虛幻邊境', '陰影捕捉', '無聲迴路', '顏色反轉', '零度空間'],
                '06': ['霧靄之境', '漂流群島', '熔岩盆地', '迴旋之塔', '鏡像平原']
            };

            // --- 國中 1200 字島關卡名稱 ---
            const options1200 = {
                '01': ['永恆圖書館', '書頁迷宮', '塵封知識', '羊皮卷軸', '筆跡解讀', '禁書區塊', '午夜閱讀', '智慧之鎖', '不完整句', '墨水印記', '最後的句點'],
                '02': ['奇異峽谷', '非歐幾何', '懸浮石塊', '時間裂隙', '彩色苔蘚', '單向河流', '重力異常', '低語風穴', '不歸之路', '紫色天空', '形狀變換'],
                '03': ['靜默領域', '屏息時刻', '聲音邊界', '失落頻率', '褪色記憶', '空白畫布', '午後靜止', '陰影交疊', '鑰匙孔隙', '緩慢腐蝕', '最終邊境'],
                '04': ['黎光秘境島', '晨霧之徑', '回音峽谷', '遠古石林', '光羽瀑布', '迷境森林', '星屑丘陵', '雲梯斷崖', '秘紋遺跡', '深藍晶洞', '黎明守門者'],
                '05': ['永恆圖書館', '奇異峽谷', '靜默領域', '黎光秘境島', '300字島', '800字島', '1200字島', '超級總複習']
            };
            const dataMap = {
                // --- ABC 啟航島單元 (國小) ---
                'af': {
                    name: optionsABC.af[0],
                    description: '協助沃特老師一起修復 A-F 的字母吧!',
                    options: createQuizOptions(optionsABC.af, book)
                },
                'gl': {
                    name: optionsABC.gl[0],
                    description: '探索 G-L 的單字世界',
                    options: createQuizOptions(optionsABC.gl, book)
                },
                'mr': {
                    name: optionsABC.mr[0],
                    description: '挑戰 M-R 的發音與單字',
                    options: createQuizOptions(optionsABC.mr, book)
                },
                'sz': {
                    name: optionsABC.sz[0],
                    description: '完成 S-Z 的最終拼圖',
                    options: createQuizOptions(optionsABC.sz, book)
                },
                'final': {
                    name: 'ABC 總復習',
                    description: '驗收你的學習成果！挑戰所有字母吧！',
                    options: createFinalOptions(optionsABC.final, fire)
                },
                // --- 300 字島單元 (國小) ---
                '01': {
                    name: options300['01'][0],
                    description: '開啟你的英語啟蒙之旅！',
                    options: createQuizOptions(options300['01'], book)
                },
                '02': {
                    name: options300['02'][0],
                    description: '探索充滿驚喜的魔法世界！',
                    options: createQuizOptions(options300['02'], book)
                },
                '03': {
                    name: options300['03'][0],
                    description: '沈浸在書香氣息的知識海洋！',
                    options: createQuizOptions(options300['03'], book)
                },
                '04': {
                    name: options300['04'][0],
                    description: '體驗繁華都市的英語生活！',
                    options: createQuizOptions(options300['04'], book)
                },
                '05': {
                    name: options300['05'][0],
                    description: '向星星許下你的英語進步願望！',
                    options: createQuizOptions(options300['05'], book)
                },
                '06': {
                    name: '300字複習',
                    description: '這裡集結了 300 字島的所有島嶼，快來跟我一起複習吧!',
                    options: createFinalOptions(options300['06'], fire)
                },

                // --- 國中 800 字島單元 ---
                '800-01': { // 國中 800 字島 - 霧靄之境
                    name: options800['01'][0],
                    description: '在迷霧中探索，掌握國中單字的第一步！',
                    options: createQuizOptions(options800['01'], book)
                },
                // --- 800 字島單元 ---
                '800-01': { // 國中 800 字島 - 霧靄之境
                    name: options800['01'][0],
                    description: '在迷霧中探索，掌握國中單字的第一步！',
                    options: createQuizOptions(options800['01'], book)
                },
                '800-02': { // 國中 800 字島 - 漂流群島
                    name: options800['02'][0],
                    description: '在無邊的海潮中，尋找你的單字寶藏。',
                    options: createQuizOptions(options800['02'], book)
                },
                '800-03': { // 國中 800 字島 - 熔岩盆地
                    name: options800['03'][0],
                    description: '挑戰炙熱的單字，鍛鍊你的英語核心能力。',
                    options: createQuizOptions(options800['03'], book)
                },
                '800-04': { // 國中 800 字島 - 迴旋之塔
                    name: options800['04'][0],
                    description: '爬上知識的頂端，征服困難詞彙！',
                    options: createQuizOptions(options800['04'], book)
                },
                '800-05': { // 國中 800 字島 - 鏡像平原
                    name: options800['05'][0],
                    description: '辨識相似單字，不再被混淆。',
                    options: createQuizOptions(options800['05'], book)
                },
                '800-06': { // 國中 800 字島 - 800字複習
                    name: options800['06'][0],
                    description: '總結你的 800 單字學習成果！',
                    options: createFinalOptions(options800['06'], fire)
                },

                // --- 1200 字島單元 ---
                '1200-01': { // 國中 1200 字島 - 永恆圖書館
                    name: options1200['01'][0],
                    description: '沉浸在更深層次的知識中，解鎖進階單字。',
                    options: createQuizOptions(options1200['01'], book)
                },
                '1200-02': { // 國中 1200 字島 - 奇異峽谷
                    name: options1200['02'][0],
                    description: '在奇異的環境中，挑戰高難度單字的認知。',
                    options: createQuizOptions(options1200['02'], book)
                },
                '1200-03': { // 國中 1200 字島 - 靜默領域
                    name: options1200['03'][0],
                    description: '專注於詞彙的意義，排除一切干擾。',
                    options: createQuizOptions(options1200['03'], book)
                },
                '1200-04': { // 國中 1200 字島 - 黎光秘境島
                    name: options1200['04'][0],
                    description: '迎接黎明，掌握最終的詞彙挑戰！',
                    options: createQuizOptions(options1200['04'], book)
                },
                '1200-05': { // 國中 1200 字島 - 1200字複習
                    name: options1200['05'][0],
                    description: '全面檢視你的國中單字實力！',
                    options: createFinalOptions(options1200['05'], fire)
                }

            };

            let mapKey = id;

            // 如果 unitId 是數字，則加上 level/wordCount 前綴來匹配 300/800/1200 的數據
            if (!['af', 'gl', 'mr', 'sz', 'final'].includes(id) && !isNaN(parseInt(id))) {
                const currentWordCount = this.wordCount;

                if (currentWordCount === '800') {
                    mapKey = `800-${id}`;
                } else if (currentWordCount === '1200') {
                    mapKey = `1200-${id}`;
                }
                // 如果 wordCount === '300'，mapKey 保持 id (例如 '01')
            }


            this.lessonData = dataMap[mapKey] || {
                name: '未知單元',
                description: '找不到此單元數據',
                options: []
            };

            this.currentKey = mapKey;


        },
async fetchUserStars() {
    try {
        const response = await api.get('/students/test-summary/');

        // 針對 ABC 總復習 (unitId 為 final) 的精確匹配
        if (this.unitId === 'final') {
            const islandData = response.data.islands.find(i => i.island_name === 'ABC 總復習');

            if (islandData && islandData.units) {
                // 找到該島嶼下名為 "ABC 總復習" 的單元
                const finalUnit = islandData.units.find(u => u.unit_name === 'ABC 總復習');
                
                this.lessonData.options = this.lessonData.options.map(opt => {
                    let stars = 0;
                    
                    // 優先從 stages 陣列裡比對 (例如: "A-F")
                    if (finalUnit && finalUnit.stages) {
                        const matchedStage = finalUnit.stages.find(s => s.stage === opt.label);
                        if (matchedStage) stars = matchedStage.stars;
                    }

                    // 如果 stages 找不到，再嘗試從 units 層級比對
                    if (stars === 0) {
                        const matchedUnit = islandData.units.find(u => u.unit_name === opt.label);
                        if (matchedUnit) stars = matchedUnit.total_stars;
                    }
                    
                    return { ...opt, stars: stars };
                });
            }
            console.log('[ABC 總復習] 星星精確匹配成功');
            return;
        }

        // ---  一般單字島邏輯 ---
        let islandSearchName = '';
        if (this.wordCount === '300') islandSearchName = '300字島';
        else if (this.wordCount === '800') islandSearchName = '800字島';
        else if (this.wordCount === '1200') islandSearchName = '1200字島';
        else if (['af', 'gl', 'mr', 'sz'].includes(this.unitId)) islandSearchName = 'ABC啟航島';

        const islandData = response.data.islands.find(i => i.island_name === islandSearchName);
        if (!islandData) return;

        const unitData = islandData.units.find(u => u.unit_name === this.lessonData.name);
        
        this.lessonData.options = this.lessonData.options.map(opt => {
            let stars = 0;
            if (unitData && unitData.stages) {
                // A. 優先匹配 Review 關卡成績 (例如：300字複習裡的「圖書館島」)
                const matchedStage = unitData.stages.find(s => s.stage === opt.label);
                
                if (matchedStage) {
                    stars = matchedStage.stars;
                } 
                else {
                    // 判斷是否為「嚴格複習模式」(300/800 的第 6 單元)
                    const isStrictReview = ['06', '800-06'].includes(this.unitId) || (this.wordCount === '300' && this.unitId === '06');

                    if (!isStrictReview) {
                        // 只有 1200字總複習 或其他特殊單元，才允許去抓同名 Unit 的星星
                        const matchedUnitAsStage = islandData.units.find(u => u.unit_name === opt.label);
                        if (matchedUnitAsStage) {
                            stars = matchedUnitAsStage.total_stars;
                        }
                    }
                }
            }
            return { ...opt, stars: stars };
        });

        console.log(`[${islandSearchName}] 星星綁定成功 (嚴格模式: ${['06', '800-06'].includes(this.unitId)})`);

    } catch (error) {
        console.error('LessonDetail 星星更新失敗:', error);
    }
},
       goBack() {
        // 1. 判斷是否為 ABC 島嶼的單元 (af, gl, mr, sz, final)
        const isAbcUnit = ['af', 'gl', 'mr', 'sz', 'final'].includes(this.unitId);

        if (isAbcUnit) {
            // ABC 島嶼目前沒有中間層，直接回 ABCIsland 列表
            this.$router.push('/abc-island');
        } 
        else {
            // 2. 處理單字島 (300/800/1200)
            // 回到 WordIslandDetail，並帶上 level 和 wordCount 參數
            this.$router.push({
                name: 'WordIslandDetail',
                params: {
                    level: this.level,
                    wordCount: this.wordCount
                }
            });
        }
    },
   startActivity(actionType, option) {
            console.log(`觸發活動: ${actionType}，關卡: ${option.label}`);

            // 1. 學習模式
            if (actionType === 'learn') {
                const isTotalReview = (option.type === 'learn') || (option.label === this.lessonData.name);
                this.$router.push({
                    name: 'LearnPage',
                    params: {
                        unitId: this.unitId,
                        level: this.level,
                        unitName: this.lessonData.name,
                        stageLabel: isTotalReview ? 'ALL' : option.label,
                        isTotal: isTotalReview,
                        wordCount: this.wordCount
                    }
                });
            }
            // 2. 測驗模式 (QuizPage / HeroQuizPage)
            else if (actionType === 'quiz') {
                const isHero = option.type === 'hero-quiz';

                if (isHero) {
                    this.$router.push({
                        name: 'HeroQuizPage',
                        params: {
                            stageId: this.unitId,
                            stageName: option.label,
                            level: this.level,
                            unitName: this.lessonData.name,
                            wordCount: this.wordCount
                        }
                    });
                } else {
                    // 一般測驗 & ABC 總複習 會走這裡
                    this.$router.push({
                        name: 'QuizPage',
                        params: {
                            unitId: this.unitId, // 這裡是 'final'
                            activityType: 'word',
                            level: this.level,
                            stageLabel: option.label, // 這裡是 'A-Z'
                            unitName: this.lessonData.name,
                            wordCount: this.wordCount
                        }
                    });
                }
            }
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