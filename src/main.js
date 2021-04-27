import * as components from './components';
import * as OCSUtil from '@/util';
import * as OCSMixin from '@/mixins';
import * as OCSComposable from '@/composables';

const OCSComponentLib = {
  install(Vue) {
    for (const componentName in components) {
      const component = components[componentName];
      // Namespace all components with "ocs". For example, if the name of a SFC is "RequestDetail",
      // adding the namespace will make the component available in projects where it is installed
      // as <ocs-request-detail></ocs-request-detail>.
      Vue.component('Ocs' + component.name, component);
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
  GlobalVue.use(OCSComponentLib);
}

export { OCSComponentLib, OCSUtil, OCSMixin, OCSComposable };
