const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
console.log(HtmlWebpackPlugin,'HtmlWebpackPlugin');

module.exports = {
    entry: "./src/pages/index/index.js",
    output: {
        filename: "js/[name].[chunkhash:5].js", // js 输出到 dist/js/xxx
        publicPath: "/", // 公用的公共路径 /
        path: path.resolve(__dirname, "dist"), // 输出目录为 dist
    },
    resolve:{
        alias: {
            "@": path.resolve(__dirname,"src"),
            _: __dirname,
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify")
        }
    },
    module:{
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
              },
            {
                test: /\.(css)|(pcss)$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options:{ publicPath: '../' }
                },"css-loader","postcss-loader"]
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
              },
            {test: /\.js$/,use:"babel-loader"},
        ]
    },
    plugins:[
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {from: path.resolve(__dirname,"public"),to: "./"}
            ]
        }),
        new HtmlWebpackPlugin({
            template: "src/pages/index/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
        })
    ]
}

