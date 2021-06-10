import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import RequestConfigurationsDetail from '@/components/Configurations/RequestConfigurationsDetail.vue';

// Make sure the bootstrap-vue components are available during testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const configurationsData = [
  {
    id: 12345,
    constraints: {
      max_airmass: 1.6,
      min_lunar_distance: 30.0,
      max_lunar_phase: null,
      max_seeing: null,
      min_transparency: null,
      extra_params: {}
    },
    instrument_configs: [
      {
        exposure_time: 60.0,
        optical_elements: {
          filter: 'B'
        },
        mode: 'default',
        exposure_count: 1,
        rotator_mode: '',
        extra_params: {
          defocus: 0.0
        }
      },
      {
        exposure_time: 70.0,
        optical_elements: {
          filter: 'V'
        },
        mode: 'default',
        exposure_count: 1,
        rotator_mode: '',
        extra_params: {
          defocus: 0.0
        }
      },
      {
        exposure_time: 80.0,
        optical_elements: {
          filter: 'ip'
        },
        mode: 'default',
        exposure_count: 1,
        rotator_mode: '',
        extra_params: {
          defocus: 0.0
        }
      },
      {
        exposure_time: 90.0,
        optical_elements: {
          filter: 'zs'
        },
        mode: 'default',
        exposure_count: 1,
        rotator_mode: '',
        extra_params: {
          defocus: 0.0
        }
      }
    ],
    acquisition_config: {
      mode: 'OFF',
      exposure_time: null,
      extra_params: {}
    },
    guiding_config: {
      optional: true,
      mode: 'ON',
      optical_elements: {},
      exposure_time: null,
      extra_params: {}
    },
    target: {
      type: 'ICRS',
      name: 'm88',
      ra: 187.996733,
      dec: 14.420411,
      proper_motion_ra: null,
      proper_motion_dec: null,
      parallax: null,
      epoch: 2000.0,
      extra_params: {}
    },
    instrument_type: 'INSTRUMENT-A',
    type: 'EXPOSE',
    extra_params: {},
    priority: 1
  }
];

const wrapperFactory = (configurations = {}) => {
  return mount(RequestConfigurationsDetail, {
    localVue,
    propsData: {
      configurations: configurations
    }
  });
};

describe('RequestConfigurationsDetail.vue', () => {
  it('displays instrument config details', () => {
    const wrapper = wrapperFactory(configurationsData);
    expect(wrapper.find('.instrument-configs').text()).toContain('80');
    expect(wrapper.find('.instrument-configs').text()).toContain('filter: B');
    expect(wrapper.find('.instrument-configs').text()).toContain('default');
  });

  it('displays toggle header details', async () => {
    const wrapper = wrapperFactory(configurationsData);
    expect(wrapper.find('.configuration-toggle-0').text()).toContain('Target: m88');
    expect(wrapper.find('.configuration-toggle-0').text()).toContain('Type: EXPOSE');
  });

  it('displays target details', async () => {
    const wrapper = wrapperFactory(configurationsData);
    expect(wrapper.find('.target-information').text()).toContain('m88');
    expect(wrapper.find('.target-information').text()).toContain('ICRS');
    expect(wrapper.find('.target-information').text()).toContain('187.9967');
    expect(wrapper.find('.target-information').text()).toContain('14.4204');
  });
});
