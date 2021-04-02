<template>
  <b-row>
    <b-col>
      <request-group
        :errors="errors"
        :duration-data="durationData"
        :request-group="requestGroup"
        :profile="profile"
        :datetime-format="datetimeFormat"
        :observation-portal-api-base-url="observationPortalApiBaseUrl"
        :simple-interface="simpleInterface"
        :available-instruments="availableInstruments"
        :site-code-to-color="siteCodeToColor"
        :site-code-to-name="siteCodeToName"
        @request-group-updated="requestgroupUpdated"
      >
        <template #request-group-help="data">
          <slot name="request-group-help" :data="data"></slot>
        </template>
        <template #request-help>
          <slot name="request-help"></slot>
        </template>
        <template #configuration-help>
          <slot name="configuration-help"></slot>
        </template>
        <template #instrument-config-help>
          <slot name="instrument-config-help"></slot>
        </template>
        <template #target-help>
          <slot name="target-help"></slot>
        </template>
        <template #constraints-help>
          <slot name="constraints-help"></slot>
        </template>
        <template #window-help>
          <slot name="window-help"></slot>
        </template>
      </request-group>
    </b-col>
    <b-col cols="auto">
      <request-group-side-nav
        :request-group="requestGroup"
        :errors="errors"
        :draft-id="draftId"
        @save-draft="saveDraft($event.draftId)"
        @submit="submit()"
        @clear="clear()"
      />
    </b-col>
  </b-row>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

import RequestGroup from '@/components/RequestGroupComposition/RequestGroup.vue';
import RequestGroupSideNav from '@/components/RequestGroupComposition/RequestGroupSideNav.vue';
import { generateDurationString } from '@/util';

export default {
  name: 'RequestGroupCompositionForm',
  components: {
    RequestGroup,
    RequestGroupSideNav
  },
  props: {
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    // Response from the /api/instruments/ endpoint
    instruments: {
      type: Object,
      required: true
    },
    // Response from the /api/profile/ endpoint
    profile: {
      type: Object,
      required: true
    },
    siteCodeToColor: {
      type: Object,
      required: true
    },
    siteCodeToName: {
      type: Object,
      required: true
    },
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
                      bin_x: '',
                      bin_y: '',
                      exposure_count: 1,
                      exposure_time: '',
                      mode: '',
                      rotator_mode: '',
                      extra_params: {
                        defocus: 0
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
    datetimeFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  data: function() {
    return {
      draftId: -1,
      isMemberOfActiveProposals: false,
      errors: {},
      durationData: {}
    };
  },
  computed: {
    simpleInterface: function() {
      return _.get(this.profile, ['profile', 'simple_interface'], false);
    },
    availableInstrumentTypes: function() {
      return _.get(this.profile, 'available_instrument_types', []);
    },
    // Has only the instruments that the user's proposals allow
    availableInstruments: function() {
      // TODO: Filter the instruments for only the ones that are in the profile list of available_instrument_types... there is
      // a thing to exclude instruments that include "COMMISSIONING" in the instrument type name, but maybe I should
      // figure out a better way to handle that
      let instruments = {};
      for (let instrumentType of this.availableInstrumentTypes) {
        if (this.instruments[instrumentType]) {
          instruments[instrumentType] = this.instruments[instrumentType];
        }
      }
      return instruments;
    }
  },
  methods: {
    validate: _.debounce(function() {
      $.ajax({
        type: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/requestgroups/validate/`,
        data: JSON.stringify(this.requestGroup),
        contentType: 'application/json',
        success: data => {
          this.errors = data.errors;
          this.durationData = data.request_durations;
        }
      });
    }, 200),
    submit: function() {
      // TODO: Use confirm mixin
      if (
        confirm(
          'The request will take approximately ' +
            generateDurationString(this.durationData.duration) +
            ' of telescope time. Are you sure you want to submit the request?'
        )
      ) {
        $.ajax({
          type: 'POST',
          url: `${this.observationPortalApiBaseUrl}/api/requestgroups/`,
          data: JSON.stringify(this.requestGroup),
          contentType: 'application/json',
          success: data => {
            this.$emit('request-group-saved', data.id);
          }
        });
      }
    },
    requestgroupUpdated: function() {
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
          this.$emit('save-draft-succeeded', 'Draft id: ' + data.id + ' saved successfully');
        })
        .fail(data => {
          for (let error in data.responseJSON.non_field_errors) {
            this.$emit('save-draft-failed', data.responseJSON.non_field_errors[error]);
          }
        });
    },
    clear: function() {
      // TODO: Replace with confirm mixin
      if (confirm('Clear the form?')) {
        window.location.reload();
      }
    }
  }
};
</script>
