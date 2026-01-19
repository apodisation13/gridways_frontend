const webpack = require("webpack");

module.exports = {
  devServer: {
    allowedHosts: "all",
    client: {
      overlay: false  // ← Вот это отключит overlay
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        VUE_APP_API_URL: JSON.stringify(process.env.VUE_APP_API_URL),
        VUE_APP_TRY1: JSON.stringify(process.env.VUE_APP_TRY1),
      })
    ]
  }
}