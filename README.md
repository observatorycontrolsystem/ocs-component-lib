# OCS Component Library
![Build](https://github.com/observatorycontrolsystem/ocs-component-lib/workflows/Build/badge.svg)

Vue component library and utilities for an astronomical observatory control system frontend

## Usage

### Dependencies
This library depends on a few external libraries. The following are peer dependencies of the library:

- [BootstrapVue](https://bootstrap-vue.org/)
- [Bootstrap](https://getbootstrap.com/)
- [JQuery](https://jquery.com/)
- [Lodash](https://lodash.com/)
- [Momentjs](https://momentjs.com/)
- [Visjs](https://visjs.org/)
- [vue-ctk-date-time-picker](https://github.com/chronotruck/vue-ctk-date-time-picker)
- [@vue/composition-api](https://github.com/vuejs/composition-api)

[Font Awesome 5](https://fontawesome.com/) is used for icon support. It must be included in your application.

Some components in the library depend on [Vue Router](https://router.vuejs.org/) to function properly. To use these components your application must user Vue Router.

### Installation
```
npm install ocs-component-lib
```

### Using the components
To use the components in the library, place the following in the entrypoint of your Vue project:

```
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'ocs-component-lib/dist/ocs-component-lib.css';
import { OCSComponentLib } from 'ocs-component-lib';

Vue.use(BootstrapVue);
Vue.use(OCSComponentLib);
```

If you are using a component from the library that uses the composition API, like the RequestGroupCompositionForm, add
the following to your entrypoint as well:

```
import VueCompositionAPI from '@vue/composition-api';

Vue.use(VueCompositionAPI);
```

This lib uses jquery for AJAX requests. You must configure your project to send credentials along with your AJAX requests in order
for logged in users to be able to send requests that require authentication. One option for how to do this is to place the following
in your entrypoint. Without this you may not see the data that you expect, or you may see unexpected authentication errors.

```
// `observationPortalApi` is set to the base Observation Portal API URL and `csrfSafeMethod` returns whether
// the request method is an HTTP safe method
$(document).ajaxSend(function(event, xhr, settings) {
  if (settings.url.startsWith(observationPortalApi)) {
    if (!HTTPSafeMethod(settings.type)) {
      var csrftoken = getCookie('csrftoken');
      xhr.setRequestHeader('X-CSRFToken', csrftoken);
    }
    settings.xhrFields = {
      withCredentials: true
    };
  }
});

```

### Using the utilities
To use the utilities provided by the library, import them and call a function. For example, to
use the `decimalDecToSexigesimal(...)` function:

```
import { OCSUtil } from 'ocs-component-lib';

OCSUtil.decimalDecToSexigesimal(dec);
```

## Using the mixins
To use the mixins provided by the library, import them and include them in your component. For example, to use the
`paginationAndFilteringMixin` mixin:

```
import { OCSMixin } from 'ocs-component-lib';

export default {
  name: 'MyComponent',
  mixins: [OCSMixin.paginationAndFilteringMixin]
  ...
}
```

## Using the composable functions
To use the composable functions provided by the library, import them and use them in your component. Note that to use these, you must have installed the [@vue/composition-api](https://github.com/vuejs/composition-api) into your project. For example,
to use the `baseInstrumentConfig` composition function:

```
import { OCSComposable } from 'ocs-component-lib';

export default {
  name: 'MyInstrumentConfigForm',
  setup: function(props, context) {
    const instrumentConfig = toRef(props, 'instrumentConfig');
    const availableInstruments = toRef(props, 'availableInstruments');
    const selectedInstrument = toRef(props, 'selectedInstrument');
    const {
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      update,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    } = OCSComposable.baseInstrumentConfig(instrumentConfig, availableInstruments, selectedInstrument, context);

    return {
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      update,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    };
  }
}
```

## Using Aladin

The [Aladin sky viewer](https://aladin.u-strasbg.fr/aladin.gml#AladinLite) expects JQuery to be available globally. One way to provide JQuery in this manner is to add the following to your `vue.config.js` file. When using a component that uses Aladin, this or something similar to it must be configured.

```
{
  ...
  configureWebpack: () => {
    return {
      resolve: {
        alias: {
          jquery: path.join(__dirname, 'node_modules/jquery/src/jquery')
        }
      }
    };
  }
  ...
}
```

### Browser
The library is also available from a CDN by including the script in the head section of your HTML file. Remember to include the other dependencies as well.

```
<head>
  ...
  <script type="text/javascript" src="https://unpkg.com/ocs-component-lib@0.1.0/dist/ocs-component-lib.umd.min.js"><script>
  ...
</head>

```

## Local Development

### Project requirements
Node.js version 8.9 or above (v10+ recommended).

### Project setup
```
npm install
```

### Installing a local copy of the library into your app
When installing the library into your application from a local directory, from your application directory:
```
npm install /path/to/local/ocs/component/lib
```

You might need to turn off `lintOnSave` in your project's `vue.config.js` file to speed up your project build
time when running the hot reload server.

### Compile and minify library for production
```
npm run build
```

### Run unit tests
The tests require `@vue/composition-api` and `jquery` to be installed. For some reason, having those libraries set as devDependencies in
`package.json` breaks local development when a local copy of the library is installed in a local app that is using it. As a
workaround, install and then prune `@vue/composition-api` and `jquery` before and after running tests.

```
npm install --no-save @vue/composition-api jquery
npm run test:unit
npm prune @vue/composition-api jquery
```

### Lint files
View lint errors:
```
npm run lint:check
```

Fix lint errors:
```
npm run lint:fix
```
