<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['requestGroup', 'panel', 'hide'], false)"
    id="general"
    :title="getFromObject(formConfig, ['requestGroup', 'panel', 'title'], 'Request Group')"
    :icon="getFromObject(formConfig, ['requestGroup', 'panel', 'icon'], 'fas fa-address-card')"
    :tooltip-config="tooltipConfig"
    :can-remove="false"
    :can-copy="false"
    :errors="errors"
    :show="show"
    :index="0"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alert-class="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-form-row>
        <b-col v-show="show" md="6">
          <slot name="request-group-help" :data="{ requestGroup: requestGroup, durationData: durationData }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field
              v-model="requestGroup.name"
              field="name"
              :label="getFromObject(formConfig, ['requestGroup', 'name', 'label'], 'Name')"
              :desc="getFromObject(formConfig, ['requestGroup', 'name', 'desc'], '')"
              :hide="getFromObject(formConfig, ['requestGroup', 'name', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.name"
              @input="update"
            />
            <custom-select
              v-model="requestGroup.proposal"
              field="proposal"
              :label="getFromObject(formConfig, ['requestGroup', 'proposal', 'label'], 'Proposal')"
              :desc="getFromObject(formConfig, ['requestGroup', 'proposal', 'desc'], '')"
              :hide="getFromObject(formConfig, ['requestGroup', 'proposal', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.proposal"
              :options="proposalOptions"
              @input="update"
            />
            <custom-select
              v-model="requestGroup.observation_type"
              field="observation_type"
              :label="getFromObject(formConfig, ['requestGroup', 'observation_type', 'label'], 'Observation Type')"
              :desc="getFromObject(formConfig, ['requestGroup', 'observation_type', 'desc'], '')"
              :hide="getFromObject(formConfig, ['requestGroup', 'observation_type', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.observation_type"
              :options="observationTypeOptions"
              @input="update"
            />
            <custom-field
              v-model="requestGroup.ipp_value"
              field="ipp_value"
              :label="getFromObject(formConfig, ['requestGroup', 'ipp_value', 'label'], 'IPP Factor')"
              :desc="getFromObject(formConfig, ['requestGroup', 'ipp_value', 'desc'], '')"
              :hide="getFromObject(formConfig, ['requestGroup', 'ipp_value', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.ipp_value"
              @input="update"
            />
            <span v-show="!show">
              Total Duration: <strong>{{ durationDisplay }} </strong>
            </span>
          </b-form>
        </b-col>
      </b-form-row>
    </b-container>
    <div v-for="(request, idx) in requestGroup.requests" :key="'request' + idx">
      <custom-modal
        :show="showCadence"
        header="Generated Cadence"
        :show-accept="cadenceRequests.length > 0"
        @close="cancelCadence"
        @submit="acceptCadence"
      >
        <p>
          The blocks below represent the windows of the requests that will be generated if the cadence is accepted. These requests will replace the
          current request.
        </p>
        <p>Press Cancel to discard the cadence.</p>
        <p>Press Ok to accept the cadence. Once a cadence is accepted, the individual generated requests may be edited.</p>
        <cadence-plot :data="cadenceRequests" />

        <!-- TODO: Differentiate between loading data and no cadence found -->

        <p v-if="cadenceRequests.length < 1">
          <strong>
            A valid cadence could not be generated. Please try adjusting the jitter or period and make sure your target is visible within the selected
            window.
          </strong>
        </p>
      </custom-modal>
      <request
        :index="idx"
        :request="request"
        :available-instruments="availableInstruments"
        :parent-show="show"
        :observation-type="requestGroup.observation_type"
        :observation-portal-api-base-url="observationPortalApiBaseUrl"
        :errors="getRequestErrors(idx)"
        :duration-data="getRequestDurationData(idx)"
        :site-code-to-color="siteCodeToColor"
        :site-code-to-name="siteCodeToName"
        :show-airmass-plot="showAirmassPlot"
        :instrument-category-to-name="instrumentCategoryToName"
        :dither-pattern-options="ditherPatternOptions"
        :dithering-allowed="ditheringAllowed"
        :aladin-script-location="aladinScriptLocation"
        :aladin-style-location="aladinStyleLocation"
        :datetime-format="datetimeFormat"
        :form-config="formConfig"
        :tooltip-config="tooltipConfig"
        @remove="removeRequest(idx)"
        @copy="addRequest(idx)"
        @request-updated="requestUpdated"
        @generate-cadence="expandCadence"
      >
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
      </request>
    </div>
  </form-panel>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';

import CustomModal from '@/components/RequestGroupComposition/CustomModal.vue';
import Request from '@/components/RequestGroupComposition/Request.vue';
import CadencePlot from '@/components/Plots/CadencePlot.vue';
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import { generateDurationString, getFromObject, defaultTooltipConfig, defaultDatetimeFormat } from '@/util';

export default {
  name: 'RequestGroup',
  components: {
    Request,
    CustomModal,
    CustomField,
    CustomSelect,
    FormPanel,
    CustomAlert,
    CadencePlot
  },
  props: {
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    // Response from the /api/profile/ endpoint
    profile: {
      type: Object,
      required: true
    },
    availableInstruments: {
      type: Object,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    requestGroup: {
      type: Object,
      required: true
    },
    durationData: {
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
    showAirmassPlot: {
      type: Boolean
    },
    instrumentCategoryToName: {
      type: Object,
      default: () => {
        return {};
      }
    },
    ditherPatternOptions: {
      type: Array,
      default: () => {
        return [
          { text: 'None', value: 'none' },
          { text: 'Line', value: 'line' },
          { text: 'Grid', value: 'grid' },
          { text: 'Spiral', value: 'spiral' }
        ];
      }
    },
    ditheringAllowed: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: (configuration, requestIndex, configurationIndex) => {
        return true;
      }
    },
    observationTypeOptions: {
      type: Array,
      default: () => {
        return [
          { value: 'NORMAL', text: 'Queue scheduled (default)' },
          { value: 'TIME_CRITICAL', text: 'Time Critical' },
          { value: 'RAPID_RESPONSE', text: 'Rapid Response' }
        ];
      }
    },
    formConfig: {
      type: Object,
      default: () => {
        return {};
      }
    },
    datetimeFormat: {
      type: String,
      default: defaultDatetimeFormat
    },
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
    },
    aladinScriptLocation: {
      type: String,
      default: 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js'
    },
    aladinStyleLocation: {
      type: String,
      default: 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css'
    }
  },
  data: function() {
    return {
      show: true,
      showCadence: false,
      cadenceRequests: [],
      cadenceRequestId: -1
    };
  },
  computed: {
    proposalOptions: function() {
      let options = [{ value: '', text: '' }];
      for (let proposal of this.profile.proposals) {
        if (proposal.current) {
          options.push({
            value: proposal.id,
            text: proposal.title + ' (' + proposal.id + ')'
          });
        }
      }
      return _.sortBy(options, 'text');
    },
    durationDisplay: function() {
      return generateDurationString(this.durationData.duration);
    }
  },
  watch: {
    'requestGroup.requests.length': function(value) {
      this.requestGroup.operator = value > 1 ? 'MANY' : 'SINGLE';
    },
    'requestGroup.observation_type': function(value) {
      // The value might be undefined at this point
      if (value) {
        for (var index = 0; index < this.requestGroup.requests.length; ++index) {
          for (var windowIndex = 0; windowIndex < this.requestGroup.requests[index].windows.length; ++windowIndex) {
            if (value === 'RAPID_RESPONSE') {
              delete this.requestGroup.requests[index].windows[windowIndex].start;
              this.requestGroup.requests[index].windows[windowIndex].end = moment
                .utc()
                .add(24, 'hours')
                .format(this.datetimeFormat);
            } else {
              if (!('start' in this.requestGroup.requests[index].windows[windowIndex])) {
                this.requestGroup.requests[index].windows[windowIndex].start = moment.utc().format(this.datetimeFormat);
              }
            }
          }
        }
      }
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    update: function(data) {
      this.$emit('request-group-updated', data);
    },
    requestUpdated: function(data) {
      this.update(data);
    },
    addRequest: function(idx) {
      let newRequest = _.cloneDeep(this.requestGroup.requests[idx]);
      this.requestGroup.requests.push(newRequest);
      this.update();
    },
    removeRequest: function(idx) {
      this.requestGroup.requests.splice(idx, 1);
      this.update();
    },
    getRequestDurationData: function(idx) {
      return _.get(this.durationData, ['requests', idx], { duration: 0 });
    },
    getRequestErrors: function(idx) {
      return _.get(this.errors, ['requests', idx], {});
    },
    expandCadence: function(data) {
      // TODO: Use a modal and not an alert

      if (!_.isEmpty(this.errors)) {
        alert('Please make sure your request is valid before generating a cadence');
        return false;
      }
      this.cadenceRequestId = data.id;
      let payload = _.cloneDeep(this.requestGroup);
      payload.requests = [_.cloneDeep(data.request)];
      payload.requests[0].windows = [];
      payload.requests[0].cadence = data.cadence;
      let that = this;
      $.ajax({
        type: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/requestgroups/cadence/`,
        data: JSON.stringify(payload),
        contentType: 'application/json',
        success: function(data) {
          for (let r in data.requests) {
            that.cadenceRequests.push(data.requests[r]);
          }
        }
      });
      this.showCadence = true;
    },
    cancelCadence: function() {
      this.cadenceRequests = [];
      this.cadenceRequestId = -1;
      this.showCadence = false;
    },
    acceptCadence: function() {
      // this is a bit hacky because the UI representation of a request doesnt match what the api expects/returns
      let that = this;
      for (let r in this.cadenceRequests) {
        // all that changes in the cadence is the window, so instead of parsing what is returned we just copy the request
        // that the cadence was generated from and replace the window from what is returned.
        let newRequest = _.cloneDeep(that.requestGroup.requests[that.cadenceRequestId]);
        newRequest.windows = that.cadenceRequests[r].windows;
        delete newRequest.cadence;
        that.requestGroup.requests.push(newRequest);
      }
      // finally we remove the original request
      this.removeRequest(that.cadenceRequestId);
      if (this.requestGroup.requests.length > 1) this.requestGroup.operator = 'MANY';
      this.cadenceRequests = [];
      this.cadenceRequestId = -1;
      this.showCadence = false;
      this.update();
    }
  }
};
</script>
