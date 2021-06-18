<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['configuration', 'panel', 'hide'], false)"
    :id="'configuration' + position.requestIndex + position.configurationIndex"
    :title="getFromObject(formConfig, ['configuration', 'panel', 'title'], 'Configuration')"
    :icon="getFromObject(formConfig, ['configuration', 'panel', 'icon'], 'fas fa-cogs')"
    :can-copy="getFromObject(formConfig, ['configuration', 'panel', 'canCopy'], true)"
    :can-remove="index > 0"
    :errors="errors"
    :show="show"
    :index="index"
    :tooltip-config="tooltipConfig"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alert-class="danger" :dismissible="false">
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
              :label="getFromObject(formConfig, ['configuration', 'instrument_category', 'label'], 'Instrument Category')"
              :desc="getFromObject(formConfig, ['configuration', 'instrument_category', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'instrument_category', 'hide'], false)"
              :options="instrumentCategoryOptions"
              :tooltip-config="tooltipConfig"
              :errors="{}"
              @change="onInstrumentCategoryChange"
            />
            <custom-select
              v-model="configuration.instrument_type"
              field="instrument_type"
              :label="getFromObject(formConfig, ['configuration', 'instrument_type', 'label'], 'Instrument')"
              :desc="getFromObject(formConfig, ['configuration', 'instrument_type', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'instrument_type', 'hide'], false)"
              :errors="errors.instrument_type"
              :tooltip-config="tooltipConfig"
              :options="availableInstrumentOptions"
              @change="onInstrumentTypeChange"
            />
            <custom-select
              v-model="configuration.guiding_config.mode"
              field="mode"
              :label="getFromObject(formConfig, ['guidingConfig', 'mode', 'label'], 'Guide Mode')"
              :desc="getFromObject(formConfig, ['guidingConfig', 'mode', 'desc'], '')"
              :hide="getFromObject(formConfig, ['guidingConfig', 'mode', 'hide'], false)"
              :errors="{}"
              :tooltip-config="tooltipConfig"
              :options="guideModeOptions"
              @input="update"
            >
              <b-input-group-append slot="inline-input" is-text>
                <b-form-checkbox
                  :id="'guiding-optional-' + position.requestIndex + '-' + position.configurationIndex"
                  v-model="configuration.guiding_config.optional"
                  name="guiding-optional"
                  :value="true"
                  :unchecked-value="false"
                  @input="update"
                >
                  Optional
                </b-form-checkbox>
              </b-input-group-append>
            </custom-select>
            <custom-select
              v-model="configuration.type"
              field="type"
              :label="getFromObject(formConfig, ['configuration', 'type', 'label'], 'Type')"
              :desc="getFromObject(formConfig, ['configuration', 'type', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'type', 'hide'], false)"
              :errors="errors.type"
              :tooltip-config="tooltipConfig"
              :options="configurationTypeOptions"
              @input="update"
            />
            <div v-if="configuration.type.includes('REPEAT')" class="repeatDuration">
              <custom-field
                v-model="configuration.repeat_duration"
                field="repeat_duration"
                :label="getFromObject(formConfig, ['configuration', 'repeat_duration', 'label'], 'Duration')"
                :desc="getFromObject(formConfig, ['configuration', 'repeat_duration', 'desc'], '')"
                :hide="getFromObject(formConfig, ['configuration', 'repeat_duration', 'hide'], false)"
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
              :label="getFromObject(formConfig, ['acquisitionConfig', 'mode', 'label'], 'Acquire Mode')"
              :desc="getFromObject(formConfig, ['acquisitionConfig', 'mode', 'desc'], '')"
              :hide="getFromObject(formConfig, ['acquisitionConfig', 'mode', 'hide'], false)"
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
              :label="getFromObject(formConfig, ['acquisitionConfig', field, 'label'], field)"
              :desc="getFromObject(formConfig, ['acquisitionConfig', field, 'desc'], '')"
              :hide="getFromObject(formConfig, ['acquisitionConfig', field, 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
              @input="updateAcquisitionConfigExtraParam($event, field)"
            />

            <!-- TODO: Only display dither options if imager instrument -->

            <!-- Begin dither fields -->
            <custom-select
              v-model="dither.pattern"
              :options="ditherPatternOptions"
              field="dither-pattern"
              :label="getFromObject(formConfig, ['configuration', 'dither', 'label'], 'Dither')"
              :desc="getFromObject(formConfig, ['configuration', 'dither', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'dither', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="{}"
            />
            <custom-field
              v-if="dither.pattern === 'line' || dither.pattern === 'spiral'"
              v-model="dither.parameters.numPoints"
              field="dither-num-points"
              :label="getFromObject(formConfig, ['configuration', 'ditherNumPoints', 'label'], 'Number of Points')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherNumPoints', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherNumPoints', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="dither.pattern === 'line' || dither.pattern === 'grid' || dither.pattern === 'spiral'"
              v-model="dither.parameters.pointSpacing"
              field="dither-point-spacing"
              :label="getFromObject(formConfig, ['configuration', 'ditherPointSpacing', 'label'], 'Point Spacing')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherPointSpacing', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherPointSpacing', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="dither.pattern === 'grid'"
              v-model="dither.parameters.lineSpacing"
              field="line-spacing"
              :label="getFromObject(formConfig, ['configuration', 'ditherLineSpacing', 'label'], 'Line Spacing')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherLineSpacing', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherLineSpacing', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="dither.pattern === 'line' || dither.pattern === 'grid' || dither.pattern === 'spiral'"
              v-model="dither.parameters.orientation"
              field="dither-orientation"
              :label="getFromObject(formConfig, ['configuration', 'ditherOrientation', 'label'], 'Orientation')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherOrientation', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherOrientation', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="dither.pattern === 'grid'"
              v-model="dither.parameters.numRows"
              field="dither-num-rows"
              :label="getFromObject(formConfig, ['configuration', 'ditherNumRows', 'label'], 'Number of Rows')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherNumRows', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherNumRows', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="dither.pattern === 'grid'"
              v-model="dither.parameters.numColumns"
              field="dither-num-columns"
              :label="getFromObject(formConfig, ['configuration', 'ditherNumColumns', 'label'], 'Number of Columns')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherNumColumns', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherNumColumns', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-select
              v-if="dither.pattern === 'grid' || dither.pattern === 'line'"
              v-model="dither.parameters.center"
              :options="dither.centerOptions"
              field="dither-center"
              :label="getFromObject(formConfig, ['configuration', 'ditherCenter', 'label'], 'Center')"
              :desc="getFromObject(formConfig, ['configuration', 'ditherCenter', 'desc'], '')"
              :hide="getFromObject(formConfig, ['configuration', 'ditherCenter', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <b-form-group
              v-show="dither.pattern !== 'none' && show"
              label-size="sm"
              label-align-sm="right"
              label-cols-sm="4"
              label=""
              label-for="dither-button"
            >
              <b-button id="dither-button" block variant="outline-primary" @click="generateDitherPattern">
                Generate Dither
              </b-button>
            </b-form-group>
            <custom-modal
              :show="dither.showDitherModal"
              header="Generated Dither Pattern"
              :show-accept="dither.expandedInstrumentConfigs.length > 0"
              @close="cancelDitherPattern"
              @submit="acceptDitherPattern"
            >
              <data-loader
                :data-loaded="dither.status.loaded"
                :data-not-found="dither.status.notFound"
                :data-load-error="dither.status.error"
                not-found-message="There are no points in the generated dither pattern. Please update your dither parameters and try again."
              >
                <template #data-load-error>
                  <p>Unable to generate dither pattern</p>
                  <ul class="pl-5">
                    <li v-for="errorMsg in getDitherErrors()" :key="errorMsg" class="text-danger">{{ errorMsg }}</li>
                  </ul>
                </template>
                <dither-pattern-plot
                  plot-id="dither-plot"
                  :offsets="ditherPatternOffsets"
                  :center-ra="configuration.target.ra | toNumber"
                  :center-dec="configuration.target.dec | toNumber"
                  :instrument-field-of-view-degrees="instrumentInfo.fieldOfViewDegrees"
                  :instrument-arc-sec-per-pixel="instrumentInfo.arcSecPerPixel"
                  :instrument-type="configuration.instrument_type"
                  :is-sidereal-target="configuration.target.type === 'ICRS'"
                  show-help
                >
                  <template #help>
                    <p>
                      This is your generated <em>{{ dither.pattern }}</em> dither pattern. Click <em>Ok</em> to accept the pattern and <em>Cancel</em> to reject it and start over.
                    </p>
                    <p>
                      Input parameters for the pattern:
                      <ul class="pl-5">
                        <li v-for="(value, parameter) in getDitherParameters(true)" :key="parameter">{{ parameter }}: {{ value }}</li>
                      </ul>
                    </p>
                  </template>
                </dither-pattern-plot>
              </data-loader>
            </custom-modal>
            <!-- End dither fields -->
          </b-form>
        </b-col>
      </b-row>
    </b-container>
    <instrument-config-panel
      v-for="(instrumentConfig, idx) in configuration.instrument_configs"
      :key="idx"
      :show="show"
      :parent-show="show"
      :index="idx"
      :configuration-index="index"
      :request-index="requestIndex"
      :instrument-config="instrumentConfig"
      :selected-instrument="configuration.instrument_type"
      :available-instruments="availableInstruments"
      :errors="getFromObject(errors, ['instrument_configs', idx], {})"
      :form-config="formConfig"
      :tooltip-config="tooltipConfig"
      @remove="removeInstrumentConfiguration(idx)"
      @copy="addInstrumentConfiguration(idx)"
      @instrumentconfigupdate="instumentConfigurationUpdated"
    >
      <template #instrument-config-help="data">
        <slot name="instrument-config-help" :data="data.data"></slot>
      </template>
      <template #instrument-config-form="data">
        <slot name="instrument-config-form" :data="data.data" :update="data.update"></slot>
      </template>
    </instrument-config-panel>
    <target
      :target="configuration.target"
      :configuration-index="index"
      :request-index="requestIndex"
      :parent-show="show"
      :errors="getFromObject(errors, 'target', {})"
      :form-config="formConfig"
      :tooltip-config="tooltipConfig"
      @target-updated="targetUpdated"
    >
      <template #target-help="data">
        <slot name="target-help" :data="data.data"></slot>
      </template>
      <template #target-name-field="data">
        <slot name="target-name-field" :data="data.data" :update="data.update"></slot>
      </template>
    </target>
    <constraints
      :configuration-index="index"
      :request-index="requestIndex"
      :constraints="configuration.constraints"
      :parent-show="show"
      :form-config="formConfig"
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
import $ from 'jquery';

import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomModal from '@/components/RequestGroupComposition/CustomModal.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import InstrumentConfigPanel from '@/components/RequestGroupComposition/InstrumentConfigPanel.vue';
import Constraints from '@/components/RequestGroupComposition/Constraints.vue';
import Target from '@/components/RequestGroupComposition/Target.vue';
import DitherPatternPlot from '@/components/RequestGroupComposition/DitherPatternPlot.vue';
import DataLoader from '@/components/Util/DataLoader.vue';
import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig } from '@/util';

export default {
  name: 'Configuration',
  components: {
    DataLoader,
    CustomField,
    CustomSelect,
    CustomModal,
    FormPanel,
    CustomAlert,
    InstrumentConfigPanel,
    DitherPatternPlot,
    Constraints,
    Target
  },
  filters: {
    toNumber(value) {
      return Number(value);
    }
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
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    parentShow: {
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
    }
  },
  data: function() {
    return {
      show: true,
      selectedInstrumentCategory: this.getInstrumentCategory(),
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.index
      },
      dither: {
        pattern: _.get(this.ditherPatternOptions, [0, 'value'], 'none'),
        centerOptions: [
          { text: 'True', value: true },
          { text: 'False', value: false }
        ],
        showDitherModal: false,
        parameters: {
          numPoints: 3,
          pointSpacing: 1,
          lineSpacing: 1,
          orientation: 0,
          center: false,
          numRows: 3,
          numColumns: 3
        },
        status: {
          notFound: false,
          error: false,
          loaded: false,
          errorResponse: {}
        },
        expandedInstrumentConfigs: []
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
        let defaultMode = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'acquisition', 'default'], '');
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
            requiredFields: requiredModeFields,
            default: modes[i].code === defaultMode
          });
        }
      }
      return _.sortBy(options, 'text');
    },
    requiredAcquireModeFields: function() {
      for (let i in this.acquireModeOptions) {
        if (this.acquireModeOptions[i].value === this.configuration.acquisition_config.mode) {
          return this.acquireModeOptions[i].requiredFields;
        }
      }
      return [];
    },
    guideModeOptions: function() {
      let options = [];
      if (this.configuration.instrument_type in this.availableInstruments) {
        let modes = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'guiding', 'modes'], []);
        let defaultMode = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'guiding', 'default'], '');
        for (let mode of modes) {
          if (mode.schedulable) {
            options.push({
              value: mode.code,
              text: mode.name,
              default: mode.code === defaultMode
            });
          }
        }
      }
      return _.sortBy(options, 'text');
    },
    ditherPatternOffsets: function() {
      let offsets = [];
      for (let instrumentConfig of this.dither.expandedInstrumentConfigs) {
        offsets.push({
          ra: instrumentConfig.extra_params.offset_ra,
          dec: instrumentConfig.extra_params.offset_dec
        });
      }
      return offsets;
    },
    instrumentInfo: function() {
      let cameraTypeInfo = _.get(this.availableInstruments, [this.configuration.instrument_type, 'camera_type']);
      return {
        fieldOfViewDegrees: _.get(cameraTypeInfo, 'science_field_of_view', 0) / 60,
        arcSecPerPixel: _.get(cameraTypeInfo, 'pixel_scale', 0)
      };
    }
  },
  watch: {
    instrumentCategoryOptions: function(options) {
      if (!this.isAvailableOption(this.selectedInstrumentCategory, options)) {
        this.selectedInstrumentCategory = this.getInstrumentCategory(options);
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
      // Set to default mode if there is one, otherwise leave the mode set as it is if it is a valid
      // mode, or set it to the first option
      let defaultOptionMode;
      for (let option of options) {
        if (option.default) {
          defaultOptionMode = option.value;
        }
      }
      if (defaultOptionMode) {
        this.configuration.guiding_config.mode = defaultOptionMode;
      } else if (!this.isAvailableOption(this.configuration.guiding_config.mode, options)) {
        this.configuration.guiding_config.mode = _.get(options, [0, 'value'], '');
      }
    },
    'configuration.instrument_type': function(newInstrumentType, oldInstrumentType) {
      if (oldInstrumentType !== newInstrumentType) {
        this.configureAcquisitionConfig({ changed: false, newValue: this.configuration.type, oldValue: this.configuration.type });
        this.configureGuidingConfig();
        this.update();
      }
      this.$emit('instrument-type-updated', { new: newInstrumentType, old: oldInstrumentType });
    },
    'configuration.acquisition_config.mode': function(newValue, oldValue) {
      if (oldValue !== 'OFF' && newValue !== 'OFF') {
        this.configuration.acquisition_config.extra_params = {};
        this.update();
      }
    },
    'configuration.type': function(newValue, oldValue) {
      this.configureAcquisitionConfig({ changed: true, newValue: newValue, oldValue: oldValue });
      if (!newValue.includes('REPEAT')) {
        this.configuration.repeat_duration = undefined;
      }
    }
  },
  created: function() {
    if (this.configuration.acquisition_config.mode === '') {
      this.configureAcquisitionConfig({ changed: false, newValue: this.configuration.type, oldValue: this.configuration.type });
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
      this.$emit('configuration-fill-duration', this.index);
    },
    constraintsUpdated: function() {
      this.update();
    },
    targetUpdated: function(data) {
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
    instumentConfigurationUpdated: function() {
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
    setAcquireFields: function() {
      let defaultMode = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'acquisition', 'default'], '');
      if (defaultMode) {
        this.configuration.acquisition_config.mode = defaultMode;
        this.configuration.acquisition_config.extra_params = {};
      } else if (!this.acquisitionModeIsAvailable(this.configuration.acquisition_config.mode, this.configuration.acquisition_config.extra_params)) {
        // The mode that is already set does not work, set to the first available option
        this.configuration.acquisition_config.mode = _.get(this.acquireModeOptions, [0, 'value'], '');
        this.configuration.acquisition_config.extra_params = {};
      }
      this.update();
    },
    setGuideFields: function() {
      let defaultMode = _.get(this.availableInstruments, [this.configuration.instrument_type, 'modes', 'guiding', 'default'], '');
      if (defaultMode) {
        this.configuration.guiding_config.mode = defaultMode;
      } else if (!this.isAvailableOption(this.configuration.guiding_config.mode, this.guideModeOptions)) {
        // The mode that is set does not work, set it to the first available option
        this.configuration.guiding_config.mode = _.get(this.guideModeOptions, [0, 'value'], '');
      }
      this.update();
    },
    turnOffAcquisition: function() {
      this.configuration.acquisition_config.mode = 'OFF';
      this.configuration.acquisition_config.extra_params = {};
      this.update();
    },
    configureAcquisitionConfig: function(configurationType) {
      configurationType = configurationType || { changed: false, newValue: '', oldValue: '' };
      let oldConfigurationTypeIsForceOff = this.configurationTypesForceAcquisitionOff.indexOf(configurationType.oldValue) > -1;
      let newConfigurationTypeIsForceOff = this.configurationTypesForceAcquisitionOff.indexOf(configurationType.newValue) > -1;
      if (this.acquireModeOptions.length < 1) {
        // This case can happen for instruments that only have OFF as an acquisition mode, but
        // that mode is not set in ConfigDB.
        this.turnOffAcquisition();
      } else if (newConfigurationTypeIsForceOff) {
        this.turnOffAcquisition();
      } else if (configurationType.changed && !oldConfigurationTypeIsForceOff) {
        // The configuration type changed from something that was not force off, so leave the
        // acquisition settings as is. If the configuration type had changed from a type that was
        // force acquisition off, then the acquire fields would need to be reset, which happens in the else block.
        return;
      } else {
        this.setAcquireFields();
      }
    },
    configureGuidingConfig: function() {
      this.setGuideFields();
    },
    getDitherParameters: function(simple) {
      let parameters = {};
      if (this.dither.pattern === 'line') {
        parameters = {
          num_points: this.dither.parameters.numPoints,
          point_spacing: this.dither.parameters.pointSpacing,
          orientation: this.dither.parameters.orientation,
          center: this.dither.parameters.center
        };
      } else if (this.dither.pattern === 'grid') {
        parameters = {
          num_rows: this.dither.parameters.numRows,
          num_columns: this.dither.parameters.numColumns,
          point_spacing: this.dither.parameters.pointSpacing,
          line_spacing: this.dither.parameters.lineSpacing,
          orientation: this.dither.parameters.orientation,
          center: this.dither.parameters.center
        };
      } else if (this.dither.pattern === 'spiral') {
        parameters = {
          num_points: this.dither.parameters.numPoints,
          point_spacing: this.dither.parameters.pointSpacing,
          orientation: this.dither.parameters.orientation
        };
      }
      if (!simple) {
        parameters.configuration = this.configuration;
        parameters.pattern = this.dither.pattern;
      }
      return parameters;
    },
    generateDitherPattern: function() {
      if (!_.isEmpty(this.errors)) {
        alert('Please make sure your configuration is valid before generating a dither pattern for it');
        return false;
      }
      this.dither.showDitherModal = true;
      this.dither.status.loaded = false;
      this.dither.status.error = false;
      this.dither.status.notFound = false;
      this.dither.status.errorResponse = {};
      $.ajax({
        method: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/configuration/dither/`,
        data: JSON.stringify(this.getDitherParameters(false)),
        contentType: 'application/json'
      })
        .done(response => {
          if (response.instrument_configs.length < 1) {
            this.dither.status.notFound = true;
          } else {
            this.dither.expandedInstrumentConfigs = response.instrument_configs;
          }
        })
        .fail(response => {
          this.dither.status.errorResponse = response.responseJSON;
          this.dither.status.error = true;
        })
        .always(() => {
          this.dither.status.loaded = true;
        });
    },
    cancelDitherPattern: function() {
      this.dither.showDitherModal = false;
      this.dither.expandedInstrumentConfigs = [];
    },
    getDitherErrors: function() {
      let errors = [];
      for (let field in this.dither.status.errorResponse) {
        if (field === 'non_field_errors') {
          for (let msg of this.dither.status.errorResponse[field]) {
            errors.push(msg);
          }
        } else {
          for (let msg of this.dither.status.errorResponse[field]) {
            errors.push(`${field}: ${msg}`);
          }
        }
      }
      return errors;
    },
    acceptDitherPattern: function() {
      this.dither.showDitherModal = false;
      // Clear out instrument configs before setting them again to allow any existing instrument
      // configs to re-render so that the mounted hook is entered.
      this.configuration.instrument_configs = [];
      this.$nextTick(() => {
        this.configuration.instrument_configs = this.dither.expandedInstrumentConfigs;
        this.dither.expandedInstrumentConfigs = [];
      });
    }
  }
};
</script>
