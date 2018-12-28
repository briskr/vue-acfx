module.exports = {
  lintOnSave: undefined,
  baseUrl: process.env.BASE_URL,
  outputDir: undefined,
  assetsDir: 'assets',
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,
  css: undefined,
  devServer: {
    port: process.env.DEV_SERVER_PORT,
    open: true,
  },
  configureWebpack: {
    devtool: 'source-map',
  },
};
