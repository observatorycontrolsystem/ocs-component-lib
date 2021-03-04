import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import ObservationDetail from '@/components/Observations/ObservationDetail.vue';

// Make sure the bootstrap-vue components are available during testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const observationFactory = () => {
  return {
    site: 'tst',
    enclosure: 'abcd',
    telescope: '1m0a',
    start: '2021-01-28T10:49:59Z',
    end: '2021-01-28T10:55:21Z',
    priority: 10,
    configuration_statuses: [
      {
        id: 263311141,
        summary: {
          start: '2021-01-28T10:50:19Z',
          end: '2021-01-28T10:52:58Z',
          state: 'COMPLETED',
          reason: '',
          time_completed: 120.0,
          events: [
            {
              time: '2021-01-28T10:52:57',
              state: 'PROCESSING',
              description: 'TakeExposure'
            },
            {
              time: '2021-01-28T10:52:57',
              state: 'DONE',
              description: 'TakeExposure'
            }
          ]
        },
        instrument_name: 'in01',
        guide_camera_name: 'in02',
        state: 'COMPLETED',
        configuration: 12345678
      }
    ],
    request: 87654321,
    state: 'COMPLETED',
    modified: '2021-01-28T10:52:58.565167Z',
    created: '2021-01-28T10:47:34.886207Z'
  };
};

const wrapperFactory = (observation = {}, requestLink = {}) => {
  return mount(ObservationDetail, {
    localVue,
    propsData: {
      observation: observation,
      requestLink: requestLink
    }
  });
};

describe('ObservationDetail.vue', () => {
  it('displays observation details', () => {
    let observationData = observationFactory();
    const wrapper = wrapperFactory(observationData);
    expect(wrapper.text()).toContain(observationData.state);
    expect(wrapper.text()).toContain(observationData.site);
    expect(wrapper.text()).toContain(observationData.enclosure);
    expect(wrapper.text()).toContain(observationData.telescope);
  });

  it('displays request ID without link', () => {
    let observationData = observationFactory();
    const wrapper = wrapperFactory(observationData);
    expect(wrapper.find('.request-display-code').text()).toContain(observationData.request);
    expect(
      wrapper
        .find('.request-display-code')
        .find('a')
        .exists()
    ).toBe(false);
  });

  it('displays request ID as link using href', () => {
    let observationData = observationFactory();
    const wrapper = wrapperFactory(observationData, { href: 'http://localhost' });
    expect(wrapper.find('.request-display-code').text()).toContain(observationData.request);
    expect(
      wrapper
        .find('.request-display-code')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays request ID as link using to', () => {
    let observationData = observationFactory();
    const wrapper = wrapperFactory(observationData, { to: { name: 'observationDetail' } });
    expect(wrapper.find('.request-display-code').text()).toContain(observationData.request);
    expect(
      wrapper
        .find('.request-display-code')
        .find('a')
        .exists()
    ).toBe(true);
  });
});
