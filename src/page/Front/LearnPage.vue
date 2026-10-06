<template>
    <div class="learn-page">
        <div v-if="isLoading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <p>卡片載入中...</p>
        </div>

        <div v-else-if="!isFinished" class="learning-container">
            <div class="swipe-stack">
                <div v-for="(card, index) in visibleCards" :key="card.id" class="swipe-card"
                    :class="{ 'is-top': index === 0, 'is-dragging': isDragging }" :style="cardStyle(index)"
                    @pointerdown="index === 0 && onPointerDown($event)"
                    @pointermove="index === 0 && onPointerMove($event)" @pointerup="index === 0 && onPointerUp($event)"
                    @pointercancel="index === 0 && onPointerUp($event)">
                    <div class="card-return-text" tabindex="0" role="button" aria-label="返回上一頁" @click="goBack"
                        @keydown.enter.prevent="goBack" @keydown.space.prevent="goBack">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>

                    <div class="content-display">
                        <div class="question-wrap">
                            <div v-if="card.audioSrc" class="audio-trigger" tabindex="0" role="button" aria-label="播放發音"
                                @click.stop="playAudio(card)" @keydown.enter.stop.prevent="playAudio(card)"
                                @keydown.space.stop.prevent="playAudio(card)">
                                <i class="fas fa-volume-up"></i>
                            </div>
                            <h1 v-if="!card.isImageMode" class="card-word-title">{{ card.mainText }}</h1>
                            <img v-if="card.isImageMode" :src="getImageUrl(card.mainText)" class="card-image"
                                :alt="`${card.mainText} 的學習圖片`" />
                        </div>
                        <div v-if="card.subText" class="word-translation">{{ card.subText }}</div>
                    </div>
                </div>
            </div>


            <div class="btns">
                <p class="remember-btn" tabindex="0" role="button" @click="decide('pass')"
                    @keydown.enter.prevent="decide('pass')" @keydown.space.prevent="decide('pass')">
                    我不熟<span>✖</span>
                </p>
                <p class="forget-btn" tabindex="0" role="button" @click="decide('remember')"
                    @keydown.enter.prevent="decide('remember')" @keydown.space.prevent="decide('remember')">
                    我會了<span>✔</span>
                </p>
            </div>
        </div>

        <div v-else class="result-container">
            <div class="back-link" tabindex="0" role="button" aria-label="返回上一頁" @click="goBack"
                @keydown.enter.prevent="goBack" @keydown.space.prevent="goBack">
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
import api from '@/config/api';

export default {
    name: 'LearnPage',
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
            dragX: 0,
            dragY: 0,
            startX: 0,
            startY: 0,
            isDragging: false,
            isLeaving: false,
            threshold: 100,
        };
    },
    mounted() {
        this.fetchLearningData();
        window.addEventListener('keydown', this.onKeydown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeydown);
        window.speechSynthesis.cancel(); // 順便離開頁面時停止朗讀
    },
    computed: {
        // 只渲染最上面兩張，效能好
        visibleCards() {
            return this.queue.slice(0, 2);
        },
        progress() {
            return Math.min(Math.abs(this.dragX) / this.threshold, 1);
        },
        rememberOpacity() {
            return this.dragX > 0 ? this.progress : 0;
        },
        passOpacity() {
            return this.dragX < 0 ? this.progress : 0;
        },
    },
    methods: {
        onKeydown(e) {
            // 載入中、已完成、正在飛出動畫時不處理
            if (this.isLoading || this.isFinished || this.isLeaving) return;

            // 使用者正在輸入文字時不攔截
            const tag = e.target && e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.decide('pass');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.decide('remember');
            }
        },
        cardStyle(index) {
            if (index === 0) {
                const rotate = this.dragX / 20;
                return {
                    transform: `translate(${this.dragX}px, ${this.dragY * 0.3}px) rotate(${rotate}deg)`,
                };
            }
            // 後面那張：隨著前面拖動慢慢放大
            const scale = 0.95 + this.progress * 0.05;
            const y = 10 - this.progress * 10;
            return { transform: `translateY(${y}px) scale(${scale})` };
        },

        onPointerDown(e) {
            if (this.isLeaving) return;
            // 點到發音鈕、返回鈕時不要當成拖曳
            if (e.target.closest('.audio-trigger, .card-return-text')) return;
            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
        },

        onPointerMove(e) {
            if (!this.isDragging) return;
            this.dragX = e.clientX - this.startX;
            this.dragY = e.clientY - this.startY;
        },

        onPointerUp(e) {
            if (!this.isDragging) return;
            this.isDragging = false;
            if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            if (this.dragX > this.threshold) this.complete('remember');
            else if (this.dragX < -this.threshold) this.complete('pass');
            else { this.dragX = 0; this.dragY = 0; } // 沒拖夠,彈回去
        },

        // 飛出動畫 → 移出 queue → 呼叫 onSubmit
        complete(type) {
            if (this.isLeaving || this.queue.length === 0) return;
            this.isLeaving = true;
            const dir = type === 'remember' ? 1 : -1;
            this.dragX = dir * (window.innerWidth || 800);

            setTimeout(() => {
                const item = this.queue.shift();
                this.dragX = 0;
                this.dragY = 0;
                this.isLeaving = false;
                this.onSubmit({ item, type });
            }, 300);
        },

        decide(choice) {
            this.complete(choice); // 按鈕直接呼叫,取代 this.$refs.tinder.decide
        },

        onSubmit({ item, type }) {
            if (type === 'pass') {
                // 不熟的卡片放回隊尾(改成同步 push,避免最後一張時誤判完成)
                this.queue.push({ ...item, id: Date.now() + Math.random() });
            }
            this.$nextTick(() => {
                if (this.queue.length === 0) {
                    this.isFinished = true;
                } else {
                    this.playAudio(this.queue[0]);
                }
            });
        },
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
                // console.log('--- [LearnPage ABC Debug] ---');
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
                    // console.log('執行 ABC 學習模式請求');
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

                // console.log(' LearnPage Payload:', JSON.stringify(payload));
                const response = await api.post('/questionbank/generate/', payload);
                const apiData = response.data;

                if (!apiData || apiData.length === 0) throw new Error('API 回傳資料為空');

                let cards = [];

                if (isAbcRequest) {
                    // console.log('處理 ABC 學習卡片數據');
                    cards = apiData.map((item, index) => ({
                        id: item.id || (Date.now() + index),
                        mainText: item.question_text || item.answer,
                        subText: null,
                        audioSrc: item.question_text || item.answer,
                        isImageMode: true
                    }));
                } else {
                    // console.log('處理一般單字卡片數據');
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

    .remember-btn,
    .forget-btn {
        cursor: pointer;
        @include flex-center;
        gap: 0 10px;
        color: white;
        font-weight: 600;
        width: 150px;
        border-radius: 40px;
        justify-content: space-between;
        padding: 0 16px;
        font-size: 18px;
    }

    .remember-btn {
        background-color: #c42121;
    }

    .forget-btn {
        background-color: #4270f9;
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
        display: flex;
        gap: 0 20px;
        justify-content: center;
        height: 80px;
    }
}

.key-hint {
    text-align: center;
    color: $main-grey-text;
    font-size: 14px;
    margin-top: 8px;
}

.card-return-text {
    @include card-return-text;
}


.swipe-stack {
    position: relative;
    margin: 0 auto 32px auto;
    height: 500px;
    min-width: 500px;
    max-width: 800px;
}

.swipe-card {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    z-index: 1;
    transition: transform 0.3s ease;

    &.is-top {
        z-index: 2;
        cursor: grab;
    }

    &.is-dragging {
        transition: none;
        cursor: grabbing;
    }
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

@media screen and (min-width: 576px) {
    .learn-page {
        padding: 4% 8% 0 14%
    }
}

@media (orientation: landscape) and (max-height: 47.9988rem) and (pointer: coarse) {

    .learn-page {
        display: unset;
        padding: 5% 12%;

        .learning-container {
            padding: 4% 8% 0 14%
        }

        .content-display .card-image {
            max-width: 120px;
        }

        .main-card {
            margin: 5% auto;
            width: max-content;
            padding: 1rem;
        }
    }
}

@media (pointer: coarse) {
    .key-hint {
        display: none;
    }
}
</style>