const webpack = require("webpack");

module.exports = {
  devServer: {
    allowedHosts: "all",
    client: {
      overlay: false
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        VUE_APP_DOMAIN: JSON.stringify(process.env.VUE_APP_DOMAIN),
      })
    ]
  },
  // Отключаем type checking в сборщике — типы проверяет vue-tsc отдельно (npm run type-check)
  chainWebpack: config => {
    config.module
      .rule("ts")
      .use("ts-loader")
      .tap(options => ({ ...options, transpileOnly: true }))
    config.module
      .rule("tsx")
      .use("ts-loader")
      .tap(options => ({ ...options, transpileOnly: true }))
    config.plugins.delete("fork-ts-checker")
  }
}