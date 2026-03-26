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

                            <img v-if="scope.data.isImageMode" 
     :src="getImageUrl(scope.data.mainText)"
     class="card-image" 
     :alt="`${scope.data.mainText} 的學習圖片`" />
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
            this.queue = [];
            try {
                console.log('--- [LearnPage ABC Debug] ---');
                let payload = {};

                const isAbcRequest =
                    this.wordCount === 'abc' ||
                    this.unitName.includes('ABC') ||
                    ['af', 'gl', 'mr', 'sz', 'final'].includes(this.unitId);

                let islandName = '300字島';
                if (isAbcRequest) {
                    islandName = 'ABC啟航島';
                } else if (this.wordCount === '800') {
                    islandName = '800字島';
                } else if (this.wordCount === '1200') {
                    islandName = '1200字島';
                }

                if (isAbcRequest) {
                    console.log('✅ 執行 ABC 學習模式請求');
                    if (this.unitId === 'final' || this.stageLabel === 'A-Z') {
                        // ABC 總複習
                        payload = {
                            "島嶼": "ABC啟航島",
                            "單元": this.stageLabel === 'A-Z' ? undefined : this.stageLabel,
                            "題數": 26,
                            "include_answer": true
                        };
                    } else {
                        const mapping = { 'af': 'A-F', 'gl': 'G-L', 'mr': 'M-R', 'sz': 'S-Z' };

                        payload = {
                            "島嶼": "ABC啟航島",
                            "單元": mapping[this.unitId] || this.unitName,
                            "關卡": (this.stageLabel === 'ALL' || !this.stageLabel) ? undefined : this.stageLabel,
                            "題數": 26,
                            "include_answer": true
                        };
                    }
                } else {
                    // 決定動態題數
                    let dynamicLimit = 1200;
                    if (this.wordCount === '300') dynamicLimit = 300;
                    else if (this.wordCount === '800') dynamicLimit = 800;
                    else if (this.wordCount === '1200') dynamicLimit = 1200;

                    const isTotalStudy = (this.stageLabel === 'ALL');
                    let islandName = this.wordCount === '1200' ? '1200字島' : (this.wordCount === '800' ? '800字島' : '300字島');

                    payload = {
                        "島嶼": islandName,
                        "單元": this.unitName,
                        "關卡": isTotalStudy ? undefined : this.stageLabel,
                        "題數": dynamicLimit,
                        "include_answer": true
                    };
                }

                console.log(' LearnPage Payload:', JSON.stringify(payload));
                const response = await api.post('/questionbank/generate/', payload);
                const apiData = response.data;

                if (!apiData || apiData.length === 0) throw new Error('API 回傳資料為空');

                let cards = [];

                if (isAbcRequest) {
                    console.log('處理 ABC 學習卡片數據');
                    cards = apiData.map((item, index) => ({
                        id: item.id || (Date.now() + index),
                        mainText: item.question_text || item.answer,
                        subText: null,
                        audioSrc: item.question_text || item.answer,
                        isImageMode: true
                    }));
                } else {
                    console.log('處理一般單字卡片數據');
                    cards = apiData
                        .filter(item => item.type !== 'cloze')
                        .map((item, index) => {
                            const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);
                            let audioText = (!hasChinese(item.question_text)) ? item.question_text : item.answer;
                            return {
                                id: item.id || (Date.now() + index),
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
                } else {
                    // 滑動後，自動播放隊列中的下一張卡片
                    this.playAudio(this.queue[0]);
                }
            });
        },
        decide(choice) {
            this.$refs.tinder.decide(choice);
        },

        handleRestart() {
            this.isFinished = false;
            // 重新抓取資料
            this.fetchLearningData();
        },
        playAudio(wordData) {
            if (!wordData || !wordData.audioSrc) return;
            const text = wordData.audioSrc;

            // 清除之前所有正在排隊或朗讀中的語音
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;

            // 延遲極短時間執行，避免語音重叠
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 50);
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
    },
    watch: {
        // 當載入完成，畫面出現第一張卡片時自動播放
        isLoading(val) {
            if (!val && this.queue.length > 0) {
                this.$nextTick(() => {
                    this.playAudio(this.queue[0]);
                });
            }
        }
    },
};
</script>

<style lang="scss" scoped>
.learn-page {
    @include main-card-page;

    .learning-container {
        width: 100%;
        padding: 5% 0;
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
    max-width: 800px;
}


.content-display {
    @include main-card-content;

    .question-wrap {
        flex-direction: column;
        align-items: center;
        gap: 24px 0;
    }

    .card-word-title {
        font-size: 80px;
        font-weight: 900;
        color: $main-quiz-blue;
        margin: 10px 0;
    }

    .word-translation {
        font-size: 28px;
        font-weight: 600;
        color: $main-grey-text;
        margin-top: 15px;
    }

    .card-image {
        max-height: 200px;
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

        .learning-container {
            padding: 5%;
        }
    }
}
</style>