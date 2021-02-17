module.exports = {
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // Externalize dependencies when building for production
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
  }
};
