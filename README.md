# OCS Component Library
![Build](https://github.com/observatorycontrolsystem/ocs-component-lib/workflows/Build/badge.svg)

Vue component library and utilities for an astronomical observatory control system frontend

## Usage

### Dependencies
This library depends on a few external libraries. The following are installed as peer dependencies when you install the library:

- [BootstrapVue](https://bootstrap-vue.org/)
- [Bootstrap](https://getbootstrap.com/)
- [JQuery](https://jquery.com/)
- [Lodash](https://lodash.com/)
- [Momentjs](https://momentjs.com/)

[Font Awesome 5](https://fontawesome.com/) is used for icon support. It must be included in your application.

Some components in the library depend on [Vue Router](https://router.vuejs.org/) to function properly. To use these components your application must user Vue Router.

### Installation
```
npm install ocs-component-library
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
```
npm run test:unit
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
