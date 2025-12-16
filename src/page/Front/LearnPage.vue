<template>
    <div class="learn-page">
        <div v-if="!isFinished" class="learning-container">
            <Tinder ref="tinder" key-name="id" :queue.sync="queue" :offset-y="10" @submit="onSubmit">
                <template slot-scope="scope">
                    <div class="card-return-text" @click.stop="goBack">
                        <i class="fas fa-angle-left"></i> 返回
                    </div>

                    <div class="content-display">
                        <div class="question-wrap">
                            <div class="audio-trigger" @click.stop="playAudio(scope.data)">
                                <i class="fas fa-volume-up"></i>
                            </div>
                            <img :src="getImageUrl(scope.data.word)" class="card-image" alt="alphabet-card" />
                        </div>
                    </div>
                </template>
            </Tinder>

            <div class="btns">
                <i class="fa-solid fa-circle-xmark" @click="decide('pass')" style="color: #c42121"></i>
                <i class="fa-solid fa-circle-check" style="color: #4270f9" @click="decide('remember')"></i>
            </div>
        </div>

        <div v-else class="result-container">
            <div class="back-link" @click="goBack">
                <i class="fas fa-arrow-left"></i> 返回
            </div>

            <div class="game-result-card">
                <img :src="correctAvatarPath" alt="吉祥物" class="avatar-result-icon">
                <div class="result-description">你已完成本單元學習</div>
            </div>
            <button class="restart-btn" @click="handleRestart()">
                重新來過 <i class="fas fa-rotate-right"></i>
            </button>
        </div>
    </div>
</template>

<script>
import Tinder from "vue-tinder";

export default {
    name: 'LearnPage',
    components: { Tinder },
    props: {
        unitId: { type: String, required: true },
        level: { type: String, default: 'primary' }
    },
    data() {
        return {
            queue: [], // 目前顯示的卡片堆疊
            isFinished: false, // 是否完成所有卡片
            // 圖片路徑
            correctAvatarPath: require('@/assets/image/elementary/avatar.png'),
        };
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
        getImageUrl(word) {
            try {
                const filename = word.toLowerCase();
                return require(`@/assets/image/elementary/alphabet/${filename}.png`);
            } catch (e) {
                console.error(`找不到圖片: ${word}`);
                return '';
            }
        },
        playAudio(wordData) {
            if (!wordData || !wordData.word) return;
            console.log('播放發音: ' + wordData.word);
            const utterance = new SpeechSynthesisUtterance(wordData.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.2;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        },

        // 載入單元資料
        loadUnitData(id) {
            this.isFinished = false;
            let start = 65; // 'A'
            let end = 90;   // 'Z'

            if (id === 'af') { end = 70; }      // A-F
            else if (id === 'gl') { start = 71; end = 76; } // G-L
            else if (id === 'mr') { start = 77; end = 82; } // M-R
            else if (id === 'sz') { start = 83; end = 90; } // S-Z
            else if (id === 'final') { start = 65; end = 90; } // 總複習

            // 直接生成所有卡片並放入 queue，不使用 mock 分批載入
            const allCards = Array.from({ length: end - start + 1 }, (_, i) => ({
                id: Date.now() + i, // 確保 ID 唯一
                word: String.fromCharCode(start + i)
            }));

            this.queue = allCards;
        },

        // 核心邏輯：處理滑動結果
        onSubmit({ item, type }) {
            console.log(`卡片: ${item.word}, 選擇: ${type}`);

            if (type === 'pass') {
                // 如果是 pass (忘記了/叉叉)
                // 1. 複製這張卡片
                // 2. 重新加入到 queue 的最後面，讓使用者稍後再練習一次
                // 注意：給一個新 ID 避免 vue-tinder key 重複問題
                const retryItem = { ...item, id: Date.now() + Math.random() };

                // 使用 setTimeout 確保動畫順暢後再加入
                setTimeout(() => {
                    this.queue.push(retryItem);
                }, 200);
            }
            // 如果是 remember (記得/打勾)，卡片會自動從 queue 移除，不需要額外寫代碼

            // 檢查是否全部完成 (考慮到 vue-tinder sync 更新的時間差，我們在下一個 tick 檢查)
            this.$nextTick(() => {
                if (this.queue.length === 0) {
                    console.log('單元學習完成！');
                    this.isFinished = true;
                }
            });
        },

        decide(choice) {
            this.$refs.tinder.decide(choice);
        },

        // 重新開始
        handleRestart() {
            this.loadUnitData(this.unitId);
        }
    },
    mounted() {
        this.loadUnitData(this.unitId);
    }
};
</script>

<style lang="scss" scoped>
.learn-page {
    @include main-card-page;

    .back-link {
        color: $main-black-text;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
        cursor: pointer;
    }

    .game-result-card {
        @include game-result-card;
        margin-top: 12px;
    }

    .restart-btn {
        @include result-back-btn
    }

    .btns {
        text-align: center;
    }
}

.card-return-text {
    @include card-return-text;
}

.vue-tinder {
    margin: 0 auto 32px auto;
    height: 500px;
    min-width: 500px;
    max-width: 700px;
}


.content-display {
    @include main-card-content;

    .question-wrap {
        margin-top: 8%;
    }

    .card-image {
        max-width: 70%;
        max-height: 250px;
        object-fit: contain;
        display: block;
    }
}

.btns i {
    height: 60px;
    width: 60px;
    border-radius: 100%;
    background-color: white;
    font-size: 60px;
    cursor: pointer;
    margin: 28px 8px;
}

@media (orientation: landscape) and (max-height: 767.98px) and (pointer: coarse) {
    .learn-page {
        padding: 5%;
    }
}
</style>