<template>
    <div class="result-detail-page">
        <div class="result-content-card">
            <header class="result-header">
                <div class="result-header-wrap">
                    <div class="header-left">
                        <div class="back-btn-wrap" @click="goBack">
                            <i class="fas fa-angle-left back-icon"></i> 返回
                        </div>
                    </div>

                    <div class="header-right">
                        <h1 class="exam-info-title">
                            {{ displayTitle }}
                            <span class="student-info">{{ studentClass }} {{ studentName }}</span>
                        </h1>
                        <template v-if="isStarMode">
                            <span class="final-score-value">{{ starCount }} 顆星星</span>
                        </template>
                        <template v-else>
                            <span class="final-score-value">{{ finalScore }} 分</span>
                        </template>
                    </div>
                </div>
            </header>
            <div class="tabs-wrapper" style="position: relative;">
                <div class="tab-stats-summary" v-if="currentPartStats">
                    <div class="stat-tag">總題數 :<strong>{{ currentPartStats.total }}</strong></div>
                    <div class="stat-tag success">答對 :<strong>{{ currentPartStats.correct }}</strong></div>
                    <div class="stat-tag danger">答錯 :<strong>{{ currentPartStats.wrong }}</strong></div>
                </div>
                <el-tabs v-model="activePartId" class="part-tabs" v-if="quizParts && quizParts.length > 0">
                    <el-tab-pane v-for="part in quizParts" :key="part.id" :label="part.title" :name="part.id">
                        <el-table :data="part.questions" style="width: 100%" :row-class-name="tableRowClassName" border
                            height="550">
                            <el-table-column prop="index" label="序" width="60" align="center"></el-table-column>

                            <el-table-column label="題目" min-width="180">
                                <template slot-scope="scope">
                                    <div v-if="part.id === 'Listening' || scope.row.qType === 'Listening'"
                                        class="audio-trigger-row" @click="playAudio(scope.row.audioSrc)">
                                        <i class="fas fa-volume-up" style="cursor: pointer;"></i> 點擊播放
                                    </div>
                                    <span v-else>{{ scope.row.question }}</span>
                                </template>
                            </el-table-column>

                            <el-table-column label="我的答案" min-width="120">
                                <template slot-scope="scope">
                                    <span :class="{ 'text-danger': !scope.row.isCorrect }">{{ scope.row.myAnswer
                                        }}</span>
                                </template>
                            </el-table-column>

                            <el-table-column prop="correctAnswer" label="正確答案" min-width="120"
                                class-name="text-success"></el-table-column>

                            <el-table-column label="結果" width="80" align="center">
                                <template slot-scope="scope">
                                    <i
                                        :class="['fas', scope.row.isCorrect ? 'fa-check correct-icon' : 'fa-times wrong-icon']"></i>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>

                <div v-else-if="quizParts && quizParts.length === 1" class="single-part-container">
                    <el-table :data="quizParts[0].questions" style="width: 100%" :height="600"
                        :row-class-name="tableRowClassName" border>
                        <el-table-column prop="index" label="序列" width="60" align="center"></el-table-column>

                        <el-table-column label="題目" min-width="180">
                            <template slot-scope="scope">
                                <div v-if="quizParts[0].qType === 'Listening'" class="audio-trigger-row"
                                    @click="playAudio(scope.row.audioSrc)"> <i class="fas fa-volume-up"
                                        style="cursor: pointer;"></i> 點擊播放
                                </div>
                                <span v-else>{{ scope.row.question }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column prop="myAnswer" label="我的答案" min-width="120">
                            <template slot-scope="scope">
                                <span :class="{ 'text-danger': !scope.row.isCorrect }">{{ scope.row.myAnswer || '未作答'
                                    }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column prop="correctAnswer" label="正確答案" min-width="120"
                            class-name="text-success"></el-table-column>

                        <el-table-column prop="explanation" label="題目解釋" min-width="200">
                            <template slot-scope="scope">
                                <span class="explanation-text">{{ scope.row.explanation || '-' }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="結果" width="80" align="center">
                            <template slot-scope="scope">
                                <i
                                    :class="['fas', scope.row.isCorrect ? 'fa-check correct-icon' : 'fa-times wrong-icon']"></i>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/config/api';

export default {
    name: 'ResultDetail',
    props: {
        examId: { type: String, required: true },
        finalScore: { type: [String, Number], default: 0 },
        examTitle: { type: String, default: '' },
        resultList: { type: Array, default: () => [] },
        backRoute: { type: Object, default: () => null }
    },
    data() {
        return {
            studentClass: '',
            studentName: '載入中...',
            activePartId: '',
            finalResultData: [],
            apiSummary: null,
            cachedExamTitle: ''
        };
    },
    computed: {
        displayTitle() {
            return this.examTitle || this.cachedExamTitle || '測驗結果';
        },
        //即時統計目前分頁的數據
        currentPartStats() {
            if (!this.quizParts || this.quizParts.length === 0) return null;

            let targetPart;
            if (this.quizParts.length === 1) {
                // 如果只有一個 Part，直接取第一個
                targetPart = this.quizParts[0];
            } else {
                // 如果有多個tabs，根據 activePartId 尋找
                targetPart = this.quizParts.find(p => p.id === this.activePartId);
            }

            if (!targetPart) return null;

            const total = targetPart.questions.length;
            const correct = targetPart.questions.filter(q => q.isCorrect).length;
            const wrong = total - correct;

            return { total, correct, wrong };
        },
        isStarMode() {
            // 排除正式的「試煉殿堂」ID (ps-2, ms7-2, ms8-2 代號)
            // 檢查是否以 'ps-' 或 'ms' 開頭且後面跟著數字，這代表正式試卷
            const isFormalTrial = /^(ps-|ms\d)/.test(this.examId);

            // 如果是正式試卷，一律顯示分數
            if (isFormalTrial) return false;

            // 如果 API 回傳數據中明確有 stars 欄位
            if (this.apiSummary && this.apiSummary.stars !== undefined) {
                return true;
            }

            // 特殊判斷：會考大殿堂 (hero) 與 聽力海灣 (listen)
            if (this.examId === 'hero' || this.examId === 'listen' || this.examId.includes('hero')) {
                return true;
            }

            return !this.examId.startsWith('part');
        },

        starCount() {
            return this.apiSummary ? this.apiSummary.stars : (parseInt(this.finalScore) || 0);
        },

        finalScoreDisplay() {
            return this.finalScore;
        },

        quizParts() {
            if (!this.finalResultData || this.finalResultData.length === 0) return [];

            const partNameMap = {
                'EngToChi': '第一部分 英翻中',
                'ChiToEng': '第二部分 中翻英',
                'Listening': '第三部分 單字聽力',
                'ContextFill': '第四部分 文意測驗'
            };

            const groups = {};

            // 分組邏輯
            this.finalResultData.forEach(q => {
                // 如果沒有 partKey，預設為 EngToChi，避免資料消失
                const key = q.partKey || 'EngToChi';
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(q);
            });

            const order = ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'];

            // 轉換為陣列並排序
            const parts = Object.keys(groups).map(key => ({
                id: key,
                title: partNameMap[key] || '其他內容',
                qType: key === 'Listening' ? 'Listening' : 'General',
                questions: groups[key].map((item, localIndex) => ({
                    ...item, // 展開題目屬性
                    index: localIndex + 1
                }))
            }));

            return parts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        }
    },
    async created() {
        this.fetchStudentInfo();

        const savedTitle = sessionStorage.getItem('tempTrialTitle');
        if (savedTitle) this.cachedExamTitle = savedTitle;

        // 優先讀取 Props，其次讀取 SessionStorage
        if (this.resultList && this.resultList.length > 0) {
            this.finalResultData = this.resultList;
        } else {
            const cachedData = sessionStorage.getItem('tempTrialResult');
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);

                    if (parsed.results) {
                        // 格式 A (check API): { results: [...], summary: {...} }
                        this.apiSummary = parsed.summary;
                        this.formatApiResults(parsed.results);
                    } else if (Array.isArray(parsed)) {
                        // 格式 B (submit API): [...] 扁平陣列
                        // 檢查陣列內容是否已經是格式化過的
                        if (parsed.length > 0 && !parsed[0].hasOwnProperty('question')) {
                            // 如果沒有 'question' 欄位，代表是原始資料，需要格式化
                            this.formatApiResults(parsed);
                        } else {
                            // 已經是格式化過的資料，直接使用
                            this.finalResultData = parsed;
                        }
                    }
                } catch (e) {
                    console.error("解析失敗", e);
                    this.finalResultData = [];
                }
            }
        }

        // 確保在資料載入後選中第一個標籤頁
        this.$nextTick(() => {
            if (this.quizParts && this.quizParts.length > 0) {
                this.activePartId = this.quizParts[0].id;
            }
        });
    },
    methods: {
        formatApiResults(results) {
            const uniqueMap = new Map(); // 使用 Map 以 ID 為 Key，確保唯一性

            results.forEach((q) => {
                const qId = q.question_id || q.id;

                // 如果這個 ID 已經存在就不再處理
                if (uniqueMap.has(qId)) return;

                const questionText = q.question_text || q.question || '';
                const myAns = q.selected_option || q.selected_text || q.myAnswer || '未作答';
                const correctAns = q.correct_answer || q.correctAnswer || '';
                const pKey = q.partKey || q.part_key || 'EngToChi';

                uniqueMap.set(qId, {
                    index: 0,
                    question: questionText,
                    myAnswer: myAns,
                    correctAnswer: correctAns,
                    isCorrect: q.is_correct !== undefined ? q.is_correct : (myAns === correctAns),
                    explanation: q.explanation || '',
                    partKey: pKey,
                    qType: pKey === 'Listening' ? 'Listening' : 'General',
                    audioSrc: /[a-zA-Z]/.test(questionText) ? questionText : correctAns
                });
            });

            // 將 Map 轉回陣列
            this.finalResultData = Array.from(uniqueMap.values());
        },
        async fetchStudentInfo() {
            try {
                const response = await api.get('students/dashboard/student/');
                const data = response.data;
                this.studentName = data.student_name;
                this.studentClass = `${data.school_name} ${data.class_name}`;
            } catch (err) {
                console.error("抓取學生資料失敗:", err);
                this.studentName = '學生';
            }
        },

        tableRowClassName({ row }) {
            if (!row.isCorrect) return 'wrong-row';
            return '';
        },

        playAudio(text) {
            if (!text) return;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.4;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },

        goBack() {
            if (this.backRoute && this.backRoute.name) {
                this.$router.replace(this.backRoute).catch(() => {
                    this.$router.replace('/home');
                });
            } else {
                this.$router.replace('/home');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.result-detail-page {
    padding: 0 14% 4%;
    min-height: unset;

    .tabs-wrapper {
        position: relative;
        margin-top: 20px;

        .tab-stats-summary {
            position: absolute;
            right: 0;
            top: 0;
            height: 40px;
            @include flex-center;
            gap: 20px;
            z-index: 10;
            padding-right: 10px;
            font-size: 15px;
            color: $main-black-text;
        }
    }

    strong {
        margin-left: 5px;
        font-size: 18px;
    }

    .success strong {
        color: #27ae60;
    }

    .danger strong {
        color: #e74c3c;
    }

    .stat-tag {
        @include flex-center;
    }
}

.result-header {
    padding: 40px 20px;
    color: $main-black-text;

    .result-header-wrap {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    .header-left {
        @include flex-center;
    }

    .back-btn-wrap {
        text-wrap-mode: nowrap;
        color: #333;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
    }

    .exam-info-title {
        font-size: 28px;
        font-weight: 800;
        margin: 0 0 0 16px;

        .student-info {
            font-size: 16px;
            font-weight: 500;
            margin-left: 10px;
            color: #666;
        }
    }

    .header-right {
        @include flex-center;
        width: 100%;
        justify-content: space-between;

        .final-score-value {
            font-size: 36px;
            font-weight: 800;
        }
    }
}

.result-content-card {
    background: #fff;
    border-radius: 12px;
    padding: 0 24px 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-top: 5%;

    .part-tabs {
        ::v-deep .el-tabs__header {
            margin-bottom: 20px;
        }

        ::v-deep .el-tabs__nav-wrap::after {
            background-color: #eee;
        }

        ::v-deep .el-tabs__item {
            font-size: 16px;
            font-weight: 600;
        }

        ::v-deep .el-tabs__active-bar {
            background-color: $main-dark-blue;
        }

        ::v-deep .el-tabs__item.is-active {
            color: $main-dark-blue;
        }

        ::v-deep .el-tabs__item:hover {
            color: #33a195;
        }
    }

    .correct-icon {
        color: #097C70;
        font-size: 16px;
    }

    .wrong-icon {
        color: #F57148;
        font-size: 16px;
    }

    .audio-tip-text {
        color: $main-black-text;
    }
}

::v-deep .el-table {
    .el-table__header-wrapper {
        th {
            background-color: #e3e3e3;
            color: $main-black-text;
        }
    }

    .wrong-row {
        background-color: #ffe3e3 !important;

        &:hover>td {
            background-color: #ffc9c9 !important;
        }
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .result-detail-page {
        padding: 0 6% 4%;

        .result-header-wrap {
            flex-direction: column;

            .header-right {
                margin-top: 24px;

                .exam-info-title {
                    margin: 0;
                }
            }

        }

        .tabs-wrapper {
            margin: 0;

            .tab-stats-summary {
                position: static !important;
                justify-content: right;
                margin-bottom: 10px;
            }
        }


        .result-header {
            padding: 24px 0 0;

            .exam-info-title {
                display: flex;
                flex-direction: column;
                font-size: 18px;

                .student-info {
                    margin-left: 0;
                }
            }
        }
    }
}
</style>