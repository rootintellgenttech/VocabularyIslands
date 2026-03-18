# 使用 Node 16 LTS 更穩定
FROM node:16-alpine

# 安裝編譯依賴
RUN apk add --no-cache python3 make g++

# 安裝 serve
RUN npm install -g serve

# 設定工作目錄
WORKDIR /app

# 複製 package.json 並安裝依賴
COPY package*.json ./
RUN npm install

# 複製專案程式碼
COPY . .

# 打包 Vue 專案
RUN npm run build

# 對外暴露 port
EXPOSE 5000

# 啟動靜態服務
CMD ["serve", "-s", "dist", "-l", "5000"]