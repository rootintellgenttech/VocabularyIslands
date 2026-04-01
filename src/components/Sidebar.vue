<template>
    <div ref="sidebarRef" :class="['sidebar', { 'is-expanded': isMenuExpanded, 'teacher-sidebar': !isStudent }]">
        <div class="top-section">
            <div class="sidebar-header">
                <div v-if="isMenuExpanded" class="user-info">
                    <div class="user-row">
                        <template v-if="isStudent">
                            <div class="user-name">{{ studentInfo.student_name || '載入中...' }}</div>
                        </template>
                        <template v-else>
                            <div class="user-name">{{ currentRoleName }}</div>
                        </template>

                        <div class="toggle-btn" @click="toggleMenu">
                            <i :class="['fas', isMenuExpanded ? 'fa-angle-double-left' : 'fa-angle-double-right']"
                                @click.stop="toggleMenu"></i>
                        </div>
                    </div>

                    <template v-if="isStudent">
                        <div class="second-row">
                            <p class="user-status">{{ studentInfo.school_name }}</p>
                            <p class="class-name">{{ studentInfo.class_name }}</p>
                        </div>
                    </template>
                </div>

                <div v-else class="toggle-btn" @click="toggleMenu">
                    <i class="fas fa-angle-double-right"></i>
                </div>
            </div>

            <div class="menu-section">

                <template v-if="isStudent">
                    <div class="stat-item" :style="{ backgroundColor: 'rgba(245, 113, 72, 1)' }">
                        <div class="stat-icon"><i class="fas fa-star"></i></div>
                        <span v-if="isMenuExpanded" class="stat-label">星星</span>
                        <span class="stat-value">
                            {{ isMenuExpanded ? studentInfo.total_stars + ' 顆' : studentInfo.total_stars }}
                        </span>
                    </div>
                    <div class="stat-item" :style="{ backgroundColor: '#FFDB81' }">
                        <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                        <span v-if="isMenuExpanded" class="stat-label">已學習天數</span>
                        <span class="stat-value">
                            {{ isMenuExpanded ? studentInfo.attendance_days + ' 天' : studentInfo.attendance_days }}
                        </span>
                    </div>
                </template>

                <template v-else>
                    <div v-for="(item, index) in filteredMenuItems" :key="index" class="teacher-menu-item"
                        :class="{ active: isItemActive(item) }" @click="handleNavigation(item.path)">
                        <div class="menu-icon"><i :class="['fas', item.icon]"></i></div>
                        <span v-if="isMenuExpanded" class="menu-label">{{ item.title }}</span>
                    </div>
                </template>

            </div>
            <div v-if="isMenuExpanded && isStudent" class="achievement-section"
                @click="handleNavigation('/achievementisland')" style="cursor: pointer;">
                <div class="section-title">
                    <p>成就獎章</p>
                </div>
                <div class="achievement-badges">
                    <div v-for="(log, idx) in achievementLogs.slice(0, 3)" :key="idx" class="badge-item">
                        <i :class="getAchievementIcon(log.name)" style="color: #F56C42; font-size: 32px;"></i>
                    </div>

                    <div v-if="achievementLogs.length === 0"
                        style="color: #999; font-size: 14px; margin-top: 5px;text-wrap: nowrap;">
                        尚未獲得獎章
                    </div>
                </div>
            </div>
        </div>


        <div class="bottom-menu">

            <div v-if="!isStudent" class="menu-item" @click="passwordDialogVisible = true">
                <i class="fas fa-key"></i>
                <span v-if="isMenuExpanded">修改密碼</span>
            </div>

            <div class="menu-item" @click="contactDialogVisible = true">
                <i class="fa-solid fa-envelope"></i>
                <span v-if="isMenuExpanded">聯絡我們</span>
            </div>

            <el-dialog :visible.sync="contactDialogVisible" width="600px" center custom-class="mails-modal"
                append-to-body>
                <h3 class="title">聯絡我們</h3>

                <div class="mail-info">
                    <div class="mail-label">
                        <i class="fa-solid fa-envelope"></i>
                        聯絡信箱
                    </div>
                    <div class="mail-content">
                        <i class="fa-solid fa-copy copy-icon" @click="copyEmail" title="複製信箱"></i>
                        <a href="mailto:rootintellgenttech@gmail.com?subject=【系統聯絡】使用者來信" class="contact-email">
                            rootintellgenttech@gmail.com
                        </a>
                    </div>
                </div>


                <div class="reply-info">
                    <div class="reply-label">
                        <i class="fa-solid fa-clock"></i>
                        回覆時間
                    </div>
                    <div class="reply-time">
                        週一至週五 08:00～17:00<br />
                        <span class='work-time-note'>非上班時間將於下一個工作日回覆</span>
                    </div>
                </div>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="contactDialogVisible = false">
                        關閉
                    </el-button>
                </span>
            </el-dialog>


            <template v-if="isStudent">
                <div class="menu-item" @click="settingsDialogVisible = true">
                    <i class="fas fa-cog"></i>
                    <span v-if="isMenuExpanded">設定</span>
                </div>

                <audio ref="mainAudio" :src="require('@/assets/mp3/main-bg.mp3')" loop title="系統背景音樂"></audio>
                <audio ref="fightAudio" :src="require('@/assets/mp3/fight-island.mp3')" loop></audio>

                <el-dialog :visible.sync="settingsDialogVisible" width="400px" center custom-class="settings-modal"
                    append-to-body>
                    <h3 class="title">設定</h3>
                    <div class="setting-item">
                        <div class="setting-label">
                            <i class="fas fa-music"></i> 背景音樂
                        </div>
                        <el-switch v-model="isMusicEnabled" active-color="#18AC9D" @change="handleMusicToggle">
                        </el-switch>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="settingsDialogVisible = false" class="btn-resume">關閉</el-button>
                    </span>
                </el-dialog>
            </template>

            <audio ref="mainAudio" :src="require('@/assets/mp3/main-bg.mp3')" loop></audio>
            <audio ref="fightAudio" :src="require('@/assets/mp3/fight-island.mp3')" loop></audio>

            <div class="menu-item" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span v-if="isMenuExpanded">登出</span>
            </div>
        </div>

        <el-dialog :visible.sync="passwordDialogVisible" width="400px" center custom-class="password-modal"
            append-to-body>
            <h3 class="title">修改密碼</h3>
            <div class="setting-item-box">
                <div class="input-group">
                    <label>新密碼</label>
                    <el-input v-model="newPassword" type="password" show-password placeholder="請輸入新密碼"></el-input>
                </div>
                <div class="input-group" style="margin-top: 15px;">
                    <label>確認新密碼</label>
                    <el-input v-model="confirmPassword" type="password" show-password placeholder="請再次輸入新密碼"></el-input>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="passwordDialogVisible = false" class="btn-cancel">取消</el-button>
                <el-button type="primary" @click="submitPasswordChange" :loading="passwordLoading"
                    class="btn-submit-pwd">確認修改</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import api from '@/config/api';

export default {
    name: 'Sidebar',
    data() {
        return {
            isMusicEnabled: localStorage.getItem('isMusicEnabled') === 'true',
            isMenuExpanded: false,
            userRole: '',
            currentPath: '/dashboard',
            studentInfo: {
                student_name: '',
                school_name: '',
                class_name: '',
                total_stars: 0,
                attendance_days: 0
            },
            roleTitles: {
                'teacher': '老師',
                'school_admin': '學校管理員',
                'union_leader': '聯盟召集人',
                'global_leader': '總召集人',
                // 'moe': '教育部'
            },


            // 定義哪些身份 '看得到' 對應頁面
            allMenuItems: [
                {
                    title: '儀錶板',
                    icon: 'fa-tachometer-alt',
                    path: '/dashboard',
                    roles: ['teacher', 'school_admin', 'union_leader', 'global_leader']
                },
                {
                    title: '最新消息',
                    icon: 'fa-bullhorn',
                    path: '/news',
                    roles: ['global_leader']
                },
                // {
                //     title: '學習總覽',
                //     icon: 'fa-book-reader',
                //     path: '/learning-overview',
                //     roles: ['teacher', 'school_admin', 'union_leader', 'global_leader']
                // },
                {
                    title: '練習進度與狀況',
                    icon: 'fa-tasks',
                    path: '/practice-progress',
                    roles: ['teacher']
                },
                {
                    title: '競技島分析',
                    icon: 'fa-chart-area',
                    path: '/island-analysis',
                    roles: ['school_admin', 'union_leader', 'global_leader']
                },
                {
                    title: '試煉殿堂考試分析',
                    icon: 'fa-clipboard-list',
                    path: '/exam-analysis',
                    roles: ['teacher', 'school_admin', 'union_leader', 'global_leader']
                },
                {
                    title: '學生列表',
                    icon: 'fa-users',
                    path: '/student-list',
                    roles: ['teacher']
                }
            ],
            achievementLogs: [],
            settingsDialogVisible: false,
            contactDialogVisible: false,
            passwordDialogVisible: false,
            passwordLoading: false,
            newPassword: '',
            confirmPassword: '',
        };
    },

    watch: {
        '$route.path': {
            handler(newPath) {
                // 當路由路徑改變時，同步更新 currentPath
                this.currentPath = newPath;

                // 處理成就島收合
                if (newPath === '/achievement-island') {
                    this.isMenuExpanded = false;
                }

                // 處理音樂
                if (!this.isMusicEnabled) {
                    this.stopAllMusic();
                } else {
                    this.playAppropriateMusic(newPath);
                }
            },
            immediate: true
        },
        userRole(newRole) {
            if (newRole === 'student') {
                this.fetchStudentDashboard();
            }
        }
    },
    computed: {
        isStudent() {
            return this.userRole === 'student';
        },
        currentRoleName() {
            if (this.isStudent) return this.studentInfo.student_name || '小學生';

            // 如果後端有回傳老師/管理員的名字，優先顯示名字；否則顯示職稱
            const roleTitle = this.roleTitles[this.userRole] || '系統管理員';
            return roleTitle;
        },

        // =自動過濾後的選單 
        filteredMenuItems() {
            // 如果是學生，這裡不回傳任何東西 (因為 template 上面有 v-else 區分了)
            if (this.isStudent) return [];

            // 過濾出包含當前 userRole 的項目
            return this.allMenuItems.filter(item => {
                return item.roles.includes(this.userRole);
            });
        }
    },
    mounted() {
        document.addEventListener('click', this.handleOutsideClick);

        // 頁面加載後，如果音樂開關是開的，嘗試播放
        if (this.isMusicEnabled) {
            this.playAppropriateMusic(this.$route.path);
        }
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleOutsideClick);
    },
    methods: {
        async submitPasswordChange() {
            if (!this.newPassword) {
                this.$message.warning('請輸入新密碼');
                return;
            }
            if (this.newPassword !== this.confirmPassword) {
                this.$message.error('兩次輸入的密碼不一致');
                return;
            }
            if (this.newPassword.length < 6) {
                this.$message.warning('密碼長度建議至少 6 位');
                return;
            }

            this.passwordLoading = true;
            try {
                await api.post('/students/first-change-password/', {
                    skip_change: false, // 固定為 false
                    new_password: this.newPassword
                });

                this.$message({
                    message: '密碼修改成功，請使用新密碼重新登入',
                    type: 'success',
                    duration: 2000
                });

                // 修改成功後自動登出
                setTimeout(() => {
                    this.handleLogout();
                }, 1500);

            } catch (err) {
                console.error('修改密碼失敗:', err);
                const errorMsg = err.response?.data?.message || '修改失敗，請稍後再試';
                this.$message.error(errorMsg);
            } finally {
                this.passwordLoading = false;
            }
        },
        isItemActive(item) {
            // 如果當前路徑完全等於選單路徑
            if (this.currentPath === item.path) return true;

            // 額外判定：如果是考試詳情頁，讓「考試分析」保持高亮
            if (item.path === '/exam-analysis' && this.currentPath === '/exam-detail') return true;

            return false;
        },
        copyEmail() {
            const email = 'rootintellgenttech@gmail.com';

            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    this.$message.success('信箱已複製');
                }).catch(() => {
                    this.fallbackCopy(email);
                });
            } else {
                this.fallbackCopy(email);
            }
        },

        fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            this.$message.success('信箱已複製');
        },
        handleOutsideClick(event) {
            const sidebar = this.$refs.sidebarRef;

            // 如果側欄目前是打開的，且點擊的目標不包含在側欄內
            if (this.isMenuExpanded && sidebar && !sidebar.contains(event.target)) {
                this.isMenuExpanded = false;
            }
        },
        handleMusicToggle(val) {
            localStorage.setItem('isMusicEnabled', val); // 持久化儲存
            if (val) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    this.playAppropriateMusic(this.$route.path);
                }
            } else {
                this.stopAllMusic();
            }
        },

        playAppropriateMusic(path) {
            if (!this.isStudent || !this.isMusicEnabled) return;

            this.$nextTick(() => {
                // 1. 定義「完全靜音」的路由名單 (包含所有作答、學習、考試、遊戲內部)
                const silentPaths = [
                    '/learn',        // 學習模式
                    '/quiz',         // 練習測驗/聽力
                    '/hero-quiz',    // 英雄試煉作答
                    '/trial-quiz',   // 試煉殿堂正式考試
                    '/competition/', // 競技島遊戲內部 (假設路徑如 /competition/math-game)
                ];

                // 檢查當前路徑是否包含在靜音名單中
                const isSilentMode = silentPaths.some(p => path.includes(p));

                if (isSilentMode) {
                    console.log('[BGM] 進入作答或遊戲區域，暫停背景音樂');
                    this.stopAllMusic();
                    return; // 直接中斷，不執行後續播放
                }

                // 2. 正常播放
                const isCompetitionIsland = path === '/competition';
                const targetAudio = isCompetitionIsland ? this.$refs.fightAudio : this.$refs.mainAudio;
                const otherAudio = isCompetitionIsland ? this.$refs.mainAudio : this.$refs.fightAudio;

                if (targetAudio) {
                    // 如果目標音樂已經在播放中，且音軌正確，就不重複執行
                    if (!targetAudio.paused) return;

                    // 切換音軌時，停止另一首
                    if (otherAudio) {
                        otherAudio.pause();
                        otherAudio.currentTime = 0;
                    }

                    const playPromise = targetAudio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // 處理瀏覽器自動播放限制
                            const startPlay = () => {
                                targetAudio.play();
                                document.removeEventListener('click', startPlay);
                            };
                            document.addEventListener('click', startPlay);
                        });
                    }
                }
            });
        },
        stopAllMusic() {
            if (this.$refs.mainAudio) this.$refs.mainAudio.pause();
            if (this.$refs.fightAudio) this.$refs.fightAudio.pause();
        },
        async fetchAchievements() {
            try {
                const response = await api.get('/students/students/achievements/log/');
                this.achievementLogs = response.data; // [{ name: '...', completed_at: '...' }]
            } catch (err) {
                console.error('[Sidebar] 成就抓取失敗:', err);
            }
        },

        getAchievementIcon(name) {
            const iconMap = {
                '踏出第一步': 'fa-solid fa-shoe-prints',
                '初次閃耀': 'fa-solid fa-star',
                '月度冠軍': 'fa-solid fa-trophy',
                '學而時習之': 'fa-solid fa-calendar',
                '勤學學霸': 'fa-solid fa-book',
                '字母探險者': 'fa-brands fa-fort-awesome',
                '300字霸總': 'fa-solid fa-user-tie',
                '初階小英雄': 'fa-solid fa-shield-halved',
                '聽力小老師': 'fa-solid fa-ear-deaf',
                '國小里程碑': 'fa-solid fa-medal',
                '800字勇者': 'fa-solid fa-user-ninja',
                '1200字王者': 'fa-solid fa-chess',
                '會考大殿堂': 'fa-solid fa-web-awesome',
                '聽力大師': 'fa-solid fa-headphones',
                '國中里程碑': 'fa-solid fa-ranking-star'
            };
            return iconMap[name] || 'fa-solid fa-medal'; // 預設圖標
        },

        async checkAndFetchData() {
            const savedRole = localStorage.getItem('userRole');
            const token = localStorage.getItem('accessToken');

            if (savedRole === 'student' && token) {
                if (!this.studentInfo.student_name) await this.fetchStudentDashboard();
                await this.fetchAchievements(); //  呼叫成就 API
            }
        },
        async fetchStudentDashboard() {
            try {
                const response = await api.get('students/dashboard/student/');
                this.studentInfo = response.data;
            } catch (err) {
                console.error('[Sidebar] 抓取失敗:', err);
            }
        },
        toggleMenu() {
            this.isMenuExpanded = !this.isMenuExpanded;
        },
        handleNavigation(path) {
            if (this.$route.path !== path) {
                this.$router.push(path).catch(err => { });
            }
        },
        handleLogout() {
            this.stopAllMusic(); // 停止音樂
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            this.userRole = 'student';
            this.$router.push('/login');
        }

    },
    async created() {
        const savedRole = localStorage.getItem('userRole');

        if (savedRole) {
            this.userRole = savedRole;
            // 確保身份更新後才根據身份執行對應
            await this.checkAndFetchData();
        } else {
            // 若無身份，導回登入
            this.$router.push('/login');
        }
    },
};
</script>

<style lang="scss" scoped>
.el-dialog {

    .setting-item,
    .mail-info,
    .reply-info {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
        font-size: 16px;
    }

    .copy-icon {
        cursor: pointer;
    }

    a {
        text-decoration: none;
        color: $main-dark-blue;
        font-weight: 600;
    }

    .reply-time {
        text-align: right;

        .work-time-note {
            font-weight: 600;
        }
    }
}

.password-modal .el-input {
    margin-top: 10px;
}

.sidebar {
    justify-content: space-between;
    background-color: transparent;
    width: 90px;
    color: $main-black-text;
    padding-top: 16px;
    transition: width 0.3s ease-in-out, background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 99;
    box-shadow: none;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;


    .sidebar-header {
        display: flex;

        .user-info {
            width: 100%;

            .user-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
            }
        }
    }

    .achievement-section {
        padding: 24px 16px 16px;

        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: $main-black-text;
            white-space: nowrap;
        }

        .achievement-badges {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(1, 1fr);
            grid-column-gap: 12px;
            margin-top: 10px;

            .badge-item {
                width: 100%;
                height: 80px;
                background: linear-gradient(135deg, rgba(245, 108, 66, 0.2) 0%, rgba(22, 162, 73, 0.2) 100%);
                border: 1px solid #F56C424D;
                border-radius: 24px;
                @include flex-center;
                justify-content: center;

                i {
                    font-size: 16px;
                    margin-bottom: 0;
                }
            }
        }
    }


    .toggle-btn {
        width: 30px;
        height: 30px;
        @include flex-center;
        justify-content: center;
        color: #666;
        font-size: 16px;
        border-radius: 50%;
        transition: transform 0.3s ease, background-color 0.2s;
        margin-right: 5px;
        cursor: pointer;

        i {
            pointer-events: none;
        }
    }

    .user-info {
        white-space: nowrap;
        overflow: hidden;

        .second-row {
            @include flex-center;
            justify-content: space-between;
            margin-top: 8px;
        }

        .user-name {
            font-weight: bold;
            font-size: 18px;
            color: $main-black-text;
        }
    }

    .menu-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .stat-item {
        @include flex-center;
        color: white;
        padding: 8px 10px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: padding 0.3s ease, width 0.3s ease;
        overflow: hidden;
        height: 60px;
        position: relative;

        i {
            font-size: 20px !important
        }

        .stat-icon {
            margin-right: 0;
            font-size: 14px;
            margin-bottom: 2px;
            color: white;
        }

        .fa-calendar {
            color: #474700;
        }

        .stat-label,
        .stat-value {
            color: $main-black-text;
        }

        .stat-label {
            flex-grow: 1;
            font-size: 16px;
            white-space: nowrap;
            overflow: hidden;
        }

        .stat-value {
            font-weight: bold;
            font-size: 16px;
            white-space: nowrap;
            overflow: hidden;
        }
    }

    .bottom-menu {
        padding-bottom: 38px;

        .menu-item {
            @include flex-center;
            padding: 0 16px;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            color: $main-black-text;
            font-weight: 500;
            height: 40px;


            i {
                width: 30px;
                font-size: 18px;
                text-align: center;
            }

            span {
                white-space: nowrap;
                overflow: hidden;
                transition: opacity 0.3s ease;
            }
        }
    }


    &.is-expanded {
        width: 300px;
        background-color: #F0FAFFBF;
        box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);

        .user-info {
            padding: 0 16px;
        }

        .toggle-btn i {
            font-size: 18px;
        }

        .sidebar-header {
            justify-content: space-between;
        }

        .toggle-btn {
            margin-right: 0;
        }

        .menu-section {
            padding: 0 16px;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px solid rgba(128, 128, 128, 0.274);
        }


        .stat-item {
            .stat-icon {
                height: 40px;
                width: 40px;
                color: white;
                @include flex-center;
                justify-content: center;
                border-radius: 8px;
                background-color: rgba(255, 255, 255, 0.2);
                margin-right: 12px;

                i {
                    font-size: 18px;
                }
            }
        }
    }

    &:not(.is-expanded) {

        .user-info,
        .achievement-section,
        .menu-item span,
        .stat-label {
            display: none;
        }

        .sidebar-header {
            justify-content: center;
            margin-bottom: 16px;
        }

        .toggle-btn {
            margin: 0;
            background-color: #F0FAFFBF;
            border: #DAE2E7 2px solid;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            color: $main-black-text;

            &:hover {
                background-color: #a3defcbf;
            }
        }

        .stat-item {
            width: 60px;
            height: 60px;
            padding: 0;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0 auto;

            .stat-icon {
                margin-right: 0;
                font-size: 14px;
                margin: 4px 0;
                color: white;

                i {
                    font-size: 16px;
                }
            }

            .fa-calendar {
                color: black;
            }

            .stat-value {
                position: static;
                transform: none;
                font-size: 16px;
                line-height: 1;
                display: block;
                width: 100%;
                text-align: center;
            }
        }

        .bottom-menu {
            border-top: none;
            @include flex-center;
            flex-direction: column;
            gap: 16px;

            .menu-item {
                background-color: #F0FAFFBF;
                border: #DAE2E7 2px solid;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                justify-content: center;
                padding: 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

                &:hover {
                    background-color: #a3defcbf;
                }

                i {
                    width: auto;
                    font-size: 18px;
                    color: $main-black-text;
                }
            }
        }
    }

    .teacher-menu-item {
        @include flex-center;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #555;
        border-radius: 0;
        position: relative;
        white-space: nowrap;

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
            color: #2aaea0;
        }

        &.active {
            background-color: #e6f7f5;
            color: #2aaea0;
            border-right: 3px solid #2aaea0;
        }

        .menu-icon {
            width: 30px;
            text-align: center;
            font-size: 18px;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .menu-label {
            font-size: 16px;
            font-weight: 500;
            flex-grow: 1;
        }

        .menu-sub {
            font-size: 12px;
            color: #999;
            margin-left: 5px;
            display: block;
            transform: scale(0.9);
        }
    }

    &:not(.is-expanded) {
        .teacher-menu-item {
            padding: 15px 0;
            justify-content: center;

            .menu-icon {
                margin-right: 0;
                font-size: 20px;
            }

            .menu-label,
            .menu-sub {
                display: none;
            }
        }
    }
}

.teacher-sidebar {
    background-color: #F7FBFB;

    &.sidebar.is-expanded {
        background-color: #F7FBFB;
    }
}


@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .sidebar {
        width: 90px;
        padding: 0;
        background-color: unset;
        box-shadow: none;
        overflow-y: scroll;

        .sidebar-header {
            .toggle-btn {
                visibility: visible !important;
                position: fixed;
                left: 10px;
                top: 10px;
                z-index: 100;
                width: 42px;
                height: 42px;
                background-color: #F0FAFFBF;
                border: #DAE2E7 2px solid;
            }
        }

        &:not(.is-expanded) {

            .menu-section,
            .bottom-menu {
                display: none;
            }

            .toggle-btn {
                margin: 0;
            }
        }

        .achievement-section .achievement-badges .badge-item {
            width: 100px;
        }
    }

    .sidebar.is-expanded {
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
        padding: 10px 0;
        background-color: #F0FAFF;
        box-shadow: 2px 0 6px rgba(0, 0, 0, 0.3);
        position: fixed;

        .bottom-menu {
            padding-bottom: 0;
        }

        .sidebar-header {
            .toggle-btn {
                position: static;
                background-color: transparent;
                border: none;
                box-shadow: none;
                width: 30px;
                height: 30px;
            }
        }
    }
}
</style>