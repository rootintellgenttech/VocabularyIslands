<template>
    <div class="hero-quiz-page">
        <div v-if="isLoading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <p>題目載入中...</p>
        </div>

        <div v-else-if="currentPhase === 'quiz'" class="quiz-container-wide">
            <el-row type="flex" justify="center" align="middle" :gutter="80" style="width: 100%; max-width: 1200px;">
                <el-col :xs="24" :md="10" class="left-image-col">
                    <img :src="tempAvatar" alt="Role" class="side-role-img desktop-img">

                    <div class="timer-bar-wrap" style="width: 80%; margin: 20px auto 0;">
                        <el-progress :text-inside="true" :stroke-width="26" :percentage="timerPercentage"
                            :format="formatTimerText" status="exception" class="timer-progress">
                        </el-progress>
                    </div>
                </el-col>

                <el-col :xs="24" :md="14">
                    <div class="main-card question-mode">
                        <div class="back-link" @click="handleQuizBack">
                            <i class="fas fa-angle-left"></i> 返回
                        </div>

                        <template v-if="currentQuestion">
                            <div class="exam-header-bar">
                                <div class="timer-area">
                                    <i class="fa-regular fa-clock" style="color: #404E4E;margin-right: 12px;"></i>
                                    <span class="timer-value">{{ questionTimeLeft }} s</span>
                                </div>
                                <div class="progress-area">
                                    <span class="progress-count">{{ currentQuestionIndex }} / {{ maxQuestions }}</span>
                                </div>
                            </div>

                            <img :src="tempAvatar" alt="Role" class="side-role-img mobile-img">
                            <div class="question-content">
                                <div class="question-wrap">
                                    <p class="question-title context-fill-title">
                                        <template v-for="(part, i) in currentQuestion.questionParts">
                                            <span :key="i + '-text'" v-if="part !== '_______'">{{ part }}</span>
                                            <span :key="i + '-fill'" v-else
                                                :class="['fill-placeholder', { 'filled': selectedAnswer }]">
                                                {{ selectedAnswerLabel ? selectedAnswerLabel : '_____' }}
                                            </span>
                                        </template>
                                    </p>
                                </div>
                                <p class="instruction-text">選擇空格內的正確答案</p>
                                <div class="options-grid">
                                    <button v-for="(option, index) in currentQuestion.options" :key="index"
                                        :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                                        @click="selectAnswer(option)" :disabled="isProcessing">
                                        {{ option.label }}
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </el-col>
            </el-row>
        </div>

        <div v-else-if="currentPhase === 'intro'" class="main-card">
            <div class="intro-content">
                <div class="back-link" @click="goBack">
                    <i class="fas fa-angle-left"></i> 返回
                </div>
                <div class="intro-main-area">
                    <img :src="introAvatar" alt="吉祥物" class="intro-avatar">
                    <div class="intro-text">
                        <h2>英雄試煉</h2>
                        <h2 class="intro-title">{{ stageName }}</h2>
                        <p class="exam-time">
                            共 20 題克漏字挑戰<br>
                            限時 5 分鐘，每一題 15 秒作答
                        </p>
                        <p class="intro-details">請仔細閱讀句子，選出正確的單字填入空格。</p>
                        <button class="intro-continue-btn" @click="startQuiz" :disabled="isLoading">
                            {{ isLoading ? '載入題目中...' : '開始挑戰' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="currentPhase === 'complete'" class="main-card result-mode">
            <div class="result-inner-card">
                <div class="back-link" @click="goBack()">
                    <i class="fas fa-angle-left"></i> 返回
                </div>

                <h2 class="result-title">{{ earnedStars > 0 ? '太棒了!' : '再接再厲' }}</h2>

                <img :src="wonderfulAvatarPath" alt="Result" class="result-avatar">

                <div v-if="earnedStars > 0" class="final-star">
                    <i v-for="n in 5" :key="n" style="color: #ffc940;" class="fas fa-star"
                        :class="{ 'filled': n <= earnedStars }"></i>
                </div>

                <p class="result-score">你獲得了 {{ earnedStars }} 顆星星</p>
            </div>
            <button class="result-back-btn" @click="goToResultDetail()">查看解答</button>
        </div>

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="480px" center
            :close-on-click-modal="false" :show-close="false">
            <div class="dialog-content">
                <h3 class="title exam-warning-title"><i class="fas fa-exclamation-circle"></i> 確定要離開嗎？</h3>
                <p class="description">中途結束將不會計算分數，進度將會遺失。</p>
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
    name: 'HeroQuizPage',
    props: {
        stageId: { type: String, required: true },
        stageName: { type: String, required: true },
        level: { type: String, default: 'primary' },
        unitName: { type: String, default: '' },
        wordCount: { type: String, default: '300' }
    },
    data() {
        return {
            currentPhase: 'intro',
            isLoading: true,
            introAvatar: require('@/assets/image/hero-avatar.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
            tempAvatar: require('@/assets/image/15sec.gif'),
            maxQuestions: 20,
            questionTimeLeft: 15,
            questionTimer: null,
            timeLimitMinutes: 5,
            currentQuestionIndex: 0,
            timeLeftSeconds: 0,
            timerInterval: null,
            selectedAnswer: null, // 存 ID
            selectedAnswerLabel: '', // 存文字顯示在空格
            currentQuestion: null,
            earnedStars: 0,
            isProcessing: false,
            exitDialogVisible: false,
            questionsList: [],
            userAnswers: [],
            reportData: []
        };
    },
    computed: {
        timerPercentage() {
            // (當前秒數 / 總秒數) * 100
            const p = (this.questionTimeLeft / 15) * 100;
            return Math.max(0, Math.min(100, p));
        },
        formattedTimeLeft() {
            const minutes = Math.floor(this.timeLeftSeconds / 60);
            const seconds = this.timeLeftSeconds % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    },
    mounted() {
        this.fetchQuestions();
    },
    methods: {
        formatTimerText() {
            return `${this.questionTimeLeft}s`;
        },
        async fetchQuestions() {
            this.isLoading = true;
            try {
                let payload = {};

                //定義需要「全島抓題」的特殊標籤清單
                const fullIslandLabels = ['800字複習', '1200字總複習', '會考大殿堂-1', '會考大殿堂-2'];

                // 判斷當前標籤是否在清單內
                if (fullIslandLabels.includes(this.stageName)) {
                    console.log(`✅ 進入會考大殿堂特殊複習模式: ${this.stageName}`);
                    payload = {
                        "島嶼": "1200字島",   // 強制指定 1200字島 (包含所有國中題)
                        "題型": "克漏字",      // 固定題型
                        "題數": 1200,
                        "include_answer": true
                    };
                } else {
                    //  一般關卡 (霧靄之境、永恆圖書館等) 維持原有邏輯
                    console.log(`✅ 進入會考大殿堂一般單元模式: ${this.stageName}`);
                    payload = {
                        "單元": this.stageName,
                        "題型": "克漏字",
                        "題數": 1200,
                        "include_answer": true
                    };
                }

                console.log('>>> Hero API Payload:', JSON.stringify(payload, null, 2));

                const res = await api.post('/questionbank/generate/', payload);
                let apiData = res.data;

                // 既然 API 已經指定克漏字，且後端會直接回傳正確數據，我們直接處理
                // 隨機抽 20 題
                const targetCount = 20;
                apiData = apiData.sort(() => Math.random() - 0.5).slice(0, targetCount);

                this.maxQuestions = apiData.length;
                this.questionsList = apiData.map(q => ({
                    id: q.id,
                    // 處理克漏字空格切割邏輯
                    questionParts: q.question_text.split(/(_______)/g),
                    correctAnswer: q.answer,
                    explanation: q.explanation || '無題解',
                    options: q.options.map(opt => ({
                        value: opt.id,
                        label: opt.text
                    }))
                }));

                this.isLoading = false;
            } catch (err) {
                console.error('Hero Fetch Error:', err);
                alert('無法取得英雄挑戰題庫');
                this.goBack();
            }
        },
        startQuiz() {
            if (this.questionsList.length === 0) return;
            this.currentPhase = 'quiz';
            this.userAnswers = [];

            this.timeLeftSeconds = this.timeLimitMinutes * 60;
            this.startGlobalTimer(); // 啟動總計時 (可選)

            // 載入第一題
            this.loadQuestion(0);
        },

        loadQuestion(index) {
            // 清除上一題的計時器，避免重疊
            if (this.questionTimer) clearInterval(this.questionTimer);

            this.selectedAnswer = null;
            this.selectedAnswerLabel = '';
            this.currentQuestionIndex = index + 1;
            this.currentQuestion = this.questionsList[index];
            this.isProcessing = false;

            // 啟動 15 秒倒數
            this.startQuestionTimer();
        },

        // 單題 15 秒倒數邏輯
        startQuestionTimer() {
            this.questionTimeLeft = 15; // 重置為 15 秒
            this.questionTimer = setInterval(() => {
                this.questionTimeLeft--;

                // 時間到
                if (this.questionTimeLeft <= 0) {
                    this.handleQuestionTimeout();
                }
            }, 1000);
        },

        // 處理時間到 (未作答)
        handleQuestionTimeout() {
            clearInterval(this.questionTimer);
            if (this.isProcessing) return; // 防止重複觸發
            this.isProcessing = true;

            // 記錄為 "未填寫"
            this.userAnswers.push({
                question_id: this.currentQuestion.id,
                option_id: "未填寫"
            });

            // 自動前往下一題 (延遲一下讓使用者意識到切換，或直接切換)
            setTimeout(() => {
                if (this.currentQuestionIndex < this.maxQuestions) {
                    // currentQuestionIndex 是 1-based，載入下一題剛好用這個數字當 index
                    this.loadQuestion(this.currentQuestionIndex);
                } else {
                    this.submitFinalResults();
                }
            }, 500);
        },

        selectAnswer(option) {
            if (this.isProcessing) return;

            // 玩家作答後，立刻停止該題倒數
            clearInterval(this.questionTimer);

            this.selectedAnswer = option.value;
            this.selectedAnswerLabel = option.label;
            this.isProcessing = true;

            this.userAnswers.push({
                question_id: this.currentQuestion.id,
                option_id: option.value
            });

            setTimeout(() => {
                if (this.currentQuestionIndex < this.maxQuestions) {
                    this.loadQuestion(this.currentQuestionIndex);
                } else {
                    this.submitFinalResults();
                }
            }, 500);
        },

        // 全局計時器 (5分鐘限制)
        startGlobalTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                if (--this.timeLeftSeconds <= 0) {
                    clearInterval(this.questionTimer); // 總時間到也要停掉單題計時
                    this.submitFinalResults();
                }
            }, 1000);
        },
        async submitFinalResults() {
            clearInterval(this.timerInterval);
            clearInterval(this.questionTimer);
            this.isLoading = true;
            try {
                const islandName = this.level === 'primary' ? '小英雄大本營' : '會考大殿堂';

                // 例如：unit: "啟蒙小木屋", stage: "啟蒙小木屋"
                const payload = {
                    "answers": this.userAnswers,
                    "island": islandName,
                    "unit": this.stageName,
                    "stage": this.stageName
                };

                console.log('>>> Hero Submit Payload:', JSON.stringify(payload, null, 2));

                const response = await api.post('/questionbank/check/', payload);
                const apiResult = response.data;

                this.earnedStars = apiResult.summary.stars;

                this.reportData = apiResult.results.map((res, index) => ({
                    index: index + 1,
                    question: res.question_text,
                    myAnswer: res.selected_option,
                    correctAnswer: res.correct_answer,
                    isCorrect: res.is_correct,
                    explanation: res.explanation
                }));

                this.currentPhase = 'complete';

            } catch (error) {
                console.error('Hero Check failed:', error);
                alert('提交失敗，請檢查網絡');
            } finally {
                this.isLoading = false;
            }
        },
        goToResultDetail() {
            // 根據 level 決定返回 國小英雄 或 國中英雄 (會考)
            const targetRouteName = this.level === 'primary' ? 'PrimaryHeroDetail' : 'SecondaryHeroDetail';

            this.$router.push({
                name: 'ResultDetail',
                params: {
                    finalScore: this.earnedStars,
                    examId: this.stageId,
                    examTitle: this.stageName,
                    resultList: this.reportData,
                    backRoute: {
                        name: targetRouteName,
                        params: {
                            unitId: 'hero',
                            level: this.level
                        }
                    }
                }
            });
        },
        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                if (--this.timeLeftSeconds <= 0) this.submitFinalResults();
            }, 1000);
        },
        handleQuizBack() { this.currentPhase === 'quiz' ? (this.exitDialogVisible = true) : this.goBack(); },
        confirmExit() { this.exitDialogVisible = false; this.goBack(); },
        goBack() { this.$router.go(-1); },
        retryQuiz() { this.fetchQuestions().then(() => this.startQuiz()); }
    },
    beforeDestroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.questionTimer) clearInterval(this.questionTimer);
    }
};
</script>

<style lang="scss" scoped>
.hero-quiz-page {
    @include main-card-page;
    @include flex-center;
    padding-left: 0;
    justify-content: center;

    .back-link {
        @include card-return-text;
    }
}

.side-role-img {
    &.desktop-img {
        display: block;
        width: 100%;
        max-width: 300px;
        height: auto;
    }

    &.mobile-img {
        display: none;
    }
}


.main-card {
    @include main-card;
    width: 650px;
    min-height: 500px;
    padding: 30px 40px 40px;
    display: flex;
    flex-direction: column;

    &.result-mode {
        background-color: transparent;
        box-shadow: none;
        padding: 0;
        width: auto;

        .result-inner-card {
            @include game-result-card;

            .back-link {
                @include card-return-text;
            }


        }

        .result-back-btn {
            @include result-back-btn
        }
    }

    .exam-header-bar {
        display: flex;
        justify-content: space-between;
        width: 100%;
        color: $main-black-text;
        font-weight: 600;
        font-size: 20px;
        margin: 12px 0 28px;
    }

    h2,
    .exam-time {
        margin: 0 !important;
        font-weight: 600;
        color: $main-black-text
    }

    .exam-time {
        font-size: 20px
    }

    .intro-content {
        width: 100%;
        @include flex-center;
        flex-direction: column;
        height: 100%;
        position: relative;
    }

    // .back-link {
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    // }

    .intro-main-area {
        text-align: center;
        margin-top: 20px;

        .intro-avatar {
            width: 200px;
            margin-bottom: 20px;
        }

        .intro-title {
            font-size: 40px;
            color: $main-dark-blue;
            margin: 10px 0;
        }

        .intro-details {
            font-size: 20px;
            color: $main-grey-text;
            margin: 20px 0;
        }

        .intro-continue-btn {
            @include common-btn;
            font-size: 20px;
            padding: 10px 40px;
            margin-top: 20px;
        }
    }
}

.question-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding-top: 12%;
}

.question-wrap {
    width: 100%;
    margin-bottom: 20px;
}

.context-fill-title {
    font-size: 40px;
    color: $main-quiz-blue;
    font-weight: bold;

    .fill-placeholder {
        display: inline-block;
        margin: 0 4px;
        text-align: center;
        color: $main-quiz-blue;

        &.filled {
            color: $main-quiz-blue;
            font-weight: bold;
            border-bottom-color: $main-quiz-blue;
        }
    }
}

.instruction-text {
    font-size: 22px;
    color: $main-black-text;
    margin: 4% 0 6%;
}

.options-grid {
    @include option-grid;
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    border-top: 3px solid #DAE2E7;
    padding-top: 24px;
}

.option-btn {
    background: white;
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 15px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    color: $main-grey-text;

    &:hover {
        border-color: #aaa;
        background-color: #f9f9f9;
    }

    &.is-selected {
        background-color: #E0F2F1;
        border-color: $main-dark-blue;
        color: $main-dark-blue;
        font-weight: bold;
    }
}

.submit-btn {
    @include qa-submit-continue-btn;
    width: 100%;
    margin-top: 30px;
    padding: 15px;
    border-radius: 50px;
}

.final-score {
    font-size: 60px;
    font-weight: 800;
    color: $main-dark-blue;
    margin: 20px 0;
}

.result-actions {
    display: flex;
    gap: 20px;
    justify-content: center;

    .result-detail-btn {
        background: white;
        border: 2px solid #ddd;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 18px;
        cursor: pointer;

        &.primary {
            border: none;
            color: $main-black-text;
            font-weight: bold;
        }
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .quiz-container-wide .el-row--flex.is-align-middle {
        justify-self: center;
    }

    .router-view-content {
        padding: 5%;
    }

    .main-card {
        min-width: 500px !important;
        width: 100% !important;
    }

    .timer-bar-wrap {
        width: 100% !important;
        margin: 10px 0 !important;
    }

    .left-image-col {
        display: none;
    }

    .side-role-img {
        &.desktop-img {
            display: none;
        }

        &.mobile-img {
            display: block;
            width: 170px;
            margin: auto;
            align-self: center;
        }
    }
}
</style>