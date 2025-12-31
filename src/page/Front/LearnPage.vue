<template>
    <div class="learn-page">
        <div v-if="isLoading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <p>卡片載入中...</p>
        </div>

        <div v-else-if="!isFinished" class="learning-container">
            <Tinder ref="tinder" key-name="id" :queue.sync="queue" :offset-y="10" @submit="onSubmit">
                <template slot-scope="scope">
                    <div class="card-return-text" @click="goBack">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>
                    <div class="content-display">
                        <div class="question-wrap">
                            <div v-if="scope.data.audioSrc" class="audio-trigger" @click.stop="playAudio(scope.data)">
                                <i class="fas fa-volume-up"></i>
                            </div>
                            
                            <h1 v-if="!scope.data.isImageMode" class="card-word-title">{{ scope.data.mainText }}</h1> 
                            
                            <img v-if="scope.data.isImageMode" :src="getImageUrl(scope.data.mainText)" class="card-image" alt="card-img" />
                        </div>
                        
                        <div v-if="scope.data.subText" class="word-translation">
                            {{ scope.data.subText }}
                        </div>
                    </div>
                </template>
            </Tinder>
            
            <div class="btns">
                <i class="fa-solid fa-circle-xmark" @click="decide('pass')" style="color: #c42121"></i>
                <i class="fa-solid fa-circle-check" style="color: #4270f9" @click="decide('remember')"></i>
            </div>
        </div>

        <div v-else class="result-container">
            <div class="back-link" @click="goBack">
                <i class="fas fa-arrow-left"></i> 返回
            </div>

            <div class="game-result-card">
                <img :src="correctAvatarPath" alt="吉祥物" class="avatar-result-icon">
                <div class="result-description">你已完成本單元學習</div>
            </div>
            <button class="restart-btn" @click="handleRestart()">
                重新來過 <i class="fas fa-rotate-right"></i>
            </button>
        </div>
    </div>
</template>

<script>
import Tinder from "vue-tinder";
import api from '@/config/api'; 

export default {
    name: 'LearnPage',
    components: { Tinder },
    props: {
        unitId: { type: String, required: true },
        level: { type: String, default: 'primary' },
        unitName: { type: String, default: '' },
        stageLabel: { type: String, default: '' },
        isTotal: { type: Boolean, default: false },
        wordCount: { type: String, default: '300' }
    },
    data() {
        return {
            isLoading: true,
            queue: [], 
            isFinished: false,
            correctAvatarPath: require('@/assets/image/elementary/avatar.png'),
        };
    },
    mounted() {
        this.fetchLearningData();
    },
 methods: {
        goBack() {
            this.$router.push({
                name: 'LessonDetail', 
                params: { 
                    unitId: this.unitId, 
                    level: this.level,
                    wordCount: this.wordCount 
                }
            });
        },

    async fetchLearningData() {
    this.isLoading = true;
    this.isFinished = false;
    try {
        console.log('--- [LearnPage ABC Debug] ---');
        let payload = {};

        // 判斷是否為 ABC 相關模式
        const isAbcMode = (this.wordCount === 'abc' || this.unitId === 'final' || ['af', 'gl', 'mr', 'sz'].includes(this.unitId));

        if (isAbcMode) {
            console.log('✅ 進入修正後的 ABC 學習路徑');
            
            // 決定單元名稱 (例如: A-F, G-L)
            const unitMapping = { 'af': 'A-F', 'gl': 'G-L', 'mr': 'M-R', 'sz': 'S-Z' };
            const currentUnit = unitMapping[this.unitId] || this.stageLabel || this.unitName;

            if (this.stageLabel === 'A-Z') {
                // A-Z 總學習：只傳島嶼與題型
                payload = {
                    "島嶼": "ABC啟航島",
                    "題型": "字母",
                    "題數": 26,
                    "include_answer": true
                };
            } else {
                payload = {
                    "島嶼": "ABC啟航島",
                    "單元": currentUnit, 
                    "題型": "字母",    
                    "題數": 26,
                    "include_answer": true
                };
            }
        } else {
            // 一般單字島學習模式 
            let islandName = '300字島';
            if (this.wordCount === '800') islandName = '800字島';
            else if (this.wordCount === '1200') islandName = '1200字島';

            payload = {
                "島嶼": islandName,
                "單元": this.unitName,
                "關卡": this.stageLabel === 'ALL' ? undefined : this.stageLabel,
                "題數": 1200,
                "include_answer": true
            };
        }

        console.log(' Learn API Request Payload:', JSON.stringify(payload, null, 2));
        
        const response = await api.post('/questionbank/generate/', payload);
        const apiData = response.data;

        if (!apiData || apiData.length === 0) throw new Error('API 回傳資料為空');

        // --- 資料處理 ---
        let cards = [];
        if (isAbcMode) {
            // ABC 模式：字母發音與圖片
            cards = apiData.map((item, index) => ({
                id: Date.now() + index,
                mainText: item.question_text || item.answer, 
                subText: null, 
                audioSrc: item.question_text, // 播報字母名稱
                isImageMode: true 
            }));
        } else {
            // 一般單字模式：中英對照
            cards = apiData
                .filter(item => item.type !== 'cloze')
                .map((item, index) => {
                    const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);
                    let audioText = (!hasChinese(item.question_text)) ? item.question_text : item.answer;
                    return {
                        id: Date.now() + index,
                        mainText: item.question_text, 
                        subText: item.answer,
                        audioSrc: audioText, 
                        isImageMode: false
                    };
                });
        }

        if (cards.length > 0) {
            // 隨機排序學習卡片
            this.queue = cards.sort(() => Math.random() - 0.5);
        } else {
            throw new Error('本單元沒有有效的學習卡片');
        }

    } catch (error) {
        console.error('Fetch learning data failed:', error);
        alert('無法載入學習內容，請稍後再試');
        this.goBack();
    } finally {
        this.isLoading = false;
    }
},

        onSubmit({ item, type }) {
            console.log(`卡片: ${item.mainText}, 選擇: ${type}`);

            if (type === 'pass') {
                const retryItem = { ...item, id: Date.now() + Math.random() };
                setTimeout(() => {
                    this.queue.push(retryItem);
                }, 200);
            }

            this.$nextTick(() => {
                if (this.queue.length === 0) {
                    this.isFinished = true;
                }
            });
        },

        decide(choice) {
            this.$refs.tinder.decide(choice);
        },

        handleRestart() {
            this.fetchLearningData(); 
        },

        playAudio(wordData) {
            const text = wordData.audioSrc;
            if (!text) return;
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.3;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },
        
        getImageUrl(word) {
            try {
                if (!word) return '';
                // 移除可能的非字母字符，確保只有 a-z
                const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
                return require(`@/assets/image/elementary/alphabet/${cleanWord}.png`);
            } catch (e) {
                return '';
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.learn-page {
    @include main-card-page;
    .learning-container{
        width: 100%;
    padding: 5% 28%;
    }

    .back-link {
        color: $main-black-text;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
        cursor: pointer;
    }

    .game-result-card {
        @include game-result-card;
        margin-top: 12px;
    }

    .restart-btn {
        @include result-back-btn
    }

    .btns {
        text-align: center;
    }
}

.card-return-text {
    @include card-return-text;
}

.vue-tinder {
    margin: 0 auto 32px auto;
    height: 500px;
    min-width: 500px;
    max-width: 700px;
}


.content-display {
    @include main-card-content;

    .question-wrap {
        margin-top: 8%;
    }
    .card-word-title {
        font-size:100px;
        font-weight: 900;
        color:$main-quiz-blue;
        margin: 10px 0;
    }

    .word-translation {
        font-size: 28px;
        font-weight: 600;
        color: $main-grey-text;
        margin-top: 15px;
    }

    .card-image {
        max-width: 70%;
        max-height: 250px;
        object-fit: contain;
        display: block;
    }
}

.btns i {
    height: 60px;
    width: 60px;
    border-radius: 100%;
    background-color: white;
    font-size: 60px;
    cursor: pointer;
    margin: 28px 8px;
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .learn-page {
        padding: 5%;
        .learning-container{
            padding: 5%;
        }
    }
}
</style>