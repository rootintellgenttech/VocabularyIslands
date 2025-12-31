<template>
    <div class="quiz-page">
        <div v-if="currentPhase === 'quiz'" :class="['main-card']">

            <!-- 一鍵完成考試 -->
            <div v-if="isDevelopment" class="test-god-toolbar"
                style="padding: 10px; background: #fff3cd; border-bottom: 1px solid #ffeeba; display: flex; gap: 10px; justify-content: center;">
                <el-button type="warning" size="mini" @click="godModeSkipCurrentPart">⏩ 跳過本階段</el-button>
                <el-button type="danger" size="mini" @click="godModeCompleteWholeExam">🔥 一鍵全卷交卷</el-button>
            </div>

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

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="exitDialogVisible" width="480px" center
            :close-on-click-modal="false" :show-close="false">
            <div class="dialog-content">
                <h3 class="title exam-warning-title"><i class="fas fa-exclamation-circle"></i> 確定要離開考試嗎？</h3>
                <p class="description" style="color: #e74c3c; font-weight: bold;">
                    ⚠️ 注意：中途離開將會自動將剩餘題目視為「未填寫」並直接提交試卷，這將導致得分大幅降低或為零分。
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
            examData: null,
            allPartsQuestions: {},
            currentPartQuestions: [],
            userAnswers: [],
            examCode: '',
            isDevelopment: true,
            exitDialogVisible: false,
            nextRoute: null,
        }
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
    // 攔截瀏覽器返回鍵與內部跳轉
    beforeRouteLeave(to, from, next) {
        // 如果是在 'complete' (完成)、'intro' (介紹頁)、或 'isLoading'，直接放行
        if (this.currentPhase === 'complete' || this.currentPhase === 'intro' || this.isLoading) {
            next();
        } else {
            // 只有在 'quiz' (作答中) 才會攔截
            this.exitDialogVisible = true;
            this.nextRoute = to;
            next(false); // 攔截導航（這會觸發 aborted 警告，但不影響功能）
        }
    },
    mounted() {
        // 攔截「關閉分頁」或「重整網頁」
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    },

    beforeDestroy() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    },
    created() {
        const { examData, examCode, accumulatedAnswers } = this.$route.params;

        // 檢查數據是否存在
        if (!examData) {
            console.error('❌ 錯誤：未接收到試卷數據');
            this.$router.push('/trial-hall');
            return;
        }

        this.examCode = examCode;
        this.examData = examData;

        if (accumulatedAnswers) {
            this.userAnswers = [...accumulatedAnswers];
        }

        // 數據確認無誤後再載入配置
        this.loadQuizConfig(this.examId);
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
        goBack() {
            // 返回試煉殿堂總頁面
            this.$router.push('/trial-hall');
        },
        // 瀏覽器原生警告（關閉標籤頁時觸發）
        handleBeforeUnload(e) {
            if (this.currentPhase !== 'complete') {
                const confirmationMessage = '考試尚未結束，離開將自動以零分計，確定離開？';
                (e || window.event).returnValue = confirmationMessage;
                return confirmationMessage;
            }
        },

        // 使用者點擊對話框的「確定離開並提交」
        async confirmExit() {
            this.exitDialogVisible = false;

            if (this.currentPhase === 'quiz') {
                this.autoFillAllRemainingWithNull();
                await this.submitEntireExam();
            }

            // 跳轉回大廳或目的地
            const targetPath = this.nextRoute ? this.nextRoute.path : '/trial-hall';
            this.$router.push(targetPath).catch(() => { });
        },
        autoFillAllRemainingWithNull() {
            const parts = this.examData.parts;
            Object.keys(parts).forEach(pKey => {
                parts[pKey].forEach(q => {
                    // 檢查 userAnswers 是否已經有這題 ID (使用外部 ID 比對)
                    const isAnswered = this.userAnswers.some(ans => ans.question_id === q.external_id);
                    if (!isAnswered) {
                        this.userAnswers.push({
                            question_id: q.external_id
                        });
                    }
                });
            });
            console.log(`[強制交卷] 已補齊剩餘題目，總提交數: ${this.userAnswers.length}`);
        },

        handlePartTimeout() {
            console.warn(` 階段 ${this.examId} 時間到！自動補齊...`);
            for (let i = this.currentQuestionIndex; i < this.currentPartQuestions.length; i++) {
                const q = this.currentPartQuestions[i];
                const alreadyAnswered = this.userAnswers.some(a => a.question_id === q.id);
                if (!alreadyAnswered) {
                    this.userAnswers.push({
                        question_id: q.id
                    });
                }
            }
            this.handleSummaryContinue();
        },
        godModeSkipCurrentPart() {
            console.log(`[God Mode] 正在自動完成階段: ${this.currentQuizConfig.title}`);

            for (let i = this.currentQuestionIndex; i < this.currentPartQuestions.length; i++) {
                const q = this.currentPartQuestions[i];

                const correctOpt = q.rawOptions.find(o => o.description === q.correctAnswer) || q.rawOptions[0];

                this.userAnswers.push({
                    question_id: q.id,
                    selected_option_id: correctOpt ? correctOpt.external_id : null
                });
            }

            this.$message.success(`${this.currentQuizConfig.title} 已自動完成`);
            this.handleSummaryContinue();
        },

        //Godmode 一鍵完成考試
    async godModeCompleteWholeExam() {
    this.isLoading = true;
    const allAnswers = [];
    const parts = this.examData.parts;

    if (!parts) {
        this.$message.error("找不到考卷內容");
        this.isLoading = false;
        return;
    }

    Object.keys(parts).forEach(pKey => {
        const questions = parts[pKey];
        if (!Array.isArray(questions)) return;

        questions.forEach(q => {
            const realAnswer = (q.answer || q.correct_answer || "").toString().trim();
            const options = q.options || [];

            // 如果沒有選項，這題無法自動作答，跳過
            if (options.length === 0) return;

            const correctOpt = options.find(o => 
                (o.description || o.text || "").toString().trim() === realAnswer
            );

            allAnswers.push({
                // 優先使用 external_id，否則使用 id
                question_id: q.external_id || q.id,
                // 如果找到正確答案就選它，找不到就選第一個選項（保底不空白）
                selected_option_id: correctOpt ? (correctOpt.external_id || correctOpt.id) : (options[0].external_id || options[0].id)
            });
        });
    });

    this.userAnswers = allAnswers.sort(() => Math.random() - 0.5);

    console.log(`[God Mode] 準備提交 ${this.userAnswers.length} 題答案`);

    // 確保存入標題
    const examName = this.examData.info || "試煉挑戰卷";
    sessionStorage.setItem('tempTrialTitle', examName);

    if (this.timerInterval) clearInterval(this.timerInterval);
    await this.submitEntireExam();
},
  loadQuizConfig(examId) {
    const meta = PART_METADATA[examId];
    if (!meta) return this.goBack();

    const cleanCode = (this.examCode || "").trim(); 
    const specificSet = EXAM_MASTER_SETTINGS[cleanCode]?.[meta.type];

    // 抓取真實題目數據
    const rawQuestions = this.examData.parts[meta.type] || [];

    if (!specificSet) {
        console.warn(`⚠️ 找不到設定: ExamCode=${cleanCode}, Type=${meta.type}`);
        this.currentQuizConfig = {
            title: meta.title,
            qType: meta.type,
            instruction: meta.instruction,
            maxQuestions: rawQuestions.length,
            timeLimitMinutes: 15, // 預設 15 分鐘
            totalScore: 100,      // 預設 100 分
            nextPart: null        // 沒設定就當作最後一關
        };
    } else {
        this.currentQuizConfig = {
            title: meta.title,
            qType: meta.type,
            instruction: meta.instruction,
            maxQuestions: rawQuestions.length,
            timeLimitMinutes: specificSet.time,
            totalScore: specificSet.totalScore,
            nextPart: specificSet.next
        };
    }

    // 🚀 關鍵修改：確保題目物件被正確映射 (Map)
    // 之前可能是這裡映射失敗導致 currentQuestionIndex 找不到內容
    this.currentPartQuestions = rawQuestions.map(q => ({
        id: q.external_id || q.id,
        title: q.question_text,
        audioWord: q.question_text,
        questionParts: meta.type === 'ContextFill' ? (q.question_text || "").split(/(_______)/g) : null,
        options: (q.options || []).map(opt => ({ 
            value: opt.description || opt.text, 
            label: opt.description || opt.text 
        })),
        rawOptions: q.options || [],
        correctAnswer: q.answer || q.correct_answer
    }));

    // 初始化狀態
    this.currentPhase = 'intro';
    this.currentQuestionIndex = 1; // 題目從 1 開始顯示
    this.selectedAnswer = null;

    if (this.currentPartQuestions.length > 0) {
        this.currentQuestion = this.currentPartQuestions[0];
    } else {
        console.error(`❌ 單元 ${meta.type} 內沒有題目資料`);
    }
},
        handleSubmit() {
            if (!this.selectedAnswer) return;

            // 1. 取得當前題目在 API 中的原始資料（為了拿真正的 option ID）
            const currentRawQuestion = this.currentPartQuestions[this.currentQuestionIndex - 1];
            const selectedOptionObj = currentRawQuestion.rawOptions.find(o => o.description === this.selectedAnswer);

            // 2. 儲存答案 (格式：question_id, selected_option_id)
            this.userAnswers.push({
                question_id: currentRawQuestion.id,
                selected_option_id: selectedOptionObj ? selectedOptionObj.external_id : null
            });

            // 3. 換下一題邏輯
            if (this.currentQuestionIndex < this.currentPartQuestions.length) {
                this.currentQuestionIndex++;
                this.currentQuestion = this.currentPartQuestions[this.currentQuestionIndex - 1];
                this.selectedAnswer = null;
                if (this.currentQuizConfig.qType === 'Listening') this.playAudio(this.currentQuestion.audioWord);
            } else {
                this.handleSummaryContinue();
            }
        },

        // 修改 handleSummaryContinue 方法
        handleSummaryContinue() {
            if (this.timerInterval) clearInterval(this.timerInterval);

            //  [新增/修改] 強大調試日誌：輸出當前階段所有作答紀錄
            if (this.currentQuizConfig && this.currentPartQuestions.length > 0) {
                const currentPartIds = this.currentPartQuestions.map(q => q.id);

                // 從 userAnswers 中過濾出屬於本階段的答案
                const phasePayload = this.userAnswers.filter(ans =>
                    currentPartIds.includes(ans.question_id)
                );

                console.group(`階段完成：${this.currentQuizConfig.title} `, 'background: #222; color: #bada55; padding: 2px 5px;');
                console.log('試卷代碼:', this.examCode);
                console.log('本階段總題數:', this.currentPartQuestions.length);
                console.log('有效作答數:', phasePayload.length);
                console.log('未作答(null)數量:', phasePayload.filter(a => a.selected_option_id === null).length);
                console.log('本階段預計發送 Payload:', JSON.stringify(phasePayload, null, 2));
                console.groupEnd();
            }

            if (!this.currentQuizConfig) {
                this.submitEntireExam();
                return;
            }

            const nextPartId = this.currentQuizConfig.nextPart;
            const nextMeta = PART_METADATA[nextPartId];

            // 安全檢查 API 數據
            const hasNextData = nextMeta &&
                this.examData &&
                this.examData.parts &&
                Object.prototype.hasOwnProperty.call(this.examData.parts, nextMeta.type) &&
                this.examData.parts[nextMeta.type].length > 0;

            if (nextPartId && hasNextData) {
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
                console.log('試卷所有階段已結束，準備執行最終提交...', 'color: #ff9f43; font-weight: bold;');
                this.submitEntireExam();
            }
        },
        async submitEntireExam() {
            this.isLoading = true;
            try {
                console.log(`[正式提交] 試卷代碼: ${this.examCode}`);
                console.log(`[正式提交] 總題目數: ${this.userAnswers.length}`);

                const payload = {
                    "code": this.examCode,
                    "answers": this.userAnswers
                };

                const response = await api.post('/students/exam-papers/submit/', payload);
                const result = response.data;

                this.finalTotalScore = result.score;

                this.finalCorrectCount = result.correct;
                this.finalTotalCount = result.total;

                this.reportData = result.details || [];

                this.currentPhase = 'complete';

                console.log(' 考試提交成功，得分：', this.finalTotalScore);
            } catch (error) {
                console.error('Submit Failed:', error);
                alert('試卷提交失敗，請檢查網路連線');
            } finally {
                this.isLoading = false;
            }
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
                    // 觸發全階段超時處理
                    this.handlePartTimeout();
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
            utterance.rate = 0.3;
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

            // 題號索引從 0 開始 (對應陣列)
            this.currentQuestionIndex = 0;

            // 確保題目數據已從 loadQuizConfig 載入
            if (this.currentPartQuestions.length > 0) {
                this.currentQuestion = this.currentPartQuestions[0];
            } else {
                return this.handleSummaryContinue();
            }

            // 設置倒數時間
            this.timeLeftSeconds = this.currentQuizConfig.timeLimitMinutes * 60;
            this.startTimer();

            // 聽力題自動播放
            if (this.currentQuizConfig.qType === 'Listening' && this.currentQuestion.audioWord) {
                this.playAudio(this.currentQuestion.audioWord);
            }
        },

        selectAnswer(value) {
            this.selectedAnswer = value;
        },

        handleSubmit() {
            if (!this.selectedAnswer) return;

            // A. 取得當前題目原始物件
            const currentRawQuestion = this.currentPartQuestions[this.currentQuestionIndex];

            // B. 尋找對應的選項 ID (API 規範)
            const selectedOptionObj = currentRawQuestion.rawOptions.find(o => o.description === this.selectedAnswer);

            // C. 紀錄答案
            this.userAnswers.push({
                question_id: currentRawQuestion.id,
                selected_option_id: selectedOptionObj ? selectedOptionObj.external_id : null
            });

            // D. 判斷是否有下一題 (索引值比長度小 1)
            if (this.currentQuestionIndex < this.currentPartQuestions.length - 1) {
                this.currentQuestionIndex++;
                this.currentQuestion = this.currentPartQuestions[this.currentQuestionIndex];
                this.selectedAnswer = null; // 清空選擇

                // 聽力題自動播放
                if (this.currentQuizConfig.qType === 'Listening' && this.currentQuestion.audioWord) {
                    this.playAudio(this.currentQuestion.audioWord);
                }
            } else {
                // E. 當前 Part 結束
                this.handleSummaryContinue();
            }
        },

        // 處理關卡結束後
        handleSummaryContinue() {
            if (this.timerInterval) clearInterval(this.timerInterval);
            const nextPartId = this.currentQuizConfig.nextPart;

            // 檢查 API 是否真的有下一部分題目
            const nextMeta = PART_METADATA[nextPartId];
            const hasNextData = nextMeta &&
                this.examData.parts &&
                Object.prototype.hasOwnProperty.call(this.examData.parts, nextMeta.type) && // 安全檢查
                this.examData.parts[nextMeta.type].length > 0;

            if (nextPartId && hasNextData) {
                // 自動切換到下一 Part 的 Intro 頁面
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
                // 如果沒有下一關，執行最終 API 提交
                this.submitEntireExam();
            }
        },
        // 前往查看考試結果
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

        // 3. 存入緩存並跳轉
        sessionStorage.setItem('tempTrialResult', JSON.stringify(formattedResult));

        this.$router.push({
            name: 'ResultDetail',
            params: {
                examId: this.examCode,
                finalScore: this.finalTotalScore, // 或使用 record.score
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

.context-fill-title {
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