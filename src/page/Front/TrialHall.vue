<template>
    <div class="trial-hall-page">
        <div class="return-last-page" @click="goBack">
            <i class="fas fa-angle-left"></i> 返回
        </div>
        <!-- <div v-if="isDevelopment" class="god-mode-selection">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">🛠️ God Mode: 直接選擇試卷測試串接</p>
            <div class="god-btns" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <el-button v-for="target in examTargets" :key="target.id" type="info" plain size="small"
                    @click="selectExamFromGodMode(target)">
                    {{ target.name }} ({{ target.id }})
                </el-button>
            </div>
        </div> -->
        <h1 class="page-title">試煉殿堂</h1>
        <div class="main-card">

            <div class="card-header-content">
                <el-row :gutter="48">
                    <el-col :sm='24' :md="24" :xl="8" class="left-section">
                        <img :src="hallAvatar" alt="試煉殿堂吉祥物" class="hall-avatar">
                    </el-col>
                    <el-col :sm='24' :md="24" :xl="16" class="right-section">
                        <div class="description-area">
                            <div class="text-group">
                                <h2 class="card-title">試煉殿堂</h2>
                                <p class="card-desc">準備好後就接受挑戰，證明你的實力！</p>
                            </div>
                        </div>

                        <div class="tabs-control">
                            <button :class="['tab-btn', { 'is-active': activeTab === 'challenge' }]"
                                @click="activeTab = 'challenge'">
                                <i class="fas fa-book-open"></i> 試煉挑戰
                            </button>
                            <button :class="['tab-btn', { 'is-active': activeTab === 'history' }]"
                                @click="activeTab = 'history'">
                                <i class="fas fa-history"></i> 歷史記錄
                            </button>
                        </div>
                        <div class="card-body-content">
                            <div v-if="activeTab === 'challenge'" class="challenge-area">
                                <div class="exam-info-box">
                                    <div class="exam-info">
                                        <h3 class="exam-title">{{ formatExamName(nextAvailableExam.name) }}</h3>
                                        <div class="exam-details">
                                            <p class="detail-item">
                                                <i class="far fa-clock"></i>
                                                檢測期程: 即日起 ~ 2025-12-31
                                            </p>

                                            <p class="detail-item">
                                                <i class="fas fa-hourglass-half"></i>
                                                考試時長: {{ totalExamTime }} 分鐘
                                            </p>

                                            <p class="detail-item">
                                                <i class="fas fa-list-ol"></i>
                                                測驗部分: {{ nextAvailableExam.parts.length }} 個單元
                                            </p>
                                        </div>
                                    </div>
                                    <button :class="['start-exam-btn', { 'is-completed-btn': isExamCompleted }]"
                                        :disabled="isExamCompleted" @click="showStartExamDialog(nextAvailableExam)">
                                        <template v-if="isExamCompleted">
                                            考試完畢
                                        </template>
                                        <template v-else>
                                            {{ hasLocalProgress ? '繼續作答' : '開始作答' }}
                                        </template>
                                    </button>
                                </div>
                            </div>
                            <vue-custom-scrollbar v-else class="history-area" :settings="scrollSettings"
                                v-loading="isLoadingHistory">
                                <div v-if="historyList.length === 0 && !isLoadingHistory" class="no-data-info">
                                    <i class="fas fa-folder-open"></i>
                                    <p>目前尚無有任何考試紀錄</p>
                                </div>

                                <div v-for="(record, idx) in historyList" :key="idx" class="score-info-box"
                                    style="cursor: pointer;" @click="goToHistoryDetail(record)">
                                    <div class="exam-info">
                                        <h3 class="exam-title">{{ formatExamName(record.exam_name) }}</h3>
                                        <div class="exam-details">
                                            <p class="detail-item">
                                                <i class="far fa-calendar-check"></i>
                                                作答時間：{{ formatHistoryTime(record.answer_time) }}
                                            </p>
                                            <p class="detail-summary">
                                                總題數: {{ record.summary.total }} | 答對: <span style="color: #27ae60;">{{
                                                    record.summary.correct }}</span> | 答錯: <span
                                                    style="color:#AA1F0F;">{{
                                                        record.summary.wrong }}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="display-final-score">
                                        <p class="final-score">{{ record.score }}</p>
                                        <p>分數</p>
                                    </div>
                                </div>
                            </vue-custom-scrollbar>
                        </div>
                    </el-col>
                </el-row>
            </div>


        </div>
        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="examDialogVisible" width="550px" center
            :close-on-click-modal="false" :show-close="false">

            <div class="dialog-content">
                <h3 class="title exam-warning-title">
                    <i class="fas fa-exclamation-circle"></i> 注意
                </h3>

                <p class="description">請確認您已準備好再開始作答。</p>

                <p class="description exam-checklist-title">為避免影響您的測驗結果，請務必確認：</p>
                <ul class="exam-checklist">
                    <li>網路連線穩定</li>
                    <li>裝置有足夠電量</li>
                    <li>已預留足夠作答時間</li>
                </ul>

                <p class="description final-question">是否確定要開始考試？</p>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button class="start-exam-btn" @click="confirmStartExam">開始考試</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import api from '@/config/api';

const EXAM_MASTER_SETTINGS = {
    // 總共35分鐘
    'ps-2': {
        'EngToChi': { time: 15 },
        'ChiToEng': { time: 15 },
        'Listening': { time: 5 }
    },
    // 總共40分鐘
    'ms7-2': {
        'EngToChi': { time: 10 },
        'ChiToEng': { time: 10 },
        'Listening': { time: 5 },
        'ContextFill': { time: 15 }
    },
    // 總共40分鐘
    'ms8-2': {
        'EngToChi': { time: 10 },
        'ChiToEng': { time: 10 },
        'Listening': { time: 5 },
        'ContextFill': { time: 15 }
    }
};

export default {
    name: 'TrialHall',
    props: {
        scrollSettings: {
            suppressScrollY: true,  // 關閉直向滾動
            suppressScrollX: false, // 開啟橫向滾動
            wheelPropagation: false
        }
    },
    data() {
        return {
            activeTab: 'challenge', // 'challenge', 'history'
            hallAvatar: require('../../assets/image/home/exam-island.png'),
            examDialogVisible: false,
            isDevelopment: true,
            isGenerating: false,
            genProgress: '',
            examTargets: [
                { stage: 2, id: 'ps-2', name: '國小英語單字檢測-2', level: 'primary', words: 300, parts: ['EngToChi', 'ChiToEng', 'Listening'] },
                { stage: 2, id: 'ms7-2', name: '7年級英語單字檢測-2', level: 'secondary-7', words: 800, parts: ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'] },
                { stage: 2, id: 'ms8-2', name: '8年級英語單字檢測-2', level: 'secondary-8', words: 1200, parts: ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'] }
            ],
            historyList: [],
            isLoadingHistory: false,
            selectedExamTarget: null,
        };
    },
    watch: {
        activeTab(newTab) {
            if (newTab === 'history') {
                this.fetchAllHistory();
            }
        }
    },
    computed: {
        // 檢查「目前這份試卷」是否有進度
        hasLocalProgress() {
            if (!this.nextAvailableExam) return false;
            const key = `exam_progress_${this.nextAvailableExam.id}`;
            return localStorage.getItem(key) !== null;
        },
        totalExamTime() {
            const examId = this.nextAvailableExam.id;
            const settings = EXAM_MASTER_SETTINGS[examId];

            if (!settings) return 0;

            // 將所有單元的 time 加總
            return Object.values(settings).reduce((acc, part) => {
                return acc + (part.time || 0);
            }, 0);
        },
        nextAvailableExam() {
            if (!this.historyList || this.historyList.length === 0) {
                return this.examTargets[0];
            }
            const completedCodes = this.historyList.map(h => h.code);
            const next = this.examTargets.find(target => !completedCodes.includes(target.id));

            // 如果找不到未完成的，就回傳最後一個或第一個，
            return next || this.examTargets[this.examTargets.length - 1];
        },

        // 判斷當前顯示的這份試卷是否已經考過
        isExamCompleted() {
            if (!this.historyList || this.historyList.length === 0) return false;
            const completedCodes = this.historyList.map(h => h.code);
            return completedCodes.includes(this.nextAvailableExam.id);
        }
    },
    methods: {
        async fetchAllHistory() {
            this.isLoadingHistory = true;
            this.historyList = [];
            const validRecords = [];

            for (const target of this.examTargets) {
                try {
                    const res = await api.get('/students/exam-papers/history/', {
                        params: { code: target.id }
                    });

                    if (res.data && res.data.questions) {
                        validRecords.push(res.data);
                    }
                } catch (err) {
                    console.log(`試卷 ${target.id} 尚未有紀錄。`);
                }
            }

            this.historyList = validRecords.sort((a, b) =>
                new Date(b.answer_time) - new Date(a.answer_time)
            );

            this.isLoadingHistory = false;
        },
        formatHistoryTime(timeStr) {
            if (!timeStr) return '';
            const date = new Date(timeStr);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${d} ${hh}:${mm}`;
        },
        goBack() {
            this.$router.push('/home');
        },
        getTabName(tab) {
            if (tab === 'history') return '歷史記錄';
            return '試煉挑戰';
        },
        showStartExamDialog(target) {
            this.selectedExamTarget = target;
            this.examDialogVisible = true;
        },

        // 確保點擊「瞭解」後執行正式流程
        async confirmStartExam() {
            this.examDialogVisible = false;
            if (!this.selectedExamTarget) return;

            this.isGenerating = true;
            try {
                const response = await api.get('/students/exam-papers/', { params: { code: this.selectedExamTarget.id } });
                let examData = response.data;

                const storageKey = `exam_progress_${this.selectedExamTarget.id}`;
                const savedData = localStorage.getItem(storageKey);

                let targetPartId = '';
                let accumulatedAnswers = [];

                if (savedData) {
                    // 恢復進度：使用存檔資料
                    const progress = JSON.parse(savedData);
                    targetPartId = progress.currentExamId;
                    accumulatedAnswers = progress.userAnswers || [];
                    if (progress.fullExamData) {
                        examData = progress.fullExamData;
                    }
                    console.log(`[系統] 偵測到斷點，恢復進度`);
                } else {
                    // 全新考試：只負責洗牌，不負責存檔
                    if (examData && examData.parts) {
                        Object.keys(examData.parts).forEach(pKey => {
                            examData.parts[pKey] = examData.parts[pKey].sort(() => Math.random() - 0.5);
                            examData.parts[pKey].forEach(q => {
                                if (q.options) q.options = q.options.sort(() => Math.random() - 0.5);
                            });
                        });
                    }
                    // 定義單元的標準優先級
                    const partPriority = ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'];
                    // 從優先級中找到這份試卷包含的第一個單元
                    const firstAvailableKey = partPriority.find(key => examData.parts[key] && examData.parts[key].length > 0) || Object.keys(examData.parts)[0];
                    targetPartId = this.getPartIdByApiMode(firstAvailableKey);
                    console.log('起始單元:', targetPartId)
                }

                this.$router.push({
                    name: 'TrialQuizPage',
                    params: {
                        level: this.selectedExamTarget.level,
                        examId: targetPartId,
                        examData: examData,
                        examCode: this.selectedExamTarget.id,
                        accumulatedAnswers: accumulatedAnswers
                    }
                });

            } catch (err) {
                console.error('[系統] 啟動考試失敗:', err);
                this.$message.error('無法載入考試資料');
            } finally {
                this.isGenerating = false;
            }
        },
        // God Mode 專用選擇函式
        async selectExamFromGodMode(target) {
            this.isGenerating = true;
            try {
                const response = await api.get('/students/exam-papers/', { params: { code: target.id } });
                const examData = response.data;

                if (!examData.info) {
                    examData.info = target.name;
                }

                if (examData && examData.parts) {
                    Object.keys(examData.parts).forEach(pKey => {
                        examData.parts[pKey] = examData.parts[pKey].sort(() => Math.random() - 0.5);
                        examData.parts[pKey].forEach(q => {
                            if (q.options) q.options = q.options.sort(() => Math.random() - 0.5);
                        });
                    });
                }

                const availablePartKeys = Object.keys(examData.parts);
                const firstPartKey = availablePartKeys[0]; // 例如 "EngToChi"
                const firstPartId = this.getPartIdByApiMode(firstPartKey); // 轉為 "part1-eng-chi"

                this.$router.push({
                    name: 'TrialQuizPage',
                    params: {
                        level: target.level,
                        examId: firstPartId,
                        examData: examData,
                        examCode: target.id
                    }
                });
            } catch (err) { console.error(err); }
            finally { this.isGenerating = false; }
        },
        getPartIdByApiMode(apiPartKey) {
            const map = {
                'EngToChi': 'part1-eng-chi',
                'ChiToEng': 'part2-chi-eng',
                'Listening': 'part3-listening',
                'ContextFill': 'ms-part4-context'
            };
            return map[apiPartKey] || 'part1-eng-chi';
        },

        async generateAllExamData() {
            this.isGenerating = true;
            this.genProgress = '開始連線 API (God Mode)...';
            const finalData = {};

            const typeMapping = {
                'EngToChi': '英翻中',
                'ChiToEng': '中翻英',
                'Listening': '聽力',
                'ContextFill': '克漏字'
            };

            const exams = [
                {
                    id: 'ps-2', name: '國小英語單字檢測-2', island: '300字島', parts: [
                        { type: 'EngToChi', count: 100 }, { type: 'ChiToEng', count: 80 }, { type: 'EngToChi', count: 20, isListening: true }
                    ]
                },
                {
                    id: 'ms7-2', name: '7年級英語單字檢測-2', island: '800字島', parts: [
                        { type: 'EngToChi', count: 100 }, { type: 'ChiToEng', count: 80 }, { type: 'EngToChi', count: 20, isListening: true }, { type: 'ContextFill', count: 50 }
                    ]
                },
                {
                    id: 'ms8-2', name: '8年級英語單字檢測-2', island: '1200字島', parts: [
                        { type: 'EngToChi', count: 100 }, { type: 'ChiToEng', count: 80 }, { type: 'EngToChi', count: 20, isListening: true }, { type: 'ContextFill', count: 50 }
                    ]
                }
            ];

            try {
                for (const exam of exams) {
                    finalData[exam.id] = { info: exam.name, parts: {} };

                    for (let i = 0; i < exam.parts.length; i++) {
                        const part = exam.parts[i];
                        const typeName = typeMapping[part.type];
                        const partKey = part.isListening ? 'Listening' : part.type;

                        this.genProgress = `抓取中: ${exam.name} -> ${part.isListening ? '聽力(英翻中)' : typeName}...`;

                        const payload = {
                            "島嶼": exam.island,
                            "題型": typeName,
                            "題數": part.count,
                            "include_answer": true
                        };

                        const response = await api.post('/questionbank/generate/', payload);
                        finalData[exam.id].parts[partKey] = response.data;

                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
                }

                this.downloadObjectAsJson(finalData, "Trial_Exams_Stage2_Only_Database");
                this.genProgress = ' 第二階段數據獲取成功！';

            } catch (error) {
                console.error('God Mode Error:', error);
                this.genProgress = ` 錯誤: ${error.message}`;
            } finally {
                this.isGenerating = false;
            }
        },

        downloadObjectAsJson(exportObj, exportName) {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", exportName + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        },
        formatExamName(apiName) {
            if (!apiName) return '未知名稱';

            // 名稱映射表
            const nameMap = {
                '國小英文測驗 2': '國小英語單字檢測-2',
                '7年級英語單字檢測-2': '7年級英語單字檢測-2',
                '8年級英語單字檢測-2': '8年級英語單字檢測-2'
            };

            // 如果 API 回傳的名稱在映射表中，則回傳對應的正式名稱，否則回傳原始名稱
            return nameMap[apiName.trim()] || apiName;
        },
        goToHistoryDetail(record) {
            console.log("原始 API 紀錄:", record);
            const formattedName = this.formatExamName(record.exam_name);

            let allFormattedList = [];

            record.questions.forEach((partGroup) => {
                const pKey = partGroup.part_key;

                partGroup.questions.forEach((q) => {
                    const hasEnglish = /[a-zA-Z]/.test(q.question_text);
                    const finalAudioSrc = hasEnglish ? q.question_text : q.correct_answer;

                    allFormattedList.push({
                        index: q.index || 0,
                        question: q.question_text,
                        audioSrc: finalAudioSrc,
                        myAnswer: q.selected_text || '未作答',
                        correctAnswer: q.correct_answer,
                        isCorrect: q.is_correct,
                        explanation: q.explanation || '',
                        partKey: pKey
                    });
                });
            });

            // 存入標題與結果到 sessionStorage
            sessionStorage.setItem('tempTrialResult', JSON.stringify(allFormattedList));
            sessionStorage.setItem('tempTrialTitle', formattedName);

            this.$router.push({
                name: 'ResultDetail',
                params: {
                    examId: record.code,
                    finalScore: record.score,
                    examTitle: formattedName,
                    resultList: allFormattedList,
                    backRoute: { name: 'TrialHall' }
                }
            });
        }
    },
    mounted() {
        this.fetchAllHistory();
    },

};
</script>

<style lang="scss" scoped>
.trial-hall-page {
    padding-left: 100px;

    .challenge-confirm-modal {

        .description,
        .exam-checklist {
            display: inline;
            align-self: flex-start;
            margin: 4px 0;
            padding-left: 8%;
            text-align: left;
        }

        .exam-checklist {
            font-weight: 600;
            padding-left: 12%;
        }

        .final-question {
            margin-top: 16px;
        }
    }
}

.page-title {
    @include page-main-title;
    margin-bottom: 28px;
}


.main-card {
    @include main-card;
    min-width: 900px;
    padding: 4% 50px;

    .history-area {
        height: 200px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 16px 0;

        .no-data-info {
            color: $main-grey-text;
            margin-top: 24px;
            font-size: 18px
        }
    }

    .card-header-content {
        @include flex-center;

        .right-section {
            min-width: 600px;
        }


        img {
            width: 100%;
            min-width: 250px;
        }

        .description-area {
            display: flex;
            align-items: center;

            .hall-avatar {
                width: 150px;
                height: 150px;
                object-fit: contain;
                margin-right: 20px;
            }

            .text-group {
                .card-title {
                    font-size: 32px;
                    font-weight: bold;
                    color: $main-black-text;
                    margin-bottom: 5px;
                    text-align: left;
                }

                .card-desc {
                    font-size: 20px;
                    margin: 0;
                    color: $main-grey-text;
                }
            }
        }

        .tabs-control {
            display: flex;
            background-color: #F0F3F5;
            border-radius: 10px;
            margin: 16px 0;
            padding: 5px;
            height: fit-content;

            .tab-btn {
                padding: 10px 15px;
                font-size: 16px;
                font-weight: 600;
                border: none;
                background: transparent;
                border-radius: 8px;
                width: 100%;
                cursor: pointer;
                transition: background-color 0.2s, color 0.2s;
                color: $main-blue-text;

                i {
                    margin-right: 8px;
                }

                &.is-active {
                    background-color: $main-dark-blue;
                    color: white;
                }
            }
        }

    }

    .card-body-content {
        padding: 4px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .challenge-area {
        @include flex-center;
        flex-grow: 1;
        justify-content: center;
        width: 100%;

        .exam-info-box {
            width: 100%;
        }
    }

    .exam-info-box .exam-info {
        justify-content: center;
        padding: 24px 0;
    }

    .score-info-box .exam-info {
        justify-content: flex-start;
    }

    .exam-info-box,
    .score-info-box {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        padding-right: 0;
        padding-left: 24px;
        border: 3px solid #C7D3D1;
        border-radius: 16px;
        box-shadow: 0px 4px 4px 0px #00000040;

        .exam-info {
            display: flex;
            gap: 12px 0;
            flex-direction: column;

            .exam-title {
                font-size: 40px;
                font-weight: bold;
                margin: 0;
                text-align: left;
                color: $main-black-text;
            }

            .exam-details {
                display: flex;
                flex-direction: column;
                align-items: start;
                font-size: 16px;
                gap: 8px 0;
                color: $main-grey-text;

                .detail-item {
                    color: $main-grey-text;
                    margin: 0;

                    i {
                        margin-right: 8px;
                        color: #5D9CEC;
                    }
                }

                .detail-summary {
                    margin-top: 4px;
                }
            }

        }


        .start-exam-btn {
            height: auto;
            text-wrap: nowrap;
            @include common-btn;
            border-radius: 0 16px 16px 0;
            font-size: 20px;
            transition: background-color 0.2s;
        }

        .is-completed-btn {
            background-color: #bdc3c7;
            cursor: not-allowed;
            opacity: 0.8;

            &:hover {
                background-color: #bdc3c7;
            }
        }
    }

    .score-info-box {
        margin: 4px;
        padding: 16px 24px;

        .display-final-score {
            @include flex-center;
            flex-direction: column;
            font-size: 18px;
            color: $main-blue-text;

            p {
                margin: 0;
            }


            .final-score {
                font-size: 32px;
                color: $main-black-text;
                font-weight: 600;
            }
        }
    }

}



@media (min-width: 768px) and (pointer: coarse) {
    .trial-hall-page {
        padding: 6%;

        .main-card {
            padding: 5%;
        }

        .exam-info-box,
        .score-info-box {

            .start-exam-btn {
                text-wrap: nowrap;
                margin-left: 8px;
            }

            .exam-info {
                .exam-details {
                    text-align: left;
                }

                .exam-title {
                    font-size: 24px;
                }
            }
        }

        .card-header-content {
            padding: 8px;

            img {
                width: 150px;
            }

            .right-section {
                min-width: unset;
            }
        }

    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .trial-hall-page {
        padding: 24px 8%;

        .page-title {
            margin-top: 16px;
        }
    }

    .main-card {
        .history-area {
            .score-info-box {
                margin: 0;
            }
        }

        .exam-info-box .exam-info,
        .score-info-box .exam-info {

            .exam-title {
                font-size: 24px;
            }
        }

        .exam-info-box,
        .score-info-box {
            width: 100%;
        }

        .score-info-box {
            padding: 16px;
        }

        .card-header-content {
            padding: 8px;

            img {
                width: 200px;
            }

            .right-section {
                min-width: unset;
            }
        }
    }

}
</style>