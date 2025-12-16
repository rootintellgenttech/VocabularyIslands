<template>
    <div class="wheel-page">

        <div v-if="isGameActive || isFinished || isExitConfirmed"
            :class="['main-card', { 'is-finished-mode': isFinished || isExitConfirmed }]">

            <template v-if="isGameActive && !isFinished && !isExitConfirmed">
                <div class="header-wrap">
                    <div class="top-link" @click="handleBackClick">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>
                    <div class="game-status-display">
                        <span class="turns-display">回合: {{ questionCount - 1 }} / 5</span>
                    </div>
                </div>

                <div v-if="isWheelPhase" class="wheel-stage">
                    <LuckyWheel ref="myLucky" width="300px" height="300px" :prizes="prizes" :blocks="blocks"
                        :buttons="buttons" @start="startCallback" @end="endCallback" />
                    <p class="instruction-text">點選轉盤開始挑戰</p>
                </div>

                <div v-else-if="isQuestionPhase" class="question-stage question-mode question-content">
                    <div class="question-wrap">
                        <div class="audio-trigger" @click="playAudio(currentQuestion)">
                            <i class="fas fa-volume-up"></i>
                        </div>
                        <h1 class="question-title">{{ currentQuestion.title }}</h1>
                    </div>

                    <p class="instruction-text">選擇聽到的內容</p>

                    <div class="options-grid">
                        <button v-for="(option, index) in currentQuestion.options" :key="index"
                            :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                            @click="selectAnswerAndSubmit(option.value, index)">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>
            </template>

            <template v-else-if="isFinished || isExitConfirmed">
                <div class="game-result-card final-result">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="result-avatar">
                    <h2 class="result-title">挑戰{{ isExitConfirmed ? '中止' : '完成' }}!</h2>
                    <p class="result-score">你獲得了 {{ finalScore }} 積分</p>
                </div>
                <button class="result-back-btn" @click="goBack">返回</button>
            </template>
        </div>

        <el-dialog custom-class="exit-confirm-modal" :visible.sync="exitDialogVisible" width="350px" center
            :close-on-click-modal="false" :show-close="false" append-to-body>

            <div class="dialog-content game-result-style">
                <img :src="quizAvatarPath" alt="Quiz Avatar" class="result-avatar dialog-img">

                <h3 class="title">確定要結束遊戲嗎</h3>

                <p class="description">分數將立即結算<br>您將失去今天的挑戰機會!</p>

                <p class="current-score-preview">
                    當前得分: <span>{{ correctAnswers * 10 }}</span> 積分
                </p>
            </div>

            <span slot="footer" class="dialog-footer two-btns">
                <el-button @click="resumeGame" class="btn-resume">繼續遊戲</el-button>
                <el-button type="danger" @click="confirmExitGame" class="btn-end">結束遊戲</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
// 轉盤題目 (10個)
const WHEEL_PRIZES = [
    '幸運字母', '神奇字母', '魔法字母', '飛天字母', '大地字母',
    '海洋字母', '火花字母', '風之字母', '木之字母', '花枝字母'
];

// 字母數據源
const WORD_SOURCE = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...

export default {
    name: 'AlphabetWheelQuiz',
    props: {
        gameId: { type: String, required: true },
        gameTitle: { type: String, default: '字母轉盤樂' },
        gameLevel: { type: String, required: true },
        gameType: { type: String, default: 'reading' }
    },
    data() {
        const prizesList = WHEEL_PRIZES.map((text, index) => ({
            fonts: [{ text, top: '10%', fontSize: '16px', fontColor: '#333', fontWeight: 'bold' }],
            background: index % 2 === 0 ? '#35D0C0' : '#DAE2E7'
        }));

        return {
            // 遊戲階段控制
            isWheelPhase: true,
            isQuestionPhase: false,
            isGameActive: true,
            isFinished: false,
            isExitConfirmed: false,
            exitDialogVisible: false,
            blocks: [{ padding: '13px', background: '#097C70' }],
            prizes: prizesList,
            buttons: [
                {
                    radius: '40%',
                    background: '#077065',
                },
                {
                    radius: '35%',
                    background: '#38ADA2',
                    pointer: true,
                    fonts: [{ text: '開始', top: '-10px', fontColor: '#333', fontSize: '24px', fontWeight: 'bold' }]
                }],

            // 遊戲數據
            maxTurns: 5,
            questionCount: 1, // 當前回合數 (從 1 開始)
            correctAnswers: 0,
            finalScore: 0,

            // 題目數據
            selectedAnswer: null,
            currentQuestion: {
                title: '', // 隨機字母
                correctAnswer: '',
                options: [] // 4 個選項 (隨機字母)
            },

            quizAvatarPath: require('@/assets/image/quiz-avatar.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
        };
    },
    methods: {
        goBack() {
            // 返回競技島
            this.$router.push('/competition');
        },

     handleBackClick() {
            // 1. 如果遊戲已經結束或已經確認退出，直接返回上一頁
            if (this.isFinished || this.isExitConfirmed) {
                this.goBack();
                return;
            }
            // 2. 如果是第一回合，且還沒有選擇任何答案 (無論是在轉盤階段還是在看題目階段)
            // 直接退出，不顯示確認視窗
            if (this.questionCount === 1 && !this.selectedAnswer) {
                 this.goBack();
                 return;
            }
            // 3. 其他情況 (第 2 回合以後，或是已經點了答案正在跑動畫)，顯示確認視窗
            this.exitDialogVisible = true;
        },
        resumeGame() {
            this.exitDialogVisible = false;
        },

        confirmExitGame() {
            this.exitDialogVisible = false;
            if (this.isGameActive) {
                this.isGameActive = false;
                this.isExitConfirmed = true;
                this.endGame();
            }
        },

        startCallback() {
            if (this.questionCount > this.maxTurns) {
                this.endGame();
                return;
            }
            this.$refs.myLucky.play();
            const prizeIndex = Math.floor(Math.random() * this.prizes.length);

            setTimeout(() => {
                this.$refs.myLucky.stop(prizeIndex);
            }, 3000);
        },

        endCallback(prize) {
            console.log(`轉盤結束，中獎：${prize.fonts[0].text}`);
            this.isWheelPhase = false;
            this.isQuestionPhase = true;
            this.loadQuestion();
            this.$nextTick(() => {
                this.playAudio(this.currentQuestion);
            });
        },

        getRandomAlphabet() {
            const randomIndex = Math.floor(Math.random() * WORD_SOURCE.length);
            return WORD_SOURCE[randomIndex];
        },

        // 產生題目和選項
        loadQuestion() {
            this.selectedAnswer = null; // 重置選中的答案

            const correctWord = this.getRandomAlphabet(); // 隨機選一個作為正確答案 (例如 'A')
            const options = [correctWord];

            // 生成其他 3 個錯誤選項
            while (options.length < 4) {
                const randomWord = this.getRandomAlphabet();
                if (!options.includes(randomWord)) {
                    options.push(randomWord);
                }
            }

            // 隨機打亂選項順序
            options.sort(() => Math.random() - 0.5);

            this.currentQuestion = {
                title: correctWord,
                correctAnswer: correctWord,
                options: options.map(word => ({
                    value: word,
                    label: word
                }))
            };

            console.log(`回合 ${this.questionCount}: 題目 ${correctWord}, 選項: ${options.join(', ')}`);
        },

        // 點擊選項並提交
        selectAnswerAndSubmit(value, index) {
            this.selectedAnswer = value;

            // 模擬對錯判斷
            const isCorrect = value === this.currentQuestion.correctAnswer;

            // 處理得分
            if (isCorrect) {
                this.correctAnswers++;
                console.log(`回合 ${this.questionCount} 答案正確！總答對數: ${this.correctAnswers}`);
            } else {
                console.log(`回合 ${this.questionCount} 答案錯誤！正確答案是 ${this.currentQuestion.correctAnswer}`);
            }

            // 模擬 API 呼叫 (不顯示結果卡，直接進入下一回合/結束)
            setTimeout(() => {
                this.moveToNextTurn();
            }, 500); // 稍微延遲一下，給用戶看到點擊效果
        },

        // 推進回合
        moveToNextTurn() {
            // 檢查是否結束遊戲
            if (this.questionCount >= this.maxTurns) {
                this.endGame();
            } else {
                this.questionCount++;
                this.returnToWheel();
            }
        },

        returnToWheel() {
            this.isQuestionPhase = false;
            this.isWheelPhase = true;
        },

        endGame() {
            this.isGameActive = false;
            // 1 題 10 分
            this.finalScore = this.correctAnswers * 10;

            // 標記今日挑戰已完成
            const today = new Date().toDateString();
            localStorage.setItem('dailyChallengeCompletionDate', today);

            this.isFinished = true;
            console.log(`遊戲結束/中途退出！總分: ${this.finalScore}，答對題數: ${this.correctAnswers}`);
        },

        // 播放發音 (使用 Web Speech API 唸出題目字母)
        playAudio(question) {
            const wordToSpeak = question.title; // 唸出題目字母 (如 'A')
            if (!wordToSpeak) return;

            console.log('播放發音: ' + wordToSpeak);

            const utterance = new SpeechSynthesisUtterance(wordToSpeak);
            utterance.lang = 'en-US';
            utterance.rate = 0.2;

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },
    },
    mounted() {
        this.isWheelPhase = true;
        this.isQuestionPhase = false;
        this.isGameActive = true;
        this.isFinished = false;
    }
};
</script>


<style lang="scss">
.wheel-page {
    @include main-card-page;
}

.game-status-display {
    @include flex-center;
    gap: 0 20px;
    font-size: 20px;
    font-weight: 600;
    color: $main-dark-blue
}

.wheel-stage {
    @include flex-center;
    flex-direction: column;
    margin-top: 40px;

    .instruction-text {
        font-size: 20px;
        font-weight: 600;
        margin-top: 24px;
        color: $main-dark-blue;
    }
}


.question-content {
    @include main-card-content
}

.instruction-text {
    font-size: 32px;
    font-weight: 600;
    color: $main-black-text;
    margin-bottom: 30px;
    text-align: center;
}

.options-grid {
    @include option-grid
}

.question-stage {
    width: 100%;
    @include flex-center;
    flex-direction: column;

    .content-display {
        @include main-card-content;
        height: 100%;
        padding: 0;
        border: 4px solid #DAE2E7;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .question-wrap {
            margin-top: 24px;
            @include flex-center;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 20px;

            .audio-trigger {
                font-size: 40px;
                color: #26C9B9;
                margin-bottom: 15px;
            }

            .card-image {
                max-width: 90%;
                max-height: 250px;
                object-fit: contain;
            }
        }
    }

    .btns i {
        // 沿用 learn-page 的按鈕樣式
        height: 60px;
        width: 60px;
        font-size: 60px;
        margin: 20px 15px;
    }
}


.main-card {
    @include main-card;
    padding-bottom: 32px;

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
        justify-content: space-between;

        .top-link {
            @include card-return-text;
            text-wrap: nowrap;
            margin-bottom: 0;
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

.game-result-card {
    @include game-result-card
}

.result-back-btn {
    @include result-back-btn
}

.exit-confirm-modal {
    @include exit-confirm-modal
}
</style>