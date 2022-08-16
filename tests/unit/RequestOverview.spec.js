import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import RequestOverview from '@/components/Requests/RequestOverview.vue';

// Make sure the bootstrap-vue components are available during testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const requestFactory = (state = 'PENDING') => {
  return {
    id: 12345,
    acceptability_threshold: 90,
    optimization_type: 'TIME',
    configuration_repeats: 1,
    duration: 137,
    state: state,
    configurations: [
      {
        type: 'EXPOSE',
        instrument_type: 'instrument_a',
        instrument_configs: [
          {
            exposure_count: 1,
            exposure_time: '60',
            mode: 'default',
            rotator_mode: '',
            extra_params: {
              defocus: 0
            },
            optical_elements: {
              filter: 'r'
            }
          }
        ],
        acquisition_config: {
          mode: 'OFF',
          extra_params: {}
        },
        guiding_config: {
          mode: 'ON',
          optional: true,
          extra_params: {}
        },
        target: {
          name: 'm88',
          type: 'ICRS',
          ra: 187.996733,
          dec: 14.420411,
          epoch: 2000
        },
        constraints: {
          max_airmass: 2,
          min_lunar_distance: 30,
          max_lunar_phase: 1.0
        }
      }
    ],
    windows: [
      {
        start: '2021-02-24 23:37:04',
        end: '2021-02-25 23:37:04'
      }
    ],
    location: {
      telescope_class: '1m0'
    }
  };
};

const instrumentsFactory = (instrumentCode = 'instrument_a') => {
  let instruments = {};
  instruments[instrumentCode] = { name: 'Instrument Code' };
  return instruments;
};

const wrapperFactory = (request = {}, instruments = {}, requestLink = {}, slots = {}, showExtraColumn = false) => {
  return mount(RequestOverview, {
    localVue,
    propsData: {
      request: request,
      instruments: instruments,
      requestLink: requestLink,
      showExtraColumn: showExtraColumn
    },
    slots: slots
  });
};

describe('RequestOverview.vue', () => {
  it('displays request details', () => {
    let requestData = requestFactory();
    const wrapper = wrapperFactory(requestData, instrumentsFactory());
    expect(wrapper.text()).toContain(requestData.id);
    expect(wrapper.text()).toContain(requestData.duration);
    expect(wrapper.text()).toContain(requestData.state);
  });

  it('displays request ID without link', () => {
    let requestData = requestFactory();
    const wrapper = wrapperFactory(requestData, instrumentsFactory());
    expect(wrapper.find('.request-title').text()).toContain(requestData.id);
    expect(
      wrapper
        .find('.request-title')
        .find('a')
        .exists()
    ).toBe(false);
  });

  it('displays request ID as link using href', () => {
    let requestData = requestFactory();
    const wrapper = wrapperFactory(requestData, instrumentsFactory(), { href: 'http://localhost' });
    expect(wrapper.find('.request-title').text()).toContain(requestData.id);
    expect(
      wrapper
        .find('.request-title')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays request ID as link using to', () => {
    let requestData = requestFactory();
    const wrapper = wrapperFactory(requestData, instrumentsFactory(), { to: { name: 'rgPath', params: { id: 1 } } });
    expect(wrapper.find('.request-title').text()).toContain(requestData.id);
    expect(
      wrapper
        .find('.request-title')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays extra column slot content', () => {
    let requestData = requestFactory();
    const wrapper = wrapperFactory(requestData, instrumentsFactory(), {}, { 'extra-column-content': '<span>I go in extra column</span>' }, true);
    expect(wrapper.text()).toContain('I go in extra column');
  });
});
