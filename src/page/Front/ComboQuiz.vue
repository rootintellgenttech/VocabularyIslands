<template>
    <div class="quiz-page">

        <div v-if="isGameActive || isFinished" :class="['main-card', { 'is-finished-mode': isFinished }]">

            <template v-if="isGameActive && !isFinished && !isExitConfirmed">
                <div class="header-wrap">
                    <div class="top-link" @click="handleBackClick">
                        <i class="fas fa-angle-left"></i> 返回
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

            <template v-else-if="isFinished || isExitConfirmed">
                <div class="game-result-card final-result">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="result-avatar">
                    <h2 class="result-title">太棒了!</h2>
                    <p class="result-score">你獲得了 {{ finalScore }} 積分</p>
                </div>
                <button class="result-back-btn" @click="goBack">返回</button>
            </template>
        </div>


        <el-dialog custom-class="start-modal" :visible.sync="dialogVisible" width="400px" center
            :close-on-click-modal="false" :show-close="false" :before-close="handleGameStartClose">

            <div class="dialog-content">
                <img :src="heroAvatarPath" alt="英雄吉祥物" class="dialog-avatar">

                <h3 class="title">小英雄，你準備好開始遊戲了嗎？</h3>
                <p class="description">快速回答完 50 題抽選！</p>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="handleGameStartClose">取 消</el-button>
                <el-button @click="startGame">開始遊戲</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="exit-confirm-modal" :visible.sync="exitDialogVisible" width="350px" center
            :close-on-click-modal="false" :show-close="false">

            <div class="dialog-content game-result-style">
                <img :src="quizAvatarPath" alt="Quiz Avatar" class="result-avatar dialog-img">

                <h3 class="title">確定要結束遊戲嗎</h3>

                <p class="description">分數將立即結算<br>您將失去今天的挑戰機會!</p>

                <p class="current-score-preview">
                    當前得分: <span>{{ currentScore * 100 }}</span> 積分
                </p>
            </div>

            <span slot="footer" class="dialog-footer two-btns">
                <el-button @click="resumeGame" class="btn-resume">繼續遊戲</el-button>
                <el-button type="danger" @click="confirmExit" class="btn-end">結束遊戲</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'ComboQuiz',
    props: {
        gameId: { type: String, required: true },
        gameTitle: { type: String, default: '完美連擊' },
        gameLevel: { type: String, required: true },
        gameType: { type: String, default: 'listening' }
    },
    data() {
        return {
            dialogVisible: true,        // 開始遊戲 Dialog
            exitDialogVisible: false,   // 退出確認 Dialog 
            isGameActive: false,
            isFinished: false,
            isExitConfirmed: false,     // 退出確認狀態


            quizAvatarPath: require('@/assets/image/quiz-avatar.png'),
            heroAvatarPath: require('@/assets/image/hero-avatar.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),

            currentScore: 0,
            currentCombo: 0,            // 連擊數
            maxQuestions: 50,           // 最大題目數 
            questionCount: 0,           //已回答題目數 
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
    methods: {
        goBack() {
            this.$router.push('/competition');
        },
        handleGameStartClose() {
            this.dialogVisible = false;
            this.goBack();
        },
        handleBackClick() {
            if (this.isFinished || this.isExitConfirmed) {
                this.goBack();
                return;
            }
            if (this.questionCount === 1 && !this.selectedAnswer) {
                this.goBack();
                return;
            }
            this.exitDialogVisible = true;
        },

        playAudio() {
            if (this.gameType !== 'listening') return;

            console.log('播放音檔: ' + this.currentQuestion.title);
            // 語音合成測試
            const utterance = new SpeechSynthesisUtterance(this.currentQuestion.title);
            utterance.lang = 'en-US';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },

        startGame() {
            this.dialogVisible = false;
            this.isGameActive = true;
            this.isFinished = false;
            this.isExitConfirmed = false;
            this.currentScore = 0;
            this.currentCombo = 0;
            this.questionCount = 0;
            this.loadQuestion();
        },

        loadQuestion() {
            if (this.questionCount >= this.maxQuestions) {
                this.endGame();
                return;
            }
            this.questionCount++;
            this.selectedAnswer = null;

            // 根據類型產生模擬題目
            if (this.gameType === 'reading') {
                // --- 閱讀模式 (題英文 -> 選中文) ---
                this.currentQuestion = {
                    title: 'Banana', // 顯示的大字
                    correctValue: 'banana',
                    options: [
                        { value: 'banana', label: '香蕉' },
                        { value: 'apple', label: '蘋果' },
                        { value: 'cat', label: '貓咪' },
                        { value: 'dog', label: '狗狗' },
                    ]
                };
            } else {
                // --- 聽力模式 (題音檔 -> 選英文) ---
                this.currentQuestion = {
                    title: 'apple', // 唸出來的字
                    correctValue: 'apple',
                    options: [
                        { value: 'apple', label: 'Apple' },
                        { value: 'ten', label: 'Ten' },
                        { value: 'pen', label: 'Pen' },
                        { value: 'puppy', label: 'Puppy' },
                    ]
                };

                // 聽力題自動播放
                this.$nextTick(() => {
                    this.playAudio();
                });
            }
        },

        selectAnswerAndSubmit(value) {
            this.selectedAnswer = value;
            this.submitAnswer();
        },

        submitAnswer() {
            if (this.selectedAnswer === this.currentQuestion.correctValue) {
                this.currentScore++;
                this.currentCombo++;
                console.log('回答正確！');
            } else {
                console.log('回答錯誤！連擊繼續。');
            }

            // 稍微延遲讓用戶看到點擊效果
            setTimeout(() => {
                this.selectedAnswer = null;
                this.loadQuestion();
            }, 300);
        },

        endGame() {
            this.isGameActive = false;
            this.finalScore = this.currentScore * 100;

            const today = new Date().toDateString();
            localStorage.setItem('dailyChallengeCompletionDate', today);

            this.isFinished = true;
            if (this.questionCount < this.maxQuestions) {
                this.isExitConfirmed = true; // 如果沒答完就是中途退出
            } else {
                this.isExitConfirmed = false;
            }
            console.log(`遊戲結束！總分: ${this.finalScore}`);
        },

        confirmExit() {
            this.exitDialogVisible = false;
            this.isGameActive = false;
            this.isExitConfirmed = true;
            this.endGame();
        },

        resumeGame() {
            this.exitDialogVisible = false;
        }
    }
};
</script>

<style lang="scss" scoped>
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

.header-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 30px;

    .top-link {
        @include card-return-text;
        position: static;
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
        font-size: 9rem;
        margin-bottom: 24px;
    }
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
        color: $main-quiz-blue;
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
    @include game-result-card
}

.result-back-btn {
    @include result-back-btn
}

.exit-confirm-modal {
    @include exit-confirm-modal
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