<template>
    <div class="quiz-page">

        <div v-if="isGameActive || isFinished" :class="['main-card', { 'is-finished-mode': isFinished }]">

            <template v-if="isGameActive && !isFinished">
                <div class="header-wrap">
                    <div v-if="!isFinished" class="top-link" @click="goBack">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>
                    <div class="game-header">
                        <div class="star-count">
                            <i class="fa-regular fa-clock" style="color: #404E4E;margin-right: 16px;"></i>
                        </div>

                        <div class="timer-bar">
                            <el-progress :show-text="false" :text-inside="true" :stroke-width="26"
                                :percentage="timerPercentage" status="exception" class="timer-progress"></el-progress>
                        </div>
                    </div>
                </div>




                <div class="question-content">
                    <div class="question-wrap">
                        <div v-if="gameType === 'listening'" class="audio-trigger big-icon" @click="playAudio">
                            <i class="fas fa-volume-up"></i>
                        </div>

                        <h1 v-else-if="gameType === 'reading'" class="question-word-title">
                            {{ currentQuestion.title }}
                        </h1>
                    </div>

                    <p class="instruction-text">
                        {{ gameType === 'listening' ? '請選擇聽到的文字' : '請選擇對應的中文' }}
                    </p>

                    <div class="options-grid">
                        <button v-for="(option, index) in currentQuestion.options" :key="index"
                            :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                            @click="selectAnswerAndSubmit(option.value)">
                            {{ option.label }}
                        </button>
                    </div>
                </div>

            </template>
            <template v-else-if="isFinished">
                <div class="game-result-card">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="result-avatar">
                    <h2 class="result-title">太棒了!</h2>
                    <p class="result-score">你獲得了 {{ finalScore }} 積分</p>
                </div>
                <button class="result-back-btn" @click="goBack">返回</button>
            </template>

        </div>
        <el-dialog custom-class="start-modal" :visible.sync="dialogVisible" width="400px" center
            :close-on-click-modal="false" :show-close="false" :before-close="handleClose">

            <div class="dialog-content">
                <img :src="heroAvatarPath" alt="英雄吉祥物" class="dialog-avatar">

                <h3 class="title">小英雄，你準備好開始遊戲了嗎？</h3>
                <p class="description">目標是在 1 分鐘內回答完 50 題抽選！</p>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button @click="startGame">開始遊戲</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

export default {
    name: 'SpeedQuiz',
    props: {
        gameId: { type: String, required: true },
        gameTitle: { type: String, default: '速度對決' },
        gameLevel: { type: String, required: true },
        gameType: { type: String, default: 'listening' }
    },
    data() {
        return {
            dialogVisible: true,
            isGameActive: false,
            isFinished: false,

            // 圖片路徑
            heroAvatarPath: require('@/assets/image/hero-avatar.png'), // 英雄頭像
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'), // 結束畫面頭像

            // 計時器
            totalTime: 60, // 總時間 60 秒
            timeLeft: 60,
            timerInterval: null,

            // 遊戲數據
            currentScore: 0,
            finalScore: 0,

            // 模擬題目
            currentQuestion: {
                title: '',
                options: [],
                correctValue: ''
            },
            selectedAnswer: null,
        };
    },
    computed: {
        timerPercentage() {
            return (this.timeLeft / this.totalTime) * 100;
        }
    },
    methods: {
        // --- 導航與 Dialog 處理 ---
        goBack() {
            // 返回競技島主頁
            this.$router.push('/competition');
        },
        handleClose() {
            this.dialogVisible = false;
            this.goBack();
        },

        // --- 遊戲控制 ---
        startGame() {
            this.dialogVisible = false;
            this.isGameActive = true;
            this.isFinished = false;
            this.currentScore = 0;
            this.timeLeft = this.totalTime;
            this.startTimer();
            this.loadQuestion();
        },
        startTimer() {
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.endGame();
                }
            }, 1000);
        },
        endGame() {
            clearInterval(this.timerInterval);
            this.isGameActive = false;
            this.isFinished = true;
            this.finalScore = this.currentScore * 100;
            console.log(`遊戲結束！總分: ${this.finalScore}`);
            const today = new Date().toDateString();
            localStorage.setItem('dailyChallengeCompletionDate', today);
        },

        //根據 gameType 載入不同類型的模擬數據
        loadQuestion() {
            this.selectedAnswer = null;

            if (this.gameType === 'reading') {
                // --- 閱讀模式 (題目英文 -> 選項中文) ---
                this.currentQuestion = {
                    title: 'Apple',
                    correctValue: 'apple',
                    options: [
                        { value: 'apple', label: '蘋果' }, // 中文選項
                        { value: 'banana', label: '香蕉' },
                        { value: 'cat', label: '貓咪' },
                        { value: 'dog', label: '狗狗' },
                    ]
                };
            } else {
                // --- 聽力模式 (題目音檔 -> 選項英文) ---
                this.currentQuestion = {
                    title: '', // 聽力模式不顯示標題
                    correctValue: 'apple',
                    options: [
                        { value: 'apple', label: 'Apple' }, // 英文選項
                        { value: 'ten', label: 'Ten' },
                        { value: 'pen', label: 'Pen' },
                        { value: 'puppy', label: 'Puppy' },
                    ]
                };
                // 如果是聽力題，載入後自動播放一次
                this.$nextTick(() => {
                    this.playAudio();
                });
            }
        },
        playAudio() {
            console.log('播放題目音訊');
            // 播放音訊邏輯
        },
        // 選擇答案並自動提交
        selectAnswerAndSubmit(value) {
            // 1. 設置選中的答案 (為了判斷對錯)
            this.selectedAnswer = value;

            // 2. 執行提交邏輯 (不需要等待用戶額外點擊)
            this.submitAnswer();
        },

        selectAnswer(value) {
            // 在此模式下，selectAnswer 僅用於設定值，不做其他動作
            this.selectedAnswer = value;
        },

        submitAnswer() {
            if (this.selectedAnswer === this.currentQuestion.correctValue) {
                this.currentScore++;
                console.log('回答正確！');
            } else {
                console.log('回答錯誤！');
            }

            // 清空答案準備下一題
            this.selectedAnswer = null;

            // 進入下一題
            this.loadQuestion();
        }

    },
    beforeDestroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
};
</script>

<style lang="scss" scoped>
.result-title,
.result-score {
    color: $main-black-text
}

.quiz-page {
    @include main-card-page;
}

.main-card {
    @include main-card;

    &.is-finished-mode {
        background-color: transparent;
        box-shadow: none;
        border: none;
        padding: 0;
        width: auto;
        min-height: auto;
    }

    .header-wrap {
        @include flex-center;
        gap: 0 40px;
        width: 100%;

        .top-link {
            @include card-return-text;
            text-wrap: nowrap;
        }

        .game-header {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 30px;


            .star-count {
                @include flex-center;
                font-size: 20px;
                color: #FFC107;
                font-weight: bold;

                .fa-star {
                    font-size: 24px;
                    margin-right: 5px;
                }
            }
        }

    }
}


.question-content {
    text-align: center;
    width: 100%;
    padding: 20px 0;

    .audio-trigger {
        font-size: 10rem;
        margin-bottom: 30px;
        color: $main-quiz-blue;
    }


    .question-word-title {
        color: $main-quiz-blue;
        font-size: 10rem;
        margin-bottom: 24px;
    }
}

.big-icon {
    font-size: 10rem;
    color: $main-dark-blue;
    margin-bottom: 30px;
}

.instruction-text {
    font-size: 32px;
    font-weight: 600;
    color: $main-black-text;
    margin-bottom: 40px;
}

.options-grid {
    @include option-grid;
    width: 90%;
    margin: 0 auto 30px;

    .option-btn {
        background-color: #F5FFFF;
        border: 2px solid #C7D3D1;
        color: $main-dark-blue;
        padding: 15px 10px;
        border-radius: 15px;
        font-size: 24px;
        box-shadow: 0px 4px 4px 0px #00000040;

        &.is-selected {
            background-color: #26C9B9;
            border-color: #26C9B9;
            color: white;
        }
    }
}

.submit-btn {
    width: calc(100% + 80px);
    margin: 0 -40px;
    padding: 20px 0;
    background-color: #FAE162;
    border-top: none;
    font-size: 24px;
    font-weight: bold;
}


.game-result-card {
    background-color: white;
    @include flex-center;
    flex-direction: column;
    text-align: center;
    padding: 30px;
    border: 4px solid #38C7A7;
    border-radius: 20px;
    width: 350px;
    margin-bottom: 16px;

    .result-title {
        font-size: 36px;
        font-weight: bold;
    }

    .result-score {
        font-size: 24px;
    }


}

.result-back-btn {
    background-color: #38C7A7;
    color: $main-black-text;
    padding: 12px 60px;
    font-size: 20px;
    font-weight: 600;
    border-radius: 12px;
    width: 350px;
    border: none;
    box-shadow: 0px 4px 4px 0px #00000040;

    &:hover {
        background-color: #2db698;
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .question-content .question-word-title {
        font-size: 7rem;
        margin-bottom: 0;
    }

    .instruction-text {
        font-size: 24px;
    }
}
</style>