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
        },
        'vue-ctk-date-time-picker': {
          commonjs: 'vue-ctk-date-time-picker',
          commonjs2: 'vue-ctk-date-time-picker',
          amd: 'vue-ctk-date-time-picker',
          root: 'vue-ctk-date-time-picker'
        },
        'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css': {
          commonjs: 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css',
          commonjs2: 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css',
          amd: 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css',
          root: 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
        },
        '@vue/composition-api': {
          commonjs: '@vue/composition-api',
          commonjs2: '@vue/composition-api',
          amd: '@vue/composition-api',
          root: '@vue/composition-api'
        }
      });
    }
  }
};
