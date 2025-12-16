<template>
    <div class="trial-hall-page">
        <div class="return-last-page" @click="goBack">
            <i class="fas fa-angle-left"></i> 返回首頁
        </div>
        <h1 class="page-title">試煉殿堂</h1>
        <div class="main-card">

            <div class="card-header-content">
                <el-col :sm='24' :xl="8">
                    <img :src="hallAvatar" alt="試煉殿堂吉祥物" class="hall-avatar">
                </el-col>
                <el-col :sm='24' :xl="15">
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
                                    <h3 class="exam-title">試卷名稱</h3>
                                    <div class="exam-details">
                                        <p class="detail-item"><i class="far fa-clock"></i>檢測期程:(開啟時間) ~(結束時間)</p>
                                        <p class="detail-item"><i class="fas fa-hourglass-half"></i>考試時長:35分鐘</p>
                                    </div>
                                </div>

                                <button class="start-exam-btn" @click="showStartExamDialog">開始考試</button>
                            </div>
                        </div>
                      <vue-custom-scrollbar v-else class="history-area" :settings="scrollSettings">
        <div class="score-info-box">
            <div class="exam-info">
                <h3 class="exam-title">試卷名稱</h3>
            </div>
            <div class="display-final-score">
                <p class="final-score">85</p>
                <p>分數</p>
            </div>
        </div>
        </vue-custom-scrollbar>
                    </div>
                </el-col>

            </div>


        </div>
        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="examDialogVisible" width="550px" center
            :close-on-click-modal="false" :show-close="false">

            <div class="dialog-content">
                <h3 class="title exam-warning-title">
                    <i class="fas fa-exclamation-circle"></i> 注意：本次考試只有一次作答機會！
                </h3>

                <p class="description">請確認您已準備好再開始作答。</p>
                <p class="description">
                    作答途中系統不會保留作答紀錄，若因網路不穩或退出作答頁面，將會被迫重新從頭作答。
                </p>

                <p class="description exam-checklist-title">為避免影響您的測驗結果，請務必確認：</p>
                <ul class="exam-checklist">
                    <li>網路連線穩定</li>
                    <li>裝置有足夠電量</li>
                    <li>已預留足夠作答時間</li>
                </ul>

                <p class="description final-question">是否確定要開始考試？</p>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="examDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmStartExam">開始考試</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'TrialHall',
    data() {
        return {
            scrollSettings: {
                suppressScrollY: false, // 開啟縱向
                suppressScrollX: true,  // 關閉橫向
                wheelPropagation: false
            },
            activeTab: 'challenge', // 'challenge', 'history'
            hallAvatar: require('../../assets/image/home/exam-island.png'),
            examDialogVisible: false,
        };
    },
    methods: {
        goBack() {
            this.$router.push('/home');
        },
        getTabName(tab) {
            if (tab === 'history') return '歷史記錄';
            return '試煉挑戰';
        },
        showStartExamDialog() {
            this.examDialogVisible = true;
        },

        confirmStartExam() {
            this.examDialogVisible = false;
            console.log('開始試煉考試...');

            // ⬇️ 修改跳轉到考試頁面的邏輯 ⬇️
            this.$router.push({
                name: 'TrialQuizPage',
                params: {
                    level: 'primary', // 國小試煉
                    examId: 'part1-eng-chi' // 第一部分的英選中
                }
            });
        }
    }
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
    width: fit-content;
    padding: 4% 50px;
    height: 100%;

    .history-area {
        height: 250px;
        display: flex;
        flex-direction: column;
        gap: 16px 0;
        margin: 4px;
    }

    .card-header-content {
        @include flex-center;
        justify-content: space-between;
        gap: 0 48px;

        img {
            width: 350px;
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

    .challenge-area {
        @include flex-center;
        width: 100%;
    }

    .exam-info-box,
    .score-info-box {
        width: 650px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 24px;
        border: 3px solid #C7D3D1;
        border-radius: 16px;
        box-shadow: 0px 4px 4px 0px #00000040;

        .exam-info {
            display: flex;
            flex-direction: column;
            align-items: self-start;
            gap: 12px 0;

            .exam-title {
                font-size: 40px;
                font-weight: bold;
                color: $main-black-text;
            }

            .exam-details {
                display: flex;
                flex-direction: column;
                align-items: start;
                font-size: 16px;
                color: $main-grey-text;

                .detail-item i {
                    margin-right: 8px;
                    color: #5D9CEC;
                }
            }

        }


        .start-exam-btn {
            height: 200px;
            @include common-btn;
            border-radius: 0 16px 16px 0;
            font-size: 20px;
            transition: background-color 0.2s;
        }
    }

    .score-info-box {
        padding: 16px 32px;

        .display-final-score {
            @include flex-center;
            flex-direction: column;
            font-size: 18px;
            color: $main-blue-text;

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
        padding-left: 6%;

        .main-card {
            padding: 25px 5%;
        }

        .exam-info-box,
        .score-info-box {
            width: 400px;

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

        .card-header-content img {
            width: 150px;
        }
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .trial-hall-page {
        padding: 24px 40px;

        .page-title {
            margin-top: 16px;
        }
    }

    .main-card {
        width: 100%;

        .exam-info-box .exam-info .exam-title {
            font-size: 22px;
        }

        .exam-info-box,
        .score-info-box {
            width: 100%;
        }

        .card-header-content {
            display: unset;
            width: 100%;

            img {
                width: 200px;
            }

        }

    }



}
</style>