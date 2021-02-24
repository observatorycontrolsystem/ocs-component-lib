# OCS Component Library
![Build](https://github.com/observatorycontrolsystem/ocs-component-lib/workflows/Build/badge.svg)

Vue component library and utilities for an astronomical observatory control system frontend

## Usage

### Dependencies
These dependencies must be installed alongside the library.

- [BootstrapVue](https://bootstrap-vue.org/)
- [Bootstrap](https://getbootstrap.com/)
- [JQuery](https://jquery.com/)
- [Lodash](https://lodash.com/)
- Fontawesome for font support

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
