process.traceDeprecation = true
// Docs: https://webpack.js.org/guides/asset-management/
const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');

const outputDirectory = 'dist';



function tryResolve_(url, sourceFilename) {
    // Put require.resolve in a try/catch to avoid node-sass failing with cryptic libsass errors
    // when the importer throws
    try {
        return require.resolve(url, {
            paths: [path.dirname(sourceFilename)]
        });
    } catch (e) {
        return '';
    }
}

function tryResolveScss(url, sourceFilename) {
    // Support omission of .scss and leading _
    const normalizedUrl = url.endsWith('.scss') ? url : `${url}.scss`
    return tryResolve_(normalizedUrl, sourceFilename) ||
        tryResolve_(path.join(path.dirname(normalizedUrl), `_${path.basename(normalizedUrl)}`),
            sourceFilename)
}

function materialImporter(url, prev) {
    if (url.startsWith('@material')) {
        const resolved = tryResolveScss(url, prev)
        return {
            file: resolved || url
        }
    }
    return {
        file: url
    }
}

const isDev = process.env.NODE_ENV !== 'production'


// Module export
module.exports = {
    context: __dirname,
    mode: isDev ? 'development': 'production',

    //-- App entry-points (bundles)
    entry: {
        site: './src/client/site/app.js',
        faux_style_bundle: './src/client/site/faux_style_bundle.js',
        client_tests: './src/client/client_tests/app.js',
        // styles: './src/client/site/styles.scss',
        // home: './src/client/home/app.js',
        // project: './src/client/project/app.js',
        // predictive_outcomes: './src/client/predictive_outcomes/app.js'
    },

    //-- Compilation destination resolution
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, outputDirectory),
        publicPath: '/'
    },

    module: {
        rules: [{
                test: [
                    /\.scss$/,
                    /\.css$/
                ],
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            includePaths: ['./node_modules'],
                            importer: materialImporter
                        }
                    },
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {

                test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
                use: {
                    loader: 'file-loader',
                }
            },
            {
                // Use url-loader for tiny files
                test: /\.(png|jpg|gif)$/i,
                use: [{
                    loader: 'urlloader',
                    options: {
                        limit: 8192
                    }
                }]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css'
        })
    ],
    
    devServer: {
        port: 3000,
        open: true,
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
        // publicPath: _publicPath,
        proxy: {
            '/api': 'http://localhost:8080'
        },
    },

    // resolve: {
    //     alias: {
    //         'vue$': 'vue/dist/vue.esm.js'
    //     },
    //     extensions: ['.js']
    // },
    devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map'
};
