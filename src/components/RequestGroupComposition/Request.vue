<template>
  <panel
    :id="'request' + index"
    :show="show"
    title="Request"
    icon="fab fa-wpexplorer"
    :index="index"
    :errors="errors"
    :canremove="index > 0"
    :cancopy="true"
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
          <slot name="request-help"></slot>
        </b-col>

        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-select
              v-if="!simpleInterface"
              v-model="dataType"
              label="Observation Type"
              field="observation_type"
              :options="dataTypeOptions"
              :errors="{}"
              @input="update"
            />
            <custom-select
              v-model="instrument_type"
              label="Instrument"
              field="instrument_type"
              :errors="getFromObject(errors, ['configurations', 0, 'instrument_type'], {})"
              :options="availableInstrumentOptions"
              @input="update"
            />
            <custom-field
              v-if="!simpleInterface"
              v-model="request.acceptability_threshold"
              label="Acceptability Threshold"
              field="acceptability_threshold"
              desc="The percentage of the observation that must be completed to mark the request as complete
                    and avert rescheduling. The percentage should be set to the lowest value for which the amount
                    of data is acceptable to meet the science goal of the request."
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
      :configuration="configuration"
      :selectedinstrument="instrument_type"
      :datatype="dataType"
      :parentshow="show"
      :available-instruments="availableInstruments"
      :errors="getFromObject(errors, ['configurations', idx], {})"
      :duration-data="getFromObject(durationData, ['configurations', idx], { duration: 0 })"
      :simple-interface="simpleInterface"
      @remove="removeConfiguration(idx)"
      @copy="addConfiguration(idx)"
      @configurationupdated="configurationUpdated"
    >
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
    </configuration>
    <window
      v-for="(window, idx) in request.windows"
      :key="'window' + idx"
      ref="window"
      :index="idx"
      :window="window"
      :errors="getFromObject(errors, ['windows', idx], {})"
      :parentshow="show"
      :simple-interface="simpleInterface"
      :observation-type="observationType"
      :site-code-to-color="siteCodeToColor"
      :site-code-to-name="siteCodeToName"
      @remove="removeWindow(idx)"
      @windowupdate="windowUpdated"
      @cadence="cadence"
      @copy="addWindow(idx)"
    >
      <template #window-help>
        <slot name="window-help"></slot>
      </template>
    </window>
  </panel>
</template>
<script>
import _ from 'lodash';

// import {
//   // collapseMixin,
//   arcDefaultExposureTime,
//   lampFlatDefaultExposureTime
// } from '@/utils.js';

import Configuration from '@/components/RequestGroupComposition/Configuration.vue';
import Window from '@/components/RequestGroupComposition/Window.vue';
import Panel from '@/components/RequestGroupComposition/Panel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';

import { collapseMixin } from '@/mixins/collapseMixins.js';

export default {
  name: 'Request',
  components: {
    Configuration,
    Window,
    CustomField,
    CustomSelect,
    Panel,
    CustomAlert
  },
  mixins: [collapseMixin],
  props: {
    request: {
      type: Object,
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
    simpleInterface: {
      type: Boolean
    },
    parentshow: {
      type: Boolean
    },
    observationType: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      show: true,
      dataType: '',
      dataTypeOptions: [],
      // TODO: Should I move this down to the configuration level? probably...
      instrument_type: this.request.configurations[0].instrument_type
    };
  },
  computed: {
    availableInstrumentOptions: function() {
      let options = [];
      for (let ai in this.availableInstruments) {
        if (this.availableInstruments[ai].type === this.dataType) {
          options.push({ value: ai, text: this.availableInstruments[ai].name });
        }
      }
      this.update();
      return _.sortBy(options, 'text').reverse();
    },
    firstAvailableInstrument: function() {
      if (this.availableInstrumentOptions.length) {
        return this.availableInstrumentOptions[0].value;
      } else {
        return '';
      }
    }
  },
  watch: {
    dataType: function(value) {
      if (
        Object.keys(this.availableInstruments).length &&
        (!this.instrument_type || this.availableInstruments[this.instrument_type].type !== value)
      ) {
        this.instrument_type = this.firstAvailableInstrument;
        this.update();
      }
    },
    instrument_type: function(newValue, oldValue) {
      if (newValue) {
        this.updateAcceptabilityThreshold(newValue, oldValue);
        this.request.location.telescope_class = this.availableInstruments[newValue].class.toLowerCase();
        this.update();
      }
    },
    availableInstruments: function() {
      if (!this.instrument_type) {
        this.instrument_type = this.firstAvailableInstrument;
      }
      this.updateDataTypeOptions();
    }
  },
  created: function() {
    // Need to call this here for when a request is copied
    this.updateDataTypeOptions();
  },
  methods: {
    update: function() {
      this.$emit('requestupdate');
      // let that = this;
      // _.delay(function() {
      //   that.updateVisibility();
      // }, 500);
    },
    // updateVisibility: _.debounce(function() {
    //   if ('window' in this.$refs) {
    //     for (var windowIdx in this.$refs.window) {
    //       this.$refs.window[windowIdx].updateVisibility(this.request);
    //     }
    //   }
    // }, 300),
    updateDataTypeOptions: function() {
      if (_.isEmpty(this.dataTypeOptions)) {
        let hasImage = false;
        let hasSpectra = false;
        for (let itype in this.availableInstruments) {
          if (this.availableInstruments[itype].type === 'IMAGE') hasImage = true;
          if (this.availableInstruments[itype].type === 'SPECTRA') hasSpectra = true;
        }
        if (hasImage) this.dataTypeOptions.push({ value: 'IMAGE', text: 'Image' });
        if (hasSpectra) this.dataTypeOptions.push({ value: 'SPECTRA', text: 'Spectrum' });
        this.setDataType();
      }
    },
    setDataType: function() {
      if (this.instrument_type) {
        for (let itype in this.availableInstruments) {
          if (itype === this.instrument_type) {
            this.dataType = this.availableInstruments[itype].type;
            return;
          }
        }
      } else if (this.dataTypeOptions.length > 0) {
        this.dataType = this.dataTypeOptions[0].value;
      }
    },
    updateAcceptabilityThreshold: function(new_instrument_type, old_instrument_type) {
      let newDefaultAcceptability = 90;
      let oldDefaultAcceptability = 90;
      if (new_instrument_type in this.availableInstruments) {
        newDefaultAcceptability = this.availableInstruments[new_instrument_type].default_acceptability_threshold;
      }
      if (old_instrument_type in this.availableInstruments) {
        oldDefaultAcceptability = this.availableInstruments[old_instrument_type].default_acceptability_threshold;
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
    configurationFillDuration: function(configId) {
      if ('largest_interval' in this.durationData) {
        let config_duration = this.durationData.configurations[configId].duration;
        let available_time = this.durationData.largest_interval - this.durationData.duration + config_duration;
        this.request.configurations[configId].repeat_duration = Math.floor(available_time) - 1;
        this.update();
      }
    },
    // generateCalibs: function(configuration_id) {
    //   let request = this.request;
    //   let calibs = [{}, {}, {}, {}];
    //   for (let c in calibs) {
    //     calibs[c] = _.cloneDeep(request.configurations[configuration_id]);
    //     for (let ic in calibs[c].instrument_configs) {
    //       calibs[c].instrument_configs[ic].exposure_time = arcDefaultExposureTime(this.instrument_type);
    //     }
    //   }
    //   calibs[0].type = 'LAMP_FLAT';
    //   calibs[1].type = 'ARC';
    //   calibs[0].guiding_config.optional = true;
    //   calibs[1].guiding_config.optional = true;
    //   calibs[0].guiding_config.mode = 'ON';
    //   calibs[1].guiding_config.mode = 'ON';
    //   for (let ic in calibs[0].instrument_configs) {
    //     calibs[0].instrument_configs[ic].exposure_time = lampFlatDefaultExposureTime(
    //       calibs[0].instrument_configs[ic].optical_elements.slit,
    //       this.instrument_type,
    //       calibs[0].instrument_configs[ic].mode
    //     );
    //   }
    //   request.configurations.unshift(calibs[0], calibs[1]);
    //   calibs[2].type = 'ARC';
    //   calibs[3].type = 'LAMP_FLAT';
    //   calibs[2].guiding_config.optional = true;
    //   calibs[3].guiding_config.optional = true;
    //   calibs[2].guiding_config.mode = 'ON';
    //   calibs[3].guiding_config.mode = 'ON';
    //   for (let ic in calibs[3].instrument_configs) {
    //     calibs[3].instrument_configs[ic].exposure_time = lampFlatDefaultExposureTime(
    //       calibs[3].instrument_configs[ic].optical_elements.slit,
    //       this.instrument_type,
    //       calibs[3].instrument_configs[ic].mode
    //     );
    //   }
    //   request.configurations.push(calibs[2], calibs[3]);
    //   this.update();
    // },
    configurationUpdated: function() {
      console.log('configurationupdated');
      this.update();
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
    cadence: function(data) {
      this.$emit('cadence', { id: this.index, request: this.request, cadence: data });
    },
    getFromObject(obj, path, defaultValue) {
      return _.get(obj, path, defaultValue);
    }
  }
};
</script>
