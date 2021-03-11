import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import moment from 'moment';

import { formatDate } from '@/util';
import RequestWindowsDetail from '@/components/Requests/RequestWindowsDetail.vue';

// Make sure the bootstrap-vue components are available during testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const windowFactory = (nWindows = 1) => {
  let windows = [];
  for (let i = 0; i < nWindows; i++) {
    windows.push({
      start: moment
        .utc('2021-02-02', 'YYYY-MM-DD')
        .add(i, 'days')
        .format(),
      end: moment
        .utc('2021-02-02', 'YYYY-MM-DD')
        .add(i + 1, 'days')
        .format()
    });
  }
  return windows;
};

const wrapperFactory = (windows = {}) => {
  return mount(RequestWindowsDetail, {
    localVue,
    propsData: {
      windows: windows
    }
  });
};

describe('RequestWindowsDetail.vue', () => {
  it('displays window details of single window', () => {
    let windowData = windowFactory();
    const wrapper = wrapperFactory(windowData);
    expect(wrapper.text()).toContain(formatDate(windowData[0].start));
    expect(wrapper.text()).toContain(formatDate(windowData[0].end));
  });

  it('displays window details of multiple windows', () => {
    let windowData = windowFactory(2);
    const wrapper = wrapperFactory(windowData);
    expect(wrapper.text()).toContain(formatDate(windowData[0].start));
    expect(wrapper.text()).toContain(formatDate(windowData[0].end));
    expect(wrapper.text()).toContain(formatDate(windowData[1].start));
    expect(wrapper.text()).toContain(formatDate(windowData[1].end));
  });
});
