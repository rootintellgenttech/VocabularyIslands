<template>
    <div class="quiz-page">
        <div v-if="isGameActive || isFinished || isExitConfirmed"
            :class="['main-card', { 'is-finished-mode': isFinished || isExitConfirmed }]">
            <template v-if="isGameActive && !isFinished && !isExitConfirmed">
                <div class="header-wrap">
                    <div class="top-link" @click="handleBackClick">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>
                    <div class="game-header">
                        <div class="star-count">
                            <i class="fa-regular fa-clock" style="color: #404E4E;margin-right: 8px;"></i>
                            <span style="font-weight: bold; font-size: 20px;">{{ timeLeft }}s</span>
                        </div>
                        <div class="timer-bar">
                            <el-progress :show-text="false" :stroke-width="26" :percentage="timerPercentage"
                                status="exception" class="timer-progress"></el-progress>
                        </div>
                    </div>
                </div>

                <div class="question-content">
                    <div class="question-wrap">
                        <h1 class="question-title">{{ currentQuestion ? currentQuestion.question_text : '' }}</h1>
                    </div>

                    <p class="instruction-text">請聽音檔並選擇正確的英文單字</p>

                    <div class="options-grid">
                        <button v-for="(option, index) in currentOptions" :key="index"
                            :class="['option-btn', { 'is-selected': tempSelectedAnswer === option.id }]"
                            @click="handleOptionClick(option)">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    <el-button class="submit-btn" :disabled="!tempSelectedAnswer" @click="handleQuestionSubmit">
                        提交
                    </el-button>
                </div>
            </template>

            <template v-else-if="isFinished || isExitConfirmed">
                <div class="game-result-card">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="result-avatar">
                    <h2 class="result-title">{{ isExitConfirmed ? '挑戰中止' : '挑戰完成!' }}</h2>
                    <p class="result-score">你獲得了 {{ finalScore }} 積分</p>
                    <p class="correct-quiz-count">總計答對 {{ correctCount }} 題</p>
                </div>
                <button class="result-back-btn" @click="goBack">返回</button>
            </template>
        </div>

        <el-dialog custom-class="start-modal" :visible.sync="dialogVisible" width="450px" center
            :close-on-click-modal="false" :show-close="false">
            <div class="dialog-content">
                <img :src="heroAvatarPath" alt="英雄吉祥物" class="dialog-avatar">
                <h3 class="title">準備好開始挑戰了嗎？</h3>
                <p class="description">目標是在 1 分鐘內回答完 50 題抽選！</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button type="primary" @click="startGame">開始遊戲</el-button>
            </span>
        </el-dialog>

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="550px" center
            :close-on-click-modal="false" :show-close="false" append-to-body>
            <div class="dialog-content">
                <h3 class="title exam-warning-title"><i class="fas fa-exclamation-circle"></i> 確定要離開嗎？</h3>
                <p class="description" style="color: #e74c3c; font-weight: bold;">
                    ⚠️ 注意：中途離開將會自動將剩餘題目視為「未填寫」並立即結算。
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
    name: 'SpeedQuiz',
    props: ['gameId', 'gameTitle', 'gameLevel', 'gameType'],
    data() {
        return {
            dialogVisible: true,
            exitDialogVisible: false,
            isGameActive: false,
            isFinished: false,
            isExitConfirmed: false,

            heroAvatarPath: require('@/assets/image/hero-avatar.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
            quizAvatarPath: require('@/assets/image/quiz-avatar.png'),

            totalTime: 60,
            timeLeft: 60,
            timerInterval: null,

            questionsList: [],
            userAnswers: [],
            questionCount: 1,
            tempSelectedAnswer: null,
            correctCount: 0,
            finalScore: 0
        };
    },
    computed: {
        timerPercentage() { return (this.timeLeft / this.totalTime) * 100; },
        currentQuestion() { return this.questionsList[this.questionCount - 1] || null; },
        currentOptions() { return this.currentQuestion ? this.currentQuestion.options : []; }
    },
    methods: {
        async startGame() {
            const loading = this.$loading({ lock: true, text: '正在準備題目...', background: 'rgba(0, 0, 0, 0.7)' });
            try {
                const island = this.gameLevel === 'primary' ? '300字島' : '1200字島';
                const targetNum = this.gameLevel === 'primary' ? 300 : 1200; //  國中抓 1200 題
                const response = await api.post('/questionbank/generate/', {
                    "島嶼": island,
                    "題數": targetNum,
                    "題型": "中翻英",
                    "include_answer": true
                });
                this.questionsList = response.data.sort(() => 0.5 - Math.random()).slice(0, 50);
                this.dialogVisible = false;
                this.isGameActive = true;
                this.startTimer();
            } catch (err) {
                this.$message.error('獲取題目失敗');
                this.goBack();
            } finally { loading.close(); }
        },
        startTimer() {
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.processFinalSubmit();
                }
            }, 1000);
        },
        handleOptionClick(option) {
            this.tempSelectedAnswer = option.id;
            this.playAudio(option.text);
        },
        // 存檔並判斷下一題
        handleQuestionSubmit() {
            if (!this.tempSelectedAnswer) return;

            this.userAnswers.push({
                question_id: this.currentQuestion.id,
                option_id: this.tempSelectedAnswer
            });

            if (this.questionCount < 50) {
                this.questionCount++;
                this.tempSelectedAnswer = null; // 重置下一題的選取
            } else {
                this.processFinalSubmit();
            }
        },
        async processFinalSubmit() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            const loading = this.$loading({ lock: true, text: '結算中...', background: 'rgba(0, 0, 0, 0.7)' });
            try {
                const finalAnswers = [...this.userAnswers];
                for (let i = finalAnswers.length; i < 50; i++) {
                    finalAnswers.push({ question_id: this.questionsList[i].id, option_id: null });
                }

                const checkRes = await api.post('/questionbank/check/', {
                    answers: finalAnswers,
                    island: this.gameLevel === 'primary' ? '300字島' : '1200字島',
                    unit: "競技場挑戰",
                    stage: "速度對決"
                });

                this.correctCount = checkRes.data.summary.correct_count;
                this.finalScore = this.correctCount * 10;

                await api.post('/students/competition-score/', { score: this.finalScore });
                localStorage.setItem('dailyChallengeCompletionDate', new Date().toDateString());

                this.isGameActive = false;
                this.isFinished = true;
            } catch (err) {
                this.$message.error('結算失敗');
            } finally { loading.close(); }
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
            if (this.userAnswers.length === 0) this.goBack();
            else this.exitDialogVisible = true;
        },
        async confirmExit() {
            this.exitDialogVisible = false;
            this.isExitConfirmed = true;
            await this.processFinalSubmit();
        },
        goBack() { this.$router.push('/competition'); },
        handleClose() { this.goBack(); }
    },
    beforeDestroy() { if (this.timerInterval) clearInterval(this.timerInterval); }
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
                margin-right: 12px;
            }
        }

    }
}

.question-content {
    @include main-card-content
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
    @include option-grid
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

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .question-content .question-title {
        font-size: 7rem;
        margin-bottom: 0;
    }

    .instruction-text {
        font-size: 24px;
    }
}
</style>