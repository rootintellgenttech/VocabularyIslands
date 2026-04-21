<template>
    <div class="competition-page">
        <el-dialog custom-class="challenge-confirm-modal" :visible.sync="challengeDialogVisible" width="31.25rem" center
            :close-on-click-modal="false" :show-close="false">

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
        <div class="return-last-page" @click="goToHome">
            <i class="fas fa-angle-left"></i> 返回
        </div>
        <h1 class="page-title">競技島</h1>
        <div class="content-wrapper">
            <div class="main-column">

                <div class="arena-header-card">
                    <div class="header-wrap">
                        <img alt='島嶼圖片' src="../../assets/image/competition/island.png">
                        <div class="header-info">
                            <h2 class="header-title">競技聯盟</h2>
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
                            <span class="stat-label">
                                <i class="fa-solid fa-crown" style="color: #eab308;"></i>
                                {{ rankingType === 'all' ? '所屬聯盟排行' : '所屬學校排行' }}
                            </span>
                            <span class="stat-value">{{ currentRanking ? currentRanking.display_name : '無排行'
                                }}</span>
                            <span class="stat-status">排名第 {{ currentRanking ? currentRanking.my_rank : '-' }} 名</span>
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
                            <div class="ranking-list" v-loading="isLoadingRanking">
                                <div v-for="(player, index) in filteredRanking" :key="index"
                                    :class="['player-row', { 'is-top3': index < 3 }]">
                                    <div class="rank-icon-name">
                                        <img alt="排行榜Icon" v-if="index < 3" :src="getRankIcon(index + 1)"
                                            class="rank-icon">
                                        <span v-else class="rank-number">#{{ player.rank }}</span>

                                        <div class="player-info">
                                            <span class="player-name">{{ player.displayName }}</span>
                                            <span v-if="player.school_name" class="player-school">{{ player.school_name
                                                }}</span>
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
                                        <div class="info-wrap">
                                            <p class="game-island">{{ game.island }}</p>
                                            <p class="game-point">{{ game.point }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button :class="['start-btn', getChallengeButtonProps().className]"
                                :disabled="getChallengeButtonProps().disabled" @click="showChallengeDialog(game)">
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
                            <span class="info-value">{{ isDailyChallengeCompleted ? 1 : 0 }}</span>
                        </div>
                        <div class="info-footer">
                            <i class="fa-regular fa-clock" style="color: #67777e;"></i>
                            <span class="refresh-time">刷新時間：每日 00:00</span>
                        </div>

                    </div>

                    <div class="info-block ranking-block">
                        <div class="info-label-group">
                            <i class="fa-solid fa-ranking-star" style="color: #28a99c;"></i>
                            <span class="info-label">當前{{ rankingType === 'all' ? '聯盟' : '校內' }}排名</span>
                        </div>
                        <div class="ranking-details">
                            <span class="rank-number">#{{ currentRanking ? currentRanking.my_rank : '--' }}</span>
                            <span class="score-value">{{ currentRanking ? formatScore(currentRanking.my_score) : 0 }}
                                積分</span>
                        </div>
                        <div class="ranking-diff">
                            <i class="fa-solid fa-arrow-trend-up" style="color: #f97316;"></i>
                            <span>與昨天的自己差<span class="diff-score"> {{ currentRanking ?
                                currentRanking.compare_yesterday.score_diff : 0 }} </span>分</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="footer-fixed" v-if="studentInfo">
            <div class="player-summary">
                <div class="player-left-info">
                    <span class="player-rank">#{{ currentRanking ? currentRanking.my_rank : '--' }}</span>
                    <div class="player-wrap">
                        <div class="player-info-wrap">
                            <span class="player-name">
                                {{ studentInfo.student_name || '載入中...' }}<span class="player-tag">我</span>
                            </span>
                        </div>
                        <span class="player-school">{{ studentInfo.school_name || '' }}</span>
                    </div>
                </div>

                <div class="player-right-info">
                    <div class="player-actual-score">
                        <span class="player-score">{{ currentRanking ? formatScore(currentRanking.my_score) : 0
                            }}</span>
                        <span class="score-title">積分</span>
                    </div>

                    <div class="player-score-compare" v-if="currentRanking && currentRanking.my_rank > 1">
                        <span class="player-rank-diff">與前一名差</span>
                        <div class="player-rank-diff-score">
                            <span>{{ formatScore(myDiffFromPrevious) }}</span><span>分</span>
                        </div>
                    </div>
                    <div class="player-score-compare" v-else-if="currentRanking && currentRanking.my_rank === 1"
                        style="background: #FEFAD0; border-color: #EAB308;">
                        <span class="player-rank-diff" style="color: #856404;">保持領先！</span>
                        <div class="player-rank-diff-score">
                            <span style="font-size: 1rem;">目前排名第一</span>
                        </div>
                    </div>
                    <div class="player-score-compare" v-else>
                        <span class="player-rank-diff">暫無挑戰數據</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/config/api';

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
    props: {
        rankingScrollSettings: {
            suppressScrollY: false,
            suppressScrollX: true,
            wheelPropagation: false
        },
    },
    data() {
        return {
            currentTime: new Date(),
            timeUpdateInterval: null,
            dailyCheckInterval: null,
            challengeDialogVisible: false,
            isDailyChallengeCompleted: true,
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
                    { id: 'perfect', title: '完美連擊', description: '連續答對題目直到錯誤', point: '每題10分', island: '國小聽力海灣', iconClass: 'TARGET_ICON', level: 'both' },
                    { id: 'speed', title: '速度對決', description: '1分鐘內，盡可能的答對', point: '每題10分', island: '國小聽力海灣', iconClass: 'THUNDER_ICON', level: 'both' },
                ],
                secondary: [
                    { id: 'perfect', title: '完美連擊', description: '連續答對題目直到錯誤', point: '每題10分', island: '國中聽力海灣', iconClass: 'TARGET_ICON', level: 'both' },
                    { id: 'speed', title: '速度對決', description: '1分鐘內，盡可能的答對', point: '每題10分', island: '國中聽力海灣', iconClass: 'THUNDER_ICON', level: 'both' },
                ]
            },
            studentInfo: null,
            rankingData: { all: null, school: null },
            isLoadingRanking: false,
        };
    },
    computed: {

        filteredRanking() {
            return this.rankingType === 'all' ? this.allRanking : this.schoolRanking;
        },
        filteredGames() {
            const allGames = this.gamesData[this.gameLevel] || [];
            // 如果是國中 (secondary)，確保不會出現 id 為 'abc' 的遊戲
            if (this.gameLevel === 'secondary') {
                return allGames.filter(game => game.id !== 'abc');
            }
            return allGames;
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
            // 如果有測試手動類型設定，則優先使用手動值
            if (this.manualGameType) {
                return this.manualGameType;
            }

            // 否則，使用原本的日期計算邏輯
            const now = this.currentTime;
            const weekNumber = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
            // 偶數週為 listening，奇數週為 reading
            return weekNumber % 2 === 0 ? 'listening' : 'reading';
        },

        weekData() {
            const now = this.currentTime;

            // 決定本週挑戰類型中文
            const challengeType = this.currentWeekType === 'listening' ? '聽力大賽' : '閱讀大賽';

            // 計算活動結束時間 (本週日 23:59:59)
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (7 - now.getDay()) % 7);
            endOfWeek.setHours(23, 59, 59, 999);

            // 計算倒數時間
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
        },
        currentRanking() {
            return this.rankingType === 'all' ? this.rankingData.all : this.rankingData.school;
        },
        // 計算與前一名的差距
        myDiffFromPrevious() {
            if (!this.currentRanking || !this.currentRanking.top_30) return 0;

            const myRank = this.currentRanking.my_rank;
            const list = this.currentRanking.top_30;

            // 如果目前是第一名，就沒有前一名，回傳 0 或其他提示
            if (myRank === 1) return 0;

            // 尋找清單中 rank 為 (我的排名 - 1) 的那位學生
            const prevPlayer = list.find(p => p.rank === myRank - 1);

            if (prevPlayer) {
                return prevPlayer.score - this.currentRanking.my_score;
            }
            return 0;
        },
        // 獲取 top_30 並進行資料脫敏
        filteredRanking() {
            if (!this.currentRanking || !this.currentRanking.top_30) return [];
            return this.currentRanking.top_30.map(item => ({
                ...item,
                displayName: this.maskName(item.student_name) // 資料脫敏
            }));
        },
    },
    methods: {
        goToHome() {
            this.$router.push('/home');
        },
        async fetchStudentInfo() {
            try {
                const response = await api.get('students/dashboard/student/');
                this.studentInfo = response.data;
                if (this.studentInfo.school_type === '國中') {
                    this.gameLevel = 'secondary';
                } else {
                    this.gameLevel = 'primary';
                }
            } catch (err) {
                console.error('獲取個人資訊失敗:', err);
            }
        },
        // 資料脫敏：將名字中間變為 O
        maskName(name) {
            if (!name) return '';
            if (name.length <= 1) return name;
            if (name.length === 2) return name[0] + 'O';
            return name[0] + 'O' + name.substring(2);
        },

        //非同步獲取排行榜數據
        async fetchRanking(scope) {
            this.isLoadingRanking = true;
            try {
                const apiScope = scope === 'all' ? 'league' : 'school';
                const response = await api.get('/students/competition-score/weekly-ranking/', {
                    params: { scope: apiScope }
                });

                this.isDailyChallengeCompleted = response.data.has_done_today;

                if (scope === 'all') {
                    this.rankingData.all = response.data;
                } else {
                    this.rankingData.school = response.data;
                }
            } catch (err) {
                console.error('獲取排行榜失敗:', err);
                // 報錯時給予預設值
                const defaultData = {
                    my_rank: '--',
                    my_score: 0,
                    top_30: [],
                    compare_yesterday: { score_diff: 0 }
                };

                if (scope === 'all') {
                    this.rankingData.all = this.rankingData.all || defaultData;
                } else {
                    this.rankingData.school = this.rankingData.school || defaultData;
                }

                // 即使API回傳error，也要讓用戶可以挑戰
                if (this.isDailyChallengeCompleted === null) {
                    this.isDailyChallengeCompleted = false;
                }
            } finally {
                this.isLoadingRanking = false;
            }
        },
        // 切換 Tab 時自動重新抓取
        handleRankingToggle(type) {
            this.rankingType = type;
            if (!this.rankingData[type]) {
                this.fetchRanking(type);
            }
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
        async confirmStartChallenge() {
            this.challengeDialogVisible = false;
            if (!this.selectedGame) return;

            const isPrimary = this.gameLevel === 'primary';
            const island = isPrimary ? '300字島' : '1200字島';

            //  字母轉盤樂 (僅國小)
            if (this.selectedGame.id === 'abc') {
                const loading = this.$loading({ lock: true, text: '載入題目中...', background: 'rgba(0, 0, 0, 0.7)' });
                try {
                    const response = await api.post('/questionbank/generate/', {
                        "島嶼": "ABC啟航島",
                        "題數": 26,
                        "include_answer": true
                    });
                    loading.close();
                    this.$router.push({
                        name: 'AlphabetWheelQuiz',
                        params: {
                            gameId: 'abc',
                            gameTitle: '字母轉盤樂',
                            questionsData: response.data.sort(() => 0.5 - Math.random()).slice(0, 5),
                            gameLevel: this.gameLevel
                        }
                    });
                } catch (e) { loading.close(); }
            }
            //  完美連擊 (一錯即死)
            else if (this.selectedGame.id === 'perfect') {
                this.$router.push({
                    name: 'ComboQuiz',
                    params: {
                        gameId: 'perfect',
                        gameTitle: '完美連擊',
                        gameLevel: this.gameLevel,
                        gameType: this.currentWeekType
                    }
                });
            }
            // 速度對決 (1分鐘挑戰)
            else if (this.selectedGame.id === 'speed') {
                this.$router.push({
                    name: 'SpeedQuiz',
                    params: {
                        gameId: 'speed',
                        gameTitle: '速度對決',
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
    async mounted() {
        await this.fetchStudentInfo();

        this.fetchRanking('all');
        this.fetchRanking('school');
        this.timeUpdateInterval = setInterval(() => {
            this.currentTime = new Date();
        }, 60000);
    },
    beforeDestroy() {
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
    border: .0625rem solid #DAE2E780;
    border-radius: 1rem;
    padding: 1rem;
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
.score-title {
    color: $main-grey-text;
}

.player-school {
    color: $main-black-text;
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
    padding: 0 0 5rem 6.25rem;
    position: relative;
    overflow-y: auto;
}

.page-title {
    @include page-main-title;
    margin-bottom: 1.75rem;
}

.content-wrapper {
    display: flex;
    justify-content: center;
    gap: 1.875rem;
    width: 100%;
    max-width: 87.5rem;
    margin: 0 auto 4%;
}

.main-column {
    flex: 3;
    min-width: 37.5rem;
}

.sidebar-right {
    flex: 1;
    border-radius: 1rem;
    padding: 1.5rem;
    background-color: #fff;
    min-width: 21.875rem;
    height: 100%;

    .my-info-card {
        padding: 0;
        position: sticky;
        top: 1.25rem;

        .card-title {
            font-size: 1.25rem;
            margin-bottom: 1.125rem;
            text-align: center;

            i {
                margin-right: .625rem;
            }
        }

    }

    .info-block {
        border-radius: .75rem;
        padding: .9375rem;

        .info-label-group {
            display: flex;
            align-items: center;
            font-size: 1rem;

            i {
                margin-right: .5rem;
            }
        }
    }

    .info-block:nth-child(3) {
        margin-top: 1rem;
    }

    .challenge-block,
    .activity-block {
        @include section-card-layout;
        text-align: left;
    }

    .challenge-block {


        .info-value {
            font-size: 2.25rem;
            font-weight: bold;
            display: block;
        }

        .info-footer {
            display: flex;
            align-items: center;
            margin-top: .625rem;

            i {
                margin-right: .3125rem;
            }
        }
    }

    .activity-block {

        .info-content {
            display: flex;
            flex-direction: column;

            .activity-days {
                font-size: 2.25rem;
                font-weight: 600;
            }
        }
    }

    .ranking-block {
        background: linear-gradient(135deg, rgba(40, 169, 156, 0.1) 0%, rgba(40, 169, 156, 0.05) 100%);
        border: .0625rem solid #28A99C4D;

        .ranking-details {
            margin-top: .625rem;
            display: flex;
            flex-direction: column;

            .rank-number {
                font-size: 3rem;
                font-weight: 800;
                color: #28A99C;
                line-height: 1;
            }

            .score-value {
                font-size: 1.125rem;
                font-weight: 600;
            }
        }

        .ranking-diff {
            display: flex;
            align-items: center;
            margin-top: .625rem;
            font-size: .875rem;

            i {
                margin-right: .3125rem;
            }

            .diff-score {
                color: #f97316;
                font-weight: 600;
            }
        }
    }
}


.arena-header-card {
    border-radius: 1rem;
    padding: 1.5rem;
    background-color: #fff;
    border: .0625rem solid #28A99C4D;

    .header-wrap {
        @include flex-center;
        gap: 0 1rem;

        img {
            width: 5.625rem;
            height: 100%;
        }

        .header-info {
            display: flex;
            flex-direction: column;


            .header-title {
                font-size: 1.75rem;
                font-weight: bold;
            }
        }


    }


    .stats-grid {
        display: flex;
        justify-content: space-between;
        gap: 1.25rem;

        .stat-item {
            margin-top: 1rem;
            @include section-card-layout;

            .stat-value {
                font-size: 1.5rem;
                font-weight: 600;
                margin: .25rem 0;
            }

            .stat-label {
                i {
                    margin-right: .5rem;
                }

            }
        }
    }
}

.ranking-challenge-section {

    .tabs {
        display: flex;
        border-radius: 1rem;
        overflow: hidden;
        margin: 1.75rem 0;
        padding: .75rem;
        background: rgba(240, 243, 245, 0.8);

        .tab-btn {
            flex: 1;
            padding: .5rem;
            font-size: 1.25rem;
            font-weight: bold;
            background-color: rgb(209 238 235);
            border: none;
            transition: background-color 0.2s, color 0.2s;

            span {
                margin-right: .5rem;
            }

            &:first-child {
                &.is-active {
                    background-color: rgba(9, 124, 112, 1);
                    color: white;
                    border-radius: .5rem 0 0 .5rem;

                    i {
                        color: white;
                    }
                }

                &:not(.is-active):hover {
                    border-radius: .5rem 0 0 .5rem;
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
                    border-radius: 0 .5rem .5rem 0;

                    i {
                        color: white;
                    }
                }

                &:not(.is-active):hover {
                    border-radius: 0 .5rem .5rem 0;
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
        border-radius: 1rem;
        padding: 1.5rem;
        text-align: center;
        background: #fff;
    }

    // 排行榜切換按鈕
    .ranking-toggle {
        display: flex;
        gap: 0 .75rem;
        justify-content: center;
        margin-bottom: 1.25rem;

        .toggle-btn {
            padding: .5rem 1.25rem;
            border-radius: .5rem;
            width: 12.5rem;
            font-size: 1rem;
            border: .0625rem solid #DAE2E7;
            background: #F0FAFF;
            font-weight: 600;

            span {
                margin-right: .5rem;
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
                background-color: #095e55;
                color: white;
                border: .0625rem solid #DAE2E7;

                i {
                    color: white;
                }
            }
        }
    }

    .ps {
        height: 31.25rem;
    }

    .ranking-list {


        .player-row {
            @include flex-center;
            justify-content: space-between;
            padding: .9375rem;
            margin-bottom: .625rem;
            width: 100%;
            border-radius: .625rem;
            background-color: #FFFFFF;
            border: .125rem solid #DAE2E7;
            box-shadow: 0 .0625rem .1875rem rgba(0, 0, 0, 0.05);

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
                font-size: 1.125rem;
                font-weight: bold;
                width: 1.875rem;
                text-align: center;
                margin-right: .625rem;
            }

            .rank-icon-name {
                @include flex-center;

                .rank-icon,
                .rank-number {
                    width: 2.5rem;
                }

                .rank-icon {
                    margin-right: 1rem;
                    width: 2.5rem;
                    height: 2.5rem;
                }

                .player-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    font-size: 1.125rem;

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
                    font-size: 1.5rem;
                    font-weight: bold;
                }
            }
        }
    }


    // 挑戰遊戲列表
    .game-item {
        @include flex-center;
        justify-content: space-between;
        padding: 1.25rem;
        margin-bottom: .9375rem;
        border-radius: .625rem;
        background: rgba(255, 255, 255, 0.95);
        border: .0625rem solid rgba(218, 226, 231, 1);
        box-shadow: 0rem .0625rem .125rem 0rem rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(.75rem);

        .game-info {
            display: flex;
            align-items: center;

            .game-description,
            .game-island,
            .game-point {
                margin: 0;
            }

            .game-text {
                display: flex;
                flex-direction: column;
                text-align: left;

                .game-title {
                    font-weight: 600;
                    margin: 0;
                    font-size: 1.5rem;
                }

                .game-info-wrap {
                    @include flex-center;
                    gap: 0 .5rem;
                    font-size: 1.125rem;

                    .info-wrap {
                        display: flex;
                        gap: 0 .5rem;
                    }

                    .game-island {
                        font-size: .875rem;
                        border-radius: 1.5rem;
                        background-color: #F8F9FA;
                        border: .0625rem solid #DAE2E7;
                        padding: .5rem 1rem;
                        color: $main-blue-text;
                    }

                    .game-point {
                        font-size: .875rem;
                        border-radius: 1.5rem;
                        background-color: rgba(205, 236, 233, 0.35);
                        border: .0625rem solid rgba(218, 226, 231, 1);
                        padding: .5rem 1rem;
                        color: $main-dark-blue;
                    }
                }


            }

            .game-icon {
                width: 3.75rem;
                height: 3.75rem;
                margin-right: 1rem;
                object-fit: contain;
            }
        }

        .start-btn {
            border-radius: .5rem;
            background-color: $main-dark-blue;
            color: white;
            border: none;
            padding: .5rem 1rem;
            font-size: 1rem;

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
    left: 6.25rem;
    right: 0;
    min-height: 5.625rem;
    z-index: 50;
    display: flex;
    justify-content: center;
    padding-bottom: 1rem;
    background: linear-gradient(0deg, #F0FAFF 0%, #f8fdff2b 70%, rgba(240, 250, 255, 0) 100%);


    .player-summary {
        @include flex-center;
        justify-content: space-between;
        gap: 1.25rem;
        padding: .5rem 1.5rem;
        font-size: 1rem;
        min-width: 80%;
        box-shadow: 0rem 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(1.5rem);
        border: rgba(40, 169, 156, 1) .0625rem solid;
        border-radius: 1rem;

        .player-left-info {
            @include flex-center;
            gap: 0 .625rem;

            .player-rank,
            .player-name {
                font-weight: 600;
                font-size: 1.25rem;
            }

            .player-info-wrap {

                .player-tag {
                    background: #CAEBEB;
                    font-size: 1rem;
                    color: #01302C;
                    padding: .25rem .5rem;
                    border-radius: .5rem;
                    margin-left: .5rem;
                }
            }


        }

        .player-right-info {
            @include flex-center;
            gap: 0 1rem;

            .player-actual-score {
                text-align: right;

                .player-score {
                    display: flex;
                    flex-direction: column;
                    font-size: 1.375rem;
                    color: #28A99C;
                    font-weight: 600
                }
            }

            .player-score-compare {
                display: flex;
                flex-direction: column;
                background: #FFFDEA;
                border: .0625rem solid #FFFDEA;
                padding: .5rem 1rem;
                border-radius: 1rem;

                .player-rank-diff-score {
                    color: #972E19;
                    font-weight: 600;
                    font-size: 1.375rem;
                }
            }
        }
    }

    .player-score {
        display: flex;
        flex-direction: column;
        font-size: 1.5rem;
        color: #28A99C;

        .score-title {
            font-size: 1rem;
            font-weight: normal;
        }
    }
}

@media (min-width: 48rem) and (pointer: coarse) {
    .competition-page {
        padding: 0 4% 8% 12%;

        .content-wrapper {
            width: 62.5rem;
        }
    }
}

@media (orientation: landscape) and (max-height: 47.9988rem) and (pointer: coarse) {
    .competition-page {
        .page-title {
            margin-top: 1.5rem;
        }

        .stat-label {
            text-wrap-mode: nowrap;
        }

        .ranking-challenge-section .game-item {
            gap: 0 1.5rem;
        }

        .ranking-list {
            width: 100%;
        }

        .footer-fixed {
            padding: 0 4.875rem 1rem;
            display: unset;
            left: 0;
            right: 0;
            z-index: 0;
        }

        padding:0 3.125rem 5rem !important;

        .content-wrapper {
            width: 100%;
            margin: 0 auto 12%;

            .main-column {
                min-width: unset;
            }
        }

        .content-wrapper {
            flex-direction: column;
        }

        .ranking-challenge-section .game-item .game-info .game-text .game-info-wrap {
            flex-direction: column;
            gap: .625rem 0;
            align-items: flex-start;
        }
    }
}
</style>