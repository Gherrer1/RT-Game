/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
    const currentPath = path.join(__dirname);
    const productionEnvPath = currentPath + '/.env';
    const environmentEnvPath = productionEnvPath + '.' + env.ENVIRONMENT;
    const finalEnvPath = fs.existsSync(environmentEnvPath) ? environmentEnvPath : productionEnvPath;
    const fileEnv = dotenv.config({ path: finalEnvPath }).parsed;
    const environmentVariables = {};
    Object.keys(fileEnv).forEach(envVarKey => environmentVariables[`process.env.${envVarKey}`] = JSON.stringify(fileEnv[envVarKey]));

    return {
        entry: ['@babel/polyfill', './app/index.js'],
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash].js',
            publicPath: '/',
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [
                { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
                { test: /\.ts$/, use: 'babel-loader', exclude: /node_modules/ },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({ template: './app/index.html' }),
            new webpack.DefinePlugin(environmentVariables),
        ],
        devServer: {
            historyApiFallback: true,
        },
        mode: 'development',
    };
};
