const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, "src", "index.ts"),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  mode: "development",
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    compress: true,
    port: 8080,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    })
  ],
  module: {
    rules: [
      {  
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false,
              },
            },
          },
          "sass-loader",
        ], 
      },
      { 
        test: /\.tsx?$/,
        exclude:  path.resolve(__dirname, "node_modules"),
        use: ['ts-loader'] 
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};