module.exports = {
  chainWebpack: config => {
    // https://webpack.js.org/configuration/externals/#externals
    config.externals({
      lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_'
      },
      jquery: {
        commonjs: 'jquery',
        commonjs2: 'jquery',
        amd: 'jquery',
        root: 'JQuery'
      }
    });
  }
};
