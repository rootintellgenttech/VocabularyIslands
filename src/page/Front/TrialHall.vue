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
                                <i class="fas fa-book-open"></i> 正式挑戰
                            </button>
                            <!-- <button :class="['tab-btn', { 'is-active': activeTab === 'practice' }]"
                                @click="activeTab = 'practice'">
                                <i class="fas fa-dumbbell"></i> 自主練習
                            </button> -->
                            <button :class="['tab-btn', { 'is-active': activeTab === 'history' }]"
                                @click="activeTab = 'history'">
                                <i class="fas fa-history"></i> 歷史記錄
                            </button>
                        </div>
                        <div class="card-body-content">
                            <div v-if="activeTab === 'challenge'" class="challenge-area">
                                <div v-if="!isAllExamsCompleted" class="exam-info-box">
                                    <div class="exam-info">
                                        <h3 class="exam-title">{{ formatExamName(nextAvailableExam.name) }}</h3>
                                        <div class="exam-details">
                                            <p class="detail-item"><i class="far fa-clock"></i> 檢測期程: 2026-06-01 ~
                                                2026-06-30</p>
                                            <p class="detail-item"><i class="fas fa-hourglass-half"></i> 考試時長: {{
                                                totalExamTime }} 分鐘</p>
                                        </div>
                                    </div>
                                    <button :class="['start-exam-btn', { 'is-disabled': !isExamOpen }]"
                                        :disabled="!isExamOpen" @click="showStartExamDialog(nextAvailableExam)">
                                        {{ isExamOpen ? (hasLocalProgress(nextAvailableExam.id) ? '繼續作答' : '開始作答') :
                                            '尚未開放' }}
                                    </button>
                                </div>

                                <div v-else class="exam-info-box is-completed-box"
                                    style="text-align: center; justify-content: center;">
                                    <div class="exam-info">
                                        <h3 class="exam-title" style="color: #999;">正式測驗已全部完成</h3>
                                        <p>請前往「歷史記錄」查看您的成績</p>
                                    </div>
                                </div>
                            </div>

                            <vue-custom-scrollbar v-else class="history-area" :settings="scrollSettings"
                                v-loading="isLoadingHistory">
                                <div v-if="historyList.length === 0 && !isLoadingHistory" class="no-data-info">
                                    <i class="fas fa-folder-open"></i>
                                    <p>目前尚無任何考試紀錄</p>
                                </div>
                                <div v-for="(record, idx) in historyList" :key="idx" class="score-info-box"
                                    @click="goToHistoryDetail(record)">
                                    <div class="exam-info">
                                        <h3 class="exam-title">{{ formatExamName(record.exam_name) }}</h3>
                                        <div class="exam-details">
                                            <p class="detail-item"><i class="far fa-calendar-check"></i> {{
                                                formatHistoryTime(record.answer_time) }}</p>
                                            <p class="detail-summary">答對: {{ record.summary.correct }} / 總題數: {{
                                                record.summary.total }}</p>
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

        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="examDialogVisible" width="600px" center
            :close-on-click-modal="false" append-to-body @close="dialogStep = 1">

            <div v-if="dialogStep === 1" class="dialog-content-custom">
                <div class="warning-header">
                    <i class="fas fa-exclamation-circle icon-big"></i>
                    <h2 class="main-title">
                        注意：此{{ (selectedExamTarget && selectedExamTarget.isPractice) ? '練習' : '考試' }}只有一次作答機會！
                    </h2>
                </div>

                <div class="rule-box">
                    <p v-if="!(selectedExamTarget && selectedExamTarget.isPractice)" class="rule-warn">
                        本測驗須於學校統一安排之施測時段，並在教師監督下進行。<br>
                        學生不得於未經學校安排或非在校情況下自行施測。
                    </p>
                    <p v-else class="rule-warn">
                        本練習旨在協助您熟悉正式考試流程，請依正式考試態度作答。
                    </p>
                    <p class="rule-text secondary">
                        違反施測規定者，其測驗結果自行負責。<br>
                        作答途中不會保留作答紀錄，若因網路不穩或退出作答頁面，則視為結束考試。
                    </p>
                </div>

                <div class="checklist-section">
                    <p class="checklist-title">為避免影響您的測驗結果，請務必確認：</p>
                    <ul class="exam-checklist-v2">
                        <li>網路連線穩定</li>
                        <li>裝置有足夠電量</li>
                        <li>已預留足夠作答時間</li>
                    </ul>
                </div>
            </div>

            <div v-else class="dialog-content-warn-step">
                <div class="warn-img-wrapper">
                    <img :src="warnImage" alt="警告" class="step2-warn-img">
                </div>
                <div class="warn-text-content">
                    <h3 class="warn-highlight">注意！</h3>
                    <p class="warn-desc">
                        答案一經送出，將無法修改或返回上一題，<br>
                        請確認作答無誤後再送出。
                    </p>
                </div>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button class="btn-cancel" @click="examDialogVisible = false">取消返回</el-button>

                <el-button v-if="dialogStep === 1" class="btn-confirm-start" @click="dialogStep = 2">
                    下一步
                </el-button>

                <el-button v-else
                    :class="['btn-confirm-start', { 'practice-theme': selectedExamTarget && selectedExamTarget.isPractice }]"
                    @click="confirmStartExam">
                    開始{{ (selectedExamTarget && selectedExamTarget.isPractice) ? '練習' : '考試' }}
                </el-button>
            </span>
        </el-dialog>


    </div>
</template>


<script>
import api from '@/config/api';

const EXAM_MASTER_SETTINGS = {
    'ps-1': { 'EngToChi': { time: 15 }, 'ChiToEng': { time: 15 }, 'Listening': { time: 5 } },
    'ps-2': { 'EngToChi': { time: 15 }, 'ChiToEng': { time: 15 }, 'Listening': { time: 5 } },
    'ms7-1': { 'EngToChi': { time: 10 }, 'ChiToEng': { time: 10 }, 'Listening': { time: 5 }, 'ContextFill': { time: 15 } },
    'ms7-2': { 'EngToChi': { time: 10 }, 'ChiToEng': { time: 10 }, 'Listening': { time: 5 }, 'ContextFill': { time: 15 } },
    'ms8-1': { 'EngToChi': { time: 10 }, 'ChiToEng': { time: 10 }, 'Listening': { time: 5 }, 'ContextFill': { time: 15 } },
    'ms8-2': { 'EngToChi': { time: 10 }, 'ChiToEng': { time: 10 }, 'Listening': { time: 5 }, 'ContextFill': { time: 15 } }
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
            activeTab: 'challenge',
            hallAvatar: require('../../assets/image/home/exam-island.png'),
            examDialogVisible: false,
            dialogStep: 1, // 1: 規則說明, 2: 最後警告
            warnImage: require('@/assets/image/trial-quiz/warn.png'),
            // 正式考試
            examTargets: [
                { id: 'ps-2', name: '國小英語單字檢測-2', level: 'primary', parts: ['EngToChi', 'ChiToEng', 'Listening'] },
                { id: 'ms7-2', name: '7年級英語單字檢測-2', level: 'secondary-7', parts: ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'] },
                { id: 'ms8-2', name: '8年級英語單字檢測-2', level: 'secondary-8', parts: ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'] }
            ],
            // 練習卷 (隨時開放)
            // practiceExams: [
            //     { id: 'ps-1', name: '國小英語單字檢測-1', level: 'primary', parts: ['EngToChi', 'ChiToEng', 'Listening'], isPractice: true },
            //     { id: 'ms7-1', name: '7年級英語單字檢測-1', level: 'secondary-7', parts: ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'], isPractice: true },
            //     { id: 'ms8-1', name: '8年級英語單字檢測-1', level: 'secondary-8', parts: ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'], isPractice: true }
            // ],
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
        isExamOpen() {
            const now = new Date();
            const startTime = new Date('2026-06-01T00:00:00');
            const endTime = new Date('2026-06-30T23:59:59');
            return now >= startTime && now <= endTime;
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
        // 過濾後的正式考試列表
        filteredExamTargets() {
            const completedCodes = this.historyList.map(h => h.code);
            return this.examTargets.filter(target => !completedCodes.includes(target.id));
        },

        // // 過濾後的自主練習列表
        // filteredPracticeExams() {
        //     const completedCodes = this.historyList.map(h => h.code);
        //     return this.practiceExams.filter(practice => !completedCodes.includes(practice.id));
        // },
        nextAvailableExam() {
            const list = this.filteredExamTargets;
            if (list.length === 0) {
                // 如果都考完了，回傳最後一個項目（或你可以自定義處理方式，例如回傳 null）
                return this.examTargets[this.examTargets.length - 1];
            }
            return list[0];
        },
        isAllExamsCompleted() {
            return this.filteredExamTargets.length === 0;
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

            // 合併正式考試與自主練習的所有 ID
            const allPossibleIds = [
                ...this.examTargets.map(t => t.id),
                // ...this.practiceExams.map(t => t.id)
            ];

            console.log("開始抓取歷史紀錄，目標清單:", allPossibleIds);

            // 遍歷所有 ID 請求 API
            for (const code of allPossibleIds) {
                try {
                    const res = await api.get('/students/exam-papers/history/', {
                        params: { code: code }
                    });

                    // 確保回傳資料有效且包含題目資訊
                    if (res.data && res.data.questions) {
                        validRecords.push(res.data);
                    }
                } catch (err) {
                    // 404 代表該學生尚未作答這份試卷，屬於正常情況，不報錯
                    if (err.response && err.response.status === 404) {
                        console.log(`試卷 ${code} 尚未有作答紀錄。`);
                    } else {
                        console.error(`獲取試卷 ${code} 歷史失敗:`, err);
                    }
                }
            }

            // 將所有紀錄依照「答題時間」由新到舊排序
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
            this.dialogStep = 1;
            this.examDialogVisible = true;
        },
        hasLocalProgress(id) {
            return localStorage.getItem(`exam_progress_${id}`) !== null;
        },
        getExamTime(id) {
            const settings = EXAM_MASTER_SETTINGS[id];
            return settings ? Object.values(settings).reduce((acc, p) => acc + (p.time || 0), 0) : 0;
        },

        async confirmStartExam() {
            const target = this.selectedExamTarget;
            const now = new Date();

            // 定義 6 月的起訖時間
            const startTime = new Date('2026-06-01T00:00:00');
            const endTime = new Date('2026-06-30T23:59:59');

            if (!target.isPractice) {
                // --- 正式考試卷 ---
                if (now < startTime) {
                    this.$message.warning('此正式考試尚未開放（開放時間：2026-06-01 起）');
                    this.examDialogVisible = false;
                    return;
                }
                if (now > endTime) {
                    this.$message.warning('此正式考試已結束（開放至 2026-06-30）');
                    this.examDialogVisible = false;
                    return;
                }
            }

            // 通過檢查，執行開始考試
            this.examDialogVisible = false;
            this.startExamFlow(target);
        },
        async startExamFlow(target) {
            try {
                const response = await api.get('/students/exam-papers/', { params: { code: target.id } });
                let examData = response.data;
                const storageKey = `exam_progress_${target.id}`;
                const savedData = localStorage.getItem(storageKey);

                let targetPartId = '';
                let accumulatedAnswers = [];

                if (savedData) {
                    const progress = JSON.parse(savedData);
                    targetPartId = progress.currentExamId;
                    accumulatedAnswers = progress.userAnswers || [];
                    examData = progress.fullExamData || examData;
                } else {
                    const partPriority = ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'];
                    const firstAvailableKey = partPriority.find(key => examData.parts[key] && examData.parts[key].length > 0);
                    targetPartId = this.getPartIdByApiMode(firstAvailableKey);
                }

                this.$router.push({
                    name: 'TrialQuizPage',
                    params: {
                        level: target.level,
                        examId: targetPartId,
                        examData: examData,
                        examCode: target.id,
                        accumulatedAnswers: accumulatedAnswers
                    }
                });
            } catch (err) {
                this.$message.error('無法載入考試資料');
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
        formatExamName(nameOrId) {
            // 優先定義完整的名稱對照表 (包含所有正式與練習卷)
            const nameMap = {
                'ps-1': '國小英語單字檢測-1',
                'ps-2': '國小英語單字檢測-2',
                'ms7-1': '7年級英語單字檢測-1',
                'ms7-2': '7年級英語單字檢測-2',
                'ms8-1': '8年級英語單字檢測-1',
                'ms8-2': '8年級英語單字檢測-2'
            };

            if (nameMap[nameOrId]) return nameMap[nameOrId];

            const allExams = [...(this.examTargets || []), ...(this.practiceExams || [])];
            const found = allExams.find(ex => ex.id === nameOrId || ex.name === nameOrId);

            return found ? found.name : nameOrId;
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

}

.challenge-confirm-modal {

    .warning-header {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0 10px;

        .main-title,
        i {
            margin: 0 0 20px;
            color: $main-black-text;
        }

        i {
            font-size: 20px;
        }
    }


    .rule-box,
    .checklist-section {
        padding: 0 16px;

        .rule-text,
        .checklist-title,
        .exam-checklist-v2 {
            font-size: 16px;
            margin: 8px 0 0;
        }

        .rule-warn {
            font-size: 16px;
            margin: 0 0 12px;
            color: $main-black-text;
            font-weight: 600;
        }
    }

    .dialog-content-warn-step {
        text-align: center;
        padding: 20px 0;

        .warn-img-wrapper {
            .step2-warn-img {
                width: 100%;
                height: auto;
            }
        }

        .warn-highlight,
        .warn-text-content {
            text-align: left;
            font-size: 16px;
            color: $main-black-text;
            padding: 0 16px;
        }

        .warn-highlight,
        .warn-desc {
            font-size: 18px;
            padding: 0 16px;
            margin: 0;
        }
    }

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

            &.is-disabled {
                background-color: #ccc !important;
                cursor: not-allowed !important;
                box-shadow: none !important;
                transform: none !important;
            }
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