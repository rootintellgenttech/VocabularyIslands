<template>
    <div :class="['sitemap-page-container', { 'no-sidebar': !isLoggedIn }]">
        <div class="return-last-page" role="button" tabindex="0" aria-label="返回上一頁" @click="goBack"
            @keyup.enter="goBack">
            <i class="fas fa-angle-left" aria-hidden="true"></i> 返回
        </div>

        <div class="main-content-wrap">
            <div class="header-section">
                <h1 class="page-title">網站導覽</h1>
                <p class="page-desc">您可以透過此頁面快速連結至各學習單元與功能島嶼</p>

                <div v-if="!isLoggedIn" class="login-warning-tip">
                    <i class="fa-solid fa-circle-info"></i>
                    提示：下方學習島嶼單元需登入後方可進入，點擊將導向登入頁面。
                </div>
            </div>

            <div :class="['sitemap-grid', { 'visitor-mode': !isLoggedIn }]">
                <div class="sitemap-card">
                    <div class="card-header">1.國小島</div>
                    <div class="card-body">
                        <div class="group-name" tabindex="0" role="link" aria-label="前往國小島" @click="goTo('PrimaryIsland')" @keyup.enter="goTo('PrimaryIsland')">國小島</div>
                        <ul>
                            <li tabindex="0" role="link" @click="goTo('AbcIsland')" @keyup.enter="goTo('AbcIsland')">ABC啟航島</li>
                            <li tabindex="0" role="link" @click="goTo('WordIslandDetail', { level: 'primary', wordCount: '300' })" @keyup.enter="goTo('WordIslandDetail', { level: 'primary', wordCount: '300' })">300單字島</li>
                            <li tabindex="0" role="link" @click="goTo('PrimaryHeroDetail')" @keyup.enter="goTo('PrimaryHeroDetail')">小英雄大本營</li>
                            <li tabindex="0" role="link" @click="goTo('PrimaryListenDetail')" @keyup.enter="goTo('PrimaryListenDetail')">國小聽力海灣</li>
                        </ul>
                    </div>
                </div>

                <div class="sitemap-card">
                    <div class="card-header">2.國中島</div>
                    <div class="card-body">
                        <div class="group-name" tabindex="0" role="link" aria-label="前往國中島" @click="goTo('SecondaryIsland')" @keyup.enter="goTo('SecondaryIsland')">國中島</div>
                        <ul>
                            <li tabindex="0" role="link" @click="goTo('WordIslandDetail', { level: 'secondary', wordCount: '800' })" @keyup.enter="goTo('WordIslandDetail', { level: 'secondary', wordCount: '800' })">800單字島</li>
                            <li tabindex="0" role="link" @click="goTo('WordIslandDetail', { level: 'secondary', wordCount: '1200' })" @keyup.enter="goTo('WordIslandDetail', { level: 'secondary', wordCount: '1200' })">1200單字島</li>
                            <li tabindex="0" role="link" @click="goTo('SecondaryHeroDetail')" @keyup.enter="goTo('SecondaryHeroDetail')">會考大殿堂</li>
                            <li tabindex="0" role="link" @click="goTo('SecondaryListenDetail')" @keyup.enter="goTo('SecondaryListenDetail')">國中聽力海灣</li>
                        </ul>
                    </div>
                </div>

                <div class="sitemap-card">
                    <div class="card-header">3.試煉殿堂</div>
                    <div class="card-body">
                        <div class="group-name" tabindex="0" role="link" aria-label="前往試煉殿堂" @click="goTo('TrialHall')" @keyup.enter="goTo('TrialHall')">試煉殿堂</div>
                    </div>
                </div>

                <div class="sitemap-card">
                    <div class="card-header">4.競技島</div>
                    <div class="card-body">
                        <div class="group-name" tabindex="0" role="link" aria-label="前往競技島" @click="goTo('CompetitionIsland')" @keyup.enter="goTo('CompetitionIsland')">競技島</div>
                    </div>
                </div>

                <div class="sitemap-card">
                    <div class="card-header">5.成就島</div>
                    <div class="card-body">
                        <div class="group-name" tabindex="0" role="link" aria-label="前往成就島" @click="goTo('AchievementIsland')" @keyup.enter="goTo('AchievementIsland')">成就島</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Sitemap",
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('accessToken')
        };
    },
    methods: {
        goTo(name, params = {}) {
            if (!this.isLoggedIn) {
                this.$message.info('請先登入以進入學習單元');
                this.$router.push('/login');
                return;
            }

            this.$router.push({ name, params }).catch((err) => {
                if (err.name !== "NavigationDuplicated") throw err;
            });
        },
        goBack() {
            window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/home');
        }
    },
};
</script>

<style lang="scss" scoped>
$main-teal: #18AC9D;
$header-teal: #4abcb1;

.sitemap-page-container {
    padding: 2rem 2rem 2rem 6.25rem;
    min-height: 100vh;
    transition: padding 0.3s;

    // &.no-sidebar {
    //     padding-left: 2rem;
    // }
}

.login-warning-tip {
    margin-top: 1rem;
    background-color: #fff9db;
    border: 1px solid #fcc419;
    color: #856404;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeIn 0.5s ease;

    i {
        color: #fcc419;
    }
}

.sitemap-grid.visitor-mode {
    .sitemap-card {
        filter: grayscale(0.3);
        opacity: 0.9;

        &:hover {
            filter: grayscale(0);
            opacity: 1;
        }
    }
}

.return-last-page {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 1.5rem;
    transition: all 0.2s;

    &:hover {
        background: $main-teal;
        color: black;
    }
}

.main-content-wrap {
    max-width: 75rem;
    margin: 0 auto;
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.header-section {
    margin-bottom: 2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;

    .page-title {
        font-size: 2rem;
        color: #333;
        margin: 0 0 0.5rem 0;
    }

    .page-desc {
        color: #666;
        margin: 0;
    }
}

.sitemap-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 1.5rem;
}

.sitemap-card {
    background: white;
    border: 1px solid #eef2f2;
    border-radius: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 250px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .card-header {
        background-color: $header-teal;
        color: #000;
        padding: 0.75rem;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 800;
    }

    .card-body {
        padding: 1.25rem;
        flex-grow: 1;

        .group-name {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            color: #333;
            cursor: pointer;

            &:hover {
                color: $main-teal;
            }
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
                position: relative;
                padding-left: 1.2rem;
                margin-bottom: 0.5rem;
                color: #555;
                font-size: 1rem;
                cursor: pointer;
                transition: 0.2s;

                &::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #333;
                }

                &:hover {
                    color: $main-teal;
                    transform: translateX(3px);
                }
            }
        }
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1024px) {
    .sitemap-page-container {
        padding: 4rem 8rem;
    }
}
</style>