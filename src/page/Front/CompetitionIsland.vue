<template>
    <div class="competition-page">
        <div class="return-last-page" @click="goToHome">
            <i class="fas fa-angle-left"></i> 返回首頁
        </div>
        <h1 class="page-title">競技島</h1>
            <div class="content-wrapper">
            <div class="main-column">

                <div class="arena-header-card">
                    <div class="header-wrap">
                        <img src="../../assets/image/competition/island.png">
                        <div class="header-info">
                            <h2 class="header-title">競技聯盟</h2>
                            <p class="header-sub">Arena Hub</p>
                        </div>
                    </div>


                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label"><i class="fa-solid fa-trophy"
                                    style="color: #eab308;"></i>本週挑戰</span>
                            <span class="stat-value">{{ weekData.challenge }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label"><i class="fa-regular fa-clock"
                                    style="color: #3b82f6;"></i>活動倒數</span>
                            <span class="stat-value">{{ weekData.days }}</span>
                            <span class="stat-status">{{ weekData.timeStatus }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label"><i class="fa-solid fa-crown"
                                    style="color: #eab308;"></i>所屬聯盟排行</span>
                            <span class="stat-value">山海聯盟</span>
                            <span class="stat-status">全聯盟第5名</span>
                        </div>
                    </div>
                </div>

                <div class="ranking-challenge-section">
                    <div class="tabs">
                        <button :class="['tab-btn', { 'is-active': activeTab === 'ranking' }]"
                            @click="activeTab = 'ranking'">
                            <span v-html="rankingTabIcon"></span> 排行榜
                        </button>
                        <button :class="['tab-btn', { 'is-active': activeTab === 'challenge' }]"
                            @click="activeTab = 'challenge'">
                            <span v-html="challengeTabIcon"></span> 挑戰遊戲
                        </button>
                    </div>

                    <div v-if="activeTab === 'ranking'" class="ranking-container">
                        <div class="ranking-toggle">
                            <button :class="['toggle-btn', { 'is-active': rankingType === 'all' }]"
                                @click="rankingType = 'all'">
                                <span v-html="allRankingIcon"></span> 全聯盟
                            </button>
                            <button :class="['toggle-btn', { 'is-active': rankingType === 'school' }]"
                                @click="rankingType = 'school'">
                                <span v-html="schoolRankingIcon"></span> 校排行榜
                            </button>
                        </div>
                       <vue-custom-scrollbar :settings="rankingScrollSettings">
                            <div class="ranking-list">
                                <div v-for="(player, index) in filteredRanking" :key="player.id"
                                    :class="['player-row', { 'is-top3': index < 3 }]">
                                    <div class="rank-icon-name">
                                        <img v-if="index < 3" :src="getRankIcon(index + 1)" :alt="`Rank ${index + 1}`"
                                            class="rank-icon">
                                        <span v-else class="rank-number">#{{ player.rank }}</span>
                                        <div class="player-info">
                                            <span class="player-name">{{ player.name }}</span>
                                            <span v-if="player.school" class="player-school">{{ player.school }}</span>
                                        </div>

                                    </div>
                                    <div class="score-info">
                                        <span class="player-score">{{ formatScore(player.score) }}</span>
                                        <span>積分</span>
                                    </div>

                                </div>
                            </div>
                        </vue-custom-scrollbar>
                    </div>

                 <div v-if="activeTab === 'challenge'" class="challenge-container">
    <div v-for="game in filteredGames" :key="game.id" class="game-item">
        <div class="game-info">
            <img :src="getGameIcon(game.iconClass)" :alt="game.title" class="game-icon">

            <div class="game-text">
                <p class="game-title">{{ game.title }}</p>
                <div class="game-info-wrap">
                    <p class="game-description">{{ game.description }}</p>
                    <p class="game-island">{{ game.island }}</p>
                    <p class="game-point">{{ game.point }}</p>
                </div>
            </div>
        </div>
        
        <button 
            :class="['start-btn', getChallengeButtonProps().className]"
            :disabled="getChallengeButtonProps().disabled"
            @click="showChallengeDialog(game)">
            {{ getChallengeButtonProps().text }}
        </button>
        </div>
</div>
                </div>
            </div>

            <div class="sidebar-right">
                <div class="my-info-card">
                    <h3 class="card-title">
                        <i class="fa-regular fa-star" style="color: #eab308;"></i>我的資訊
                    </h3>

                    <div class="info-block challenge-block">
                        <div class="info-label-group">
                            <i class="fa-solid fa-flag" style="color: #28a99c;"></i>
                            <span class="info-label">今日挑戰次數</span>
                        </div>
                        <div class="info-content">
                            <span class="info-value">1</span>
                        </div>
                        <div class="info-footer">
                            <i class="fa-regular fa-clock" style="color: #67777e;"></i>
                            <span class="refresh-time">刷新時間：明日 00:00</span>
                        </div>
                    </div>

                    <div class="info-block activity-block">
                        <div class="info-label-group">
                            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
                            <span class="info-label">本週活動</span>
                        </div>
                        <div class="info-content">
                            <span class="activity-days">3天</span>
                            <span class="activity-countdown">剩餘 18小時32分</span>
                        </div>
                    </div>

                    <div class="info-block ranking-block">
                        <div class="info-label-group">
                            <i class="fa-solid fa-ranking-star" style="color: #28a99c;"></i>
                            <span class="info-label">當前班級排名</span>
                        </div>
                        <div class="ranking-details">
                            <span class="rank-number">#10</span>
                            <span class="score-value">{{ formatScore(8200) }} 積分</span>
                        </div>
                        <div class="ranking-diff">
                            <i class="fa-solid fa-arrow-trend-up" style="color: #f97316;"></i>
                            <span>與昨天的自己差<span class="diff-score"> 630 </span>分</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="footer-fixed">
            <div class="player-summary">
                <div class="player-left-info">
                    <span class="player-rank">#10</span>
                    <div class="player-wrap">
                        <div class="player-info-wrap">
                            <span class="player-name">王曉明<span class="player-tag">我</span></span>
                        </div>
                        <span class="player-school">鄭興國小</span>
                    </div>
                </div>
                <div class="player-right-info">
                    <div class="player-actual-score">
                        <span class="player-score">{{ formatScore(8200) }}</span>
                        <span class="score-title">積分</span>
                    </div>
                    <div class="player-score-compare">
                        <span class="player-rank-diff">與前一名差</span>
                        <div class="player-rank-diff-score">
                            <span>200</span><span>分</span>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <el-dialog 
            custom-class="challenge-confirm-modal" 
            :visible.sync="challengeDialogVisible" 
            width="480px"
            center 
            :close-on-click-modal="false" 
            :show-close="false">

            <div class="dialog-content">
                <h3 class="title">使用今日挑戰機會？</h3>
                <p class="description">此挑戰將消耗您每日僅有一次的挑戰機會。</p>
                <p class="description">使用後，今天將無法再挑戰其他任務，請確認您已準備好開始。</p>
                
                <p v-if="currentWeekType === 'listening'" class="description warning-text">
                    本週挑戰主題為聽力挑戰，記得開啟裝置的音量，以免影響挑戰。
                </p>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="challengeDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmStartChallenge">開始挑戰</el-button>
            </span>
        </el-dialog>

    </div>
    
</template>

<script>

const ICONS = {
    NO1: require('@/assets/image/competition/no1.png'),
    NO2: require('@/assets/image/competition/no2.png'),
    NO3: require('@/assets/image/competition/no3.png'),
    ABC_ICON: require('@/assets/image/competition/abc.png'),
    TARGET_ICON: require('@/assets/image/competition/target.png'),
    THUNDER_ICON: require('@/assets/image/competition/thunder.png'),
};

export default {
    name: 'CompetitionIsland',
    data() {
        return {
          currentTime: new Date(), 
            timeUpdateInterval: null, 
            dailyCheckInterval: null, 
            challengeDialogVisible: false,
            isDailyChallengeCompleted: false, // 今日是否已完成挑戰
            selectedGame: null,
            activeTab: 'ranking', // 'ranking' or 'challenge'
            rankingType: 'all',   // 'all' or 'school'
            gameLevel: 'primary', // 'primary' or 'secondary' (用於切換遊戲列表)
            // 測試-手動設定為閱讀大賽，請設置為 'reading'/'listening'
            manualGameType: 'reading', 

            // 排行榜數據 (模擬)
            allRanking: [
                { id: 1, rank: 1, name: '李O明', score: 9500, school: '臺北O小' },
                { id: 2, rank: 2, name: '王O真', score: 9350, school: '新北O小' },
                { id: 3, rank: 3, name: '王O廣', score: 9200, school: '桃園O小' },
                { id: 4, rank: 4, name: '陳O寧', score: 9000, school: '桃園O小' },
                { id: 5, rank: 5, name: '張O倫', score: 7000, school: '臺北O小' },
                { id: 6, rank: 6, name: '黃O敏', score: 6900, school: '臺東O小' },
                { id: 7, rank: 7, name: '林O傑', score: 6800, school: '花蓮O小' },
                { id: 8, rank: 8, name: '黃O敏', score: 6800, school: '臺東O小' },
            ],
            schoolRanking: [
                { id: 1, rank: 1, name: '李O明', score: 9500, school: '臺北O小' },
                { id: 2, rank: 2, name: '王O真', score: 9350, school: '新北O小' },
                { id: 3, rank: 3, name: '王O廣', score: 9200, school: '桃園O小' },
                { id: 4, rank: 4, name: '陳O寧', score: 9000, school: '桃園O小' },
            ],

            // 遊戲列表數據
            gamesData: {
                primary: [
                    { id: 'abc', title: '字母轉盤樂', description: '答對所有題目', point: '每題10分，共5題', island: 'ABC啟航島', iconClass: 'ABC_ICON', level: 'primary' },
                    { id: 'perfect', title: '完美連擊', description: '連續答對題目直到錯誤', point: '贏得100分', island: '國小聽力海灣', iconClass: 'TARGET_ICON', level: 'both' },
                    { id: 'speed', title: '速度對決', description: '限時問答挑戰', point: '贏得120分', island: '國小聽力海灣', iconClass: 'THUNDER_ICON', level: 'both' },
                ],
                secondary: [
                    { id: 'perfect', title: '完美連擊', description: '連續答對題目直到錯誤', point: '贏得80分', island: '國中聽力海灣', iconClass: 'TARGET_ICON', level: 'both' },
                    { id: 'speed', title: '速度對決', description: '限時問答挑戰', point: '贏得60分', island: '國中聽力海灣', iconClass: 'THUNDER_ICON', level: 'both' },
                ]
            },
            rankingScrollSettings: {
                suppressScrollY: false, 
                suppressScrollX: true, 
                wheelPropagation: false
            },
        };
    },
    computed: {
        filteredRanking() {
            return this.rankingType === 'all' ? this.allRanking : this.schoolRanking;
        },
        filteredGames() {
            return this.gamesData[this.gameLevel];
        },

        // 遊戲/挑戰 Tab 的計算圖示
        challengeTabIcon() {
            return '<i class="fa-solid fa-gamepad"></i>';
        },

        // 排行榜 Tab 的計算圖示
        rankingTabIcon() {
            return '<i class="fa-solid fa-trophy"></i>';
        },

        allRankingIcon() {
            return '<i class="fa-solid fa-trophy"></i>';
        },

        schoolRankingIcon() {
            return '<i class="fa-solid fa-medal"></i>';
        },
     currentWeekType() {
            // 1. 如果有測試手動類型設定，則優先使用手動值
            if (this.manualGameType) {
                return this.manualGameType;
            }
            
            // 2. 否則，使用原本的日期計算邏輯
            const now = this.currentTime;
            const weekNumber = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
            // 偶數週為 listening，奇數週為 reading
            return weekNumber % 2 === 0 ? 'listening' : 'reading';
        },

        weekData() {
            const now = this.currentTime;
            
            // 1. 決定本週挑戰類型中文
            const challengeType = this.currentWeekType === 'listening' ? '聽力大賽' : '閱讀大賽';

            // 2. 計算活動結束時間 (本週日 23:59:59)
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (7 - now.getDay()) % 7);
            endOfWeek.setHours(23, 59, 59, 999);

            // 3. 計算倒數時間
            const diffMs = endOfWeek.getTime() - now.getTime();

            if (diffMs <= 0) {
                return {
                    challenge: challengeType,
                    days: '0天',
                    timeStatus: '已結束',
                    ms: 0
                };
            }

            const totalSeconds = Math.floor(diffMs / 1000);
            const days = Math.floor(totalSeconds / (24 * 3600));
            const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);

            return {
                challenge: challengeType,
                days: `${days}天`,
                timeStatus: `${hours}小時${minutes}分`,
                ms: diffMs
            };
        }
    },
    methods: {
        goToHome() {
        this.$router.push('/home'); 
    },
        getRankIcon(rank) {
            if (rank === 1) return ICONS.NO1;
            if (rank === 2) return ICONS.NO2;
            if (rank === 3) return ICONS.NO3;
            return '';
        },
        getGameIcon(iconKey) {
            return ICONS[iconKey];
        },
        startChallenge(game) {
            console.log(`開始挑戰遊戲: ${game.title}`);
            this.$router.push({
                name: 'SpeedQuiz',
                params: {
                    gameId: game.id,
                    gameTitle: game.title,
                    gameLevel: this.gameLevel,
                    gameType: game.type // reading 或 listening
                }
            });
        },
        showChallengeDialog(game) {
            // 如果已完成，直接返回
            if (this.isDailyChallengeCompleted) return; 
            
            this.selectedGame = game;
            this.challengeDialogVisible = true;
        },
   confirmStartChallenge() {
            this.challengeDialogVisible = false;
            if (this.selectedGame) {
                let routeName = 'SpeedQuiz';
                
                if (this.selectedGame.id === 'perfect') {
                    routeName = 'ComboQuiz';
                } else if (this.selectedGame.id === 'abc') {
                    routeName = 'AlphabetWheelQuiz';
                } else if (this.selectedGame.id === 'speed') {
                    routeName = 'SpeedQuiz';
                }
                
                this.$router.push({ 
                    name: routeName, 
                    params: { 
                        gameId: this.selectedGame.id,
                        gameTitle: this.selectedGame.title,
                        gameLevel: this.gameLevel,
                        gameType: this.currentWeekType 
                    } 
                });
            }
        },
        // 檢查每日完成狀態
        checkDailyCompletion() {
            const lastCompletionDate = localStorage.getItem('dailyChallengeCompletionDate');
            const today = new Date().toDateString();

            // 如果儲存的日期是今天，則標記為已完成
            if (lastCompletionDate === today) {
                this.isDailyChallengeCompleted = true;
            } else {
                // 否則，重置為未完成
                this.isDailyChallengeCompleted = false;
                // 可選：如果已過期，移除舊的紀錄 (確保下次檢查時不會誤判)
                if (lastCompletionDate) {
                    localStorage.removeItem('dailyChallengeCompletionDate');
                }
            }
        },
        // 計算挑戰按鈕的
        getChallengeButtonProps() {
            if (this.isDailyChallengeCompleted) {
                return {
                    text: '今日已完成',
                    disabled: true,
                    className: 'is-completed'
                };
            }
            return {
                text: '開始挑戰',
                disabled: false,
                className: ''
            };
        },
        // 千分位逗號
        formatScore(score) {
            return score.toLocaleString('en-US');
        }
    },
    mounted() {
        // 檢查初始狀態
        this.checkDailyCompletion();
        
        // 定期檢查是否跨日 (例如每分鐘檢查一次)
        this.dailyCheckInterval = setInterval(this.checkDailyCompletion, 60000); 
        // 每分鐘更新一次時間狀態
        this.timeUpdateInterval = setInterval(() => {
            this.currentTime = new Date();
        }, 60000); // 設置為 60 秒更新一次
    },
    beforeDestroy() {
        clearInterval(this.dailyCheckInterval);
        clearInterval(this.timeUpdateInterval);
    }
};
</script>

<style lang="scss" scoped>
@mixin section-card-layout {
    display: flex;
    flex-direction: column;
    text-align: center;
    background: #F0F3F566;
    border: 1px solid #DAE2E780;
    border-radius: 16px;
    padding: 16px;
    width: 100%;
}

.ranking-diff,
.rank-number,
.info-footer,
.info-label-group,
.stat-label,
.stat-status,
.info-label,
.refresh-time,
.activity-countdown,
.diff-score,
.player-rank,
.score-title,
.player-school {
    color: $main-grey-text;
}

.score-info .player-score,
.player-name,
.my-info-card .card-title,
.challenge-block .info-value,
.activity-countdown,
.activity-days,
.ranking-details .score-value,
.header-wrap .header-title,
.stats-grid .stat-value,
.ranking-challenge-section .tabs .tab-btn:not(.is-active),
.player-info-wrap .player-rank,
.player-rank-diff {
    color: $main-black-text
}

.competition-page {
    padding: 0 0 80px 90px;
    position: relative;
    overflow-y: auto;
}

.page-title {
    @include page-main-title;
    margin-bottom: 28px;
}

.content-wrapper {
    display: flex;
    justify-content: center;
    gap: 30px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto 4%;
}

.main-column {
    flex: 3;
    min-width: 600px;
}

.sidebar-right {
    flex: 1;
    border-radius: 16px;
    padding: 24px;
    background-color: #fff;
    min-width: 350px;
    height: 100%;

    .my-info-card {
        padding: 0;
        position: sticky;
        top: 20px;

        .card-title {
            font-size: 20px;
            margin-bottom: 18px;
            text-align: center;

            i {
                margin-right: 10px;
            }
        }

    }

    .info-block {
        border-radius: 12px;
        padding: 15px;

        .info-label-group {
            display: flex;
            align-items: center;
            font-size: 16px;

            i {
                margin-right: 8px;
            }
        }
    }

    .info-block:nth-child(3) {
        margin: 16px 0
    }

    .challenge-block,
    .activity-block {
        @include section-card-layout;
        text-align: left;
    }

    .challenge-block {


        .info-value {
            font-size: 36px;
            font-weight: bold;
            display: block;
        }

        .info-footer {
            display: flex;
            align-items: center;
            margin-top: 10px;

            i {
                margin-right: 5px;
            }
        }
    }

    .activity-block {

        .info-content {
            display: flex;
            flex-direction: column;

            .activity-days {
                font-size: 36px;
                font-weight: 600;
            }
        }
    }

    .ranking-block {
        background: linear-gradient(135deg, rgba(40, 169, 156, 0.1) 0%, rgba(40, 169, 156, 0.05) 100%);
        border: 1px solid #28A99C4D;

        .ranking-details {
            margin-top: 10px;
            display: flex;
            flex-direction: column;

            .rank-number {
                font-size: 48px;
                font-weight: 800;
                color: #28A99C;
                line-height: 1;
            }

            .score-value {
                font-size: 18px;
                font-weight: 600;
            }
        }

        .ranking-diff {
            display: flex;
            align-items: center;
            margin-top: 10px;
            font-size: 14px;

            i {
                margin-right: 5px;
            }

            .diff-score {
                color: #f97316;
                font-weight: 600;
            }
        }
    }
}


.arena-header-card {
    border-radius: 16px;
    padding: 24px;
    background-color: #fff;
    border: 1px solid #28A99C4D;

    .header-wrap {
        @include flex-center;
        gap: 0 16px;

        img {
            width: 90px;
            height: 100%;
        }

        .header-info {
            display: flex;
            flex-direction: column;


            .header-title {
                font-size: 28px;
                font-weight: bold;
            }

            .header-sub {
                font-size: 16px;
                color: #666;
            }
        }


    }


    .stats-grid {
        display: flex;
        justify-content: space-between;
        gap: 20px;

        .stat-item {
            margin-top: 16px;
            @include section-card-layout;

            .stat-value {
                font-size: 24px;
                font-weight: 600;
                margin: 4px 0;
            }

            .stat-label {
                i {
                    margin-right: 8px;
                }

            }
        }
    }
}

.ranking-challenge-section {

    .tabs {
        display: flex;
        border-radius: 16px;
        overflow: hidden;
        margin: 28px 0;
        padding: 12px;
        background: rgba(240, 243, 245, 0.8);

        .tab-btn {
            flex: 1;
            padding: 8px;
            font-size: 20px;
            font-weight: bold;
            background-color: rgb(209 238 235);
            border: none;
            transition: background-color 0.2s, color 0.2s;

            span {
                margin-right: 8px;
            }

            &:first-child {
                &.is-active {
                    background-color: rgba(9, 124, 112, 1);
                    color: white;
                    border-radius: 8px 0 0 8px;

                    i {
                        color: white;
                    }
                }

                &:not(.is-active):hover {
                    border-radius: 8px 0 0 8px;
                    background-color: #28A99C;
                    color: white;

                    i {
                        color: white;
                    }
                }
            }

            &:last-child {
                &.is-active {
                    background-color: rgba(9, 124, 112, 1);
                    color: white;
                    border-radius: 0 8px 8px 0;

                    i {
                        color: white;
                    }
                }

                &:not(.is-active):hover {
                    border-radius: 0 8px 8px 0;
                    background-color: #28A99C;
                    color: white;

                    i {
                        color: white;
                    }
                }
            }


            &:not(.is-active) {
                color: $main-black-text;

                i {
                    color: $main-blue-text;
                }
            }

        }
    }

    .ranking-container {
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        background: #fff;
    }

    // 排行榜切換按鈕
    .ranking-toggle {
        display: flex;
        gap: 0 12px;
        justify-content: center;
        margin-bottom: 20px;

        .toggle-btn {
            padding: 8px 20px;
            border-radius: 8px;
            width: 200px;
            font-size: 16px;
            border: 1px solid #DAE2E7;
            background: #F0FAFF;
            font-weight: 600;

            span {
                margin-right: 8px;
            }

            i {
                color: #1F292E;
            }

            &:hover {
                background-color: #28A99C;
                color: white;

                i {
                    color: white;
                }
            }

            &.is-active {
                background-color: #28A99C;
                color: white;
                border: 1px solid #DAE2E7;

                i {
                    color: white;
                }
            }
        }
    }

    .ps {
        height: 500px;
    }

    .ranking-list {


        .player-row {
            @include flex-center;
            justify-content: space-between;
            padding: 15px;
            margin-bottom: 10px;
            width: 100%;
            border-radius: 10px;
            background-color: #FFFFFF;
            border: 2px solid #DAE2E7;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

            //  第一名樣式 
            &:nth-child(1) {
                background-color: #FEFAD0;
                border-color: #EAB308;
            }

            //  第二名樣式 
            &:nth-child(2) {
                background-color: #F6F7F8;
                border-color: #9CA3AF;
            }

            //  第三名樣式 
            &:nth-child(3) {
                background-color: #FFF3E3;
                border-color: #F97316;
            }


            .rank-number {
                font-size: 18px;
                font-weight: bold;
                width: 30px;
                text-align: center;
                margin-right: 10px;
            }

            .rank-icon-name {
                @include flex-center;

                .rank-icon {
                    margin-right: 16px;
                    width: 40px;
                    height: 40px;
                }

                .player-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    font-size: 18px;

                    .player-name {
                        font-weight: 600;
                    }
                }
            }

            .score-info {
                display: flex;
                flex-direction: column;
                align-items: end;

                .player-score {
                    font-size: 24px;
                    font-weight: bold;
                }
            }
        }
    }


    // 挑戰遊戲列表
    .game-item {
        @include flex-center;
        justify-content: space-between;
        padding: 20px;
        margin-bottom: 15px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(218, 226, 231, 1);
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(12px);

        .game-info {
            display: flex;
            align-items: center;

            .game-text {
                text-align: left;

                .game-title {
                    font-weight: 600;
                    font-size: 24px;
                }

                .game-info-wrap {
                    @include flex-center;
                    gap: 0 8px;
                    font-size: 18px;

                    .game-island {
                        font-size: 14px;
                        border-radius: 24px;
                        background-color: #F8F9FA;
                        border: 1px solid #DAE2E7;
                        padding: 8px 16px;
                        color: $main-blue-text;
                    }

                    .game-point {
                        font-size: 14px;
                        border-radius: 24px;
                        background-color: rgba(205, 236, 233, 0.35);
                        border: 1px solid rgba(218, 226, 231, 1);
                        padding: 8px 16px;
                        color: $main-dark-blue;
                    }
                }


            }

            .game-icon {
                width: 60px;
                height: 60px;
                margin-right: 16px;
                object-fit: contain;
            }
        }

        .start-btn {
            border-radius: 8px;
            background-color: $main-dark-blue;
            color: white;
            border: none;
            padding: 8px 16px;
            font-size: 16px;

            &.is-completed {
        background-color: #ccc !important; 
        color: #666 !important; 
        cursor: not-allowed;
        box-shadow: none;
        opacity: 0.7;
    }

            &:hover {
                background-color: #0f8f82;
            }
        }
    }
}

.footer-fixed {
    position: fixed;
    bottom: 0;
    left: 100px;
    right: 0;
    min-height: 90px;
    z-index: 50;
    display: flex;
    justify-content: center;
    padding-bottom: 16px;
    background: linear-gradient(0deg, #F0FAFF 0%, #f8fdff2b 70%, rgba(240, 250, 255, 0) 100%);


    .player-summary {
        @include flex-center;
        justify-content: space-between;
        gap: 20px;
        padding: 8px 24px;
        font-size: 16px;
        min-width: 80%;
        box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(24px);
        border: rgba(40, 169, 156, 1) 1px solid;
        border-radius: 16px;

        .player-left-info {
            @include flex-center;
            gap: 0 10px;

            .player-rank,
            .player-name {
                font-weight: 600;
                font-size: 20px;
            }

            .player-info-wrap {

                .player-tag {
                    background: #CAEBEB;
                    font-size: 16px;
                    color: #28A99C;
                    padding: 4px 8px;
                    border-radius: 8px;
                    margin-left: 8px;
                }
            }


        }

        .player-right-info {
            @include flex-center;
            gap: 0 16px;

            .player-actual-score {
                text-align: right;

                .player-score {
                    display: flex;
                    flex-direction: column;
                    font-size: 22px;
                    color: #28A99C;
                    font-weight: 600
                }
            }

            .player-score-compare {
                display: flex;
                flex-direction: column;
                background: #FEDEC6;
                border: 1px solid #F5BE99;
                padding: 8px 16px;
                border-radius: 16px;

                .player-rank-diff-score {
                    color: #F88739;
                    font-weight: 600;
                    font-size: 22px;
                }
            }
        }
    }

    .player-score {
        display: flex;
        flex-direction: column;
        font-size: 24px;
        color: #28A99C;

        .score-title {
            font-size: 16px;
            font-weight: normal;
        }
    }
}
@media (min-width: 768px) and (pointer: coarse) {
    .competition-page{
        padding: 0 4% 8% 12%;

        .content-wrapper{
            width: 1000px;
        }
    }
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
      .competition-page{
        .footer-fixed{
    padding: 0 78px 16px;
   display: unset;
   left: 0;
   right: 0;
   z-index: 0;
        }
        padding:0 50px 80px;
          .content-wrapper{
            width: 100%;
            margin: 0 auto 12%;
        .main-column{
            min-width: unset;
        }
        }
    .content-wrapper{
        flex-direction: column;
    }
}
}
</style>