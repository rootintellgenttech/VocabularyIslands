<template>
    <div class="hero-quiz-page">
        
        <div v-if="currentPhase === 'quiz'" class="quiz-container-wide">
            <el-row type="flex" justify="center" align="middle" :gutter="40" style="width: 100%; max-width: 1200px;">
                
                <el-col :xs="24" :md="10" class="left-image-col">
                    <img :src="tempAvatar" alt="Role" class="side-role-img">
                </el-col>

                <el-col :xs="24" :md="14">
                    <div class="main-card quiz-mode">
                        <div class="back-link" @click="handleQuizBack">
                            <i class="fas fa-angle-left"></i> 返回
                        </div>

                        <template v-if="currentQuestion">
                            <div class="exam-header-bar">
                                <div class="timer-area">
                                    <i class="fa-regular fa-clock" style="color: #404E4E;margin-right: 12px;"></i>
                                    <span class="timer-value">{{ formattedTimeLeft }}</span>
                                </div>
                                <div class="progress-area">
                                    <span class="progress-count">{{ currentQuestionIndex }}/{{ maxQuestions }}</span>
                                </div>
                            </div>

                            <div class="question-content">
                                <div class="question-wrap">
                                    <p class="question-title context-fill-title">
                                        <template v-for="(part, i) in currentQuestion.questionParts">
                                            <span :key="i + '-text'" v-if="part !== '_______'">
                                                {{ part }}
                                            </span>
                                            <span :key="i + '-fill'" v-else 
                                                  :class="['fill-placeholder', { 'filled': selectedAnswer }]">
                                                {{ selectedAnswer ? selectedAnswer : '_____' }}
                                            </span>
                                        </template>
                                    </p>
                                </div>

                                <p class="instruction-text">選擇空格內的正確答案</p>

                                <div class="options-grid">
                                    <button v-for="(option, index) in currentQuestion.options" :key="index"
                                        :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                                        @click="selectAnswer(option.value)"
                                        :disabled="isProcessing">
                                        {{ option.label }}
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </el-col>
            </el-row>
        </div>

        <div v-if="currentPhase === 'intro'" class="intro-card">
            <div class="intro-content">
                <div class="back-link" @click="goBack">
                    <i class="fas fa-angle-left"></i> 返回大本營
                </div>
                <div class="intro-main-area">
                    <img :src="introAvatar" alt="吉祥物" class="intro-avatar">
                    <div class="intro-text">
                        <h2>英雄試煉</h2>
                        <h2 class="intro-title">{{ stageName }}</h2>
                        <p class="exam-time">
                            共 {{ maxQuestions }} 題克漏字挑戰<br>
                            限時 {{ timeLimitMinutes }} 分鐘
                        </p>
                        <p class="intro-details">請仔細閱讀句子，選出正確的單字填入空格。</p>
                        <button class="intro-continue-btn" @click="startQuiz">開始挑戰</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="currentPhase === 'complete'" class="result-card-container">
            <div class="result-card-content">
                <img :src="certificateAvatar" alt="太棒了!" class="result-avatar">
                <div class="result-stars">
                    <i v-for="n in 3" :key="n" 
                       class="fas fa-star" 
                       :class="{ 'filled': n <= earnedStars }"></i>
                </div>
                <h2 class="result-title">太棒了!</h2>
                <p class="result-subtitle">你獲得了{{ earnedStars }}顆星星</p>
                 <div class="result-actions">
                     <button class="simple-btn" @click="retryQuiz">再次挑戰</button>
                     <button class="simple-btn primary" @click="goBack">返回地圖</button>
                 </div>
            </div>
        </div>

        <el-dialog 
            custom-class="challenge-confirm-modal" 
            :visible.sync="exitDialogVisible" 
            width="480px" center :close-on-click-modal="false" :show-close="false">
            <div class="dialog-content">
                <h3 class="title exam-warning-title">
                     <i class="fas fa-exclamation-circle"></i> 確定要離開嗎？
                </h3>
                <p class="description">中途結束將不會計算分數。</p>
                <p class="description">您目前的進度將會遺失，請確認是否離開。</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="exitDialogVisible = false">繼續作答</el-button>
                <el-button type="danger" @click="confirmExit">確定離開</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    name: 'HeroQuizPage',
    props: {
        stageId: { type: String, required: true },
        stageName: { type: String, default: '克漏字測驗' },
        level: { type: String, default: 'primary' }
    },
    data() {
        return {
            currentPhase: 'intro', // intro -> quiz -> complete
            
            introAvatar: require('@/assets/image/hero-avatar.png'),
            certificateAvatar: require('@/assets/image/elementary/avatar.png'), 
            tempAvatar: require('@/assets/image/temp-avatar.png'),
            // 測驗設定
            maxQuestions: 5,
            timeLimitMinutes: 10,
            
            // 狀態變數
            currentQuestionIndex: 0,
            timeLeftSeconds: 0,
            timerInterval: null,
            selectedAnswer: null,
            currentQuestion: null,
            correctCount: 0,
            earnedStars: 0, // 最終獲得的星星數 (0-3)
            
            isProcessing: false, // 防止重複點擊
            exitDialogVisible: false // 控制退出警告視窗
        };
    },
    computed: {
        formattedTimeLeft() {
            const minutes = Math.floor(this.timeLeftSeconds / 60);
            const seconds = this.timeLeftSeconds % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    },
    methods: {
        // 處理返回邏輯
        handleQuizBack() {
            if (this.currentPhase === 'quiz') {
                // 如果正在作答，顯示警告
                this.exitDialogVisible = true;
            } else {
                // 其他狀態直接返回
                this.goBack();
            }
        },
        confirmExit() {
            this.exitDialogVisible = false;
            this.goBack();
        },
        goBack() {
            this.$router.go(-1);
        },
        
        startQuiz() {
            this.currentPhase = 'quiz';
            this.currentQuestionIndex = 1;
            this.correctCount = 0;
            this.selectedAnswer = null;
            this.isProcessing = false;
            
            // 載入第一題
            this.currentQuestion = this.getMockQuestion(1);
            
            // 開始計時
            this.timeLeftSeconds = this.timeLimitMinutes * 60;
            this.startTimer();
        },
        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.timeLeftSeconds--;
                if (this.timeLeftSeconds <= 0) {
                    clearInterval(this.timerInterval);
                    this.timeLeftSeconds = 0;
                    // 時間到直接結算
                    this.finishQuiz();
                }
            }, 1000);
        },
        
        // 選擇答案 (自動提交邏輯)
        selectAnswer(value) {
            if (this.isProcessing) return; // 防止連點
            
            this.selectedAnswer = value;
            this.isProcessing = true;

            // 1. 檢查答案
            const isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
            if (isCorrect) this.correctCount++;

            // 2. 延遲一下讓使用者看到自己選了什麼，然後跳下一題
            setTimeout(() => {
                if (this.currentQuestionIndex < this.maxQuestions) {
                    this.currentQuestionIndex++;
                    this.selectedAnswer = null;
                    this.currentQuestion = this.getMockQuestion(this.currentQuestionIndex);
                    this.isProcessing = false;
                } else {
                    this.finishQuiz();
                }
            }, 500); // 0.5秒後跳轉
        },

        finishQuiz() {
            clearInterval(this.timerInterval);
            
            // --- 模擬 API 對答案並計算星星 ---
            // 假設規則：
            // 全對 = 3 星
            // 答對 >= 60% = 2 星
            // 答對 > 0 = 1 星
            // 0 分 = 0 星
            
            const scorePercent = (this.correctCount / this.maxQuestions) * 100;
            
            if (scorePercent === 100) {
                this.earnedStars = 3;
            } else if (scorePercent >= 60) {
                this.earnedStars = 2;
            } else if (scorePercent > 0) {
                this.earnedStars = 1;
            } else {
                this.earnedStars = 0;
            }

            console.log(`測驗結束，答對: ${this.correctCount}, 星星: ${this.earnedStars}`);
            
            this.currentPhase = 'complete';
        },

        retryQuiz() {
            this.startQuiz();
        },
        
        getMockQuestion(index) {
            // ... (維持原本的題目生成邏輯)
             let sentence, options, answer, parts;

            if (this.stageId === '01') {
                sentence = `This is _______ apple.`;
                parts = ['This is ', '_______', ' apple.'];
                options = [
                    { value: 'a', label: 'a' },
                    { value: 'an', label: 'an' },
                    { value: 'the', label: 'the' },
                    { value: 'two', label: 'two' }
                ];
                answer = 'an';
            } else {
                sentence = `Question ${index}: I _______ go to school by bus.`;
                parts = [`Question ${index}: I `, '_______', ' go to school by bus.'];
                options = [
                    { value: 'usually', label: 'usually' },
                    { value: 'user', label: 'user' },
                    { value: 'using', label: 'using' },
                    { value: 'use', label: 'use' }
                ];
                answer = 'usually';
            }

            return {
                title: sentence,
                questionParts: parts,
                correctAnswer: answer,
                options: options
            };
        }
    },
    beforeDestroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};
</script>

<style lang="scss" scoped>
// 引用原本的 mixins
.hero-quiz-page {
    @include main-card-page;
    @include flex-center;
    padding-left: 0; 
    justify-content: center;

        .back-link {
        @include card-return-text;
        }
}

.main-card {
    @include main-card;
    width: 650px;
    min-height: 500px;
    padding: 30px 40px 40px;
    display: flex;
    flex-direction: column;

    .exam-header-bar {
        display: flex;
        justify-content: space-between;
        width: 100%;
        color: $main-black-text;
        font-weight: 600;
        font-size: 20px;
        margin-bottom: 30px;
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
    color:$main-quiz-blue;
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

.intro-card {
    @include main-card;
    width: 800px;
    padding: 40px;
    min-height: 500px;
    h2,.exam-time{
        margin: 0 !important;
        font-weight: 600;
        color: $main-black-text
    }
    .exam-time{
        font-size: 20px
    }
    .intro-content {
        width: 100%;
        @include flex-center;
        flex-direction: column;
        height: 100%;
        position: relative;
    }

    .back-link {
        position: absolute;
        top: 0;
        left: 0;
    }

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
            color:$main-grey-text;
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
            color:$main-black-text;
            font-weight: bold;
        }
    }
}
</style>