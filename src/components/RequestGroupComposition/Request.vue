<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['request', 'panel', 'hide'], false)"
    :id="'request' + index"
    :title="getFromObject(formConfig, ['request', 'panel', 'title'], 'Request')"
    :icon="getFromObject(formConfig, ['request', 'panel', 'icon'], 'fab fa-wpexplorer')"
    :cancopy="getFromObject(formConfig, ['request', 'panel', 'canCopy'], true)"
    :canremove="index > 0"
    :errors="errors"
    :show="show"
    :index="index"
    :tooltip-config="tooltipConfig"
    @remove="$emit('remove')"
    @show="show = $event"
    @copy="$emit('copy')"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="request-help" :data="{ request: request, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field
              v-model="request.acceptability_threshold"
              field="acceptability_threshold"
              :label="getFromObject(formConfig, ['request', 'acceptability_threshold', 'label'], 'Acceptability Threshold')"
              :desc="getFromObject(formConfig, ['request', 'acceptability_threshold', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'acceptability_threshold', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.acceptability_threshold"
              @input="update"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
    <configuration
      v-for="(configuration, idx) in request.configurations"
      :key="'configuration' + idx"
      :index="idx"
      :request-index="index"
      :configuration="configuration"
      :parentshow="show"
      :available-instruments="availableInstruments"
      :instrument-category-to-name="instrumentCategoryToName"
      :errors="getFromObject(errors, ['configurations', idx], {})"
      :duration-data="getFromObject(durationData, ['configurations', idx], { duration: 0 })"
      :form-config="formConfig"
      :tooltip-config="tooltipConfig"
      @remove="removeConfiguration(idx)"
      @copy="addConfiguration(idx)"
      @configuration-updated="configurationUpdated"
      @instrument-type-updated="onInstrumentTypeUpdated"
    >
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
        <slot name="target-name-field" :data="data.data"></slot>
      </template>
      <template #target-type-field="data">
        <slot name="target-type-field" :data="data.data"></slot>
      </template>
      <template #constraints-help="data">
        <slot name="constraints-help" :data="data.data"></slot>
      </template>
    </configuration>
    <window
      v-for="(window, idx) in request.windows"
      :key="'window' + idx"
      ref="window"
      :index="idx"
      :request-index="index"
      :window="window"
      :errors="getFromObject(errors, ['windows', idx], {})"
      :parentshow="show"
      :observation-portal-api-base-url="observationPortalApiBaseUrl"
      :observation-type="observationType"
      :site-code-to-color="siteCodeToColor"
      :site-code-to-name="siteCodeToName"
      :show-airmass-plot="showAirmassPlot"
      :datetime-format="datetimeFormat"
      :tooltip-config="tooltipConfig"
      :form-config="formConfig"
      @remove="removeWindow(idx)"
      @window-updated="windowUpdated"
      @generate-cadence="generateCadence"
      @copy="addWindow(idx)"
    >
      <template #window-help="data">
        <slot name="window-help" :data="data.data"></slot>
      </template>
    </window>
  </form-panel>
</template>
<script>
import _ from 'lodash';

import Configuration from '@/components/RequestGroupComposition/Configuration.vue';
import Window from '@/components/RequestGroupComposition/Window.vue';
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';

import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig, defaultDatetimeFormat } from '@/util';

export default {
  name: 'Request',
  components: {
    Configuration,
    Window,
    CustomField,
    FormPanel,
    CustomAlert
  },
  mixins: [collapseMixin],
  props: {
    request: {
      type: Object,
      required: true
    },
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    availableInstruments: {
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
    parentshow: {
      type: Boolean
    },
    observationType: {
      type: String,
      required: true
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
    formConfig: {
      type: Object,
      default: () => {
        return {};
      }
    },
    instrumentCategoryToName: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data: function() {
    return {
      show: true,
      position: {
        requestIndex: this.index
      }
    };
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    update: function(data) {
      this.$emit('request-updated', data);
      if (this.showAirmassPlot) {
        _.delay(() => {
          this.updateAirmassPlot();
        }, 500);
      }
    },
    updateAirmassPlot: _.debounce(function() {
      if ('window' in this.$refs) {
        for (var windowIdx in this.$refs.window) {
          this.$refs.window[windowIdx].updateAirmassPlot(this.request);
        }
      }
    }, 300),
    updateAcceptabilityThreshold: function(newInstrumentType, oldInstrumentType) {
      let newDefaultAcceptability = 90;
      let oldDefaultAcceptability = 90;
      if (newInstrumentType in this.availableInstruments) {
        newDefaultAcceptability = this.availableInstruments[newInstrumentType].default_acceptability_threshold;
      }
      if (oldInstrumentType in this.availableInstruments) {
        oldDefaultAcceptability = this.availableInstruments[oldInstrumentType].default_acceptability_threshold;
      }
      let currentAcceptability = this.request.acceptability_threshold;
      if (currentAcceptability === '' || Number(currentAcceptability) === oldDefaultAcceptability) {
        // Initialize default value, or update the value if it was not set to the default of the
        // previous instrument type - this means that the user probably didn't modify the threshold
        // (If they did modify it, it should probably stay at what they set).
        this.request.acceptability_threshold = newDefaultAcceptability;
        this.update();
      }
    },
    onInstrumentTypeUpdated: function(instrumentType) {
      this.updateAcceptabilityThreshold(instrumentType.new, instrumentType.old);
      if (this.availableInstruments[instrumentType.new]) {
        this.request.location.telescope_class = this.availableInstruments[instrumentType.new].class.toLowerCase();
      } else {
        this.request.location.telescope_class = '';
      }
    },
    configurationFillDuration: function(configId) {
      if ('largest_interval' in this.durationData) {
        let config_duration = this.durationData.configurations[configId].duration;
        let available_time = this.durationData.largest_interval - this.durationData.duration + config_duration;
        this.request.configurations[configId].repeat_duration = Math.floor(available_time) - 1;
        this.update();
      }
    },
    configurationUpdated: function(data) {
      console.log('configuration-updated');
      this.update(data);
    },
    windowUpdated: function() {
      console.log('windowUpdated');
      this.update();
    },
    addWindow: function(idx) {
      let newWindow = JSON.parse(JSON.stringify(this.request.windows[idx]));
      this.request.windows.push(newWindow);
      this.update();
    },
    addConfiguration: function(idx) {
      let newConfiguration = JSON.parse(JSON.stringify(this.request.configurations[idx]));
      this.request.configurations.push(newConfiguration);
      this.update();
    },
    removeWindow: function(idx) {
      this.request.windows.splice(idx, 1);
      this.update();
    },
    removeConfiguration: function(idx) {
      this.request.configurations.splice(idx, 1);
      this.update();
    },
    generateCadence: function(data) {
      this.$emit('generate-cadence', { id: this.index, request: this.request, cadence: data });
    }
  }
};
</script>
