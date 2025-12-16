<template>
    <div class="quiz-page">
        <div v-if="currentPhase === 'quiz'" :class="['main-card']">
            <template v-if="currentPhase === 'quiz' && currentQuestion">

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
                        <template v-if="currentQuizConfig && currentQuizConfig.qType === 'Listening'">
                            <div class="audio-trigger" @click="playAudio(currentQuestion.audioWord)">
                                <i class="fas fa-volume-up"></i>
                            </div>
                        </template>
                        <template v-else-if="currentQuizConfig && currentQuizConfig.qType === 'ContextFill'">
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
        </template>
                        <template v-else>
                            <h1 class="question-title">{{ currentQuestion.title }}</h1>
                        </template>
                    </div>

<p class="instruction-text">
        {{ currentQuizConfig && currentQuizConfig.qType === 'ContextFill' ? '選擇空格內的正確答案' : instructionText }}
    </p>
    
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
            </template>
        </div>

        <div v-if="currentPhase === 'intro'" class="intro-card">
            <div class="intro-content">
                <div v-if="isFirstPart" class="back-link" @click="goBack">
                    <i class="fas fa-angle-left"></i> 返回
                </div>
                <div class="intro-main-area">
                    <img :src="introAvatar" alt="吉祥物" class="intro-avatar">
                    <div class="intro-text">
                        <h2>試煉殿堂</h2>
                        <h2 class="intro-title">{{ partTitle }}</h2>
                        <p class="exam-time">
                            共 {{ maxQuestions }} 題，限時 {{ currentQuizConfig ? currentQuizConfig.timeLimitMinutes : 0 }}
                            分鐘<br>
                            每題 {{ pointsPerQuestion }} 分，總分 {{ currentQuizConfig ? currentQuizConfig.totalScore : 0 }} 分
                        </p>

                        <div v-if="currentQuizConfig && currentQuizConfig.qType === 'Listening'"
                            class="listening-test-area">
                            <p class="audio-tip">
                                <i class="fas fa-exclamation-triangle"></i> 開始前請先測試是否有開啟聲音
                            </p>
                            <button class="test-audio-btn" @click="testAudio">
                                點擊測試 <i class="fas fa-volume-up"></i>
                            </button>
                        </div>
                        <p class="intro-details">{{ instructionText }}</p>
                        <button class="intro-continue-btn" @click="showConfirmDialog">繼續</button>
                    </div>
                </div>
            </div>
        </div>


        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="confirmDialogVisible" width="600px" center
            :close-on-click-modal="false" :show-close="false">

            <div class="dialog-content">
                <h3 class="title exam-warning-title" style="margin-bottom: 4px !important;">
                    考試説明
                </h3>
                <p class="description">作答過程請依照教師指引進行施測。</p>
<img src="../../assets/image/trial-quiz/warn.png">
<p class="description">     <i class="fas fa-exclamation-circle"></i> 請注意！</p>
               
                <p class="description">答案一經送出，將無法修改或返回上一題， 請確認作答無誤後再送出。</p>

            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="confirmDialogVisible = false; goBack()">取 消</el-button>
                <el-button type="primary" @click="startQuiz">瞭解</el-button>
            </span>
        </el-dialog>
        <div v-if="currentPhase === 'complete'" class="intro-card complete-page-card">
            <div class="intro-content">
                <div class="back-link" @click="goBack">
                    <i class="fas fa-angle-left"></i> 返回
                </div>
                <div class="intro-main-area">
                    <img :src="wonderfulAvatarPath" alt="太棒了!" class="final-avatar">
                    <div class="intro-text">
                        <h2 class="final-intro-title">試煉結果</h2>
                        <p class="final-score">{{ finalTotalScore }} 分</p>

                        <div class="result-actions">
                            <button class="result-detail-btn" @click="showResultDetail">
                                查看答題結果
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 測驗配置：設定各關卡的屬性
const QUIZ_CONFIG = {
    // 國小 (Primary School, ps-)
    'part1-eng-chi': {
        title: '第一部分 英選中',
        maxQuestions: 1,
        timeLimitMinutes: 15,
        instruction: '選擇對應的中文',
        qType: 'EngToChi',
        totalScore: 50,
        nextPart: 'part2-chi-eng'
    },
    'part2-chi-eng': {
        title: '第二部分 中選英',
        maxQuestions: 1,
        timeLimitMinutes: 15,
        instruction: '選擇對應的英文',
        qType: 'ChiToEng',
        totalScore: 40,
        nextPart: 'part3-listening'
    },
    'part3-listening': {
        title: '第三部分 單字聽力測驗',
        maxQuestions: 1,
        timeLimitMinutes: 5,
        instruction: '選擇對應的中文',
        qType: 'Listening',
        totalScore: 10,
        nextPart: 'ms-part4-context' //null=國小關卡結束，ms-part4-context可以進到國中第四關
    },
    // 國中 (Middle School, ms-)
    'ms-part1-eng-chi': {
        title: '國中 第一部分 英選中',
        maxQuestions: 1,
        timeLimitMinutes: 10,
        instruction: '選擇對應的中文',
        qType: 'EngToChi',
        totalScore: 20,
        nextPart: 'ms-part2-chi-eng'
    },
    'ms-part2-chi-eng': {
        title: '國中 第二部分 中選英',
        maxQuestions: 1,
        timeLimitMinutes: 10,
        instruction: '選擇對應的英文',
        qType: 'ChiToEng',
        totalScore: 20,
        nextPart: 'ms-part3-listening'
    },
    'ms-part3-listening': {
        title: '國中 第三部分 單字聽力測驗',
        maxQuestions: 1,
        timeLimitMinutes: 5,
        instruction: '選擇對應的中文',
        qType: 'Listening',
        totalScore: 10,
        nextPart: 'ms-part4-context'
    },
    'ms-part4-context': {
        title: '第四部分 文意測驗',
        maxQuestions: 1,
        timeLimitMinutes: 15,
        instruction: '選擇空格內正確的答案',
        qType: 'ContextFill',
        totalScore: 50,
        nextPart: null
    }
};

export default {
    name: 'TrialQuizPage',
    props: {
        level: { type: String, required: true },
        examId: { type: String, required: true } // 當前的 Part ID
    },
    data() {
        return {
            currentPhase: 'intro', // 'intro', 'quiz', 'result', 'complete'
            confirmDialogVisible: false,

            introAvatar: require('@/assets/image/answer-avatar.png'),
            correctAvatarPath: require('@/assets/image/correct.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
            wrongAvatarPath: require('@/assets/image/answer-avatar.png'),

            currentQuizConfig: null,
            currentPartScore: 0,
            finalTotalScore: 0,
            currentQuestionIndex: 0,

            timeLeftSeconds: 0,
            timerInterval: null,

            selectedAnswer: null,
            currentQuestion: null,
        };
    },
    computed: {
        maxQuestions() {
            return this.currentQuizConfig ? this.currentQuizConfig.maxQuestions : 0;
        },
        partTitle() {
            return this.currentQuizConfig ? this.currentQuizConfig.title : '載入中...';
        },
        instructionText() {
            return this.currentQuizConfig ? this.currentQuizConfig.instruction : '請開始作答';
        },
        // 格式化剩餘時間為 M:SS 格式
        formattedTimeLeft() {
            const minutes = Math.floor(this.timeLeftSeconds / 60);
            const seconds = this.timeLeftSeconds % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
        pointsPerQuestion() {
            if (!this.currentQuizConfig || this.maxQuestions === 0) return 0;
            // 計算並修正小數點
            return this.currentQuizConfig.totalScore / this.maxQuestions;
        },
        isFirstPart() {
            return this.examId === 'part1-eng-chi';
        }
    },
    watch: {
        // 監聽 examId 變化 (用於關卡切換)
        examId: {
            immediate: true,
            handler(newExamId) {
                this.loadQuizConfig(newExamId);
            }
        }
    },
  methods: {
        goBack() {
            // 返回試煉殿堂總頁面
            this.$router.push('/trial-hall');
        },
        // 載入當前關卡配置
        loadQuizConfig(examId) {
            this.currentQuizConfig = QUIZ_CONFIG[examId];
            if (!this.currentQuizConfig) {
                console.error(`找不到 ID 為 ${examId} 的測驗配置`);
                // 如果找不到配置，且不是預期的最終完成狀態，則返回首頁
                if (this.currentPhase !== 'complete') {
                    this.goBack();
                }
                return;
            }

            this.currentPhase = 'intro'; // 從介紹開始
            this.currentPartScore = 0;
            this.currentQuestionIndex = 0;
            this.isSubmitted = false;
            this.isCorrect = false;
            this.selectedAnswer = null;

            // 載入第一題的模擬數據
            this.currentQuestion = this.getMockQuestion(1);
        },

        // 模擬載入題目數據
        getMockQuestion(index) {
            if (this.currentQuizConfig.qType === 'EngToChi') {
                return {
                    title: `Apple`,
                    correctAnswer: '蘋果',
                    explanation: `Word ${index}: Apple 的中文是蘋果。`,
                    options: [
                        { value: '蘋果', label: '蘋果' },
                        { value: '香蕉', label: '香蕉' },
                        { value: '橘子', label: '橘子' },
                        { value: '葡萄', label: '葡萄' },
                    ]
                };
            } else if (this.currentQuizConfig.qType === 'ChiToEng') {
                return {
                    title: `香蕉`,
                    correctAnswer: 'Banana',
                    explanation: `詞彙 ${index}: 香蕉的英文是 Banana。`,
                    options: [
                        { value: 'Apple', label: 'Apple' },
                        { value: 'Banana', label: 'Banana' },
                        { value: 'Orange', label: 'Orange' },
                        { value: 'Grape', label: 'Grape' },
                    ]
                };
            } else if (this.currentQuizConfig.qType === 'Listening') {
                // 聽力題模擬: 播放 'Book'，讓使用者選中文
                return {
                    title: `題目 ${index}: 請聽發音`,
                    audioWord: 'Book', // 要播放的英文單字
                    correctAnswer: '書',
                    explanation: `單字 Book 的中文是「書」。`,
                    options: [
                        { value: '筆', label: '筆' },
                        { value: '書', label: '書' },
                        { value: '尺', label: '尺' },
                        { value: '鉛筆', label: '鉛筆' },
                    ]
                };
            } else if (this.currentQuizConfig.qType === 'ContextFill') {
                // 文意測驗/填空題
                // 模擬填空題目，例如: "I see ______ monkey at Shoushan Zoo."
                // title 欄位用來儲存包含底線的完整句子
                const sentence = `I see _______ monkey at Shoushan Zoo.`;

                // 將句子拆分
                const questionParts = [
                    'I see ',
                    '_______', // 這是要被替換的部分
                    ' monkey at Shoushan Zoo.'
                ];

                return {
                    title: sentence, // 傳遞完整句子
                    questionParts: questionParts, // 傳遞拆分後的陣列
                    correctAnswer: 'a', // 假設正確答案是 a
                    explanation: `這是單數可數名詞的用法，應使用 'a'。`,
                    options: [
                        { value: 'a', label: 'a' },
                        { value: 'an', label: 'an' },
                        { value: 'the', label: 'the' },
                        { value: 'X', label: 'X' },
                    ]
                };
            }
            return { title: '無題目' };
        },

        showConfirmDialog() {
            this.confirmDialogVisible = true;
        },

        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.timeLeftSeconds--;
                if (this.timeLeftSeconds <= 0) {
                    clearInterval(this.timerInterval);
                    this.timeLeftSeconds = 0;
                    alert('考試時間結束！自動提交試卷。');
                    // 這裡應呼叫強制提交方法
                    this.handleSubmit(); // 強制提交
                }
            }, 1000);
        },

        // 播放音訊功能
        playAudio(wordToSpeak) {
            if (!wordToSpeak) {
                console.log('無單字可播放');
                return;
            }
            console.log('播放發音: ' + wordToSpeak);
            const utterance = new SpeechSynthesisUtterance(wordToSpeak);
            utterance.lang = 'en-US';
            utterance.rate = 1;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },
        // 測試聲音功能 (Web Speech API)
        testAudio() {
            this.playAudio('testing 1 2 3');
        },
        
        startQuiz() {
            this.confirmDialogVisible = false;
            this.currentPhase = 'quiz';
            this.currentQuestionIndex = 1; // 進入作答，題號從 1 開始

            // 確保題目數據已載入
            if (!this.currentQuestion) {
                 this.currentQuestion = this.getMockQuestion(1);
            }

            // 設置倒數時間
            this.timeLeftSeconds = this.currentQuizConfig.timeLimitMinutes * 60;
            this.startTimer();
            console.log(`開始關卡 ${this.examId}，共 ${this.maxQuestions} 題`);
            
            // 如果是聽力題，自動播放一次
             if (this.currentQuizConfig.qType === 'Listening' && this.currentQuestion.audioWord) {
                this.playAudio(this.currentQuestion.audioWord);
            }
        },

        selectAnswer(value) {
            this.selectedAnswer = value;
        },

        handleSubmit() {
            if (!this.selectedAnswer) return;

            // 1. 判斷對錯並累計當前關卡答對題數
            const isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
            this.currentPartScore += isCorrect ? 1 : 0;

            // 2. 判斷是否還有下一題
            const hasNextQuestion = this.currentQuestionIndex < this.maxQuestions;

            if (hasNextQuestion) {
                // 3. 進入下一題 (跳過結果顯示)
                this.currentQuestionIndex++;
                this.selectedAnswer = null;
                this.currentQuestion = this.getMockQuestion(this.currentQuestionIndex);
                console.log(`下一題: ${this.currentQuestionIndex}/${this.maxQuestions}`);

                // 聽力題自動播放
                if (this.currentQuizConfig.qType === 'Listening' && this.currentQuestion.audioWord) {
                    this.playAudio(this.currentQuestion.audioWord);
                }
            } else {
                // 4. 關卡結束，處理分數累積和繼續流程
                clearInterval(this.timerInterval);

                // 計算當前關卡分數並累積到總分
                const partScore = this.currentPartScore * this.pointsPerQuestion;
                this.finalTotalScore += partScore;
                console.log(`關卡 ${this.examId} 完成。答對 ${this.currentPartScore} 題，得分 ${partScore.toFixed(1)}。累積總分 ${this.finalTotalScore.toFixed(1)}`);

                // 5. 根據是否有下一關，決定跳轉或進入最終完成頁
                this.handleSummaryContinue();
            }
        },

        // 處理關卡結束後
        handleSummaryContinue() {
            clearInterval(this.timerInterval);
            const nextPartId = this.currentQuizConfig.nextPart;

            if (nextPartId) {
                // 有下一關卡，跳轉到下一關卡的 intro 頁面
                this.$router.replace({
                    name: 'TrialQuizPage',
                    params: {
                        level: this.level,
                        examId: nextPartId
                    }
                });
            } else {
                // 所有關卡完成，顯示最終完成頁面
                this.currentPhase = 'complete';
            }
        },

        // 前往查看考試結果
        showResultDetail() {
            console.log('跳轉到結果詳情頁面，總分:', this.finalTotalScore);
            
            // 跳轉到新的結果詳情頁，並將最終總分和第一個 partId 傳遞過去
            this.$router.push({
                name: 'TrialResultDetail',
                params: {
                    // 將最終分數格式化為您想要的顯示格式，並作為字串傳遞
                    finalScore: this.finalTotalScore.toFixed(0), 
                    examId: Object.keys(QUIZ_CONFIG)[0] // 傳遞預設開啟的第一個 Tab ID
                }
            });
        }
    },
    beforeDestroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        window.speechSynthesis.cancel(); // 銷毀時停止語音
    }
};
</script>


<style lang="scss" scoped>
.quiz-page {
    @include main-card-page;
    @include flex-center;
    padding-left: 100px;

    .challenge-confirm-modal {
        img{
        width: 100%;
margin: 16px 0;
    }}
}

.main-card {
    @include main-card;
    width: 650px;
    min-height: 600px;
    padding: 30px 40px 0;

    .exam-header-bar {
        display: flex;
        justify-content: space-between;
        width: 100%;
        color: $main-black-text;
        font-weight: 600;
        font-size: 20px
    }

}

.intro-card {
    @include main-card;
    width: 800px;
    padding: 40px;
    height: 500px;

    .intro-content {
        @include flex-center;
        justify-content: center;
        height: 100%;
        position: relative;
        width: 100%;
    }

    .back-link {
        @include card-return-text;
        position: absolute;
        top: 0;
        left: 0;
    }

    .intro-main-area {
        @include flex-center;

        .intro-avatar {
            width: 280px;
            object-fit: contain;
        }

        .intro-text {
            text-align: center;

            .listening-test-area {
                @include flex-center;
                margin-bottom: 16px;
                gap: 0 8px;

                .audio-tip {
                    height: 40px;
                    color: #761C00;
                    font-weight: bold;
                    border: 3px solid #F57148;
                    border-radius: 8px;
                    padding: 4px 12px;
                }

                .test-audio-btn {
                    background-color: #f57148;
                    color: #fff;
                    padding: 10px 20px;
                    font-size: 14px;
                    border: none;
                    border-radius: 8px;
                    box-shadow: unset;

                    .fas {
                        margin-left: 5px;
                    }
                }
            }

            h2 {
                font-size: 32px;
            }

            .intro-title,
            .final-intro-title {
                font-size: 42px;
                font-weight: bold;
                margin: 24px 0 8px;
            }

            .intro-title {
                color: $main-dark-blue;
            }

            .final-intro-title {
                color: $main-black-text;
            }

            .intro-details {
                font-size: 20px;
                color: #333;
                margin-bottom: 5px;
            }

            .exam-time {
                font-weight: 600;
                color: #325362;
                line-height: 1.2;
                font-size: 22px;
                margin-bottom: 16px;
            }

            .intro-continue-btn {
                @include common-btn;
                font-size: 18px;
                margin-top: 20px;
                border-radius: 10px;
            }
        }
        .final-avatar{
            width: 200px;
        }

        .final-score {
            font-size: 80px;
            font-weight: 800;
            color: #097C70;
            margin: 0 0 40px;
        }

        .result-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 300px;

            .result-detail-btn {
                @include common-btn;
                height: 50px;
                width: 150px;
                margin: auto;
            }
        }

    }
}


.card-return-text {
    @include card-return-text;
}

.progress-header {
    @include progress-star
}

.question-content {
    @include main-card-content;
    padding-top: 12%;
}

.instruction-text {
    font-size: 32px;
    font-weight: 600;
    color: $main-black-text;
    margin: 24px 0 40px;
}

.options-grid {
    @include option-grid;
}


.submit-btn {
    @include qa-submit-continue-btn;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    padding: 24px 0;
}

.question-title {
    font-size: 8rem !important;
}

.context-fill-title{
    font-size: 2rem !important
}

.question-wrap {
    @include flex-center;

    .audio-trigger i {
        font-size: 8rem;
    }
}


.result-mode {
    background-color: transparent;
    box-shadow: none;
    padding: 0;
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

.confirm-instruction-modal {
    .el-dialog__header {
        padding: 0;
    }

    .dialog-content {
        display: block;
        padding: 30px 40px;
    }

    .exam-warning-title {
        font-size: 24px;
        font-weight: 800;
        color: #097C70;
        margin-bottom: 20px;
        border-bottom: 3px solid #097C70;
        padding-bottom: 10px;

        .fa-exclamation-circle {
            margin-right: 8px;
            color: #EAB308;
        }
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .intro-card {
        width: 100%;
    }
}
</style>