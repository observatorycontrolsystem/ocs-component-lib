import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import flushPromises from 'flush-promises';
import VueRouter from 'vue-router';
import $ from 'jquery';

import { ObservationsTable } from '@/components/Observations';
import { Pagination } from '@/components/Util';

// Mock out remote network calls
jest.mock('jquery');
const { Deferred } = jest.requireActual('jquery');

// Make sure the bootstrap-vue components are available during testing and
// also set up VueRouter
const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueRouter);
const routes = [{ path: '/', component: ObservationsTable }];
const router = new VueRouter({ mode: 'abstract', routes });

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const filterOptions = {
  fields: ['priority', 'start_after', 'start_before', 'end_after', 'end_before', 'modified_after', 'request_id', 'request_group_id', 'proposal'],
  choice_fields: [
    { name: 'site', options: [['ogg', 'ogg']] },
    {
      name: 'enclosure',
      options: [
        ['clma', 'clma'],
        ['doma', 'doma']
      ]
    },
    {
      name: 'telescope',
      options: [
        ['1m0a', '1m0a'],
        ['2m0a', '2m0a']
      ]
    },
    {
      name: 'state',
      options: [
        ['PENDING', 'PENDING'],
        ['IN_PROGRESS', 'IN_PROGRESS'],
        ['NOT_ATTEMPTED', 'NOT_ATTEMPTED'],
        ['COMPLETED', 'COMPLETED'],
        ['CANCELED', 'CANCELED'],
        ['ABORTED', 'ABORTED'],
        ['FAILED', 'FAILED']
      ]
    },
    {
      name: 'time_span',
      options: [
        ['', '---------'],
        ['today', 'Today'],
        ['yesterday', 'Yesterday'],
        ['week', 'Past 7 days'],
        ['month', 'This month'],
        ['year', 'This year']
      ]
    },
    {
      name: 'observation_type',
      options: [
        ['NORMAL', 'NORMAL'],
        ['RAPID_RESPONSE', 'RAPID_RESPONSE'],
        ['TIME_CRITICAL', 'TIME_CRITICAL'],
        ['DIRECT', 'DIRECT']
      ]
    },
    {
      name: 'request_state',
      options: [
        ['PENDING', 'PENDING'],
        ['COMPLETED', 'COMPLETED'],
        ['WINDOW_EXPIRED', 'WINDOW_EXPIRED'],
        ['FAILURE_LIMIT_REACHED', 'FAILURE_LIMIT_REACHED'],
        ['CANCELED', 'CANCELED']
      ]
    },
    { name: 'instrument_type', options: [['1M0-SCICAM-SINISTRO', '1M0-SCICAM-SINISTRO']] },
    {
      name: 'configuration_type',
      options: [
        ['AUTO_FOCUS', 'AUTO_FOCUS'],
        ['BIAS', 'BIAS'],
        ['DARK', 'DARK'],
        ['EXPOSE', 'EXPOSE'],
        ['SCRIPT', 'SCRIPT'],
        ['STANDARD', 'STANDARD']
      ]
    },
    {
      name: 'ordering',
      options: [
        ['', '---------'],
        ['start', 'Start'],
        ['-start', 'Start (descending)'],
        ['end', 'End'],
        ['-end', 'End (descending)'],
        ['modified', 'Modified'],
        ['-modified', 'Modified (descending)'],
        ['created', 'Created'],
        ['-created', 'Created (descending)'],
        ['state', 'State'],
        ['-state', 'State (descending)']
      ]
    }
  ]
};

const observationFactory = (state, id) => {
  return {
    id: id,
    request: {
      id: id,
      observation_note: '',
      state: state,
      acceptability_threshold: 90.0,
      modified: '2021-03-10T23:23:13.765578Z',
      duration: 308,
      configurations: [
        {
          id: id,
          instrument_type: '1M0-SCICAM-SINISTRO',
          type: 'EXPOSE',
          repeat_duration: null,
          extra_params: {},
          priority: 500,
          instrument_configs: [
            {
              optical_elements: {
                filter: 'air'
              },
              mode: 'default',
              exposure_time: 100.0,
              exposure_count: 2,
              bin_x: 1,
              bin_y: 1,
              rotator_mode: '',
              extra_params: {},
              rois: []
            }
          ],
          constraints: {
            max_airmass: 2.0,
            min_lunar_distance: 0.0,
            extra_params: {}
          },
          acquisition_config: {
            mode: 'OFF',
            exposure_time: 10.0,
            extra_params: {}
          },
          guiding_config: {
            optional: true,
            mode: 'OFF',
            optical_elements: {},
            exposure_time: 10.0,
            extra_params: {}
          },
          target: {
            type: 'ICRS',
            name: 'm23',
            ra: 269.267,
            dec: -18.985,
            proper_motion_ra: 1.18,
            proper_motion_dec: -1.39,
            parallax: 1.354,
            epoch: 2000.0,
            hour_angle: null,
            extra_params: {}
          },
          configuration_status: 7,
          state: state,
          instrument_name: 'xx05',
          guide_camera_name: 'xx05',
          summary: {}
        }
      ]
    },
    site: 'ogg',
    enclosure: 'clma',
    telescope: '2m0a',
    start: '2021-03-11T14:52:31.015603Z',
    end: '2021-03-11T14:57:39.015603Z',
    priority: 10,
    state: state,
    proposal: 'TestProposal2',
    submitter: 'test_user',
    name: 'Future RequestGroup-3',
    ipp_value: 1.0,
    observation_type: 'NORMAL',
    request_group_id: 13,
    created: '2021-03-10T23:23:13.812037Z',
    modified: '2021-03-10T23:23:13.812028Z'
  };
};

const observationsListFactory = statusList => {
  const results = statusList.map((status, index) => observationFactory(status, index));
  return {
    count: statusList.length,
    next: null,
    previous: null,
    results: results
  };
};

const wrapperFactory = (observationPortalApiBaseUrl = '', observationDetailLink = () => {}, requestLink = () => {}, slots = {}) => {
  let propsData = {
    observationPortalApiBaseUrl: observationPortalApiBaseUrl
  };
  if (observationDetailLink) {
    propsData.observationDetailLink = observationDetailLink;
  }
  if (requestLink) {
    propsData.requestLink = requestLink;
  }

  return mount(ObservationsTable, {
    localVue,
    router,
    propsData: propsData,
    slots: slots
  });
};

describe('ObservationsTable.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits onSuccessfulDataRetrieval event on successful data retrieval', async () => {
    const observationsList = observationsListFactory(['COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(filterOptions)).mockReturnValueOnce(Deferred().resolve(observationsList));
    const wrapper = wrapperFactory('http://localhost');
    await flushPromises();
    expect(wrapper.emitted().onSuccessfulDataRetrieval).toBeTruthy();
  });

  it('emits onErrorRetrievingData event on successful data retrieval', async () => {
    const observationsList = observationsListFactory(['COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(filterOptions)).mockReturnValueOnce(Deferred().reject(observationsList));
    const wrapper = wrapperFactory('http://localhost');
    await flushPromises();
    expect(wrapper.emitted().onErrorRetrievingData).toBeTruthy();
  });

  it('renders both pagination components', () => {
    const observationsList = observationsListFactory(['COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(filterOptions)).mockReturnValueOnce(Deferred().reject(observationsList));
    const wrapper = wrapperFactory('http://localhost');
    expect(wrapper.findAllComponents(Pagination)).toHaveLength(2);
  });

  it('updates the route with API query params', async () => {
    const observationsList = observationsListFactory(['COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(filterOptions)).mockReturnValueOnce(Deferred().reject(observationsList));
    const wrapper = wrapperFactory('http://localhost');
    await flushPromises();
    expect(wrapper.vm.$route.fullPath).toBe(
      '/?state=COMPLETED&state=PENDING&state=IN_PROGRESS&state=ABORTED&state=FAILED&state=NOT_ATTEMPTED&ordering=-start&limit=50'
    );
  });

  it('shows a message if the request for observations fails', async () => {
    const observationsList = observationsListFactory(['COMPLETED']);
    $.ajax.mockReturnValue(Deferred().resolve(filterOptions)).mockReturnValueOnce(Deferred().reject(observationsList));
    const wrapper = wrapperFactory('http://localhost');
    await flushPromises();
    expect(wrapper.text()).toContain('No observations found');
  });

  it('filters observations by state', async () => {
    const observationsListUnfiltered = observationsListFactory(['COMPLETED', 'PENDING']); // returns 2 observations
    const observationsListFiltered = observationsListFactory(['COMPLETED']); // returns 1 observation
    $.ajax
      .mockReturnValueOnce(Deferred().resolve(observationsListUnfiltered))
      .mockReturnValueOnce(Deferred().resolve(filterOptions))
      .mockReturnValueOnce(Deferred().resolve(observationsListFiltered));

    const wrapper = wrapperFactory('http://localhost');

    // Should see two rows in the observations table
    let observationsTable = wrapper.find('#observations-table');
    let body = observationsTable.find('tbody');
    let rows = body.findAll('tr');
    expect(rows).toHaveLength(2);

    // Simulate updating the filter choice for requestgroup state
    let filterButton = wrapper.find('button[type=submit]');
    let stateSelect = wrapper.find('select#input-state');
    await stateSelect.setValue('COMPLETED');
    filterButton.trigger('submit');
    await flushPromises();

    // Check that the second AJAX call used the right query params and also that
    // only one observation row is displayed
    observationsTable = wrapper.find('#observations-table');
    body = observationsTable.find('tbody');
    rows = body.findAll('tr');
    expect(rows).toHaveLength(1);

    expect($.ajax.mock.calls.length).toBe(3);
    expect($.ajax.mock.calls[2][0].data.limit).toBe(50);
    expect($.ajax.mock.calls[2][0].data.state[0]).toBe('COMPLETED');
    expect(wrapper.vm.$route.fullPath).not.toContain('state=PENDING');
    expect(wrapper.vm.$route.fullPath).toContain('state=COMPLETED');
  });
});
