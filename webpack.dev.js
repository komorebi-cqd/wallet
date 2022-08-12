const {merge} = require("webpack-merge");
const baseConfig = require("./webpack.config");


const devConfig = {
    mode: "development",
    devtool: "source-map",
    stats: "minimal",
    devServer: {
        open: true,
        port: 8080,
        proxy: {
        // 如果开发环境中有跨域问题，在这里配置代理
        },
    }
}

module.exports = merge(baseConfig,devConfig);