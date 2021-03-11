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
        },
        moment: {
          commonjs: 'moment',
          commonjs2: 'moment',
          amd: 'moment',
          root: 'moment'
        },
        vis: {
          commonjs: 'vis',
          commonjs2: 'vis',
          amd: 'vis',
          root: 'vis'
        },
        'vis/dist/vis.css': {
          commonjs: 'vis/dist/vis.css',
          commonjs2: 'vis/dist/vis.css',
          amd: 'vis/dist/vis.css',
          root: 'vis/dist/vis.css'
        }
      });
    }
  }
};
