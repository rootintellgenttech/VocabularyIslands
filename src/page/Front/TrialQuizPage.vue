<template>
    <div class="quiz-page">
        <div v-if="currentPhase === 'quiz'" :class="['main-card']">

            <!-- 一鍵完成考試 -->
            <!-- <div v-if="isDevelopment" class="test-god-toolbar"
                style="padding: 10px; background: #fff3cd; border-bottom: 1px solid #ffeeba; display: flex; gap: 10px; justify-content: center;">
                <el-button type="warning" size="mini" @click="godModeSkipCurrentPart">⏩ 跳過本階段</el-button>
                <el-button type="danger" size="mini" @click="godModeCompleteWholeExam">🔥 一鍵全卷交卷</el-button>
            </div> -->

            <template v-if="currentPhase === 'quiz' && currentQuestion">
                <div class="header-wrap">
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
                        {{ currentQuizConfig && currentQuizConfig.qType === 'ContextFill' ? '選擇空格內的正確答案' :
                            instructionText }}
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
                            <!-- 每題 {{ pointsPerQuestion }} 分，總分 {{ currentQuizConfig ? currentQuizConfig.totalScore : 0 }} 分 -->
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
                <p class="description"> <i class="fas fa-exclamation-circle"></i> 請注意！</p>

                <p class="description">答案一經送出，將無法修改或返回上一題， 請確認作答無誤後再送出。</p>

            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="startQuiz">開始考試</el-button>
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

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="480px" center
            :close-on-click-modal="false" :show-close="false">
            <div class="dialog-content">
                <h3 class="title exam-warning-title"><i class="fas fa-exclamation-circle"></i> 確定要離開考試嗎？</h3>
                <p class="description" style="color:#AA1F0F; font-weight: bold;">
                     注意：中途離開將會自動將剩餘題目視為「未填寫」並直接提交試卷，這將導致得分大幅降低或為零分。
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


// 測驗配置：設定各關卡的屬性
const EXAM_MASTER_SETTINGS = {
    // 國小 第二階段
    'ps-2': {
        'EngToChi': { time: 15, totalScore: 50, next: 'part2-chi-eng' },
        'ChiToEng': { time: 15, totalScore: 40, next: 'part3-listening' },
        'Listening': { time: 5, totalScore: 10, next: null }
    },
    // 國中 7年級 第二階段
    'ms7-2': {
        'EngToChi': { time: 10, totalScore: 40, next: 'part2-chi-eng' },
        'ChiToEng': { time: 10, totalScore: 32, next: 'part3-listening' },
        'Listening': { time: 5, totalScore: 8, next: 'ms-part4-context' },
        'ContextFill': { time: 15, totalScore: 20, next: null }
    },
    // 國中 8 年級 第一階段
    'ms8-2': {
        'EngToChi': { time: 10, totalScore: 40, next: 'part2-chi-eng' },
        'ChiToEng': { time: 10, totalScore: 32, next: 'part3-listening' },
        'Listening': { time: 5, totalScore: 8, next: 'ms-part4-context' },
        'ContextFill': { time: 15, totalScore: 20, next: null }
    }
};

// 基礎標題與類型映射
const PART_METADATA = {
    'part1-eng-chi': { title: '第一部分 英翻中', type: 'EngToChi', instruction: '選擇對應的中文' },
    'part2-chi-eng': { title: '第二部分 中翻英', type: 'ChiToEng', instruction: '選擇對應的英文' },
    'part3-listening': { title: '第三部分 單字聽力測驗', type: 'Listening', instruction: '選擇對應的中文' },
    'ms-part4-context': { title: '第四部分 文意測驗', type: 'ContextFill', instruction: '選擇空格內正確的答案' }
};

export default {
    name: 'TrialQuizPage',
    props: {
        level: { type: String, required: true },
        examId: { type: String, required: true } // 當前的 Part ID
    },
    data() {
        return {
            currentPhase: 'intro',
            confirmDialogVisible: false,
            introAvatar: require('@/assets/image/answer-avatar.png'),
            wonderfulAvatarPath: require('@/assets/image/wonderful-avatar.png'),
            currentQuizConfig: null,
            finalTotalScore: 0,
            currentQuestionIndex: 1, // 統一從 1 開始 (1-based)
            timeLeftSeconds: 0,
            timerInterval: null,
            selectedAnswer: null,
            currentQuestion: null,
            examData: null,
            currentPartQuestions: [],
            userAnswers: [], // 累積所有 Part 的答案
            examCode: '',
            isDevelopment: true,
            exitDialogVisible: false,
            nextRoute: null,
            isLoading: false
        }
    },
    computed: {
        // 每個考卷唯一的儲存名稱
        storageKey() {
            return `exam_progress_${this.examCode}`;
        },
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
            // 計算+修正小數點
            return this.currentQuizConfig.totalScore / this.maxQuestions;
        },
        isFirstPart() {
            return this.examId === 'part1-eng-chi';
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.currentPhase === 'quiz') {
            this.nextRoute = to.path;
            this.exitDialogVisible = true;
            next(false); // 阻斷跳轉
        } else {
            next();
        }
    },
    created() {
        const { examData, examCode, accumulatedAnswers } = this.$route.params;
        if (!examData) { this.$router.push('/trial-hall'); return; }

        this.examCode = examCode;
        this.examData = examData;
        this.userAnswers = accumulatedAnswers || [];

        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
            const progress = JSON.parse(savedData);
            this.userAnswers = progress.userAnswers || [];

            // 如果本地有存題目資料，強制覆蓋，確保順序一致 
            if (progress.fullExamData) {
                this.examData = progress.fullExamData;
            }

            if (progress.currentExamId === this.examId) {
                this.currentQuestionIndex = progress.currentQuestionIndex || 1;
            }
        }

        this.loadQuizConfig(this.examId);

        this.currentQuestion = this.currentPartQuestions[this.currentQuestionIndex - 1];

        if (savedData) {
            this.startQuiz();
        }
    },
    watch: {
        examId: {
            immediate: false,
            handler(newExamId) {
                this.loadQuizConfig(newExamId);
            }
        }
    },
    methods: {
        loadQuizConfig(examId) {
            const meta = PART_METADATA[examId];
            if (!meta) return this.goBack();
            const cleanCode = (this.examCode || "").trim();
            const specificSet = EXAM_MASTER_SETTINGS[cleanCode]?.[meta.type];
            const rawQuestions = this.examData.parts[meta.type] || [];

            this.currentPartQuestions = rawQuestions.map(q => ({
                id: q.id,
                title: q.question_text,
                audioWord: q.question_text,
                questionParts: meta.type === 'ContextFill' ? (q.question_text || "").split(/(_______)/g) : null,
                rawOptions: q.options || [],
                options: (q.options || []).map(opt => ({
                    id: opt.id,
                    value: opt.description,
                    label: opt.description
                }))
            }));

            this.currentQuizConfig = {
                title: meta.title,
                qType: meta.type,
                instruction: meta.instruction,
                maxQuestions: rawQuestions.length,
                timeLimitMinutes: specificSet ? specificSet.time : 15,
                nextPart: specificSet ? specificSet.next : null
            };

            this.currentPhase = 'intro';

            this.selectedAnswer = null;
        },
        startQuiz() {
            this.confirmDialogVisible = false;
            this.currentPhase = 'quiz';

            // 只有當 index 是初始值時才設為 1，否則保留恢復的值 
            if (!this.currentQuestionIndex) {
                this.currentQuestionIndex = 1;
            }

            // 根據目前的 index 設定題目 (Array 是 0-based)
            this.currentQuestion = this.currentPartQuestions[this.currentQuestionIndex - 1];

            this.timeLeftSeconds = this.currentQuizConfig.timeLimitMinutes * 60;
            this.startTimer();

            if (this.currentQuizConfig.qType === 'Listening') {
                this.playAudio(this.currentQuestion.audioWord);
            }
        },
        async confirmExit() {
            this.exitDialogVisible = false;
            this.autoFillAllRemainingWithNull();

            if (this.timerInterval) clearInterval(this.timerInterval);

            await this.submitEntireExam();
        },
        // 顯示確認對話框 (解決點擊「繼續」沒反應的問題)
        showConfirmDialog() {
            this.confirmDialogVisible = true;
        },
        // 補齊全卷未作答題目
        autoFillAllRemainingWithNull() {
            const parts = this.examData.parts;
            const answeredIds = new Set(this.userAnswers.map(a => a.question_id));
            Object.keys(parts).forEach(pKey => {
                parts[pKey].forEach(q => {
                    if (!answeredIds.has(q.id)) {
                        this.userAnswers.push({ "question_id": q.id, "selected_option_id": null });
                        answeredIds.add(q.id);
                    }
                });
            });
        },
        selectAnswer(value) {
            this.selectedAnswer = value;
        },
        saveProgressToLocal() {
            const progress = {
                userAnswers: this.userAnswers,
                currentQuestionIndex: this.currentQuestionIndex,
                currentExamId: this.examId,
                fullExamData: this.examData // 持續保存這份洗牌後的資料
            };
            localStorage.setItem(this.storageKey, JSON.stringify(progress));
        },
        handleSubmit() {
            if (!this.selectedAnswer) return;

            const q = this.currentPartQuestions[this.currentQuestionIndex - 1];
            const opt = q.rawOptions.find(o => o.description === this.selectedAnswer);

            // 先存入答案
            this.userAnswers.push({
                question_id: q.id,
                selected_option_id: opt ? opt.id : null
            });

            // 判斷是進入下一題還是下一單元
            if (this.currentQuestionIndex < this.maxQuestions) {
                this.currentQuestionIndex++; // 題號加 1，現在變成 11

                // 題號加完後才存檔 
                this.saveProgressToLocal();

                this.currentQuestion = this.currentPartQuestions[this.currentQuestionIndex - 1];
                this.selectedAnswer = null;
                if (this.currentQuizConfig.qType === 'Listening') {
                    this.playAudio(this.currentQuestion.audioWord);
                }
            } else {
                // 本單元結束
                this.handleSummaryContinue();
            }
        },
        handleSummaryContinue() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            const nextPartId = this.currentQuizConfig.nextPart;

            if (nextPartId) {
                // 強制重置題號，確保下一 Part 載入時從 1 開始
                this.currentQuestionIndex = 1;

                const progress = {
                    userAnswers: this.userAnswers,
                    currentQuestionIndex: 1,
                    currentExamId: nextPartId,
                    fullExamData: this.examData
                };
                localStorage.setItem(this.storageKey, JSON.stringify(progress));

                this.$router.replace({
                    name: 'TrialQuizPage',
                    params: {
                        level: this.level,
                        examId: nextPartId,
                        examData: this.examData,
                        examCode: this.examCode,
                        accumulatedAnswers: this.userAnswers
                    }
                });
            } else {
                // 真正的全卷最後一題，提交！
                this.submitEntireExam();
            }
        },
        // 提交成功後務必刪除紀錄
        async submitEntireExam() {
            this.isLoading = true;
            try {
                const payload = { "code": this.examCode, "answers": this.userAnswers };
                const response = await api.post('/students/exam-papers/submit/', payload);

                // 交卷成功後清除 LocalStorage
                localStorage.removeItem(this.storageKey);

                this.finalTotalScore = response.data.score;
                this.currentPhase = 'complete';
            } catch (error) {
                this.$message.error('提交失敗');
            } finally {
                this.isLoading = false;
            }
            localStorage.removeItem(this.storageKey);
        },
        // God Mode: 隨機一鍵全卷
        async godModeCompleteWholeExam() {
            this.isLoading = true;
            const allAnswers = [];
            const parts = this.examData.parts;

            // 檢查確保考卷資料存在
            if (!parts) {
                this.$message.error("找不到考卷內容");
                this.isLoading = false;
                return;
            }

            console.log("🔥 God Mode 啟動：正在跨分類蒐集所有題目...");

            //  遍歷所有的單元分類 (例如: EngToChi, ChiToEng, Listening, ContextFill)
            Object.keys(parts).forEach(partKey => {
                const questions = parts[partKey];

                // 確保該分類是一個陣列且有題目
                if (Array.isArray(questions)) {
                    questions.forEach(q => {
                        // 取得題目唯一 ID (後端要求使用 id 欄位)
                        const qId = q.id;

                        let selectedId = null;
                        if (q.options && q.options.length > 0) {
                            // --- 隨機選像邏輯 ---
                            // 從該題目的選項陣列中隨機取出一個索引
                            const randomIndex = Math.floor(Math.random() * q.options.length);
                            // 取得隨機選項的唯一 ID (後端要求使用 id 欄位)
                            selectedId = q.options[randomIndex].id;
                        }

                        // 只有當題目 ID 存在時，才存入答案包
                        if (qId) {
                            allAnswers.push({
                                "question_id": qId,
                                "selected_option_id": selectedId // 如果沒選項則為 null
                            });
                        }
                    });
                }
            });

            this.userAnswers = allAnswers;

            console.log(`[God Mode] 封裝完畢：共蒐集 ${this.userAnswers.length} 題。準備執行最終提交...`);

            const examName = this.examData.name || this.examData.info || "試煉挑戰卷";
            sessionStorage.setItem('tempTrialTitle', examName);
            if (this.timerInterval) clearInterval(this.timerInterval);

            await this.submitEntireExam();
        },
        // God Mode: 隨機跳過本階段
        godModeSkipCurrentPart() {
            // 從「目前這題」開始補完本階段的答案
            for (let i = this.currentQuestionIndex - 1; i < this.currentPartQuestions.length; i++) {
                const q = this.currentPartQuestions[i];

                // 避免重複推入已有的題目 ID
                const alreadyAnswered = this.userAnswers.some(ans => ans.question_id === q.id);

                if (!alreadyAnswered) {
                    let selectedId = null;
                    if (q.rawOptions && q.rawOptions.length > 0) {
                        const randIdx = Math.floor(Math.random() * q.rawOptions.length);
                        selectedId = q.rawOptions[randIdx].id;
                    }
                    this.userAnswers.push({ "question_id": q.id, "selected_option_id": selectedId });
                }
            }

            // 在進入下一階段前，必須強制重置題號為 1
            this.currentQuestionIndex = 1;

            // 執行跳轉邏輯
            this.handleSummaryContinue();
        },
        // 處理「當前單元」超時補 null
        autoFillCurrentPartWithNull() {
            console.log(`[超時處理] 正在補齊單元 ${this.currentQuizConfig.title} 的剩餘題目...`);
            // 從目前的題目索引開始，一直補到該單元的最後一題
            for (let i = this.currentQuestionIndex - 1; i < this.currentPartQuestions.length; i++) {
                const q = this.currentPartQuestions[i];
                // 檢查是否已經在 userAnswers 裡（防止重複推入）
                const alreadyAnswered = this.userAnswers.some(ans => ans.question_id === q.id);

                if (!alreadyAnswered) {
                    this.userAnswers.push({
                        "question_id": q.id,
                        "selected_option_id": null // 時間到，給空白
                    });
                }
            }
        },

        // 計時器
        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.timeLeftSeconds--;
                if (this.timeLeftSeconds <= 0) {
                    clearInterval(this.timerInterval);
                    this.timeLeftSeconds = 0;

                    // 先執行「當前單元」自動補 null
                    this.autoFillCurrentPartWithNull();

                    //  彈出訊息提醒學生
                    this.$message.warning(`${this.currentQuizConfig.title} 時間到！`);

                    //執行跳轉判斷
                    this.handleSummaryContinue();
                }
            }, 1000);
        },
        async showResultDetail() {
            this.isLoading = true; // 開啟 Loading 避免重複點擊
            try {
                console.log(`準備獲取歷史詳情，試卷代碼: ${this.examCode}`);

                const response = await api.get('/students/exam-papers/history/', {
                    params: { code: this.examCode }
                });

                let record = response.data;

                if (Array.isArray(record)) {
                    record = record[0];
                }

                if (!record || !record.questions) {
                    throw new Error("查無詳細答題紀錄");
                }

                const examName = record.exam_name || this.partTitle || "試煉挑戰卷";
                sessionStorage.setItem('tempTrialTitle', examName);

                let formattedResult = [];

                record.questions.forEach(partGroup => {
                    const pKey = partGroup.part_key; // 例如 "EngToChi"

                    if (Array.isArray(partGroup.questions)) {
                        partGroup.questions.forEach(q => {
                            // 判斷發音來源
                            const hasEnglish = /[a-zA-Z]/.test(q.question_text);

                            formattedResult.push({
                                index: 0,
                                question: q.question_text,
                                audioSrc: hasEnglish ? q.question_text : q.correct_answer,
                                myAnswer: q.selected_text || '未作答',
                                correctAnswer: q.correct_answer,
                                isCorrect: q.is_correct,
                                explanation: q.explanation || '',
                                partKey: pKey
                            });
                        });
                    }
                });

                console.log(`轉換完成，共 ${formattedResult.length} 題，準備跳轉...`);

                sessionStorage.setItem('tempTrialResult', JSON.stringify(formattedResult));

                this.$router.push({
                    name: 'ResultDetail',
                    params: {
                        examId: this.examCode,
                        finalScore: this.finalTotalScore,
                        examTitle: examName,
                        resultList: formattedResult,
                        backRoute: { name: 'TrialHall' }
                    }
                });

            } catch (error) {
                console.error('獲取詳情失敗:', error);
                this.$message.error('無法載入答題結果，請稍後再試');
            } finally {
                this.isLoading = false;
            }
        },
        playAudio(word) {
            if (!word) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(word);
            u.lang = 'en-US';
            u.rate = 0.5;
            window.speechSynthesis.speak(u);
        },
        goBack() {
            this.$router.push('/trial-hall');
        },
        testAudio() {
            this.playAudio('testing');
        }
    },
};
</script>

<style lang="scss" scoped>
.quiz-page {
    @include main-card-page;
    @include flex-center;
    padding-left: 100px;

    .challenge-confirm-modal {
        img {
            width: auto;
            margin: 16px 0;
            height: 300px;
        }
    }
}

.main-card {
    @include main-card;
    min-height: 600px;

    .header-wrap {
        box-sizing: border-box;
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
                gap: 0 8px;

                .audio-tip {
                    @include flex-center;
                    height: 40px;
                    color: #761C00;
                    font-weight: bold;
                    border: 3px solid #F57148;
                    border-radius: 8px;
                    padding: 4px 12px;
                    margin: 0;
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
                font-weight: 600;
                font-size: 20px;
                color: #333;
                margin-bottom: 5px;
            }

            .exam-time {
                font-weight: 600;
                color: #325362;
                line-height: 1.2;
                font-size: 22px;
                margin: 0 0 16px;
            }

            .intro-continue-btn {
                @include common-btn;
                font-size: 18px;
                margin-top: 20px;
                border-radius: 10px;
            }
        }

        .final-avatar {
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
                font-size: 16px;
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



.context-fill-title {
    font-size: 2.4rem !important
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
    .quiz-page {
        padding-left: 0 !important;
    }

    .intro-card {
        height: 100%;

        .intro-main-area {
            margin-top: 48px;
            flex-direction: column;
        }
    }
}
</style>