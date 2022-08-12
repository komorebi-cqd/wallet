const {merge} = require("webpack-merge");
const baseConfig = require("./webpack.config");
const CompressionWebpackPlugin = require("compression-webpack-plugin")

const proConfig = {
    mode: "production",
    devtool: "hidden-source-map",
    optimization:{
        splitChunks:{
            chunks: "all",
            cacheGroups: {
            styles: {
                minSize: 0,
                test: /\.css$/,
                minChunks: 2,
            },
            },
        }
    },
    plugins:[new CompressionWebpackPlugin()]
}

module.exports = merge(baseConfig,proConfig);