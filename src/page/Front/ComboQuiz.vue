<template>
    <div class="quiz-page">
        <div v-if="isGameActive || isFinished || isExitConfirmed"
            :class="['main-card', { 'is-finished-mode': isFinished || isExitConfirmed }]">

            <template v-if="isGameActive && !isFinished && !isExitConfirmed">
                <div class="header-wrap">
                    <div class="top-link" @click="handleBackClick">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>
                    <div class="game-status-display">
                        <span class="turns-display">進度: {{ questionCount }} / 50</span>
                    </div>
                </div>

                <div class="question-content">
                    <div class="question-wrap">
                        <div class="audio-trigger big-icon" @click="playAudio(currentQuestionText)">
                            <i class="fas fa-volume-up"></i>
                        </div>
                    </div>

                    <p class="instruction-text">請選擇聽到的中文意思</p>

                    <div class="options-grid">
                        <button v-for="(option, index) in currentOptions" :key="index"
                            :class="['option-btn', { 'is-selected': tempSelectedAnswer === option.id }]"
                            @click="handleOptionClick(option)">
                            {{ option.text }}
                        </button>
                    </div>


                    <el-button class="submit-btn" :disabled="!tempSelectedAnswer" @click="handleQuestionSubmit">
                        提交
                    </el-button>
                </div>
            </template>

            <template v-else-if="isFinished || isExitConfirmed">
                <div class="game-result-card final-result">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="result-avatar">
                    <h2 class="result-title">{{ isExitConfirmed ? '挑戰中止' : '挑戰完成!' }}</h2>
                    <p class="result-score">獲得了 {{ finalScore }} 積分</p>
                    <p class="correct-quiz-count">總計答對：{{ correctCount }} / 50</p>
                </div>
                <button class="result-back-btn" @click="goBack">返回</button>
            </template>
        </div>

        <el-dialog custom-class="start-modal" :visible.sync="dialogVisible" width="400px" center
            :close-on-click-modal="false" :show-close="false">
            <div class="dialog-content">
                <img :src="heroAvatarPath" alt="吉祥物" class="dialog-avatar">
                <h3 class="title">準備好開始挑戰了嗎？</h3>
                <p class="description">快速回答完 50 題「英翻中」聽力挑戰！</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleGameStartClose">取 消</el-button>
                <el-button type="primary" @click="startGame">開始遊戲</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="550px" center
            :close-on-click-modal="false" :show-close="false" append-to-body>
            <div class="dialog-content">
                <h3 class="title exam-warning-title"><i class="fas fa-exclamation-circle"></i> 確定要離開嗎？</h3>
                <p class="description" style="color: #AA1F0F; font-weight: bold;">
                     注意：中途離開將會自動將剩餘題目視為「未填寫」並直接結算，這將導致您失去今天的挑戰機會。
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

export default {
    name: 'ComboQuiz',
    props: ['gameId', 'gameTitle', 'gameLevel', 'gameType'],
    data() {
        return {
            dialogVisible: true,
            exitDialogVisible: false,
            isGameActive: false,
            isFinished: false,
            isExitConfirmed: false,

            questionsList: [],
            userAnswers: [],
            questionCount: 1,
            tempSelectedAnswer: null,
            correctCount: 0,
            finalScore: 0,

            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
            quizAvatarPath: require('@/assets/image/quiz-avatar.png'),
            heroAvatarPath: require('@/assets/image/hero-avatar.png'),
        };
    },
    computed: {
        currentQuestion() {
            return this.questionsList[this.questionCount - 1] || null;
        },
        currentQuestionText() {
            return this.currentQuestion ? this.currentQuestion.question_text : '';
        },
        currentOptions() {
            return this.currentQuestion ? this.currentQuestion.options : [];
        }
    },
    methods: {
        async startGame() {
            const loading = this.$loading({ lock: true, text: '正在獲取 50 道挑戰題目...', background: 'rgba(0, 0, 0, 0.7)' });
            try {
                const island = this.gameLevel === 'primary' ? '300字島' : '1200字島';

                const response = await api.post('/questionbank/generate/', {
                    "島嶼": island,
                    "題數": 50,
                    "題型": "英翻中",
                    "include_answer": true
                });

                this.questionsList = response.data;
                this.dialogVisible = false;
                this.isGameActive = true;
                this.$nextTick(() => {
                    if (this.currentQuestionText) {
                        this.playAudio(this.currentQuestionText);
                    }
                });
            } catch (err) {
                this.$message.error('獲取題目失敗');
                this.goBack();
            } finally {
                loading.close();
            }
        },
        handleOptionClick(option) {
            this.tempSelectedAnswer = option.id;
        },
        async handleQuestionSubmit() {
            if (!this.tempSelectedAnswer) return;

            const loading = this.$loading({ lock: true, text: '校對中...', background: 'rgba(0, 0, 0, 0.3)' });

            try {
                // 即時將「當前這一題」送去校對
                const currentAnswer = {
                    question_id: this.currentQuestion.id,
                    option_id: this.tempSelectedAnswer
                };

                const checkRes = await api.post('/questionbank/check/', {
                    answers: [currentAnswer], // 只送一題
                    island: this.gameLevel === 'primary' ? '300字島' : '1200字島',
                    unit: "競技場挑戰",
                    stage: "完美連擊"
                });

                const result = checkRes.data.results[0]; // 取得這一題的結果

                if (result.is_correct) {
                    // 答對了：存入總答案清單，增加計數，繼續下一題
                    this.userAnswers.push(currentAnswer);
                    this.correctCount++;

                    if (this.questionCount < 50) {
                        this.questionCount++;
                        this.tempSelectedAnswer = null;
                        loading.close();
                    } else {
                        // 滿分 50 題達成
                        loading.close();
                        await this.processFinalSubmit();
                    }
                } else {
                    // 答錯了：連擊中斷，立即補齊剩餘題目並結束
                    loading.close();
                    this.userAnswers.push(currentAnswer); // 加入這一題錯題
                    await this.confirmExit(); // 呼叫補齊並結算的邏輯
                }

            } catch (err) {
                loading.close();
                this.$message.error('校對失敗，請檢查網路');
            }
        },

        async processFinalSubmit() {
            const loading = this.$loading({ lock: true, text: '結算總分...', background: 'rgba(0, 0, 0, 0.7)' });
            try {
                // 計算總分 (每題 10 分)
                this.finalScore = this.correctCount * 10;

                await api.post('/students/competition-score/', {
                    score: this.finalScore
                });

                //  鎖定今日挑戰機會
                localStorage.setItem('dailyChallengeCompletionDate', new Date().toDateString());

                this.isGameActive = false;
                this.isFinished = true;
            } catch (err) {
                this.$message.error('積分上傳失敗');
            } finally {
                loading.close();
            }
        },

        async confirmExit() {
            this.exitDialogVisible = false;

            // 找出剩下還沒做到的題目，全部塞 null
            const answeredCount = this.userAnswers.length; // 包含剛才做錯的那題
            if (answeredCount < 50) {
                for (let i = answeredCount; i < 50; i++) {
                    this.userAnswers.push({
                        question_id: this.questionsList[i].id,
                        option_id: null
                    });
                }

                await api.post('/questionbank/check/', {
                    answers: this.userAnswers,
                    island: this.gameLevel === 'primary' ? '300字島' : '1200字島',
                    unit: "競技場挑戰",
                    stage: "完美連擊"
                });
            }

            this.isExitConfirmed = true; // 觸發結束畫面
            await this.processFinalSubmit();
        },
        playAudio(text) {
            if (!text) return;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },
        handleBackClick() {
            if (this.userAnswers.length === 0) {
                this.goBack();
            } else {
                this.exitDialogVisible = true;
            }
        },
        goBack() { this.$router.push('/competition'); },
        handleGameStartClose() { this.goBack(); }
    },
    watch: {
        questionCount(newVal) {
            if (this.isGameActive && !this.isFinished) {
                this.$nextTick(() => {
                    this.playAudio(this.currentQuestionText);
                });
            }
        }
    },
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

.submit-btn {
    padding: 20px 0;
    @include qa-submit-continue-btn;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
}


.question-content {
    @include main-card-content;
    margin-top: 4%;

    .audio-trigger i {
        font-size: 10rem;
        margin-bottom: 16px;
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
    margin-top: 8%;
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