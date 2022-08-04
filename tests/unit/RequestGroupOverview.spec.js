import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import RequestGroupOverview from '@/components/RequestGroups/RequestGroupOverview.vue';

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
          min_lunar_distance: 30
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

const wrapperFactory = (requestgroup = {}, proposalLink = {}, requestgroupLink = {}) => {
  return mount(RequestGroupOverview, {
    localVue,
    propsData: {
      requestgroup: requestgroup,
      proposalLink: proposalLink,
      requestgroupLink: requestgroupLink
    }
  });
};

describe('RequestGroupOverview.vue', () => {
  it('displays requestgroup details', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData);
    expect(wrapper.text()).toContain(requestgroupData.name);
    expect(wrapper.text()).toContain(requestgroupData.proposal);
    expect(wrapper.text()).toContain('2021-02-03 04:55:30');
    expect(wrapper.text()).toContain(requestgroupData.submitter);
  });

  it('displays requestgroup title without link', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData);
    expect(wrapper.find('.requestgroup-title').text()).toContain(requestgroupData.name);
    expect(
      wrapper
        .find('.requestgroup-title')
        .find('a')
        .exists()
    ).toBe(false);
  });

  it('displays requestgroup title as link using href', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData, {}, { href: 'http://localhost' });
    expect(wrapper.find('.requestgroup-title').text()).toContain(requestgroupData.name);
    expect(
      wrapper
        .find('.requestgroup-title')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays requestgroup title as link using to', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData, {}, { to: { name: 'rgPath', params: { id: 1 } } });
    expect(wrapper.find('.requestgroup-title').text()).toContain(requestgroupData.name);
    expect(
      wrapper
        .find('.requestgroup-title')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays proposal without link', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData);
    expect(wrapper.find('.proposal-display-code').text()).toContain(requestgroupData.proposal);
    expect(
      wrapper
        .find('.proposal-display-code')
        .find('a')
        .exists()
    ).toBe(false);
  });

  it('displays proposal as link using href', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData, { href: 'http://localhost' });
    expect(wrapper.find('.proposal-display-code').text()).toContain(requestgroupData.proposal);
    expect(
      wrapper
        .find('.proposal-display-code')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays proposal as link using to', () => {
    let requestgroupData = requestgroupFactory();
    const wrapper = wrapperFactory(requestgroupData, { to: { name: 'proposalPath', params: { id: 1 } } });
    expect(wrapper.find('.proposal-display-code').text()).toContain(requestgroupData.proposal);
    expect(
      wrapper
        .find('.proposal-display-code')
        .find('a')
        .exists()
    ).toBe(true);
  });

  it('displays correct number of requests', () => {
    let requestgroupData = requestgroupFactory(['PENDING', 'PENDING', 'WINDOW_EXPIRED', 'COMPLETED', 'FAILURE_LIMIT_REACHED']);
    const wrapper = wrapperFactory(requestgroupData);
    expect(wrapper.find('.total-requests').text()).toContain('5');
    expect(wrapper.find('.pending-requests').text()).toContain('2');
    expect(wrapper.find('.failed-requests').text()).toContain('2');
    expect(wrapper.find('.completed-requests').text()).toContain('1');
  });
});
