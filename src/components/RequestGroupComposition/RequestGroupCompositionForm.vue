<template>
  <b-row>
    <b-col class="m-0 p-0">
      <request-group
        :errors="requestGroupErrors"
        :duration-data="durationData"
        :request-group="requestGroup"
        :profile="profile"
        :datetime-format="datetimeFormat"
        :tooltip-config="tooltipConfig"
        :observation-portal-api-base-url="observationPortalApiBaseUrl"
        :available-instruments="availableInstruments"
        :site-code-to-color="siteCodeToColor"
        :site-code-to-name="siteCodeToName"
        :show-airmass-plot="showAirmassPlot"
        :instrument-category-to-name="instrumentCategoryToName"
        :form-config="formConfig"
        @request-group-updated="requestGroupUpdated"
      >
        <template #request-group-help="data">
          <slot name="request-group-help" :data="data.data"></slot>
        </template>
        <template #request-help="data">
          <slot name="request-help" :data="data.data"></slot>
        </template>
        <template #configuration-help="data">
          <slot name="configuration-help" :data="data.data"></slot>
        </template>
        <template #instrument-config-help="data">
          <slot name="instrument-config-help" :data="data.data"></slot>
        </template>
        <template #instrument-config-form="data">
          <slot name="instrument-config-form" :data="data.data" :update="data.update"></slot>
        </template>
        <template #target-help="data">
          <slot name="target-help" :data="data.data"></slot>
        </template>
        <template #target-name-field="data">
          <slot name="target-name-field" :data="data.data" :update="data.update"></slot>
        </template>
        <template #constraints-help="data">
          <slot name="constraints-help" :data="data.data"></slot>
        </template>
        <template #window-help="data">
          <slot name="window-help" :data="data.data"></slot>
        </template>
      </request-group>
    </b-col>
    <b-col cols="auto" class="m-0 p-0">
      <request-group-side-nav
        class="pr-0"
        :request-group="requestGroup"
        :errors="requestGroupErrors"
        :draft-id="draftId"
        @save-draft="saveDraft($event.draftId)"
        @submit="
          confirm(
            'The request will take approximately ' + getDurationString() + ' of telescope time. Are you sure you want to submit the request?',
            submitRequestGroup
          )
        "
        @clear="confirm('Clear the form?', clearRequestGroup)"
      />
    </b-col>
  </b-row>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

import RequestGroup from '@/components/RequestGroupComposition/RequestGroup.vue';
import RequestGroupSideNav from '@/components/RequestGroupComposition/RequestGroupSideNav.vue';
import { confirmMixin } from '@/mixins/confirmMixins.js';
import { generateDurationString, defaultTooltipConfig, defaultDatetimeFormat } from '@/util';

export default {
  name: 'RequestGroupCompositionForm',
  components: {
    RequestGroup,
    RequestGroupSideNav
  },
  mixins: [confirmMixin],
  props: {
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    // Object in the form of the response from the /api/instruments/ endpoint
    instruments: {
      type: Object,
      required: true
    },
    // Object in the form of the response from the /api/profile/ endpoint
    profile: {
      type: Object,
      required: true
    },
    // The initial RequestGroup data. The basic structure of a RequestGroup should be included in the
    // object, including at least one request with one configuration, location, and window, and with the
    // observation_type set. Each configuration should have at least one instrument_config, and also a section for
    // target, guiding_config, acquisition_config, and constraints. The individual fields do not need to be all filled
    // out, but the sections should be there.
    requestGroup: {
      type: Object,
      default: () => {
        return {
          name: '',
          proposal: '',
          ipp_value: 1.05,
          operator: 'SINGLE',
          observation_type: 'NORMAL',
          requests: [
            {
              acceptability_threshold: '',
              configurations: [
                {
                  type: 'EXPOSE',
                  instrument_type: '',
                  instrument_configs: [
                    {
                      exposure_count: 1,
                      exposure_time: '',
                      mode: '',
                      rotator_mode: '',
                      extra_params: {
                        offset_ra: 0,
                        offset_dec: 0
                      },
                      optical_elements: {}
                    }
                  ],
                  acquisition_config: {
                    mode: 'OFF',
                    extra_params: {
                      acquire_radius: null
                    }
                  },
                  guiding_config: {
                    mode: 'ON',
                    optional: true,
                    extra_params: {}
                  },
                  target: {
                    name: '',
                    type: 'ICRS',
                    ra: '',
                    dec: '',
                    proper_motion_ra: 0.0,
                    proper_motion_dec: 0.0,
                    epoch: 2000,
                    parallax: 0
                  },
                  constraints: {
                    max_airmass: 1.6,
                    min_lunar_distance: 30.0
                  }
                }
              ],
              windows: [
                {
                  start: '',
                  end: ''
                }
              ],
              location: {
                telescope_class: ''
              }
            }
          ]
        };
      }
    },
    // Object mapping site code to CSS color, used in the airmass plot. Set for consistent colors in plot.
    siteCodeToColor: {
      type: Object,
      required: false,
      default: () => {
        return {};
      }
    },
    // Object mapping site code to a human readable site name, used in the airmass plot
    siteCodeToName: {
      type: Object,
      required: false,
      default: () => {
        return {};
      }
    },
    // Optionally show an airmass plot on the window panel of the form when the RequestGroup is valid
    showAirmassPlot: {
      type: Boolean
    },
    // Object mapping instrument category code to human readable name.
    instrumentCategoryToName: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // Object containing configuration for form panels and form fields. Top level fields are keys
    // referencing a panel, and map to an object that can contain a `panel` key to configure panel
    // level information, and keys for each field that show up in that panel to configure that field.
    // The structure is as follows:
    // {
    //   requestGroup: {
    //     panel: {
    //       title: 'Override RequestGroup panel title'
    //     },
    //     observation_type: {
    //       label: 'Override observation_type field label',
    //       desc: 'Description of observatio type that will show up in the tooltip'
    //     },
    //     ipp_value: {
    //       hide: true // Hide this field on the form
    //     }
    //   },
    //   request: {
    //     acceptability_threshold: {
    //       desc: 'Acceptability threshold description'
    //     }
    //   },
    //   configuration: {
    //     instrument_category: {
    //       hide: simpleInterface,
    //       label: 'Observation Type'
    //     }
    //   }
    // }
    formConfig: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // Format of datetimes displayed on the form
    datetimeFormat: {
      type: String,
      default: defaultDatetimeFormat
    },
    // Tooltip configuration object https://bootstrap-vue.org/docs/directives/tooltip
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
    },
    // If the requestGroup prop that is passed in is associated with a draft, pass the ID in so
    // the draft can be updated.
    loadedDraftId: {
      type: Number,
      default: -1
    }
  },
  data: function() {
    return {
      draftId: this.loadedDraftId,
      requestGroupErrors: {},
      durationData: {}
    };
  },
  computed: {
    availableInstrumentTypes: function() {
      return _.get(this.profile, 'available_instrument_types', []);
    },
    // Has only the instruments that the user's proposals allow
    availableInstruments: function() {
      let instruments = {};
      for (let instrumentType of this.availableInstrumentTypes) {
        if (this.instruments[instrumentType]) {
          instruments[instrumentType] = this.instruments[instrumentType];
        }
      }
      return instruments;
    }
  },
  watch: {
    loadedDraftId: function(newinitialDraftId) {
      this.draftId = newinitialDraftId;
    }
  },
  methods: {
    validate: _.debounce(function() {
      $.ajax({
        type: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/requestgroups/validate/`,
        data: JSON.stringify(this.requestGroup),
        contentType: 'application/json'
      }).done(data => {
        this.requestGroupErrors = data.errors;
        this.durationData = data.request_durations;
      });
    }, 200),
    getDurationString: function() {
      return generateDurationString(this.durationData.duration);
    },
    submitRequestGroup: function() {
      $.ajax({
        type: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/requestgroups/`,
        data: JSON.stringify(this.requestGroup),
        contentType: 'application/json',
        success: data => {
          this.$emit('request-group-saved', data.id);
        }
      });
    },
    requestGroupUpdated: function() {
      console.log('requestgroup updated');
      this.validate();
    },
    saveDraft: function(id) {
      if (!this.requestGroup.name || !this.requestGroup.proposal) {
        this.$emit('save-draft-failed', 'Please give your draft a title and proposal');
        return;
      }
      let url = `${this.observationPortalApiBaseUrl}/api/drafts/`;
      let method = 'POST';
      if (id > -1) {
        url = `${url}${id}/`;
        method = 'PUT';
      }
      $.ajax({
        type: method,
        url: url,
        data: JSON.stringify({
          proposal: this.requestGroup.proposal,
          title: this.requestGroup.name,
          content: JSON.stringify(this.requestGroup)
        }),
        contentType: 'application/json'
      })
        .done(data => {
          this.draftId = data.id;
          this.$emit('save-draft-succeeded', data.id);
        })
        .fail(data => {
          if (data.responseJSON.non_field_errors) {
            for (let error in data.responseJSON.non_field_errors) {
              this.$emit('save-draft-failed', data.responseJSON.non_field_errors[error]);
            }
          } else {
            // Unexpected error, no message to supply
            this.$emit('save-draft-failed');
          }
        });
    },
    clearRequestGroup: function() {
      window.location.reload();
    }
  }
};
</script>
