import * as components from './components';
import * as OCSUtil from '@/util';

const OCSComponentLibrary = {
  install(Vue) {
    for (const componentName in components) {
      const component = components[componentName];
      Vue.component(component.name, component);
    }
  }
};

// Auto-install when vue is found (e.g. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(OCSComponentLibrary);
}

export { OCSComponentLibrary, OCSUtil };
