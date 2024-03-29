import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import RequestGroupApiDisplay from '@/components/RequestGroups/RequestGroupApiDisplay.vue';

// Make sure the bootstrap-vue components are available during testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const requestFactory = (state = 'PENDING') => {
  return {
    acceptability_threshold: 90,
    optimization_type: 'TIME',
    configuration_repeats: 1,
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

const requestgroupFactory = (requestStates = ['PENDING']) => {
  let requestgroupData = {
    name: 'test requestgroup',
    proposal: 'test proposal',
    submitter: 'test user',
    ipp_value: 1.05,
    operator: 'SINGLE',
    observation_type: 'NORMAL',
    duration: 925,
    observation_note: '',
    state: 'PENDING',
    modified: '2021-02-03T04:55:30.000055',
    created: '2021-02-03T04:55:28.474845Z',
    requests: []
  };
  for (let requestState of requestStates) {
    requestgroupData.requests.push(requestFactory(requestState));
  }
  return requestgroupData;
};

const wrapperFactory = requestGroup => {
  return mount(RequestGroupApiDisplay, {
    localVue,
    propsData: {
      requestGroup: requestGroup
    }
  });
};

describe('RequestGroupApiDisplay.vue', () => {
  it('Displays requestgroup formatted as JSON', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData);
    expect(wrapper.text()).toContain(requestgroupData.name);
    expect(wrapper.text()).toContain(requestgroupData.proposal);
    expect(wrapper.text()).toContain('{');
  });
});
