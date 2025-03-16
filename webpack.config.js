const path = require('path');

module.exports = {
    entry: './www/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'www/dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            'segment-display': path.resolve(__dirname, 'node_modules/segment-display/dist/bundle.min.js'),
            'classic-equalizer': path.resolve(__dirname, 'node_modules/classic-equalizer/src/classic-equalizer.js')
        }
    },
    mode: 'development'
}; 