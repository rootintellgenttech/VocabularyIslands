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
                        <span class="turns-display">回合: {{ questionCount }} / 5</span>
                    </div>
                </div>

                <div v-if="isWheelPhase" class="wheel-stage">
                    <LuckyWheel ref="myLucky" width="300px" height="300px" :prizes="prizes" :blocks="blocks"
                        :buttons="buttons" @start="startCallback" @end="endCallback" />
                    <p class="instruction-text">點選轉盤開始挑戰</p>
                </div>

                <div v-else-if="isQuestionPhase" class="question-stage question-content">
                    <div class="question-wrap">
                        <div class="audio-trigger" @click="playAudio(currentQuestionText)">
                            <i class="fas fa-volume-up"></i>
                        </div>
                        <h1 class="question-title">{{ currentQuestionText }}</h1>
                    </div>
                    <p class="instruction-text">選擇聽到的內容</p>

                    <div class="options-grid">
                        <button v-for="(option, index) in currentOptions" :key="index"
                            :class="['option-btn', { 'is-selected': tempSelectedAnswer === option.id }]"
                            @click="handleOptionClick(option)">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>

                    <button class="submit-btn" :disabled="!tempSelectedAnswer" @click="handleQuestionSubmit">
                        提交
                    </button>
                </div>
            </template>

            <template v-else-if="isFinished || isExitConfirmed">
                <div class="game-result-card final-result">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="result-avatar">
                    <h2 class="result-title">挑戰{{ isExitConfirmed ? '中止' : '完成' }}!</h2>
                    <p class="result-score">獲得了 {{ finalScore }} 積分</p>
                    <p v-if="!isExitConfirmed" class="correct-quiz-count">總計答對 {{ correctCount }} 題</p>
                </div>
                <button class="result-back-btn" @click="goBack">返回</button>
            </template>
        </div>
        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="480px" center
            :close-on-click-modal="false" :show-close="false" append-to-body>
            <div class="dialog-content">
                <h3 class="title exam-warning-title">
                    <i class="fas fa-exclamation-circle"></i> 確定要離開考試嗎？
                </h3>
                <p class="description" style="color: #e74c3c; font-weight: bold;">
                    ⚠️ 注意：中途離開將會自動將剩餘題目視為「未填寫」並直接提交，這將導致您失去今天的挑戰機會。
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="exitDialogVisible = false">繼續作答</el-button>
                <el-button type="danger" @click="confirmExit">確定離開</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import api from '@/config/api';

const WHEEL_PRIZES = ['幸運字母', '神奇字母', '魔法字母', '飛天字母', '大地字母', '海洋字母', '火花字母', '風之字母', '木之字母', '花枝字母'];

export default {
    name: 'AlphabetWheelQuiz',
    props: ['gameId', 'gameTitle', 'questionsData', 'gameLevel', 'gameType'],
    data() {
        const prizesList = WHEEL_PRIZES.map((text, index) => ({
            fonts: [{ text, top: '10%', fontSize: '16px', fontColor: '#333', fontWeight: 'bold' }],
            background: index % 2 === 0 ? '#35D0C0' : '#DAE2E7'
        }));
        return {
            isWheelPhase: true,
            isQuestionPhase: false,
            isGameActive: true,
            isFinished: false,
            isExitConfirmed: false,
            exitDialogVisible: false,
            userAnswers: [], // 已提交答案存放處
            questionCount: 1,
            isGameActive: true,
            isFinished: false,
            blocks: [{ padding: '13px', background: '#097C70' }],
            prizes: prizesList,
            buttons: [{ radius: '40%', background: '#077065' }, { radius: '35%', background: '#38ADA2', pointer: true, fonts: [{ text: '開始', top: '-10px', fontColor: '#333', fontSize: '24px', fontWeight: 'bold' }] }],
            finalScore: 0,
            correctCount: 0, // 從 API check 回傳的正確題數
            tempSelectedAnswer: null, // 當前題目的暫存選擇
            userAnswers: [], // 儲存準備交卷的答案

            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
            quizAvatarPath: require('@/assets/image/quiz-avatar.png'),
        };
    },
    computed: {
        currentQuestion() {
            if (!this.questionsData || this.questionsData.length === 0) return null;
            return this.questionsData[this.questionCount - 1];
        },
        currentQuestionText() {
            return this.currentQuestion ? this.currentQuestion.question_text : '';
        },
        currentOptions() {
            return this.currentQuestion ? this.currentQuestion.options : [];
        }
    },
    methods: {
        handleBackClick() {
            // 如果還沒做過任何一題，直接回上一頁且不計分
            if (this.userAnswers.length === 0) {
                this.goBack();
                return;
            }
            // 只要做過一題，就彈窗警告
            this.exitDialogVisible = true;
        },
        startCallback() {
            this.$refs.myLucky.play();
            setTimeout(() => {
                this.$refs.myLucky.stop(Math.floor(Math.random() * this.prizes.length));
            }, 2000);
        },
        endCallback() {
            this.isWheelPhase = false;
            this.isQuestionPhase = true;
            this.tempSelectedAnswer = null;

            //  渲染完成後才執行播放
            this.$nextTick(() => {
                if (this.currentQuestionText) {
                    this.playAudio(this.currentQuestionText);
                }
            });
        },
        handleOptionClick(option) {
            this.tempSelectedAnswer = option.id; // 存儲 option_id
            this.tempSelectedText = option.text; // 存儲文字用於 UI 顯示
            this.playAudio(option.text);
        },

        // 每題點擊提交 
        handleQuestionSubmit() {
            if (!this.currentQuestion || !this.tempSelectedAnswer) return;

            this.userAnswers.push({
                question_id: this.currentQuestion.id,
                option_id: this.tempSelectedAnswer
            });

            if (this.questionCount < 5) {
                this.questionCount++;
                this.isQuestionPhase = false;
                this.isWheelPhase = true;
            } else {
                this.processFinalSubmit();
            }
        },
        async confirmExit() {
            this.exitDialogVisible = false;

            // 自動補齊剩餘題目為 null
            const remainingCount = 5 - this.userAnswers.length;
            if (remainingCount > 0) {
                // 從目前的題目索引開始補齊到第 5 題
                for (let i = this.userAnswers.length; i < 5; i++) {
                    const q = this.questionsData[i];
                    this.userAnswers.push({
                        question_id: q.external_id,
                        selected_option: null
                    });
                }
            }

            // 執行正式提交
            await this.processFinalSubmit();
        },

        // 統一結算方法
        async processFinalSubmit() {
            const loading = this.$loading({ lock: true, text: '正在結算成績...', background: 'rgba(0, 0, 0, 0.7)' });
            try {
                const checkPayload = {
                    answers: this.userAnswers,
                    island: "ABC啟航島",
                    unit: this.currentQuestion.unit,
                    stage: "A-Z"
                };

                const checkRes = await api.post('/questionbank/check/', checkPayload);

                this.correctCount = checkRes.data.summary.correct_count;
                this.finalScore = this.correctCount * 10;

                await api.post('/students/competition-score/', {
                    score: this.finalScore
                });

                localStorage.setItem('dailyChallengeCompletionDate', new Date().toDateString());
                this.isGameActive = false;
                this.isFinished = true;
            } catch (error) {
                console.error('結算失敗:', error);
                this.$message.error('系統結算失敗');
            } finally {
                loading.close();
            }
        },
        goBack() {
            this.$router.push('/competition');
        },
        playAudio(text) {
            if (!text) return;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },
    },
    watch: {
        // MP3自動播放
        questionCount(newVal) {
            if (this.isQuestionPhase) {
                this.$nextTick(() => {
                    this.playAudio(this.currentQuestionText);
                });
            }
        }
    },
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
        height: 60px;
        width: 60px;
        font-size: 60px;
        margin: 20px 15px;
    }
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

.submit-btn {
    padding: 20px 0;
    @include qa-submit-continue-btn;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
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