import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import $ from 'jquery';

import RequestGroupDraftsTable from '@/components/RequestGroups/RequestGroupDraftsTable.vue';

// Mock out remote network calls
jest.mock('jquery');
const { Deferred } = jest.requireActual('jquery');

// Make sure the bootstrap-vue components are available during testing
const localVue = createLocalVue();
localVue.use(BootstrapVue);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const requestGroupDraftFactory = draftArgs => {
  return {
    id: 1,
    author: draftArgs.user,
    title: draftArgs.title,
    content: JSON.stringify({
      name: draftArgs.title,
      proposal: draftArgs.proposal,
      ipp_value: 1.05,
      operator: 'SINGLE',
      observation_type: 'NORMAL',
      requests: [
        {
          acceptability_threshold: 90,
          configuration_repeats: 1,
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
        }
      ]
    }),
    created: '2021-02-03T01:23:04.659274Z',
    modified: '2021-02-03T01:23:04.659300Z',
    proposal: draftArgs.proposal
  };
};

const requestgroupDraftListFactory = draftArgsList => {
  const results = draftArgsList.map(draftArgs => requestGroupDraftFactory(draftArgs));
  return {
    count: draftArgsList.length,
    next: null,
    previous: null,
    results: results
  };
};

const wrapperFactory = (observationPortalApiBaseUrl = 'http://localhost', tableId = 'table-id') => {
  return mount(RequestGroupDraftsTable, {
    localVue,
    propsData: {
      observationPortalApiBaseUrl: observationPortalApiBaseUrl,
      tableId: tableId
    }
  });
};

describe('RequestGroupDraftsTable.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('table exists and displays drafts', () => {
    let requestgroupDraftData = requestgroupDraftListFactory([{ proposal: 'test proposal', title: 'my title', user: 'test user' }]);
    $.ajax.mockReturnValue(Deferred().resolve(requestgroupDraftData));
    const wrapper = wrapperFactory();
    expect(wrapper.find('#table-id').exists()).toBe(true);
    expect(wrapper.text()).toContain('my title');
    expect(wrapper.text()).toContain('test proposal');
    expect(wrapper.text()).toContain('test user');
  });
});
