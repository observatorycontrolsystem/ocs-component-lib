import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import flushPromises from 'flush-promises';
import VueRouter from 'vue-router';
import $, { ajax } from 'jquery';

import { RequestGroupTable, RequestGroupOverview } from '@/components/RequestGroups';
import { Pagination } from '@/components/Util';

// Mock out remote network calls
jest.mock('jquery');
const { Deferred } = jest.requireActual('jquery');

// Make sure the bootstrap-vue components are available during testing and
// also set up VueRouter
const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueRouter);
const routes = [{ path: '/', component: RequestGroupTable }];
const router = new VueRouter({ mode: 'abstract', routes });

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const profileData = {
  username: 'jane_doe',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jdoe@example.com',
  profile: {
    education_user: false,
    notifications_enabled: false,
    notifications_on_authored_only: false,
    simple_interface: false,
    view_authored_requests_only: false,
    title: 'Software Engineer',
    staff_view: true,
    institution: 'LCO',
    terms_accepted: null
  },
  is_staff: false,
  proposals: [
    {
      id: 'test-proposal',
      title: 'Test Proposal',
      current: true
    }
  ]
};

const requestFactory = (state = 'PENDING') => {
  return {
    acceptability_threshold: 90,
    state: state,
    configurations: [
      {
        type: 'EXPOSE',
        instrument_type: 'instrument_a',
        instrument_configs: [
          {
            bin_x: 1,
            bin_y: 1,
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

const requestgroupFactory = (state = 'PENDING') => {
  let requestgroupData = {
    name: 'test requestgroup',
    proposal: 'test proposal',
    submitter: 'test user',
    ipp_value: 1.05,
    operator: 'SINGLE',
    observation_type: 'NORMAL',
    duration: 925,
    observation_note: '',
    state: state,
    modified: '2021-02-03T04:55:30.000055',
    created: '2021-02-03T04:55:28.474845Z',
    requests: []
  };
  requestgroupData.requests.push(requestFactory(state));
  return requestgroupData;
};

const requestgroupListFactory = (requestgroupStates = ['PENDING']) => {
  let requestgroups = [];
  for (let requestgroupState of requestgroupStates) {
    requestgroups.push(requestgroupFactory(requestgroupState));
  }
  return { count: requestgroups.length, results: requestgroups };
};

const wrapperFactory = (
  observationPortalApiBaseUrl = '',
  profile = {},
  title = '',
  proposalLink = () => {},
  requestgroupLink = () => {},
  slots = {}
) => {
  let propsData = {
    observationPortalApiBaseUrl: observationPortalApiBaseUrl,
    profile: profile
  };
  if (title) {
    propsData.title = title;
  }
  if (proposalLink) {
    propsData.proposalLink = proposalLink;
  }
  if (requestgroupLink) {
    propsData.requestgroupLink = requestgroupLink;
  }

  return mount(RequestGroupTable, {
    localVue,
    router,
    propsData: propsData,
    slots: slots
  });
};

describe('RequestGroupTable.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('custom title is displayed', () => {
    let requestgroupListData = requestgroupListFactory();
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData, 'Filtered Requestgroups');
    expect(wrapper.text()).toContain('Filtered Requestgroups');
  });

  it('default title is displayed when no title is passed in', () => {
    let requestgroupListData = requestgroupListFactory();
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    expect(wrapper.text()).toContain('Submitted Observation Requests');
  });

  it('custom content for empty requests slot is rendered', () => {
    let requestgroupListData = requestgroupListFactory([]);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory(
      'http://localhost',
      profileData,
      '',
      () => {},
      () => {},
      { 'empty-requests': '<span>There seems to be nothing here</span>' }
    );
    expect(wrapper.text()).toContain('There seems to be nothing here');
  });

  it('default content for empty requests is rendered when named slot is not used', () => {
    let requestgroupListData = requestgroupListFactory([]);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    expect(wrapper.text()).toContain('No observation requests found.');
  });

  it('success event emitted on successful data retrieval', async () => {
    let requestgroupListData = requestgroupListFactory(['PENDING', 'COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    await flushPromises();
    expect(wrapper.emitted().success).toBeTruthy();
  });

  it('error event emitted on error retrieving data', async () => {
    let requestgroupListData = requestgroupListFactory(['PENDING', 'COMPLETED']);
    $.ajax.mockReturnValue(Deferred().reject(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    await flushPromises();
    expect(wrapper.emitted().error).toBeTruthy();
  });

  it('pagination component is rendered', () => {
    let requestgroupListData = requestgroupListFactory(['PENDING', 'COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    expect(wrapper.findAllComponents(Pagination)).toHaveLength(1);
  });

  it('request groups overview components are rendered for each requestgroup', () => {
    let requestgroupListData = requestgroupListFactory(['PENDING', 'COMPLETED', 'PENDING']);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    expect(wrapper.text()).not.toContain('No observation requests found');
    expect(wrapper.findAllComponents(RequestGroupOverview)).toHaveLength(3);
  });

  it('updates route with API query params', async () => {
    let requestgroupListData = requestgroupListFactory(['PENDING', 'COMPLETED', 'PENDING']);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupListData));
    const wrapper = wrapperFactory('http://localhost', profileData);
    await flushPromises();
    expect(wrapper.vm.$route.fullPath).toBe('/?limit=20');
  });

  it('filters requestgroups by state', async () => {
    let semesterResults = {
      count: 1,
      results: [{id: '2021A', start: '2021-02-01T00:00:00Z', end: '2021-07-31T23:59:59Z'}],
                          };
    let requestgroupListDataUnfiltered = requestgroupListFactory(['PENDING', 'COMPLETED', 'PENDING']);
    let requestgroupListDataFiltered = requestgroupListFactory(['COMPLETED']);
    $.ajax
      .mockReturnValueOnce(Deferred().resolve(requestgroupListDataUnfiltered))
      .mockReturnValueOnce(Deferred().resolve(semesterResults))
      .mockReturnValueOnce(Deferred().resolve(requestgroupListDataFiltered));

    const wrapper = wrapperFactory('http://localhost', profileData);
    // Check that 3 requestgroups are displayed, and also that the AJAX call sent a query
    // with the expected parameters.
    expect(wrapper.findAllComponents(RequestGroupOverview)).toHaveLength(3);
    expect(wrapper.vm.$route.fullPath).toBe('/?limit=20');
    expect($.ajax.mock.calls.length).toBe(2);
    expect($.ajax.mock.calls[0][0].data.limit).toBe(20);
    expect($.ajax.mock.calls[0][0].data.state).toBeFalsy();

    // Simulate updating the filter choice for requestgroup state and semester
    let filterButton = wrapper.find('button[type=submit]');
    let stateSelect = wrapper.find('select#input-state');
    let semesterSelect = wrapper.find('select#input-semester');
    await stateSelect.setValue(['COMPLETED']);

    //wrapper.setValue does not seem to work, so get the first valid semester option and select it manually
    semesterSelect.element.options[1].selected = true;
    await semesterSelect.trigger('change');
    filterButton.trigger('submit');
    await flushPromises();

    // Check that the second AJAX call used the right query params and also that
    // only one requestgroup is displayed now
    expect($.ajax.mock.calls.length).toBe(3);
    expect($.ajax.mock.calls[2][0].data.limit).toBe(20);
    expect($.ajax.mock.calls[2][0].data.state).toStrictEqual(["COMPLETED"]);
    expect(wrapper.vm.$route.fullPath).toContain('state=COMPLETED');
    expect(wrapper.vm.$route.fullPath).toContain('limit=20');
    expect(wrapper.vm.$route.fullPath).toContain('created_after=2021-02-01');
    expect(wrapper.vm.$route.fullPath).toContain('created_before=2021-07-31');
    expect(wrapper.findAllComponents(RequestGroupOverview)).toHaveLength(1);
    expect(wrapper.vm.queryParams.created_after).toBe('2021-02-01');
    expect(wrapper.vm.queryParams.created_before).toBe('2021-07-31');

  });
});
