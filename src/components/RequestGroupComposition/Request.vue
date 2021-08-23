<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['request', 'panel', 'hide'], false)"
    :id="'request' + index"
    :title="getFromObject(formConfig, ['request', 'panel', 'title'], 'Request')"
    :icon="getFromObject(formConfig, ['request', 'panel', 'icon'], 'fab fa-wpexplorer')"
    :can-copy="getFromObject(formConfig, ['request', 'panel', 'canCopy'], true)"
    :can-remove="index > 0"
    :errors="errors"
    :show="show"
    :index="index"
    :tooltip-config="tooltipConfig"
    @remove="$emit('remove')"
    @show="show = $event"
    @copy="$emit('copy')"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alert-class="danger" :dismissible="false">
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
            <!-- Begin mosaic fields -->
            <custom-select
              v-model="mosaic.pattern"
              :options="mosaicPatternOptions"
              field="mosaic-pattern"
              :label="getFromObject(formConfig, ['request', 'mosaic', 'label'], 'Mosaic')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic', 'desc'],
                  `Optionally select a mosaic pattern. After selecting a pattern, clicking the 'Generate Mosaic' button will
                  generate and display the mosaic pattern which can then be either accepted or rejected. If accepted, the
                  request will be updated to include all configurations with the targets in the mosaic.`
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="{}"
            />
            <custom-field
              v-if="mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.lineOverlapPercent"
              field="mosaic-line-overlap-percent"
              :label="getFromObject(formConfig, ['request', 'mosaic_line_overlap_percent', 'label'], 'Line Overlap Percent')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic_line_overlap_percent', 'desc'],
                  'The percentage overlap of the pointings in the pattern as a percentage of the FOV in Right ascension (0 - 100)'
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic_line_overlap_percent', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'line' || mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.pointOverlapPercent"
              field="mosaic-point-overlap-percent"
              :label="getFromObject(formConfig, ['request', 'mosaic_point_overlap_percent', 'label'], 'Point Overlap Percent')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic_point_overlap_percent', 'desc'],
                  'The percentage overlap of the pointings in the pattern as a percentage of the FOV in Declination (0 - 100)'
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic_point_overlap_percent', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'line'"
              v-model="mosaic.parameters.numPoints"
              field="mosaic-num-points"
              :label="getFromObject(formConfig, ['request', 'mosaic_num_points', 'label'], 'Number of Points')"
              :desc="getFromObject(formConfig, ['request', 'mosaic_num_points', 'desc'], 'Number of points in the pattern')"
              :hide="getFromObject(formConfig, ['request', 'mosaic_num_points', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'line' || mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.orientation"
              field="mosaic-orientation"
              :label="getFromObject(formConfig, ['request', 'mosaic_orientation', 'label'], 'Orientation')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic_orientation', 'desc'],
                  'Angular rotation of the pattern in degrees clockwise East (Right ascension) of North (Declination)'
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic_orientation', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.numRows"
              field="mosaic-num-rows"
              :label="getFromObject(formConfig, ['request', 'mosaic_num_rows', 'label'], 'Number of Rows')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic_num_rows', 'desc'],
                  'Number of pointings in the grid in the Declination / vertical direction'
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic_num_rows', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.numColumns"
              field="mosaic-num-columns"
              :label="getFromObject(formConfig, ['request', 'mosaic_num_columns', 'label'], 'Number of Columns')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic_num_columns', 'desc'],
                  'Number of pointings in the grid in the Right ascension / horizontal direction'
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic_num_columns', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-select
              v-if="mosaic.pattern === 'grid' || mosaic.pattern === 'line'"
              v-model="mosaic.parameters.center"
              :options="mosaic.centerOptions"
              field="mosaic-center"
              :label="getFromObject(formConfig, ['request', 'mosaic_center', 'label'], 'Center')"
              :desc="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic_center', 'desc'],
                  'If True, the pattern is centered on the initial target. If False, the pattern begins at the initial target'
                )
              "
              :hide="getFromObject(formConfig, ['request', 'mosaic_center', 'hide'], !mosaicIsAllowed)"
              hide-when-collapsed
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <b-form-group
              v-show="mosaicIsAllowed && mosaic.pattern !== 'none' && show"
              label-size="sm"
              label-align-sm="right"
              label-cols-sm="4"
              :label="getFromObject(formConfig, ['request', 'mosaic', 'label'], '')"
              label-for="mosaic-button"
              :invalid-feedback="
                getFromObject(
                  formConfig,
                  ['request', 'mosaic', 'invalid_parameters_feedback'],
                  `The limit to the number of mosaic pointings that can be generated is ${mosaicMaxNumPointings}. Please
                  update your parameters before generating a mosaic.`
                )
              "
              :state="!tooManyMosaicPointings"
            >
              <b-button
                :id="'mosaic-button-' + position.requestIndex"
                block
                variant="outline-primary"
                :disabled="tooManyMosaicPointings"
                @click="generateMosaicPattern"
              >
                Generate Mosaic
              </b-button>
            </b-form-group>
            <custom-modal
              :show="expansion.showModal"
              header="Generated Mosaic"
              :show-accept="expansion.expanded.length > 0"
              @close="cancelExpansion"
              @submit="acceptMosaic()"
            >
              <data-loader
                :data-loaded="expansion.status.loaded"
                :data-not-found="expansion.status.notFound"
                :data-load-error="expansion.status.error"
                not-found-message="There are no pointings in the generated mosaic. Please update your mosaic parameters and try again."
              >
                <template #data-load-error>
                  <p>Unable to generate mosaic</p>
                  <ul class="pl-5">
                    <li v-for="errorMsg in getExpansionErrors()" :key="errorMsg" class="text-danger">{{ errorMsg }}</li>
                  </ul>
                </template>
                <mosaic-plot
                  plot-id="mosaic-plot"
                  :configurations="expansion.expanded"
                  :instruments-info="availableInstruments"
                  :extra-instrument-rotation="mosaicExtraInstrumentRotation"
                  :aladin-script-location="aladinScriptLocation"
                  :aladin-style-location="aladinStyleLocation"
                  show-help
                >
                  <template #help>
                    <p>
                      This is your generated <em>{{ mosaic.pattern }}</em> mosaic. Click <em>Ok</em> to accept the mosaic and <em>Cancel</em> to
                      reject it and start over.
                    </p>
                    <p>
                      Calculated mosaic pointings using input parameters <em>{{ getMosaicParameters(true) | objAsString }}</em>
                    </p>
                    <div class="mosaic-offset-table">
                      <b-table-lite :items="mosaicTableItems" :fields="mosaic.fields" small></b-table-lite>
                    </div>
                    <p class="float-right px-3 mt-1 mb-4 font-weight-bolder">{{ mosaicTableItems.length }} pointings</p>
                    <br />
                  </template>
                </mosaic-plot>
              </data-loader>
            </custom-modal>
            <!-- End mosaic fields -->
          </b-form>
        </b-col>
      </b-row>
    </b-container>
    <configuration
      v-for="(configuration, idx) in request.configurations"
      ref="configurations"
      :key="'configuration' + idx"
      :index="idx"
      :request-index="index"
      :configuration="configuration"
      :parent-show="show"
      :initial-show="initialConfigurationShow"
      :observation-portal-api-base-url="observationPortalApiBaseUrl"
      :available-instruments="availableInstruments"
      :instrument-category-to-name="instrumentCategoryToName"
      :errors="getFromObject(errors, ['configurations', idx], {})"
      :duration-data="getFromObject(durationData, ['configurations', idx], { duration: 0 })"
      :form-config="formConfig"
      :tooltip-config="tooltipConfig"
      :dither-pattern-options="ditherPatternOptions"
      :dithering-allowed="ditheringAllowed"
      :aladin-script-location="aladinScriptLocation"
      :aladin-style-location="aladinStyleLocation"
      @remove="removeConfiguration(idx)"
      @copy="addConfiguration(idx)"
      @configuration-updated="configurationUpdated"
      @instrument-type-updated="onInstrumentTypeUpdated"
      @configuration-fill-duration="configurationFillDuration"
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
        <slot name="target-name-field" :data="data.data" :update="data.update"></slot>
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
      :parent-show="show"
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
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import CustomModal from '@/components/RequestGroupComposition/CustomModal.vue';
import MosaicPlot from '@/components/Plots/MosaicPlot.vue';
import DataLoader from '@/components/Util/DataLoader.vue';
import requestExpansionWithModalConfirm from '@/composables/requestExpansionWithModalConfirm.js';
import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig, defaultDatetimeFormat, objAsString } from '@/util';

export default {
  name: 'Request',
  components: {
    Configuration,
    Window,
    CustomField,
    FormPanel,
    CustomAlert,
    CustomSelect,
    CustomModal,
    MosaicPlot,
    DataLoader
  },
  filters: {
    objAsString(value) {
      return objAsString(value);
    },
    toNumber(value) {
      return Number(value);
    }
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
    parentShow: {
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
    mosaicPatternOptions: {
      type: Array,
      default: () => {
        return [
          { text: 'None', value: 'none' },
          { text: 'Line', value: 'line' },
          { text: 'Grid', value: 'grid' }
        ];
      }
    },
    mosaicAllowed: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: (request, requestIndex) => {
        return true;
      }
    },
    mosaicExtraInstrumentRotation: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: configuration => {
        return 0;
      }
    },
    mosaicMaxNumPointings: {
      type: Number,
      default: 100
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
      initialConfigurationShow: true,
      mosaic: {
        fields: [
          { key: 'ra', label: 'Right ascension (decimal degrees)' },
          { key: 'dec', label: 'Declination (decimal degrees)' }
        ],
        pattern: _.get(this.mosaicPatternOptions, [0, 'value'], 'none'),
        centerOptions: [
          { text: 'True', value: true },
          { text: 'False', value: false }
        ],
        parameters: {
          pointOverlapPercent: 10,
          lineOverlapPercent: 10,
          numPoints: 3,
          pointSpacing: 1,
          lineSpacing: 1,
          orientation: 0,
          center: false,
          numRows: 3,
          numColumns: 3
        }
      },
      position: {
        requestIndex: this.index
      }
    };
  },
  setup: function() {
    const {
      expansion,
      acceptExpansionForKeyOnObject,
      cancelExpansion,
      checkReadyToGenerateExpansion,
      generateExpansion,
      getExpansionErrors
    } = requestExpansionWithModalConfirm();
    return {
      expansion,
      acceptExpansionForKeyOnObject,
      cancelExpansion,
      checkReadyToGenerateExpansion,
      generateExpansion,
      getExpansionErrors
    };
  },
  computed: {
    mosaicIsAllowed: function() {
      return this.mosaicAllowed(this.request, this.index);
    },
    mosaicTableItems: function() {
      let pointings = [];
      for (let configuration of this.expansion.expanded) {
        pointings.push({
          ra: configuration.target.ra,
          dec: configuration.target.dec
        });
      }
      return pointings;
    },
    tooManyMosaicPointings: function() {
      if (this.mosaic.pattern === 'grid') {
        let numColumns = _.get(this.mosaic.parameters, ['numColumns'], 0);
        let numRows = _.get(this.mosaic.parameters, ['numRows'], 0);
        return numColumns * numRows > this.mosaicMaxNumPointings;
      } else if (this.mosaic.pattern === 'line') {
        let numPoints = _.get(this.mosaic.parameters, ['numPoints'], 0);
        return numPoints > this.mosaicMaxNumPointings;
      }
      return false;
    }
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
      this.update(data);
    },
    windowUpdated: function() {
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
    },
    getMosaicParameters: function(simple) {
      let parameters = {};
      if (this.mosaic.pattern === 'line') {
        parameters = {
          point_overlap_percent: this.mosaic.parameters.pointOverlapPercent,
          num_points: this.mosaic.parameters.numPoints,
          orientation: this.mosaic.parameters.orientation,
          center: this.mosaic.parameters.center
        };
      } else if (this.mosaic.pattern === 'grid') {
        parameters = {
          line_overlap_percent: this.mosaic.parameters.lineOverlapPercent,
          point_overlap_percent: this.mosaic.parameters.pointOverlapPercent,
          num_rows: this.mosaic.parameters.numRows,
          num_columns: this.mosaic.parameters.numColumns,
          orientation: this.mosaic.parameters.orientation,
          center: this.mosaic.parameters.center
        };
      }
      if (!simple) {
        parameters.request = this.request;
        parameters.pattern = this.mosaic.pattern;
      }
      return parameters;
    },
    generateMosaicPattern: function() {
      if (
        this.checkReadyToGenerateExpansion('Please make sure your request is valid before generating a mosaic for it', () => {
          return !_.isEmpty(this.errors);
        })
      ) {
        this.generateExpansion(`${this.observationPortalApiBaseUrl}/api/requests/mosaic/`, this.getMosaicParameters(false), response => {
          return response.configurations;
        });
      }
    },
    acceptMosaic: function() {
      // Initialize the new configurations to be collapsed. Do this to keep rendering from taking a long time
      // for large mosaic patterns.
      this.initialConfigurationShow = false;
      this.acceptExpansionForKeyOnObject(this.request, 'configurations', () => {
        // Expand the first configuration so that it looks nice.
        this.$nextTick(() => {
          for (let configuration of this.$refs.configurations) {
            if (configuration.position.configurationIndex === 0) {
              configuration.show = true;
            }
          }
        });
        // Then, set configurations back to initially expand again.
        this.$nextTick(() => {
          this.initialConfigurationShow = true;
        });
      });
    }
  }
};
</script>
<style scoped>
.mosaic-offset-table {
  max-height: 200px;
  overflow-y: scroll;
}
</style>
