<template>
    <div class="quiz-page">
        <div v-if="!isSubmitted" class="main-card question-mode">
            <div v-if="!isSubmitted" class="card-return-text" @click="goBack">
                <i class="fas fa-angle-left"></i> 返回
            </div>

            <div class="progress-header">
                <div class="progress-bar-wrapper">
                    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="star-count">
                    <i class="fas fa-star filled"></i>5
                </div>
            </div>

            <div class="question-content">
                <div class="question-wrap">
                    <div class="audio-trigger" @click="playAudio">
                        <i class="fas fa-volume-up"></i>
                    </div>
                    <h1 class="question-title">{{ currentQuestion.title }}</h1>
                </div>

                <p class="instruction-text">選擇聽到的內容</p>

                <div class="options-grid">
                    <button v-for="(option, index) in currentQuestion.options" :key="index"
                        :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                        @click="selectAnswer(option.value)">
                        <i class="fas fa-volume-up"></i>
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
                                <p class="explanation-question-text">{{ currentQuestion.explanation }}</p>
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
    name: 'QuizPage',
    props: {
        unitId: { type: String, required: true },
        activityType: { type: String, required: true }
    },
    data() {
        return {
            isSubmitted: false,  // 提交狀態
            isCorrect: false,    // 答題結果
            correctAvatarPath: require('@/assets/image/correct.png'),
            wrongAvatarPath: require('@/assets/image/answer-avatar.png'),
            progress: 30,
            selectedAnswer: null,
            currentQuestion: {
                title: 'Aa',
                audioSrc: '...',
                correctAnswer: 'A',
                explanation: '字母 A 的發音需要將嘴巴張開成「阿」的形狀，與選項 A 的內容相符。這是基礎字母學習的第一步，請多加練習！',
                options: [
                    { value: 'A', audioSrc: '...', label: 'A' },
                    { value: 'B', audioSrc: '...', label: 'B' },
                    { value: 'C', audioSrc: '...', label: 'C' },
                    { value: 'D', audioSrc: '...', label: 'D' },
                ]
            }
        };
    },
    methods: {
        goBack() {
            // 返回到 LessonDetail 頁面 (上一個頁面)
            // 這裡使用 $router.go(-1) 回到前一頁
            // 或者如果確定上一個是 LessonDetail，也可以使用 push
            this.$router.go(-1);
        },
        playAudio() {
            console.log('播放音訊: ' + this.currentQuestion.audioSrc);
            // 這裡實作音訊播放邏輯
        },
        selectAnswer(value) {
            this.selectedAnswer = value;
            console.log('選中的答案: ' + value);
        },
        // 提交按鈕的處理邏輯 
        handleSubmit() {
            if (!this.selectedAnswer) return;

            // 1. 隨機判斷對錯 (這裡使用簡單的隨機數模擬)
            const randomResult = Math.random() < 0.5; // 50% 機率對或錯

            this.isCorrect = randomResult;
            this.isSubmitted = true; // 進入結果顯示狀態

            console.log(`用戶提交答案，結果: ${this.isCorrect ? '正確' : '錯誤'}`);

            // 實際開發中，這裡會是 API 判斷邏輯
        },

        // 繼續答題的處理邏輯
        handleContinue() {
            this.isSubmitted = false;
            this.selectedAnswer = null;
            this.progress += 10;
            if (this.progress > 100) this.progress = 100;
        }
    }
};
</script>

<style lang="scss" scoped>
.quiz-page {
    @include main-card-page
}

i {
    margin-right: 4px;
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
    @include main-card-content
}


.instruction-text {
    font-size: 32px;
    font-weight: 600;
    color:$main-black-text;
    margin-bottom: 30px;
    text-align: center;
}

.options-grid {
    @include option-grid
}

.result-inner-card {
    border-radius: 20px;
    padding: 20px;
    width: 100%;

    &.correct-mode {
        @include flex-center;
        flex-direction: column;
        text-align: center;

        button {
            margin-top: 16px;
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
        align-items: self-end;

        .explanation-info-wrap {

            .explanation-title {
                font-size: 28px;
                font-weight: 800;
                color: #521A00;
                margin-bottom: 10px;
            }
        }

        .explanation-question-text {
            font-size: 16px;
            color: #521A00;
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
    color:$main-black-text;
    font-weight: 600;
    border: none;
    padding: 8px 16px;
    font-size: 16px;
    margin-top: 16px;

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