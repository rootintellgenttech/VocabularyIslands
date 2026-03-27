const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0', 
    port: 443, 
    
    server: 'https', 
    
    allowedHosts: [
      'englishability.rootadviser.com',
      'all'
    ],
    client: {
      overlay: false,
    },
    historyApiFallback: true,
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "@/assets/scss/_utils.scss";`
      }
    }
  },
})