const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['@babel/polyfill', './app/index.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './app/index.html' })
    ],
    mode: 'development'
};