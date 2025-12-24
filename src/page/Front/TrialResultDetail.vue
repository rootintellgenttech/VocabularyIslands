<template>
    <div class="result-detail-page">

        <div class="result-content-card">
            <header class="result-header">
                <div class="header-left">
                    <div class="back-btn-wrap" @click="goBack">
                        <i class="fas fa-angle-left back-icon"></i> 返回
                    </div>
                    <h1 class="exam-info-title">
                        {{ displayTitle }}
                        <span class="student-info">{{ studentClass }} {{ studentName }}</span>
                    </h1>
                </div>

                <div class="header-right">
                    <div class="score-display">
                        <template v-if="isStarMode">
                            <span class="final-score-value">{{ starCount }} 顆星星</span>
                        </template>
                        <template v-else>
                            <span class="final-score-value">{{ finalScore }} 分</span>
                        </template>
                    </div>
                </div>
            </header>

     <el-tabs v-model="activePartId" class="part-tabs" v-if="quizParts && quizParts.length > 0">
    <el-tab-pane v-for="part in quizParts" :key="part.id" :label="part.title" :name="part.id">
        <el-table :data="part.questions" style="width: 100%" :row-class-name="tableRowClassName" border height="550">
            <el-table-column prop="index" label="序" width="60" align="center"></el-table-column>
            
            <el-table-column label="題目" min-width="180">
                <template slot-scope="scope">
                    <div v-if="part.qType === 'Listening'" class="audio-trigger-row" @click="playAudio(scope.row.audioSrc)">
                        <i class="fas fa-volume-up" style="cursor: pointer;"></i> 點擊播放
                    </div>
                    <span v-else>{{ scope.row.question }}</span>
                </template>
            </el-table-column>

            <el-table-column label="我的答案" min-width="120">
                <template slot-scope="scope">
                    <span :class="{ 'text-danger': !scope.row.isCorrect }">{{ scope.row.myAnswer }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="correctAnswer" label="正確答案" min-width="120" class-name="text-success"></el-table-column>
            
            <el-table-column label="結果" width="80" align="center">
                <template slot-scope="scope">
                    <i :class="['fas', scope.row.isCorrect ? 'fa-check correct-icon' : 'fa-times wrong-icon']"></i>
                </template>
            </el-table-column>
        </el-table>
    </el-tab-pane>
</el-tabs>

            <div v-else-if="quizParts && quizParts.length === 1" class="single-part-container">
               <el-table :data="quizParts[0].questions" style="width: 100%" :height="600" :row-class-name="tableRowClassName" border>
        <el-table-column prop="index" label="序列" width="60" align="center"></el-table-column>

        <el-table-column label="題目" min-width="180">
            <template slot-scope="scope">
               <div v-if="quizParts[0].qType === 'Listening'" class="audio-trigger-row" 
         @click="playAudio(scope.row.audioSrc)"> <i class="fas fa-volume-up" style="cursor: pointer;"></i> 點擊播放
    </div>
    <span v-else>{{ scope.row.question }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="myAnswer" label="我的答案" min-width="120">
            <template slot-scope="scope">
                <span :class="{ 'text-danger': !scope.row.isCorrect }">{{ scope.row.myAnswer || '未作答' }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="correctAnswer" label="正確答案" min-width="120" class-name="text-success"></el-table-column>

        <el-table-column prop="explanation" label="題目解釋" min-width="200">
            <template slot-scope="scope">
                <span class="explanation-text">{{ scope.row.explanation || '-' }}</span>
            </template>
        </el-table-column>

        <el-table-column label="結果" width="80" align="center">
            <template slot-scope="scope">
                <i :class="['fas', scope.row.isCorrect ? 'fa-check correct-icon' : 'fa-times wrong-icon']"></i>
            </template>
        </el-table-column>
    </el-table>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'TrialResultDetail',
    props: {
        examId: { type: String, required: true },
        finalScore: { type: [String, Number], default: 0 },
        examTitle: { type: String, default: '' },
        resultList: { type: Array, default: () => [] },
        backRoute: { type: Object, default: () => null }
    },
    data() {
        return {
            studentClass: '6年2班',
            studentName: '陳小明',
            activePartId: '',
            finalResultData: [],
        };
    },
    computed: {
        displayTitle() {
            return this.examTitle || '測驗結果';
        },
        isStarMode() {
        // 如果 examId 包含 'ps-' 或 'ms' (正式考試)，則不顯示星星模式
        const isExam = this.examId.includes('ps-') || this.examId.includes('ms');
        if (isExam) return false;
        
        // 非 part 開頭的通常是單字島=星星
        return !this.examId.startsWith('part');
    },
       starCount() {
            return parseInt(this.finalScore) || 0;
        },
quizParts() {
    if (!this.finalResultData || this.finalResultData.length === 0) return [];

    const partNameMap = {
        'EngToChi': '第一部分 英翻中',
        'ChiToEng': '第二部分 中翻英',
        'Listening': '第三部分 單字聽力',
        'ContextFill': '第四部分 文意測驗'
    };

    // 1. 依照 partKey 進行分組
    const groups = {};
    this.finalResultData.forEach(q => {
        const key = q.partKey || 'EngToChi';
        // 使用符合規範的安全屬性檢查
        if (!Object.prototype.hasOwnProperty.call(groups, key)) {
            groups[key] = [];
        }
        groups[key].push(q);
    });

    // 2. 依照固定順序產生 Tab 數據
    const order = ['EngToChi', 'ChiToEng', 'Listening', 'ContextFill'];
    
    return Object.keys(groups)
        .map(key => ({
            id: key,
            title: partNameMap[key] || '其他內容',
            qType: key === 'Listening' ? 'Listening' : 'General',
            questions: groups[key]
        }))
        .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}
    },
 created() {
    console.log("詳情頁已載入，收到 Props - examId:", this.examId, "題數:", this.resultList?.length);

    if (this.resultList && Array.isArray(this.resultList) && this.resultList.length > 0) {
        this.finalResultData = this.resultList;
        console.log("使用傳入的 Props 資料");
    } else {
        // 如果 Props 沒領到，強制從緩存抓
        const cachedData = sessionStorage.getItem('tempTrialResult');
        if (cachedData) {
            try {
                this.finalResultData = JSON.parse(cachedData);
                console.log("成功從 sessionStorage 恢復資料，題數:", this.finalResultData.length);
            } catch (e) {
                console.error("解析快取資料失敗:", e);
                this.finalResultData = [];
            }
        } else {
            console.error("⚠️ 完全找不到任何作答數據 (Props & Storage 皆無)");
            this.finalResultData = [];
        }
    }

 this.$nextTick(() => {
        if (this.quizParts.length > 0) {
            this.activePartId = this.quizParts[0].id;
        }
    });
},
    methods: {
 goBack() {
        if (this.backRoute && this.backRoute.name) {
            this.$router.replace(this.backRoute).catch(err => {
                console.error("導航失敗，路由可能不存在:", err);
                // 發生錯誤時跳回對應的大島嶼
                const fallback = this.examTitle.includes('聽力') || this.examTitle.includes('英雄') 
                                 ? (this.backRoute.params.level === 'primary' ? '/primaryisland' : '/secondaryisland')
                                 : '/home';
                this.$router.replace(fallback);
            });
        } else {
            this.$router.replace('/home');
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
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }
};
</script>


<style lang="scss" scoped>
.result-detail-page {
    padding: 0 14% 4%;
    min-height: unset;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px 20px;
    color: $main-black-text;

    .header-left {
        @include flex-center;
    }

    .back-btn-wrap {
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