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
                    <i v-for="n in earnedStars" :key="n" style="color: #ffc940;" class="fas fa-star filled">
                    </i>
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
            //  優先級：明確的聽力活動
            if (this.activityType && this.activityType.includes('listening')) return 'listening';

            //  判定 ABC 模式：
            //    條件 A: unitId 是 ABC 相關的 ID (af, gl, mr, sz, final)
            //    條件 B: wordCount 為 'abc'
            //    條件 C: 單元名稱或階段標籤包含 'ABC' 或 'A-Z' (總複習)
            const isAbc =
                ['af', 'gl', 'mr', 'sz', 'final'].includes(this.unitId) ||
                this.wordCount === 'abc' ||
                (this.unitName && this.unitName.includes('ABC')) ||
                (this.stageLabel && this.stageLabel.includes('A-Z'));

            if (isAbc) return 'abc';

            //  預設為一般單字模式
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
        console.log('QuizPage Params:', {
            unitId: this.unitId,
            activityType: this.activityType,
            wordCount: this.wordCount,
            quizMode: this.quizMode
        });
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
                console.log('--- [QuizPage Final Integrated Debug] ---');

                // 基礎判定變數
                const isAbcUnit = ['af', 'gl', 'mr', 'sz', 'final'].includes(this.unitId) || this.wordCount === 'abc';
                const isListeningBay = this.unitName.includes('聽力海灣');
                // 複習模式判定
                const isReviewMode = (this.unitName.includes('複習') || this.unitName.includes('復習') || this.unitId === 'final') && !isListeningBay;

                let apiData = [];
                let sliceCount = 10; // 預設 10 題

                // =========================================================
                // 邏輯分流 A：ABC 字母島模式
                // =========================================================
                if (isAbcUnit) {
                    console.log('執行 ABC 模式');
                    let dynamicCount = 26;
                    const rangeMatch = this.stageLabel.match(/([A-Z])-([A-Z])/);
                    if (rangeMatch) {
                        const startChar = rangeMatch[1].charCodeAt(0);
                        const endChar = rangeMatch[2].charCodeAt(0);
                        dynamicCount = Math.abs(endChar - startChar) + 1;
                    }
                    if (this.stageLabel.includes('總復習') || this.stageLabel.includes('總複習') || this.stageLabel === 'A-Z') {
                        dynamicCount = 26;
                    }
                    sliceCount = dynamicCount;
                    let payload = {};
                    if (this.unitId === 'final') {
                        if (this.stageLabel === 'A-Z') {
                            payload = { "島嶼": "ABC啟航島", "題數": 26, "include_answer": true };
                        } else {
                            payload = { "單元": this.stageLabel, "題數": dynamicCount, "include_answer": true };
                        }
                    } else {
                        payload = { "關卡": this.stageLabel, "題數": dynamicCount, "include_answer": true };
                    }
                    const response = await api.post('/questionbank/generate/', payload);
                    apiData = response.data;
                }

                // =========================================================
                // 邏輯分流 B：300/800/1200 複習模式 (特定複習單元)
                // =========================================================
                else if (isReviewMode) {
                    console.log('執行複習模式');
                    sliceCount = 20;
                    const islandLabels = ['300字複習', '300單字島', '800字複習', '800單字島', '1200字複習', '1200單字島', '超級總複習', '1200單字複習'];
                    let p1 = { "題數": 10, "題型": "英翻中", "include_answer": true };
                    let p2 = { "題數": 10, "題型": "中翻英", "include_answer": true };

                    if (islandLabels.includes(this.stageLabel)) {
                        let targetIsland = this.stageLabel.includes('800') ? "800字島" : (this.stageLabel.includes('1200') || this.stageLabel.includes('超級') ? "1200字島" : "300字島");
                        p1["島嶼"] = targetIsland; p2["島嶼"] = targetIsland;
                    } else {
                        p1["單元"] = this.stageLabel; p2["單元"] = this.stageLabel;
                    }
                    const [res1, res2] = await Promise.all([api.post('/questionbank/generate/', p1), api.post('/questionbank/generate/', p2)]);
                    apiData = [...res1.data, ...res2.data];
                }

                // =========================================================
                // 邏輯分流 C：聽力海灣
                // =========================================================
                else if (isListeningBay) {
                    console.log('執行聽力海灣雙呼叫模式');
                    sliceCount = 20;

                    // 兩個 Payload：分別取英翻中與中翻英
                    let p1 = { "題數": 10, "題型": "英翻中", "include_answer": true };
                    let p2 = { "題數": 10, "題型": "中翻英", "include_answer": true };

                    // 判斷應該傳送「島嶼」還是「單元」
                    if (this.stageLabel === '300字複習') {
                        p1["島嶼"] = "300字島"; p2["島嶼"] = "300字島";
                    } else if (this.stageLabel === '800字複習') {
                        p1["島嶼"] = "800字島"; p2["島嶼"] = "800字島";
                    } else if (this.stageLabel.includes('1200')) {
                        p1["島嶼"] = "1200字島"; p2["島嶼"] = "1200字島";
                    } else {
                        // 一般聽力關卡統一傳「單元」
                        p1["單元"] = this.stageLabel; p2["單元"] = this.stageLabel;
                    }

                    console.log('聽力海灣雙 Payload:', { p1, p2 });
                    const [res1, res2] = await Promise.all([
                        api.post('/questionbank/generate/', p1),
                        api.post('/questionbank/generate/', p2)
                    ]);

                    // 合併 10 + 10 成為 20 題
                    apiData = [...res1.data, ...res2.data];
                }

                // =========================================================
                // 邏輯分流 D：一般單元練習 ( 針對 300/800/1200 島嶼管卡)
                // =========================================================
                else {
                    console.log('執行普通單元模式 (啟蒙小木屋 ~ 黎光秘境島)');

                    // 1. 決定動態題數上限
                    let dynamicLimit = 1200;
                    if (this.wordCount === '300') dynamicLimit = 300;
                    else if (this.wordCount === '800') dynamicLimit = 800;
                    else if (this.wordCount === '1200') dynamicLimit = 1200;

                    const isTotalStudy = (this.stageLabel === 'ALL');
                    const isChallengeMode = (this.activityType === 'quiz');

                    let islandName = this.wordCount === '1200' ? '1200字島' : (this.wordCount === '800' ? '800字島' : '300字島');

                    // 2. 構建 Payload
                    let payload = {
                        "島嶼": islandName,
                        "單元": this.unitName,
                        "題數": dynamicLimit,
                        "include_answer": isChallengeMode
                    };

                    // 如果是總學習 (ALL)，不傳關卡，顯示全部
                    // 如果是挑戰 (quiz)，必須傳關卡，切片取 10 題
                    if (isTotalStudy) {
                        sliceCount = dynamicLimit;
                    } else {
                        sliceCount = 10;
                        payload["關卡"] = this.stageLabel;
                    }

                    console.log(' D 分流最終 Payload:', JSON.stringify(payload));

                    try {
                        const response = await api.post('/questionbank/generate/', payload);
                        apiData = response.data;

                        if (!apiData || apiData.length === 0) {
                            throw new Error('API 返回數據為空');
                        }

                        // 過濾克漏字
                        apiData = apiData.filter(q => q.type !== 'cloze');
                    } catch (apiErr) {
                        console.error("API 請求失敗:", apiErr);
                        throw apiErr;
                    }
                }

                // =========================================================
                // 通用資料處理
                // =========================================================
                apiData = apiData.sort(() => Math.random() - 0.5).slice(0, sliceCount);

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
                            value: opt.id,
                            label: opt.text,
                            audioSrc: opt.text
                        }))
                    };
                });

                this.loadQuestion(0);
                if (this.quizMode === 'listening') this.startTimer();

            } catch (error) {
                console.error('Fetch error:', error);
                alert('無法取得題庫，請稍後再試');
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

                // 不管什麼模式都播，只要有音訊文字就播
                this.$nextTick(() => {
                    this.playAudio(this.currentQuestion.audioSrc);
                });
            }
        },
        playAudio(text) {
            if (!text) return;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;
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

            // 記錄答案
            this.userAnswers.push({
                question_id: this.currentQuestion.id,
                option_id: this.selectedAnswer
            });

            // 判斷流程
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
            // 清除計時器，防止重複觸發
            if (this.timerInterval) clearInterval(this.timerInterval);

            this.isLoading = true;
            try {
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

            // 判斷如果是聽力海灣
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
                margin-bottom: 24px;
            }


        }

        .result-back-btn {
            @include result-back-btn
        }
    }
}



.progress-header {
    @include progress-star
}

.question-content {
    @include main-card-content;

    .question-title {
        font-size: 140px;
    }
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