<template>
    <div class="quiz-page">
        <div v-if="isLoading" class="loading-container">
            <i class="fas fa-spinner fa-spin"></i>
            <p>題目載入中...</p>
        </div>

        <div v-else-if="currentPhase === 'quiz'" class="main-card question-mode">
            <div class="header-wrap">
                <div class="card-return-text" @click="handleQuizBack">
                    <i class="fas fa-angle-left"></i> 返回
                </div>

                <div class="progress-header">
                    <div v-if="quizMode === 'listening'" class="exam-header-bar">
            <div class="timer-area">
                <i class="fa-regular fa-clock" style="color: #404E4E;margin-right: 6px;"></i>
                <span class="timer-value">{{ formattedTimeLeft }}</span>
            </div>
        </div>
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
                    </div>
                    <div class="question-count-text">
                        {{ currentQuestionIndex + 1 }} / {{ maxQuestions }}
                    </div>
                </div>
            </div>

            <div class="question-content">
                <div class="question-wrap">
                    <template v-if="quizMode === 'abc'">
                        <div class="audio-trigger" @click="playAudio(currentQuestion.audioSrc)">
                            <i class="fas fa-volume-up"></i>
                        </div>
                        <h1 class="question-title">{{ currentQuestion.title }}</h1>
                    </template>

                    <template v-else-if="quizMode === 'word'">
                        <h1 class="question-title">{{ currentQuestion.title }}</h1>
                    </template>

                    <template v-else-if="quizMode === 'listening'">
                        <div class="audio-trigger listen-quiz-audio" @click="playAudio(currentQuestion.audioSrc)">
                            <i class="fas fa-volume-up"></i>
                        </div>
                    </template>
                </div>

                <p class="instruction-text">{{ instructionText }}</p>

                <div class="options-grid">
                    <button v-for="(option, index) in currentQuestion.options" :key="index"
                        :class="['option-btn', { 'is-selected': selectedAnswer === option.value }]"
                        @click="handleOptionClick(option)">

                        <template v-if="quizMode === 'abc'">
                            <i class="fas fa-volume-up"></i>
                        </template>
                        <template v-else>
                            {{ option.label }}
                        </template>
                    </button>
                </div>
            </div>

            <button v-if="quizMode !== 'listening'" :class="['submit-btn']" :disabled="!selectedAnswer"
                @click="handleSubmit()">
                {{ isLastQuestion ? '完成交卷' : '提交' }} <i class="fas fa-angle-right"></i>
            </button>
        </div>

     <div v-else-if="currentPhase === 'complete'" class="main-card result-mode">
            
           <div class="result-inner-card">
    <div class="back-link" @click="goBack()">
        <i class="fas fa-angle-left"></i> 返回
    </div>
    
    <h2 class="result-title">{{ earnedStars > 0 ? '太棒了!' : '再接再厲' }}</h2>
    
    <img :src="wonderfulAvatarPath" alt="Result" class="result-avatar">
    
    <div v-if="earnedStars > 0" class="final-star">
        <i v-for="n in 3" :key="n" style="color: #ffc940;" class="fas fa-star" 
           :class="{ 'filled': n <= earnedStars }"></i>
    </div>
    
    <p class="result-score">你獲得了 {{ earnedStars }} 顆星星</p>
</div>

            <button class="result-back-btn" @click="goToResultDetail()">
                查看解答
            </button>
        </div>

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="480px" center
            :close-on-click-modal="false" :show-close="false">
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
import api from '@/config/api';

export default {
    name: 'QuizPage',
    props: {
        wordCount: { type: String, default: '300' },
        unitId: { type: String, required: true },
        activityType: { type: String, required: true },
        level: { type: String, default: 'primary' },
        stageLabel: { type: String, default: '' },
        unitName: { type: String, default: '' }
    },
    data() {
        return {
            isLoading: true,
            currentPhase: 'quiz', // 'quiz' | 'complete'

            // 圖片
            correctAvatarPath: require('@/assets/image/correct.png'),
            wrongAvatarPath: require('@/assets/image/answer-avatar.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),

            currentQuestionIndex: 0,
            selectedAnswer: null,

            questionsList: [],
            userAnswers: [],
            reportData: [],
            earnedStars: 0,
            finalScore: 0,

            exitDialogVisible: false,

            currentQuestion: {
                id: 0,
                title: '',
                audioSrc: '',
                correctAnswer: '',
                explanation: '',
                options: []
            },
            timeLeftSeconds: 300, // 5分鐘 = 300秒
            timerInterval: null,
        };
    },
    computed: {
        maxQuestions() {
            return this.questionsList.length || 5;
        },
        progress() {
            if (this.maxQuestions === 0) return 0;
            return ((this.currentQuestionIndex + 1) / this.maxQuestions) * 100;
        },
        isLastQuestion() {
            return this.currentQuestionIndex === this.maxQuestions - 1;
        },
        quizMode() {
            if (this.activityType.includes('listening')) return 'listening';
            if (['af', 'gl', 'mr', 'sz', 'final'].includes(this.unitId)) return 'abc';
            return 'word';
        },
        instructionText() {
            if (this.quizMode === 'listening') return '選擇聽到的單字';
            if (this.quizMode === 'abc') return '選擇聽到的字母';
            return '選擇正確答案';
        },
        formattedTimeLeft() {
            const minutes = Math.floor(this.timeLeftSeconds / 60);
            const seconds = this.timeLeftSeconds % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    },
    created() {
        this.fetchQuestions();
    },
    methods: {
        handleQuizBack() {
            if (this.currentPhase !== 'complete' && !this.isLoading) {
                this.exitDialogVisible = true;
            } else {
                this.goBack();
            }
        },

        confirmExit() {
            this.exitDialogVisible = false;
            this.goBack();
        },
async fetchQuestions() {
    this.isLoading = true;
    try {
        // 除錯：先確認收到的參數是否正確
        console.log('--- [QuizPage Strict Debug] ---');
        console.log('ID:', this.unitId, '| Label:', this.stageLabel, '| Count:', this.wordCount, '| Name:', this.unitName);

        let payload = {};
        
        // =========================================================
        // 路徑 1：ABC 總複習 (最高優先級，獨立判斷)
        // =========================================================
        if (this.unitId === 'final') {
            console.log('✅ 進入路徑 1: ABC 總複習');
            const islandName = 'ABC啟航島';

            if (this.stageLabel === 'A-Z') {
                // A-Z：只有島嶼和題數，絕對不能有單元或關卡
                payload = {
                    "島嶼": islandName,
                    "題數": 26,
                    "include_answer": true
                };
            } else {
                // A-F, G-L 等：需要指定單元
                payload = {
                    "島嶼": islandName,
                    "單元": this.stageLabel, // 這裡會是 "A-F" 等
                    "題數": 26,
                    "include_answer": true
                };
            }
        }
        // =========================================================
        // 路徑 2：ABC 一般練習 (af, gl, mr, sz)
        // =========================================================
        else if (this.wordCount === 'abc' || ['af', 'gl', 'mr', 'sz'].includes(this.unitId)) {
            console.log('✅ 進入路徑 2: ABC 一般練習');
            const islandName = 'ABC啟航島';
            const unitMapping = { 'af': 'A-F', 'gl': 'G-L', 'mr': 'M-R', 'sz': 'S-Z' };
            
            payload = {
                "島嶼": islandName,
                "單元": unitMapping[this.unitId] || 'A-F',
                "關卡": this.stageLabel,
                "題型": "字母",
                "題數": 26,
                "include_answer": true
            };
        }
        // =========================================================
        // 路徑 3：聽力海灣 (國小/國中)
        // =========================================================
        else if (this.unitName.includes('聽力海灣')) {
            console.log('✅ 進入路徑 3: 聽力海灣');
            payload = {
                "單元": this.stageLabel, // 例如 "圖書館島"
                "題數": 1200,
                "include_answer": true
            };
        }
        // =========================================================
        // 路徑 4：單字島總複習 (06, 800-06, 1200-05)
        // =========================================================
        else if (['06', '800-06', '1200-05'].includes(this.unitId)) {
            console.log('✅ 進入路徑 4: 單字島總複習');
            payload = {
                "單元": this.stageLabel,
                "題數": 1200,
                "include_answer": true
            };
        }
        // =========================================================
        // 路徑 5：一般單字島關卡 (最後保底)
        // =========================================================
        else {
            console.log('✅ 進入路徑 5: 一般單字關卡');
            let islandName = '300字島';
            if (this.wordCount === '800') islandName = '800字島';
            else if (this.wordCount === '1200') islandName = '1200字島';

            payload = {
                "島嶼": islandName,
                "關卡": this.stageLabel,
                "題型": "zh_to_en,en_to_zh",
                "題數": 1200,
                "include_answer": true
            };
        }

        console.log(' 發送 Payload:', JSON.stringify(payload, null, 2));

        const response = await api.post('/questionbank/generate/', payload);
        
        if (!response.data || response.data.length === 0) {
            throw new Error('API 回傳題目為空');
        }

        // 過濾 Cloze 題型
        let apiData = response.data.filter(q => q.type !== 'cloze');

        // 設定題數：ABC 總複習與練習固定 26 題，聽力固定 20 題
        let targetCount = 10;
        const isListening = this.unitName.includes('聽力海灣');
        const isReview = ['06', '800-06', '1200-05'].includes(this.unitId);
        // 判斷是否為挑戰關卡(300字島)
        const isChallengeStage = [
            '啟蒙小木屋', '魔法夢幻島', '圖書館島', '大城市島', '許願星星島', '300字複習', 
            '霧靄之境', '漂流群島', '熔岩盆地', '迴旋之塔', '鏡像平原', '800字複習',     
            '永恆圖書館', '奇異峽谷', '靜默領域', '黎光秘境島', '300單字島', 
            '800單字島', '1200單字島', '超級總複習', '1200字總複習',                   
            '會考大殿堂-1', '會考大殿堂-2', '1200單字複習'
        ].includes(this.stageLabel);

        if (isListening || isReview || isChallengeStage || this.unitId === 'final') {
            targetCount = 20;
        }

        // ABC 模式強制 26 題
        if (this.wordCount === 'abc' || this.unitId === 'final' || ['af', 'gl', 'mr', 'sz'].includes(this.unitId)) {
            targetCount = 26;
        }

        apiData = apiData.sort(() => Math.random() - 0.5).slice(0, targetCount);

        this.questionsList = apiData.map(q => {
            const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);
            let audioText = q.question_text;
            if (hasChinese(q.question_text)) audioText = q.answer;

            return {
                id: q.id,
                title: q.question_text,
                audioSrc: audioText,
                correctAnswer: q.answer,
                explanation: q.explanation || '無題解',
                options: (q.options || []).map(opt => ({
                    value: opt.id, label: opt.text, audioSrc: opt.text
                }))
            };
        });

        this.loadQuestion(0);
        if (this.quizMode === 'listening') this.startTimer();

    } catch (error) {
        console.error('Fetch error:', error);
        alert('無法取得題庫');
        this.goBack();
    } finally {
        this.isLoading = false;
    }
},
        loadQuestion(index) {
            this.selectedAnswer = null;
            this.currentQuestionIndex = index;
            if (this.questionsList[index]) {
                this.currentQuestion = this.questionsList[index];
            }
        },

        playAudio(text) {
            if (!text) return;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },

        handleOptionClick(option) {
            this.selectedAnswer = option.value;

            if (this.quizMode === 'abc') {
                this.playAudio(option.label);
            }

            if (this.quizMode === 'listening') {
                setTimeout(() => { this.handleSubmit(); }, 300);
            }
        },

        // --- 所有模式為連續作答 ---
        handleSubmit() {
            if (!this.selectedAnswer) return;

            // 1. 記錄答案
            this.userAnswers.push({
                question_id: this.currentQuestion.id,
                option_id: this.selectedAnswer
            });

            // 2. 判斷流程
            if (this.isLastQuestion) {
                // 如果是最後一題，送出整包答案
                this.submitFinalResults();
            } else {
                // 還有下一題，繼續
                this.loadQuestion(this.currentQuestionIndex + 1);
            }
        },
startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timeLeftSeconds = 300; // 重設為 5 分鐘
            this.timerInterval = setInterval(() => {
                this.timeLeftSeconds--;
                if (this.timeLeftSeconds <= 0) {
                    clearInterval(this.timerInterval);
                    this.submitFinalResults(); // 時間到自動交卷
                }
            }, 1000);
        },
async submitFinalResults() {
    // 1. 清除計時器，防止重複觸發
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.isLoading = true;
    try {
        // 🔥 新增邏輯：補齊未作答的題目
        // 遍歷原本的題目列表 (questionsList)
        // 如果 userAnswers 裡找不到該題的答案，就補上 null
        const finalAnswers = this.questionsList.map(q => {
            const existingAnswer = this.userAnswers.find(a => a.question_id === q.id);
            
            if (existingAnswer) {
                return existingAnswer; // 有作答，回傳原本的答案
            } else {
                return {
                    question_id: q.id,
                    option_id: null // 沒作答，回傳 null
                };
            }
        });
        
        // 預設值
        let islandName = '300字島'; 
        if (this.wordCount === '800') islandName = '800字島';
        else if (this.wordCount === '1200') islandName = '1200字島';
        
        let submitUnit = this.unitName;
        let submitStage = this.stageLabel;

        // ABC 判斷
        if (['af', 'gl', 'mr', 'sz'].includes(this.unitId)) {
            islandName = 'ABC啟航島';
        } else if (this.unitId === 'final') {
            islandName = 'ABC 總復習';
        }

        // 聽力海灣判斷
        const isListeningBay = this.unitName.includes('聽力海灣');
        if (isListeningBay) {
            islandName = this.level === 'secondary' ? '國中聽力海灣' : '國小聽力海灣';
            submitUnit = this.stageLabel; 
            submitStage = this.stageLabel;
        }

        // 4. 構建 Payload
        const payload = {
            "answers": finalAnswers, 
            "island": islandName,
            "unit": submitUnit,
            "stage": submitStage
        };

        console.log('>>> Submit Check Payload:', JSON.stringify(payload, null, 2));
        
        const response = await api.post('/questionbank/check/', payload);
        const apiResult = response.data;

        // --- 處理回傳結果 ---
        this.earnedStars = apiResult.summary.stars; 
        this.finalScore = apiResult.summary.correct_count * 10; 

        // 報表顯示邏輯
     this.reportData = apiResult.results.map((res, index) => {
    // 檢查字串中是否包含英文字母
    const hasEnglish = /[a-zA-Z]/.test(res.question_text);
    
    // 如果題目是英文就播題目，否則播正確答案(英文)
    const audioSrc = hasEnglish ? res.question_text : res.correct_answer;

    return {
        index: index + 1,
        question: res.question_text,
        audioSrc: audioSrc,
        myAnswer: res.selected_option,
        correctAnswer: res.correct_answer,
        isCorrect: res.is_correct,
        explanation: res.explanation
    };
});

        this.currentPhase = 'complete';
        this.isSubmitted = true; 

    } catch (error) {
        console.error('Check failed:', error);
        alert('批改失敗，請檢查網絡');
    } finally {
        this.isLoading = false;
    }
},
goToResultDetail() {
    let targetRouteName = 'LessonDetail'; // 預設回單字島單元
    let backParams = { 
        unitId: this.unitId, 
        level: this.level, 
        wordCount: this.wordCount 
    };

    // 關鍵判斷：如果是聽力海灣
    if (this.unitName.includes('聽力海灣')) {
        // 根據 level 對應 index.js 裡的路由 name
        targetRouteName = this.level === 'primary' ? 'PrimaryListenDetail' : 'SecondaryListenDetail';
        backParams = { unitId: 'listen', level: this.level };
    }

    this.$router.push({
        name: 'TrialResultDetail',
        params: {
            finalScore: this.earnedStars,
            examId: this.unitId,
            examTitle: this.stageLabel,
            resultList: this.reportData,
            backRoute: {
                name: targetRouteName, 
                params: backParams
            }
        }
    });
},
goBack() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.$router.go(-1);
     },
    beforeDestroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    }
};
</script>

<style lang="scss" scoped>
.quiz-page {
    @include main-card-page;
    

}

i {
    margin-right: 4px;
}


.header-wrap {
    @include flex-center;
    justify-content: space-between;
    width: 100%;
    gap: 0 28px;
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
}
   .question-mode  .question-content .question-wrap .question-title{
        font-size: 140px;
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
    color: $main-black-text;
    margin-bottom: 48px;
    text-align: center;
}

.options-grid {
    @include option-grid
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
    color: $main-black-text;
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