<template>
    <div class="result-detail-page">

        <div class="result-content-card">
            <header class="result-header">
                <div class="header-left">
                    <i class="fas fa-angle-left back-icon" @click="goBack"></i>
                    <h1 class="exam-info-title">{{ examName }} <span class="student-info">{{ studentClass }} {{
                        studentName }}</span></h1>
                </div>
                <div class="header-right">
                    <span class="final-score-value">{{ finalScore }} 分</span>
                </div>
            </header>

            <el-tabs v-model="activePartId" class="part-tabs">
                <el-tab-pane v-for="part in quizParts" :key="part.id" :label="part.title" :name="part.id">

                    <el-table :data="part.questions" style="width: 100%" :row-class-name="tableRowClassName" border
                        height="550" max-height="550">

                        <el-table-column prop="index" label="序列" width="50">
                        </el-table-column>

                        <el-table-column prop="question" label="題目" min-width="120">
                            <template slot-scope="scope">
                                <span v-if="part.qType === 'Listening'" class="audio-tip-text audio-trigger"
                                    @click="playAudio(scope.row.question)">
                                    <i class="fas fa-volume-up" style="cursor: pointer;margin-right: 8px;;"></i> 點擊發音
                                </span>
                                <span v-else>{{ scope.row.question }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column prop="myAnswer" label="我的答案" min-width="120">
                        </el-table-column>

                        <el-table-column prop="correctAnswer" label="正確答案" min-width="120">
                        </el-table-column>

                        <el-table-column prop="isCorrect" label="結果" width="80" align="center">
                            <template slot-scope="scope">
                                <i
                                    :class="['fas', scope.row.isCorrect ? 'fa-check correct-icon' : 'fa-times wrong-icon']"></i>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
const QUIZ_CONFIG = {
    // 國小 (ps-)
    'part1-eng-chi': { title: '第一部分：英選中', qType: 'EngToChi' },
    'part2-chi-eng': { title: '第二部分：中選英', qType: 'ChiToEng' },
    'part3-listening': { title: '第三部分：單字聽力測驗', qType: 'Listening' },
    
    // 國中 (ms-)
    'ms-part1-eng-chi': { title: '國中 第一部分：英選中', qType: 'EngToChi' },
    'ms-part2-chi-eng': { title: '國中 第二部分：中選英', qType: 'ChiToEng' },
    'ms-part3-listening': { title: '國中 第三部分：單字聽力測驗', qType: 'Listening' },
    'ms-part4-context': { title: '第四部分：文意測驗', qType: 'ContextFill' } 
};

// 模擬後端回傳的答題記錄數據
const MOCK_RESULTS_DATA = [
    // Part 1: 英選中
    { id: 'part1-eng-chi', isCorrect: true, question: 'Apple', myAnswer: '蘋果', correctAnswer: '蘋果' },
    { id: 'part1-eng-chi', isCorrect: false, question: 'Banana', myAnswer: '橘子', correctAnswer: '香蕉' },
    { id: 'part1-eng-chi', isCorrect: true, question: 'Cat', myAnswer: '貓', correctAnswer: '貓' },

    // Part 2: 中選英
    { id: 'part2-chi-eng', isCorrect: false, question: '老師', myAnswer: 'Student', correctAnswer: 'Teacher' },
    { id: 'part2-chi-eng', isCorrect: true, question: '學生', myAnswer: 'Student', correctAnswer: 'Student' },

    // Part 3: 聽力
    { id: 'part3-listening', isCorrect: true, question: 'Book', myAnswer: '書', correctAnswer: '書' },
    { id: 'part3-listening', isCorrect: false, question: 'Pen', myAnswer: '筆記本', correctAnswer: '筆' },
{ 
        id: 'ms-part4-context', 
        isCorrect: true, 
        question: 'I see a monkey at Shoushan Zoo.',
        myAnswer: 'a', 
        correctAnswer: 'a', 
        qType: 'ContextFill' 
    },
    { 
        id: 'ms-part4-context', 
        isCorrect: false, 
        question: 'He is playing basketball.', 
        myAnswer: 'is playing', 
        correctAnswer: 'plays', 
        qType: 'ContextFill' 
    }
];


export default {
    name: 'TrialResultDetail',
    props: {
        examId: { type: String, default: 'part1-eng-chi' }, // 假定當前頁面預設顯示的第一個 tab
        finalScore: { type: [String, Number], default: 0 },
    },
    data() {
        return {
            examName: '國小單字試煉',
            studentClass: 'X年X班',
            studentName: '學生名稱',
            activePartId: 'part1-eng-chi', // 當前選中的 Tab
            rawResults: [], // 原始的答題記錄
        };
    },
    computed: {
        // 整理 Tabs 和對應的題目數據
        quizParts() {
            const parts = Object.keys(QUIZ_CONFIG).map(id => ({
                id,
                title: QUIZ_CONFIG[id].title,
                qType: QUIZ_CONFIG[id].qType,
                questions: this.getQuestionsByPartId(id),
            }));
            return parts;
        }
    },
 created() {
        // 模擬從後端載入數據
        this.rawResults = MOCK_RESULTS_DATA;
        // 預設選中第一個 Tab
        this.activePartId = Object.keys(QUIZ_CONFIG)[0];
    },
    methods: {
     goBack() {
            this.$router.push('/trial-hall');
        },
       getQuestionsByPartId(partId) {
            let index = 1;
            return this.rawResults
                .filter(q => q.id === partId)
                .map(q => ({
                    index: index++,
                    question: q.question,
                    myAnswer: q.myAnswer,
                    correctAnswer: q.correctAnswer,
                    isCorrect: q.isCorrect,
                }));
        },
        // 根據對錯狀態設定表格行的 class (錯誤標註紅色)
        tableRowClassName({ row }) {
            // 如果 isCorrect 為 false (錯誤)，返回 'wrong-row' class
            if (!row.isCorrect) {
                return 'wrong-row';
            }
            return '';
        },
        playAudio(wordToSpeak) {
            if (!wordToSpeak) {
                console.warn('無單字可播放');
                return;
            }

            console.log('播放發音 (結果頁): ' + wordToSpeak);

            const utterance = new SpeechSynthesisUtterance(wordToSpeak);
            utterance.lang = 'en-US'; // 確保使用英文發音
            utterance.rate = 1;

            // 在播放新的音訊之前取消當前正在進行的語音
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },

    },
    beforeDestroy() {
        window.speechSynthesis.cancel();
    }
};
</script>

<style lang="scss" scoped>
.result-detail-page {
    padding: 0 14%;
    min-height: unset;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px 20px;
    color: $main-black-text;

    .header-left {
        display: flex;
        align-items: center;
        gap: 15px;

        .back-icon {
            font-size: 24px;
            cursor: pointer;
            color: $main-dark-blue;
        }
    }

    .exam-info-title {
        font-size: 28px;
        font-weight: 800;
        margin: 0;

        .student-info {
            font-size: 16px;
            font-weight: 500;
            margin-left: 10px;
            color: #666;
        }
    }

    .header-right {
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
    .result-detail-page{
        padding: 0 6% 4%;
    .result-header {
        padding: 24px 0;

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