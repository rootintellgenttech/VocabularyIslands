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
                    <i v-for="n in 5" :key="n" style="color: #ffc940;" class="fas fa-star"
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
                console.log('--- [QuizPage Strict Debug] ---');
                console.log('ID:', this.unitId, '| Label:', this.stageLabel, '| Name:', this.unitName);

                let payload = {};

                // 1. 決定島嶼名稱
                let islandName = '300字島';
                if (this.wordCount === '800' || (this.unitId && this.unitId.includes('800'))) islandName = '800字島';
                if (this.wordCount === '1200' || (this.unitId && this.unitId.includes('1200'))) islandName = '1200字島';

                // 只要單元名稱包含「複習」，就認定為複習模式
                const isReviewMode = this.unitName.includes('複習') || this.unitName.includes('復習') || ['06', '800-06', '1200-05'].includes(this.unitId);

                // =========================================================
                // 分流 A：複習模式 (針對 300/800/1200 複習單元內的點擊)
                // =========================================================
                if (isReviewMode) {
                    console.log('✅ 進入強效複習模式分流');

                    // 1. 全島/全項目抓題標籤 (不傳「單元」，不傳「關卡」)
                    const islandOnlyLabels = [
                        '300字島', '800字島', '1200字島', '300字複習', '800字複習', '1200字複習', '超級總複習'
                    ];

                    if (islandOnlyLabels.includes(this.stageLabel)) {
                        // 正確格式：{"島嶼": "...", "題數": ..., "include_answer": true}
                        payload = {
                            "島嶼": islandName,
                            "題數": (islandName === '300字島') ? 300 : 1200,
                            "include_answer": true
                        };
                    } else {
                        // 2. 特定單元抓題 (例如: 奇異峽谷)
                        payload = {
                            "島嶼": islandName,
                            "單元": this.stageLabel,
                            "題數": 1200,
                            "include_answer": true
                        };
                    }
                }
                // =========================================================
                // 分流 B：其他特殊模式 (ABC, 聽力海灣)
                // =========================================================
                else if (this.unitId === 'final' || this.wordCount === 'abc') {
                    const island = 'ABC啟航島';
                    if (this.unitId === 'final') {
                        payload = this.stageLabel === 'A-Z' ? { "島嶼": island, "題數": 26, "include_answer": true } : { "島嶼": island, "單元": this.stageLabel, "題數": 26, "include_answer": true };
                    } else {
                        const mapping = { 'af': 'A-F', 'gl': 'G-L', 'mr': 'M-R', 'sz': 'S-Z' };
                        payload = { "島嶼": island, "單元": mapping[this.unitId], "關卡": this.stageLabel, "題型": "字母", "題數": 26, "include_answer": true };
                    }
                }
                else if (this.unitName.includes('聽力海灣')) {
                    console.log('✅ 進入路徑 3: 聽力海灣模式');

                    // 針對國中聽力海灣的複習關卡做特殊判定
                    if (this.stageLabel === '800字複習') {
                        // 800字複習專用：指向 800字島
                        payload = {
                            "島嶼": "800字島",
                            "題數": 1200,
                            "include_answer": true
                        };
                    } else if (this.stageLabel === '1200單字複習') {
                        // 1200單字複習：指向 1200字島
                        payload = {
                            "島嶼": "1200字島",
                            "題數": 1200,
                            "include_answer": true
                        };
                    } else {
                        // 一般單元 (霧靄之境、永恆圖書館等)
                        payload = {
                            "單元": this.stageLabel,
                            "題數": 1200,
                            "include_answer": true
                        };
                    }
                }
                // =========================================================
                // 分流 C：一般單元 (01~05) 
                // =========================================================
                else {
                    payload = {
                        "島嶼": islandName,
                        "單元": this.unitName,
                        "關卡": this.stageLabel,
                        "題數": 1200,
                        "include_answer": true
                    };
                }

                console.log('🚀 發送 Payload:', JSON.stringify(payload, null, 2));

                const response = await api.post('/questionbank/generate/', payload);
                let apiData = response.data;

                // 題型過濾
                if (isReviewMode) {
                    apiData = apiData.filter(q => q.type === 'en_to_zh' || q.type === 'zh_to_en');
                } else {
                    apiData = apiData.filter(q => q.type !== 'cloze');
                }

                // 隨機選題
                let targetCount = 10;
                if (isReviewMode || this.unitName.includes('聽力海灣') || this.unitId === 'final') {
                    targetCount = (this.unitId === 'final' || this.wordCount === 'abc') ? 26 : 20;
                }

                apiData = apiData.sort(() => Math.random() - 0.5).slice(0, targetCount);

                this.questionsList = apiData.map(q => {
                    const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);
                    let audioText = q.question_text;
                    if (hasChinese(q.question_text)) audioText = q.answer;
                    return {
                        id: q.id, title: q.question_text, audioSrc: audioText,
                        correctAnswer: q.answer, explanation: q.explanation || '無題解',
                        options: (q.options || []).map(opt => ({ value: opt.id, label: opt.text, audioSrc: opt.text }))
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
            utterance.rate = 0.3;
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
                name: 'ResultDetail',
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

.question-mode .question-content .question-wrap .question-title {
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