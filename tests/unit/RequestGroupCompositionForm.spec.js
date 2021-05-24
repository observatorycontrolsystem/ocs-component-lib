import { createLocalVue, enableAutoDestroy, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import flushPromises from 'flush-promises';
import { advanceBy, clear } from 'jest-date-mock';
import $ from 'jquery';
import VueCompositionAPI from '@vue/composition-api';

import RequestGroup from '@/components/RequestGroupComposition/RequestGroup.vue';
import RequestGroupSideNav from '@/components/RequestGroupComposition/RequestGroupSideNav.vue';
import { RequestGroupCompositionForm } from '@/components/RequestGroupComposition';

// Mock out remote network calls
jest.mock('jquery');
const { Deferred } = jest.requireActual('jquery');

// Make sure the bootstrap-vue components are available during testing and
// also make the composition API available
const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueCompositionAPI);

// Call the .destroy() hook on the test Vue instance after each test
enableAutoDestroy(afterEach);

const debouncedValidateTime = 200;

const profileData = {
  proposals: [
    {
      id: 'test-proposal-1',
      title: 'Test Proposal 1',
      current: true
    },
    {
      id: 'test-proposal-2',
      title: 'Test Proposal 2',
      current: true
    }
  ],
  available_instrument_types: ['imager_a', 'imager_b', 'spectrograph_a']
};

const instrumentsData = {
  imager_a: {
    type: 'IMAGE',
    class: '0m4',
    name: 'Imager A',
    optical_elements: {
      filters: [
        {
          name: 'Bessell-V',
          code: 'V',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-B',
          code: 'B',
          schedulable: true,
          default: false
        }
      ]
    },
    modes: {
      readout: {
        type: 'readout',
        modes: [
          {
            name: 'Full frame',
            code: 'full_frame',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'Full frame bin 2',
            code: 'full_frame_bin_2',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'Half frame',
            code: 'half_frame',
            schedulable: false,
            validation_schema: {}
          }
        ],
        default: 'full_frame'
      },
      acquisition: {
        type: 'acquisition',
        modes: [
          {
            name: 'Acquire Off',
            code: 'OFF',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'OFF'
      }
    },
    default_acceptability_threshold: 80.0,
    configuration_types: {
      EXPOSE: {
        name: 'Exposure',
        code: 'EXPOSE',
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      REPEAT_EXPOSE: {
        name: 'Exposure Sequence',
        code: 'REPEAT_EXPOSE',
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      }
    }
  },
  imager_b: {
    type: 'IMAGE',
    class: '1m0',
    name: 'Imager B',
    optical_elements: {
      filters: [
        {
          name: 'Bessell-I',
          code: 'I',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-R',
          code: 'R',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-V',
          code: 'V',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-B',
          code: 'B',
          schedulable: true,
          default: false
        }
      ]
    },
    modes: {
      guiding: {
        type: 'guiding',
        modes: [
          {
            name: 'Off',
            code: 'OFF',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'On',
            code: 'ON',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'ON'
      },
      acquisition: {
        type: 'acquisition',
        modes: [
          {
            name: 'Acquire Off',
            code: 'OFF',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'OFF'
      },
      readout: {
        type: 'readout',
        modes: [
          {
            name: 'Full frame',
            code: 'full_frame',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'Central frame',
            code: 'central_frame',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'full_frame'
      }
    },
    default_acceptability_threshold: 95.0,
    configuration_types: {
      EXPOSE: {
        name: 'Exposure',
        code: 'EXPOSE',
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      REPEAT_EXPOSE: {
        name: 'Exposure Sequence',
        code: 'REPEAT_EXPOSE',
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      }
    }
  },
  imager_c: {
    type: 'IMAGE',
    class: '2m0',
    name: 'Imager C',
    optical_elements: {
      filters: [
        {
          name: 'Bessell-I',
          code: 'I',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-R',
          code: 'R',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-V',
          code: 'V',
          schedulable: true,
          default: false
        },
        {
          name: 'Bessell-B',
          code: 'B',
          schedulable: true,
          default: false
        }
      ]
    },
    modes: {
      guiding: {
        type: 'guiding',
        modes: [
          {
            name: 'Off',
            code: 'OFF',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'On',
            code: 'ON',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'ON'
      },
      acquisition: {
        type: 'acquisition',
        modes: [
          {
            name: 'Acquire Off',
            code: 'OFF',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'OFF'
      },
      readout: {
        type: 'readout',
        modes: [
          {
            name: 'Full frame',
            code: 'full_frame',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'Central frame',
            code: 'central_frame',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'full_frame'
      }
    },
    default_acceptability_threshold: 95.0,
    configuration_types: {
      EXPOSE: {
        name: 'Exposure',
        code: 'EXPOSE',
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      REPEAT_EXPOSE: {
        name: 'Exposure Sequence',
        code: 'REPEAT_EXPOSE',
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      }
    }
  },

  '1M0-NRES-COMMISSIONING': {
    type: 'SPECTRA',
    class: '1m0',
    name: '1.0 meter NRES Commissioning',
    optical_elements: {},
    modes: {
      readout: {
        type: 'readout',
        modes: [
          {
            name: 'NRES Commisioning 1x1',
            overhead: 57.0,
            code: 'default',
            schedulable: true,
            validation_schema: {
              bin_x: {
                type: 'integer',
                allowed: [1],
                default: 1
              },
              bin_y: {
                type: 'integer',
                allowed: [1],
                default: 1
              }
            }
          }
        ],
        default: 'default'
      },
      acquisition: {
        type: 'acquisition',
        modes: [
          {
            name: 'Target Coordinates NRES',
            overhead: 400.0,
            code: 'WCS',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'Brightest Object NRES',
            overhead: 400.0,
            code: 'BRIGHTEST',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'BRIGHTEST'
      },
      guiding: {
        type: 'guiding',
        modes: [
          {
            name: 'On',
            overhead: 0.0,
            code: 'ON',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'ON'
      }
    },
    default_acceptability_threshold: 90.0,
    configuration_types: {
      NRES_SPECTRUM: {
        name: 'Spectrum',
        code: 'NRES_SPECTRUM',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      NRES_EXPOSE: {
        name: 'NRES_EXPOSE',
        code: 'NRES_EXPOSE',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      NRES_TEST: {
        name: 'NRES_TEST',
        code: 'NRES_TEST',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      SCRIPT: {
        name: 'SCRIPT',
        code: 'SCRIPT',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: false
      },
      ENGINEERING: {
        name: 'ENGINEERING',
        code: 'ENGINEERING',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      ARC: {
        name: 'Arc',
        code: 'ARC',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      },
      LAMP_FLAT: {
        name: 'Lamp Flat',
        code: 'LAMP_FLAT',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      },
      NRES_BIAS: {
        name: 'NRES_BIAS',
        code: 'NRES_BIAS',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      },
      NRES_DARK: {
        name: 'NRES_DARK',
        code: 'NRES_DARK',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      }
    }
  },

  sprectrograph_a: {
    type: 'SPECTRA',
    class: '1m0',
    name: 'Spectrograph A',
    optical_elements: {
      slits: [
        {
          name: '6.0 arcsec slit',
          code: 'slit_6.0as',
          schedulable: true,
          default: false
        },
        {
          name: '1.6 arcsec slit',
          code: 'slit_1.6as',
          schedulable: true,
          default: false
        }
      ]
    },
    modes: {
      readout: {
        type: 'readout',
        modes: [
          {
            name: 'Default',
            code: 'default',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'default'
      },
      acquisition: {
        type: 'acquisition',
        modes: [
          {
            name: 'Brightest Object',
            code: 'BRIGHTEST',
            schedulable: true,
            validation_schema: {
              extra_params: {
                type: 'dict',
                schema: {
                  acquire_radius: {
                    max: 15,
                    min: 0,
                    type: 'float',
                    required: true
                  }
                }
              }
            }
          },
          {
            name: 'Target Coordinates',
            code: 'TARGET',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'TARGET'
      },
      rotator: {
        type: 'rotator',
        modes: [
          {
            name: 'Slit Angle',
            code: 'SLIT_ANGLE',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'Slit Position',
            code: 'SLIT_POSITION',
            schedulable: true,
            validation_schema: {
              extra_params: {
                type: 'dict',
                schema: {
                  rotator_angle: {
                    max: 360,
                    min: 0,
                    type: 'float'
                  }
                }
              }
            }
          }
        ],
        default: 'SLIT_ANGLE'
      },
      guiding: {
        type: 'guiding',
        modes: [
          {
            name: 'Off',
            code: 'OFF',
            schedulable: true,
            validation_schema: {}
          },
          {
            name: 'On',
            code: 'ON',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'ON'
      }
    },
    default_acceptability_threshold: 100.0,
    configuration_types: {
      SPECTRUM: {
        name: 'Spectrum',
        code: 'SPECTRUM',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      REPEAT_SPECTRUM: {
        name: 'Spectrum Sequence',
        code: 'REPEAT_SPECTRUM',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      ARC: {
        name: 'Arc',
        code: 'ARC',
        config_change_overhead: 60.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      },
      LAMP_FLAT: {
        name: 'Lamp Flat',
        code: 'LAMP_FLAT',
        config_change_overhead: 60.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      }
    }
  },
  spectrograph_b: {
    type: 'SPECTRA',
    class: '2m0',
    name: 'Spectrograph B',
    optical_elements: {},
    modes: {
      readout: {
        type: 'readout',
        modes: [
          {
            name: 'Default',
            code: 'default',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'default'
      },
      guiding: {
        type: 'guiding',
        modes: [
          {
            name: 'On',
            code: 'ON',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'ON'
      },
      acquisition: {
        type: 'acquisition',
        modes: [
          {
            name: 'Brightest Object',
            code: 'BRIGHTEST',
            schedulable: true,
            validation_schema: {}
          }
        ],
        default: 'BRIGHTEST'
      }
    },
    default_acceptability_threshold: 90.0,
    configuration_types: {
      SPECTRUM: {
        name: 'Spectrum',
        code: 'SPECTRUM',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      REPEAT_SPECTRUM: {
        name: 'Spectrum Sequence',
        code: 'REPEAT_SPECTRUM',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: false,
        requires_optical_elements: true
      },
      ARC: {
        name: 'Arc',
        code: 'ARC',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      },
      LAMP_FLAT: {
        name: 'Lamp Flat',
        code: 'LAMP_FLAT',
        config_change_overhead: 0.0,
        schedulable: true,
        force_acquisition_off: true,
        requires_optical_elements: true
      }
    }
  }
};

const wrapperFactory = (observationPortalApiBaseUrl, instruments, profile, requestGroup, showAirmassPlot, formConfig, loadedDraftId, slots = {}) => {
  let propsData = {
    observationPortalApiBaseUrl: observationPortalApiBaseUrl,
    profile: profile,
    instruments: instruments
  };
  if (requestGroup) {
    propsData.requestGroup = requestGroup;
  }
  if (formConfig) {
    propsData.formConfig = formConfig;
  }
  if (showAirmassPlot) {
    propsData.showAirmassPlot = showAirmassPlot;
  }
  if (loadedDraftId) {
    propsData.loadedDraftId = loadedDraftId;
  }

  return mount(RequestGroupCompositionForm, {
    localVue,
    propsData: propsData,
    slots: slots
  });
};

describe('RequestGroupCompositionForm.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The validate method uses lodash's debounce function, which does not play nicely with testing. In order to get the
    // code in the debounced function to run, place the following lines in the test function before flushing promises
    // and running asserts:
    //
    // <Run code that triggers the validate function>
    // advanceBy(debouncedValidateTime + 1000) // forward Date
    // jest.advanceTimersByTime(debouncedValidateTime) // forward setTimeout's timer
    // await flushPromises();
    // <Place asserts here>
    //
    // jest.useFakeTimers() is necessary here for this to work as well.
    // See here for more info: https://stackoverflow.com/questions/52695553/testing-debounced-function-in-react-component-with-jest-and-enzyme
    jest.useFakeTimers();
  });
  afterEach(() => {
    // Clear out any jest date mocked in case it was mocked during the test
    clear();
  });

  it('form is rendered', () => {
    const wrapper = wrapperFactory('http://localhost', instrumentsData, profileData);
    expect(wrapper.findComponent(RequestGroup).exists()).toBe(true);
    expect(wrapper.findComponent(RequestGroupSideNav).exists()).toBe(true);
  });

  it('submit button is disabled when requestgroup is invalid', async () => {
    const wrapper = wrapperFactory('http://localhost', instrumentsData, profileData);
    $.ajax.mockReturnValue(Deferred().resolve({ errors: { name: ['Please provide a name.'] }, request_durations: {} }));
    advanceBy(debouncedValidateTime + 1000); // forward Date
    jest.advanceTimersByTime(debouncedValidateTime); // forward setTimeout's timer
    await flushPromises();
    const sideNav = wrapper.findComponent(RequestGroupSideNav);
    const sideNavSubmitButton = sideNav.findAll('button').filter(w => w.text().includes('Submit Request'));
    expect(sideNavSubmitButton.length).toBe(1);
    expect(sideNavSubmitButton.at(0).attributes().disabled).toBe('disabled');
  });
});
