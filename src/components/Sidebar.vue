<template>
    <div :class="['sidebar', { 'is-expanded': isMenuExpanded }]">
        <div class="sidebar-header">
            <!-- 切換按鈕 -->
            <div class="toggle-btn" @click="toggleMenu">
                <i :class="['fas', isMenuExpanded ? 'fa-angle-double-left' : 'fa-angle-double-right']"></i>
            </div>
            <!-- 使用者資訊 -->
            <div v-if="isMenuExpanded" class="user-info">
                <div class="user-name">王曉明</div>
                <div class="user-status">小學生</div>
            </div>
        </div>

        <!-- 主要功能選單 -->
        <div class="menu-section">
            <div class="stat-item" :style="{ backgroundColor: 'rgba(245, 113, 72, 1)' }">
                <div class="stat-icon"><i class="fas fa-star"></i></div>
                <span v-if="isMenuExpanded" class="stat-label">星星</span>
                <span class="stat-value">{{ isMenuExpanded ? '256 顆' : '256' }}</span>
            </div>
            <div class="stat-item" :style="{ backgroundColor: 'rgba(42, 174, 160, 1)' }">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <span v-if="isMenuExpanded" class="stat-label">登入天數</span>
                <span class="stat-value">{{ isMenuExpanded ? '13 天' : '13' }}</span>
            </div>
            <div class="stat-item" :style="{ backgroundColor: 'rgba(247, 202, 87, 1)' }">
                <div class="stat-icon calendar-icon"><i class="fas fa-calendar-alt"></i></div>
                <span v-if="isMenuExpanded" class="stat-label">已學習天數</span>
                <span class="stat-value">{{ isMenuExpanded ? '30 字' : '30' }}</span>
            </div>
        </div>

        <!-- 成就徽章 -->
        <div v-if="isMenuExpanded" class="achievement-section">
            <div class="section-title">成就獎章</div>
            <div class="achievement-badges">
                <div class="badge-item">🏅</div>
                <div class="badge-item">🎖️</div>
                <div class="badge-item">🏆</div>
                <div class="badge-item">🥇</div>
            </div>
        </div>

        <!-- 底部選單 -->
        <div class="bottom-menu">
            <div class="menu-item">
                <i class="fas fa-book"></i>
                <span v-if="isMenuExpanded">學習歷程</span>
            </div>
            <div class="menu-item">
                <i class="fas fa-cog"></i>
                <span v-if="isMenuExpanded">設定</span>
            </div>
            <div class="menu-item" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span v-if="isMenuExpanded">登出</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Sidebar',
    data() {
        return {
            isMenuExpanded: false,
        };
    },
    methods: {
        toggleMenu() {
            this.isMenuExpanded = !this.isMenuExpanded;
        },
        handleLogout() {
            // 登出邏輯
            console.log('Logout');
            this.$router.push('/login');
        }
    },
};
</script>

<style lang="scss" scoped>
.sidebar {
    background-color: transparent;
    width: 90px;
    color: #333;
    padding: 10px 0;
    transition: width 0.3s ease-in-out, background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 99999;
    box-shadow: none;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;


    .sidebar-header {
        display: flex;
        padding: 5px 16px;
    }

    .toggle-btn {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 16px;
        border-radius: 50%;
        transition: transform 0.3s ease, background-color 0.2s;
        margin-right: 5px;
    }

    .user-info {
        white-space: nowrap;
        overflow: hidden;

        .user-name {
            font-weight: bold;
            font-size: 18px;
            color: #333;
        }

        .user-status {
            margin-top: 8px;
            font-size: 16px;
            color: #666;
        }
    }

    .menu-section {
        padding: 10px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .stat-item {
        display: flex;
        align-items: center;
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

            &.calendar-icon i {
                color: rgba(71, 71, 0, 1);
            }

        }

        .stat-label,
        .stat-value {
            color: #333;
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

    .achievement-section {
        padding: 24px 16px 16px;

        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            white-space: nowrap;
        }

        .achievement-badges {
            display: flex;
            gap: 10px;

            .badge-item {
                font-size: 24px;
                cursor: pointer;
                transition: transform 0.2s;

                &:hover {
                    transform: scale(1.1);
                }
            }
        }
    }

    .bottom-menu {
        margin-top: auto;
        padding: 16px 0;

        .menu-item {
            display: flex;
            align-items: center;
            padding: 10px 16px;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            color: #333;
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

        .toggle-btn i {
            font-size: 18px;
        }

        .sidebar-header {
            justify-content: space-between;
            flex-direction: row-reverse;
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

    /* --- 狀態：收合 (Collapsed) --- */
    &:not(.is-expanded) {

        .user-info,
        .achievement-section,
        .menu-item span,
        .stat-label {
            display: none;
        }

        .sidebar-header {
            justify-content: center;
            padding: 10px 0;
            margin-bottom: 10px;
        }

        .toggle-btn {
            margin: 0;
            background-color: #F0FAFFBF;
            border: #DAE2E7 2px solid;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            color: #333;

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
            margin: 5px auto;

            .stat-icon {
                margin-right: 0;
                font-size: 14px;
                margin: 4px 0;
                color: white;

                i {
                    font-size: 16px;
                }
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
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding-bottom: 20px;

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
                    color: #333;
                }
            }
        }
    }
}



@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .sidebar {
        width: 0;
        padding: 0;
        background-color: #F0FAFF;
        box-shadow: none;
        overflow-y: scroll;

        .sidebar-header {
            .toggle-btn {
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
    }

    .sidebar.is-expanded {
        width: 100%; // 展開時佔據的螢幕寬度
        height: 100vh;
        top: 0;
        left: 0;
        padding: 10px 0;
        background-color: #F0FAFF;
        box-shadow: 2px 0 6px rgba(0, 0, 0, 0.3);
        position: fixed;

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