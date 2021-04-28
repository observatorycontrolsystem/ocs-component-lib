<template>
  <form-panel
    v-if="!getFromObject(fieldHelp, ['configuration', 'panel', 'hide'], false)"
    :id="'configuration' + position.requestIndex + position.configurationIndex"
    :title="getFromObject(fieldHelp, ['configuration', 'panel', 'title'], 'Configuration')"
    :icon="getFromObject(fieldHelp, ['configuration', 'panel', 'icon'], 'fas fa-cogs')"
    :cancopy="getFromObject(fieldHelp, ['configuration', 'panel', 'canCopy'], true)"
    :canremove="index > 0"
    :errors="errors"
    :show="show"
    :index="index"
    :tooltip-config="tooltipConfig"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="configuration-help" :data="{ configuration: configuration, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-select
              v-model="selectedInstrumentCategory"
              field="instrument_category"
              :label="getFromObject(fieldHelp, ['configuration', 'instrument_category', 'label'], 'Instrument Category')"
              :desc="getFromObject(fieldHelp, ['configuration', 'instrument_category', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['configuration', 'instrument_category', 'hide'], false)"
              :options="instrumentCategoryOptions"
              :tooltip-config="tooltipConfig"
              :errors="{}"
              @change="onInstrumentCategoryChange"
            />
            <custom-select
              v-model="configuration.instrument_type"
              field="instrument_type"
              :label="getFromObject(fieldHelp, ['configuration', 'instrument_type', 'label'], 'Instrument')"
              :desc="getFromObject(fieldHelp, ['configuration', 'instrument_type', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['configuration', 'instrument_type', 'hide'], false)"
              :errors="errors.instrument_type"
              :tooltip-config="tooltipConfig"
              :options="availableInstrumentOptions"
              @change="onInstrumentTypeChange"
            />
            <custom-select
              v-model="configuration.guiding_config.mode"
              field="mode"
              :label="getFromObject(fieldHelp, ['guidingConfig', 'mode', 'label'], 'Guide Mode')"
              :desc="getFromObject(fieldHelp, ['guidingConfig', 'mode', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['guidingConfig', 'mode', 'hide'], false)"
              :errors="{}"
              :tooltip-config="tooltipConfig"
              :options="guideModeOptions"
              @input="update"
            >
              <b-input-group-append slot="inline-input" is-text>
                <b-form-checkbox
                  id="guiding-optional"
                  v-model="configuration.guiding_config.optional"
                  name="guiding-optional"
                  :value="true"
                  :unchecked-value="false"
                >
                  Optional
                </b-form-checkbox>
              </b-input-group-append>
            </custom-select>
            <custom-select
              v-model="configuration.type"
              field="type"
              :label="getFromObject(fieldHelp, ['configuration', 'type', 'label'], 'Type')"
              :desc="getFromObject(fieldHelp, ['configuration', 'type', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['configuration', 'type', 'hide'], false)"
              :errors="errors.type"
              :tooltip-config="tooltipConfig"
              :options="configurationTypeOptions"
              @input="update"
            />
            <div v-if="configuration.type.includes('REPEAT')" class="repeatDuration">
              <custom-field
                v-model="configuration.repeat_duration"
                field="repeat_duration"
                :label="getFromObject(fieldHelp, ['configuration', 'repeat_duration', 'label'], 'Duration')"
                :desc="getFromObject(fieldHelp, ['configuration', 'repeat_duration', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['configuration', 'repeat_duration', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.repeat_duration"
                @input="update"
              >
                <b-input-group-append slot="inline-input">
                  <b-button :disabled="durationData.duration > 0 ? false : true" @click="configurationFillDuration">
                    Fill
                  </b-button>
                </b-input-group-append>
              </custom-field>
            </div>
            <custom-select
              v-if="acquireModeOptions.length > 1 && configurationTypesForceAcquisitionOff.indexOf(configuration.type) < 0"
              v-model="configuration.acquisition_config.mode"
              field="mode"
              :label="getFromObject(fieldHelp, ['acquisitionConfig', 'mode', 'label'], 'Acquire Mode')"
              :desc="getFromObject(fieldHelp, ['acquisitionConfig', 'mode', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['acquisitionConfig', 'mode', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="{}"
              :options="acquireModeOptions"
              @input="update"
            />
            <custom-field
              v-for="field in requiredAcquireModeFields"
              :key="field"
              v-model="configuration.acquisition_config.extra_params[field]"
              :field="field"
              :label="getFromObject(fieldHelp, ['acquisitionConfig', field, 'label'], field)"
              :desc="getFromObject(fieldHelp, ['acquisitionConfig', field, 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['acquisitionConfig', field, 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
              @input="updateAcquisitionConfigExtraParam($event, field)"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
    <instrument-config-panel
      v-for="(instrumentConfig, idx) in configuration.instrument_configs"
      :key="idx"
      :show="show"
      :parentshow="show"
      :index="idx"
      :configuration-index="index"
      :request-index="requestIndex"
      :instrument-config="instrumentConfig"
      :selected-instrument="configuration.instrument_type"
      :available-instruments="availableInstruments"
      :errors="getFromObject(errors, ['instrument_configs', idx], {})"
      :field-help="fieldHelp"
      :tooltip-config="tooltipConfig"
      @remove="removeInstrumentConfiguration(idx)"
      @copy="addInstrumentConfiguration(idx)"
      @instrumentconfigupdate="instumentConfigurationUpdated"
    >
      <template #instrument-config-help="data">
        <slot name="instrument-config-help" :data="data.data"></slot>
      </template>
      <template #instrument-config-form="data">
        <slot name="instrument-config-form" :data="data.data"></slot>
      </template>
    </instrument-config-panel>
    <target
      :target="configuration.target"
      :configuration-index="index"
      :request-index="requestIndex"
      :parentshow="show"
      :errors="getFromObject(errors, 'target', {})"
      :field-help="fieldHelp"
      :tooltip-config="tooltipConfig"
      @target-updated="targetUpdated"
    >
      <template #target-help="data">
        <slot name="target-help" :data="data.data"></slot>
      </template>
      <template #target-name-field="data">
        <slot name="target-name-field" :data="data.data"></slot>
      </template>
      <template #target-type-field="data">
        <slot name="target-type-field" :data="data.data"></slot>
      </template>
    </target>
    <constraints
      :configuration-index="index"
      :request-index="requestIndex"
      :constraints="configuration.constraints"
      :parentshow="show"
      :field-help="fieldHelp"
      :tooltip-config="tooltipConfig"
      :errors="getFromObject(errors, 'constraints', {})"
      @constraintsupdate="constraintsUpdated"
    >
      <template #constraints-help="data">
        <slot name="constraints-help" :data="data.data"></slot>
      </template>
    </constraints>
  </form-panel>
</template>
<script>
import _ from 'lodash';

import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import InstrumentConfigPanel from '@/components/RequestGroupComposition/InstrumentConfigPanel.vue';
import Constraints from '@/components/RequestGroupComposition/Constraints.vue';
import Target from '@/components/RequestGroupComposition/Target.vue';
import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig } from '@/util';

export default {
  name: 'Configuration',
  components: {
    CustomField,
    CustomSelect,
    FormPanel,
    CustomAlert,
    InstrumentConfigPanel,
    Constraints,
    Target
  },
  mixins: [collapseMixin],
  props: {
    configuration: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    requestIndex: {
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
    parentshow: {
      type: Boolean
    },
    durationData: {
      type: Object,
      required: true
    },
    instrumentCategoryToName: {
      type: Object,
      default: () => {
        return {};
      }
    },
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
    },
    fieldHelp: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data: function() {
    return {
      show: true,
      acquireHistory: {
        mode: '',
        extra_params: {}
      },
      selectedInstrumentCategory: this.getInstrumentCategory(),
      selectedImagerGuidingOption: null,
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.index
      }
    };
  },
  computed: {
    configurationTypesForceAcquisitionOff: function() {
      let forceOffTypes = new Set();
      let configurationTypes = _.get(this.availableInstruments, [this.configuration.instrument_type, 'configuration_types'], {});
      for (let configurationType in configurationTypes) {
        if (configurationTypes[configurationType].force_acquisition_off) {
          forceOffTypes.add(configurationTypes[configurationType].code);
        }
      }
      return [...forceOffTypes];
    },
    instrumentCategoryOptions: function() {
      let optionsSet = new Set();
      let optionsArray = [];
      for (let ai in this.availableInstruments) {
        optionsSet.add(this.availableInstruments[ai].type);
      }
      optionsSet.forEach(value => {
        if (value in this.instrumentCategoryToName) {
          optionsArray.push({ value: value, text: this.instrumentCategoryToName[value] });
        } else {
          optionsArray.push({ value: value, text: value });
        }
      });
      return _.sortBy(optionsArray, 'text');
    },
    availableInstrumentOptions: function() {
      let options = [];
      for (let ai in this.availableInstruments) {
        if (this.availableInstruments[ai].type === this.selectedInstrumentCategory) {
          options.push({ value: ai, text: this.availableInstruments[ai].name });
        }
      }
      this.update();
      return _.sortBy(options, 'text');
    },
    configurationTypeOptions: function() {
      let options = [];
      let configurationTypes = _.get(this.availableInstruments, [this.configuration.instrument_type, 'configuration_types'], {});
      for (let configurationType in configurationTypes) {
        if (configurationTypes[configurationType].schedulable) {
          options.push({ value: configurationTypes[configurationType].code, text: configurationTypes[configurationType].name });
        }
      }
      return _.sortBy(options, 'text');
    },
    acquireModeOptions: function() {
      let options = [];
      if (this.availableInstruments[this.configuration.instrument_type]) {
        let requiredModeFields = [];
        let modes = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'acquisition', 'modes'], []);
        for (let i in modes) {
          requiredModeFields = [];
          if ('extra_params' in modes[i].validation_schema) {
            for (let j in modes[i].validation_schema.extra_params.schema) {
              requiredModeFields.push(j);
            }
          }
          options.push({
            value: modes[i].code,
            text: modes[i].name,
            requiredFields: requiredModeFields
          });
        }
      }
      return _.sortBy(options, 'text');
    },
    requiredAcquireModeFields: function() {
      for (let i in this.acquireModeOptions) {
        if (this.acquireModeOptions[i].value == this.configuration.acquisition_config.mode) {
          return this.acquireModeOptions[i].requiredFields;
        }
      }
      return [];
    },
    guideModeOptions: function() {
      let options = [];
      if (this.configuration.instrument_type in this.availableInstruments) {
        let modes = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'guiding', 'modes'], []);
        for (let mode of modes) {
          if (mode.schedulable) {
            options.push({ value: mode.code, text: mode.name });
          }
        }
      }
      return _.sortBy(options, 'text');
    }
  },
  watch: {
    instrumentCategoryOptions: function(options) {
      if (!this.isAvailableOption(this.selectedInstrumentCategory, options)) {
        this.selectedInstrumentCategory = this.getInstrumentCategory();
      }
    },
    availableInstrumentOptions: function(options) {
      // Only set the instrument type if it is not already set to something because if the initial value is not in the list of
      // available instruments, it is preferable to let the form display an error message and let the user update the instrument.
      // For example if a user is loading in a draft with an old instrument, it is more clear for them to be told that their old
      // instrument is no longer valid, and to update it.
      if (this.configuration.instrument_type === '') {
        this.configuration.instrument_type = _.get(options, [0, 'value'], '');
      }
    },
    configurationTypeOptions: function(options) {
      if (this.configuration.type === '') {
        this.configuration.type = _.get(options, [0, 'value'], '');
      }
    },
    guideModeOptions: function(options) {
      // TODO: Set to default mode or the first one
      if (!this.isAvailableOption(this.configuration.guiding_config.mode, options)) {
        this.configuration.guiding_config.mode = _.get(options, [0, 'value'], '');
      }
    },
    selectedImagerGuidingOption: function(value) {
      this.setGuidingFields(value);
    },
    'configuration.instrument_type': function(newInstrumentType, oldInstrumentType) {
      if (oldInstrumentType !== newInstrumentType) {
        this.configureAcquisitionConfig(this.configuration.type);
        this.configureGuidingConfig();
        this.update();
      }
      this.$emit('instrument-type-updated', { new: newInstrumentType, old: oldInstrumentType });
    },
    'configuration.acquisition_config.mode': function(newValue, oldValue) {
      if (oldValue !== 'OFF' && newValue !== 'OFF') {
        let oldExtraParams = this.configuration.acquisition_config.extra_params;
        if (newValue === this.acquireHistory.mode) {
          this.configuration.acquisition_config.extra_params = this.acquireHistory.extra_params;
        } else {
          this.configuration.acquisition_config.extra_params = {};
        }
        this.acquireHistory.mode = oldValue;
        this.acquireHistory.extra_params = oldExtraParams;
        this.update();
      }
    },
    'configuration.type': function(value) {
      this.configureAcquisitionConfig(value);
      if (!value.includes('REPEAT')) {
        this.configuration.repeat_duration = undefined;
      }
    }
  },
  created: function() {
    if (this.configuration.acquisition_config.mode === '') {
      this.configureAcquisitionConfig(this.configuration.type);
    }
    if (this.configuration.guiding_config.mode === '') {
      this.configureGuidingConfig();
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    onInstrumentCategoryChange: function() {
      this.configuration.instrument_type = _.get(this.availableInstrumentOptions, [0, 'value'], '');
      this.configuration.type = _.get(this.configurationTypeOptions, [0, 'value'], '');
      this.update();
    },
    onInstrumentTypeChange: function() {
      this.configuration.type = _.get(this.configurationTypeOptions, [0, 'value'], '');
      this.update();
    },
    getConfigurationTypeToInstrumentCategoriesArray: function() {
      let result = {};
      for (let instrument in this.availableInstruments) {
        let category = this.availableInstruments[instrument].type;
        for (let configType in this.availableInstruments[instrument].configuration_types) {
          if (!result[configType]) {
            result[configType] = new Set();
          }
          result[configType].add(category);
        }
      }
      return result;
    },
    getInstrumentCategory: function(options) {
      options = options || [];
      let category;
      let configurationTypeToInstrumentCategoriesArray = this.getConfigurationTypeToInstrumentCategoriesArray();
      if (this.configuration.instrument_type && this.availableInstruments[this.configuration.instrument_type]) {
        // If an instrument type is set, set to that instrument type's category.
        category = _.get(this.availableInstruments, [this.configuration.instrument_type, 'type'], '');
      } else if (
        this.configuration.type &&
        configurationTypeToInstrumentCategoriesArray[this.configuration.type] &&
        configurationTypeToInstrumentCategoriesArray[this.configuration.type].size === 1
      ) {
        // If a configuration type is set, check if there's only a single instrument category associated with that
        // configuration type, and if there is, set that.
        category = [...configurationTypeToInstrumentCategoriesArray[this.configuration.type]][0];
      } else {
        // If the other checks failed, set the first option.
        category = _.get(options, [0, 'value'], '');
      }
      return category;
    },
    isAvailableOption: function(selectedValue, availableOptions) {
      // Return whether the selectedValue is present in the availableOptions, which are options for a select field
      for (let option of availableOptions) {
        if (option.value === selectedValue) {
          return true;
        }
      }
      return false;
    },
    update: function(data) {
      this.$emit('configuration-updated', data);
    },
    updateAcquisitionConfigExtraParam: function(value, field) {
      if (value === '') {
        // Remove the field if an empty value is entered because the validation
        // for required extra params only check if the field exists
        this.configuration.acquisition_config.extra_params[field] = undefined;
      }
      this.update();
    },
    configurationFillDuration: function() {
      this.$emit('configurationfillduration', this.index);
    },
    constraintsUpdated: function() {
      console.log('constraintsUpdated');
      this.update();
    },
    targetUpdated: function(data) {
      console.log('targetUpdated', data);
      this.update(data);
    },
    removeInstrumentConfiguration: function(idx) {
      this.configuration.instrument_configs.splice(idx, 1);
      this.update();
    },
    addInstrumentConfiguration: function(idx) {
      let newInstrumentConfiguration = JSON.parse(JSON.stringify(this.configuration.instrument_configs[idx]));
      this.configuration.instrument_configs.push(newInstrumentConfiguration);
      this.update();
    },
    instumentConfigurationUpdated: function(data) {
      console.log('instrumentconfigUpdated', data);
      this.update();
    },
    acquisitionModeIsAvailable: function(acquisitionMode, acquisitionExtraParams) {
      // In order for a mode to be available, its code as well as any extra params must match
      let modeMatches;
      for (let amo in this.acquireModeOptions) {
        if (acquisitionMode === this.acquireModeOptions[amo].value) {
          modeMatches = true;
          for (let aep in acquisitionExtraParams) {
            if (this.acquireModeOptions[amo].requiredFields.indexOf(aep) < 0) {
              modeMatches = false;
            }
          }
          if (modeMatches) {
            return true;
          }
        }
      }
      return false;
    },
    saveAcquireFields: function() {
      if (this.configuration.acquisition_config.mode !== 'OFF') {
        this.acquireHistory.mode = this.configuration.acquisition_config.mode;
        this.acquireHistory.extra_params = this.configuration.acquisition_config.extra_params;
      }
    },
    setAcquireFields: function() {
      // TODO: Don't keep same acquire mode if instrument type changes - it's an entirely different set of modes. However, if the configuration
      // type changed, you're still using the same instrument with the same modes and the same default mode, and could very well have
      // set the mode first, and at this point you def don't want it to change. Check both the first case as well as the history mode.

      if (this.acquisitionModeIsAvailable(this.configuration.acquisition_config.mode, this.configuration.acquisition_config.extra_params)) {
        // The mode that is already set works!
        return;
      }

      if (this.acquireModeOptions.length < 1) {
        // This case can happen for instruments that only have OFF as an acquisition mode, but
        // that mode is not set in ConfigDB.
        this.turnOffAcquisition();
        return;
      }

      let defaultMode = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'acquisition', 'default'], '');
      if (this.acquisitionModeIsAvailable(this.acquireHistory.mode, this.acquireHistory.extra_params)) {
        this.configuration.acquisition_config.mode = this.acquireHistory.mode;
        this.configuration.acquisition_config.extra_params = this.acquireHistory.extra_params;
      } else if (defaultMode) {
        this.configuration.acquisition_config.mode = defaultMode;
        if (defaultMode === this.acquireHistory.mode) {
          this.configuration.acquisition_config.extra_params = this.acquireHistory.extra_params;
        } else {
          this.configuration.acquisition_config.extra_params = {};
        }
      } else if (this.acquireModeOptions.length > 0) {
        this.saveAcquireFields();
        this.configuration.acquisition_config.mode = this.acquireModeOptions[0].value;
        this.configuration.acquisition_config.extra_params = {};
      }
      this.update();
    },
    setGuideFields: function() {
      let defaultMode = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'guiding', 'default'], '');
      if (defaultMode) {
        this.configuration.guiding_config.mode = defaultMode;
      } else {
        this.configuration.guiding_config.mode = _.get(this.guideModeOptions, [0, 'value'], '');
      }
    },
    turnOffAcquisition: function() {
      this.saveAcquireFields();
      this.configuration.acquisition_config.mode = 'OFF';
      this.configuration.acquisition_config.extra_params = {};
      this.update();
    },
    configureAcquisitionConfig: function(configurationType) {
      if (this.configurationTypesForceAcquisitionOff.indexOf(configurationType) > -1) {
        this.turnOffAcquisition();
      } else {
        this.setAcquireFields();
      }
    },
    configureGuidingConfig: function() {
      this.setGuideFields();
    }
  }
};
</script>