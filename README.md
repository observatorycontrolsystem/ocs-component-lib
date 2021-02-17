# OCS Component Library
Component library and utilities for an astronomical observatory control system frontend

## Usage

### Dependencies
These dependencies must be installed alongside the library.

- BootstrapVue
- JQuery
- Lodash

### Installation
```
npm install ocs-component-library
```

### Using the components
To use the components in the library, after importing `Vue` and place the following in the entrypoint of your Vue project:

```
import Vue from 'vue';
import { OCSComponentLibrary } from 'observation-portal-component-lib';

Vue.use(BootstrapVue);
Vue.use(OCSComponentLibrary);
```

### Using the utility methods
To use the utility methods provided by the library, import the utilities and call a function. For example, to
use the `decimalDecToSexigesimal()` function:

```
import { OCSUtil } from 'observation-portal-component-lib';

OCSUtil.decimalDecToSexigesimal(dec).str;
```

## Local Development

### Project requirements
-  Node.js version 8.9 or above (v10+ recommended).

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

### Lint files and display lint errors
```
npm run lint:check
```

### Lint files and fix linting errors
```
npm run lint:fix
```
