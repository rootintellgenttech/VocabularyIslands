<template>
    <div class="quiz-page">
        <div v-if="!isSubmitted" class="main-card question-mode">
            <div class="card-return-text" @click="goBack">
                <i class="fas fa-angle-left"></i> 返回
            </div>

            <div class="progress-header">
                <div class="progress-bar-wrapper">
                    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="star-count">
                    <i class="fas fa-star filled"></i> {{ currentQuestionIndex + 1 }}/{{ maxQuestions }}
                </div>
            </div>

            <div class="question-content">
                <div class="question-wrap">
                    <div class="audio-trigger" @click="playQuestionAudio">
                        <i class="fas fa-volume-up"></i>
                    </div>
                    <p class="audio-hint-text">點擊喇叭聆聽單字</p>
                </div>

                <p class="instruction-text">選擇聽到的單字</p>

                <div class="options-grid">
                    <button v-for="(option, index) in currentQuestion.options" :key="index"
                        :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                        @click="selectAnswer(option.value)">
                        {{ option.label }}
                    </button>
                </div>
            </div>

            <button :class="['submit-btn']" :disabled="!selectedAnswer" @click="handleSubmit()">
                提交 <i class="fas fa-angle-right"></i>
            </button>
        </div>

        <div v-else :class="['main-card', 'result-mode', { 'is-correct': isCorrect }]">

            <div v-if="isCorrect" class="result-inner-card correct-mode">
                <img :src="correctAvatarPath" alt="吉祥物" class="avatar-result-icon">
                <h2 style="color: #097C70; margin: 10px 0;">答對了！</h2>
                <button class="continue-btn" @click="handleContinue()">
                    繼續答題 <i class="fas fa-angle-right"></i>
                </button>
            </div>

            <div v-else class="result-inner-card wrong-explanation-mode">
                <div class="explanation-content-wrapper">
                    <div class="explanation-header">
                        <div class="avatar-info-wrap">
                            <img :src="wrongAvatarPath" alt="吉祥物教練" class="explanation-avatar">
                            <div class="explanation-tip">
                                <p class="tip-text">沒關係</p>
                                <p class="tip-subtext">我們一起看看該如何解決</p>
                            </div>
                        </div>

                        <div class="explanation-text-group">
                            <div class="explanation-info-wrap">
                                <h2 class="explanation-title">正確答案</h2>
                                <p class="explanation-question-text">
                                    <strong>{{ currentQuestion.correctAnswer }}</strong><br>
                                    {{ currentQuestion.explanation }}
                                </p>
                            </div>
                            <div class="explanation-button">
                                <button class="continue-btn-wrong" @click="handleContinue()">
                                    繼續答題 <i class="fas fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'ListeningQuizPage',
    props: {
        stageId: { type: String, required: true },
        stageName: { type: String, default: '聽力測驗' },
        level: { type: String, default: 'primary' }
    },
    data() {
        return {
            isSubmitted: false,
            isCorrect: false,
            
            correctAvatarPath: require('@/assets/image/correct.png'),
            wrongAvatarPath: require('@/assets/image/answer-avatar.png'),
            
            // 進度控制
            currentQuestionIndex: 0,
            maxQuestions: 5,
            
            selectedAnswer: null,
            currentQuestion: null,
            
            // 模擬題庫
            mockQuestions: [
                {
                    audioWord: 'Apple',
                    correctAnswer: 'Apple',
                    explanation: 'Apple (蘋果) 的發音開頭是 /æ/，注意嘴型要張大。',
                    options: [
                        { value: 'Apple', label: 'Apple' },
                        { value: 'Banana', label: 'Banana' },
                        { value: 'Ant', label: 'Ant' },
                        { value: 'April', label: 'April' },
                    ]
                },
                {
                    audioWord: 'Book',
                    correctAnswer: 'Book',
                    explanation: 'Book (書) 的中間母音是短音 /ʊ/。',
                    options: [
                        { value: 'Bag', label: 'Bag' },
                        { value: 'Book', label: 'Book' },
                        { value: 'Box', label: 'Box' },
                        { value: 'Ball', label: 'Ball' },
                    ]
                },
                // ... 可以加入更多題目
            ]
        };
    },
    computed: {
        progress() {
            return ((this.currentQuestionIndex) / this.maxQuestions) * 100;
        }
    },
    created() {
        this.loadQuestion(0);
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
        loadQuestion(index) {
            // 這裡模擬從題庫拿題目，實際可根據 stageId 判斷
            // 循環取題避免 index out of bound
            const qIndex = index % this.mockQuestions.length;
            this.currentQuestion = this.mockQuestions[qIndex];
            this.selectedAnswer = null;
            this.isSubmitted = false;
        },
        
        // 播放題目音訊
        playQuestionAudio() {
            const word = this.currentQuestion.audioWord;
            console.log('播放音訊: ' + word);
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8; // 稍微放慢一點
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },
        
        selectAnswer(value) {
            this.selectedAnswer = value;
        },
        
        handleSubmit() {
            if (!this.selectedAnswer) return;

            const isRight = this.selectedAnswer === this.currentQuestion.correctAnswer;
            this.isCorrect = isRight;
            this.isSubmitted = true;
            
            // 如果答錯，可以自動播放一次正確發音加深印象
            if (!isRight) {
                 // this.playQuestionAudio();
            }
        },

        handleContinue() {
            if (this.currentQuestionIndex < this.maxQuestions - 1) {
                this.currentQuestionIndex++;
                this.loadQuestion(this.currentQuestionIndex);
            } else {
                alert('關卡完成！(這裡可以接結算畫面)');
                this.goBack();
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.quiz-page {
    @include main-card-page
}

.card-return-text {
    @include card-return-text;
}

.main-card {
    @include main-card;

    &.result-mode {
        background-color: transparent;
        box-shadow: none;
        padding: 0;
        width: auto;
    }
}

.progress-header {
    @include progress-star
}

.question-content {
    @include main-card-content;
    padding-top: 5%; // 稍微調整上方間距
}

.instruction-text {
    font-size: 28px;
    font-weight: 600;
    color: $main-black-text;
    margin-bottom: 30px;
    text-align: center;
}

.options-grid {
    @include option-grid
}

// 特別針對聽力題的樣式調整
.question-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;

    .audio-trigger {
        width: 120px;
        height: 120px;
        background-color: #E0F2F1; // 淺綠色背景
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);

        i {
            font-size: 50px;
            color: #097C70;
            margin: 0; // 重置 margin
        }

        &:hover {
            transform: scale(1.05);
            background-color: #B2DFDB;
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .audio-hint-text {
        margin-top: 15px;
        color: #666;
        font-size: 18px;
        font-weight: 500;
    }
}

.option-btn {
    font-size: 24px; // 英文單字字體大一點
    font-family: 'Arial', sans-serif; // 確保英文字體清晰
}

// --- 以下是結果卡片樣式 (沿用你提供的) ---

.result-inner-card {
    border-radius: 20px;
    padding: 20px;
    width: 100%;

    &.correct-mode {
        @include flex-center;
        flex-direction: column;
        text-align: center;
        background: white; // 確保有背景色
        padding: 40px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);

        button {
            margin-top: 16px;
        }
        
        .avatar-result-icon {
            width: 150px;
        }
    }
}

.wrong-explanation-mode {
    background-color: #FFF7ED;
    border: 5px solid #E49452;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 650px;

    .explanation-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 20px;
        text-align: left;
    }

    .explanation-header {
        display: flex;
        gap: 20px;

        .avatar-info-wrap {
            flex-direction: column;
            @include flex-center;

            img {
                width: 160px;
            }
        }
    }

    .explanation-text-group {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: flex-start; // 改為靠左對齊
        flex: 1;

        .explanation-info-wrap {
            .explanation-title {
                font-size: 28px;
                font-weight: 800;
                color: #521A00;
                margin-bottom: 10px;
            }
        }

        .explanation-question-text {
            font-size: 18px;
            color: #521A00;
            line-height: 1.5;
        }
    }

    .explanation-tip {
        text-align: center;

        .tip-text {
            font-size: 24px;
            font-weight: bold;
            color: #B84D1B;
            margin: 0;
        }

        .tip-subtext {
            font-size: 16px;
            color: #521A00;
            margin: 5px 0 0;
            text-wrap: nowrap;
        }
    }
}

.continue-btn-wrong {
    background-color: #E49452;
    border-radius: 16px;
    color: $main-black-text;
    font-weight: 600;
    border: none;
    padding: 8px 16px;
    font-size: 16px;
    margin-top: 16px;
    align-self: flex-end; // 按鈕靠右
    cursor: pointer;

    &:hover {
        background-color: #d7833e;
    }
}

.submit-btn,
.continue-btn {
    padding: 20px 0;
    @include qa-submit-continue-btn;
}

.submit-btn {
    border-top-right-radius: 0;
    border-top-left-radius: 0;
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .wrong-explanation-mode {
        width: 500px;
    }
}
</style>