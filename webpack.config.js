const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    devMiddleware: {
      writeToDisk: true,
    },
    compress: true,
    port: 8080,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, "resources", "bins"), to: "resources/bins" },
        { from: path.resolve(__dirname, "resources", "textures"), to: "resources/textures" },
      ],
    })
  ],
  module: {
    rules: [
      {  
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ], 
      },
      { 
        test: /\.tsx?$/,
        exclude:  path.resolve(__dirname, "node_modules"),
        use: ['ts-loader'] 
      },
      {
        test: /\.(png|jpe?g|gif|obj|gltf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: "resources"
            }
          },
        ],
      },
    ],
  },
};