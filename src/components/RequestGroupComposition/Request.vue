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
              :desc="getFromObject(formConfig, ['request', 'mosaic', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaic', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="{}"
            />
            <custom-field
              v-if="mosaic.pattern === 'line'"
              v-model="mosaic.parameters.numPoints"
              field="mosaic-num-points"
              :label="getFromObject(formConfig, ['request', 'mosaicNumPoints', 'label'], 'Number of Points')"
              :desc="getFromObject(formConfig, ['request', 'mosaicNumPoints', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicNumPoints', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'line' || mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.pointSpacing"
              field="mosaic-point-spacing"
              :label="getFromObject(formConfig, ['request', 'mosaicPointSpacing', 'label'], 'Point Spacing')"
              :desc="getFromObject(formConfig, ['request', 'mosaicPointSpacing', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicPointSpacing', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.lineSpacing"
              field="mosaic-line-spacing"
              :label="getFromObject(formConfig, ['request', 'mosaicLineSpacing', 'label'], 'Line Spacing')"
              :desc="getFromObject(formConfig, ['request', 'mosaicLineSpacing', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicLineSpacing', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'line' || mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.orientation"
              field="mosaic-orientation"
              :label="getFromObject(formConfig, ['request', 'mosaicOrientation', 'label'], 'Orientation')"
              :desc="getFromObject(formConfig, ['request', 'mosaicOrientation', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicOrientation', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.numRows"
              field="mosaic-num-rows"
              :label="getFromObject(formConfig, ['request', 'mosaicNumRows', 'label'], 'Number of Rows')"
              :desc="getFromObject(formConfig, ['request', 'mosaicNumRows', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicNumRows', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-field
              v-if="mosaic.pattern === 'grid'"
              v-model="mosaic.parameters.numColumns"
              field="mosaic-num-columns"
              :label="getFromObject(formConfig, ['request', 'mosaicNumColumns', 'label'], 'Number of Columns')"
              :desc="getFromObject(formConfig, ['request', 'mosaicNumColumns', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicNumColumns', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <custom-select
              v-if="mosaic.pattern === 'grid' || mosaic.pattern === 'line'"
              v-model="mosaic.parameters.center"
              :options="mosaic.centerOptions"
              field="mosaic-center"
              :label="getFromObject(formConfig, ['request', 'mosaicCenter', 'label'], 'Center')"
              :desc="getFromObject(formConfig, ['request', 'mosaicCenter', 'desc'], '')"
              :hide="getFromObject(formConfig, ['request', 'mosaicCenter', 'hide'], !mosaicIsAllowed)"
              :tooltip-config="tooltipConfig"
              :errors="null"
            />
            <b-form-group
              v-show="mosaicIsAllowed && mosaic.pattern !== 'none' && show"
              label-size="sm"
              label-align-sm="right"
              label-cols-sm="4"
              label=""
              label-for="mosaic-button"
            >
              <b-button id="mosaic-button" block variant="outline-primary" @click="generateMosaicPattern">
                Generate Mosaic
              </b-button>
            </b-form-group>
            <custom-modal
              :show="mosaic.showModal"
              header="Generated Mosaic"
              :show-accept="mosaic.expandedConfigurations.length > 0"
              @close="cancelMosaic"
              @submit="acceptMosaic"
            >
              <data-loader
                :data-loaded="mosaic.status.loaded"
                :data-not-found="mosaic.status.notFound"
                :data-load-error="mosaic.status.error"
                not-found-message="There are no pointing in the generated mosaic. Please update your mosaic parameters and try again."
              >
                <template #data-load-error>
                  <p>Unable to generate mosaic</p>
                  <ul class="pl-5">
                    <li v-for="errorMsg in getMosaicErrors()" :key="errorMsg" class="text-danger">{{ errorMsg }}</li>
                  </ul>
                </template>
                <mosaic-plot
                  plot-id="mosaic-plot"
                  :pointing-coordinates="mosaicPointings"
                  :instrument-field-of-view-degrees="mosaicInstrumentInfo.fieldOfViewDegrees"
                  :instrument-arc-sec-per-pixel="mosaicInstrumentInfo.arcSecPerPixel"
                  :instrument-pixels-x="mosaicInstrumentInfo.pixelsX"
                  :instrument-pixels-y="mosaicInstrumentInfo.pixelsY"
                  :instrument-orientation="mosaicInstrumentInfo.orientation"
                  :configuration="mosaicConfiguration"
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
                      <b-table-lite :items="mosaicPointings" :fields="mosaic.fields" small></b-table-lite>
                    </div>
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
      :key="'configuration' + idx"
      :index="idx"
      :request-index="index"
      :configuration="configuration"
      :parent-show="show"
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
import $ from 'jquery';

import Configuration from '@/components/RequestGroupComposition/Configuration.vue';
import Window from '@/components/RequestGroupComposition/Window.vue';
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import CustomModal from '@/components/RequestGroupComposition/CustomModal.vue';
import MosaicPlot from '@/components/Plots/MosaicPlot.vue';
import DataLoader from '@/components/Util/DataLoader.vue';

import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig, defaultDatetimeFormat } from '@/util';

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
    // TODO: This might be a duplicate
    objAsString(value) {
      let result = '';
      for (let key in value) {
        if (result) {
          result += `, ${key}: ${value[key]}`;
        } else {
          // This is the first key, value pair being printed
          result += `${key}: ${value[key]}`;
        }
      }
      return result;
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
    // `mosaicAllowed` is a function that takes the request data and the request index,
    // and returns a boolean indicating whether mosaicing is allowed.
    mosaicAllowed: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: (request, requestIndex) => {
        return true;
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
      mosaic: {
        fields: [
          { key: 'ra', label: 'RA (decimal degrees)' },
          { key: 'dec', label: 'Dec (decimal degrees)' }
        ],
        pattern: _.get(this.mosaicPatternOptions, [0, 'value'], 'none'),
        centerOptions: [
          { text: 'True', value: true },
          { text: 'False', value: false }
        ],
        showModal: false,
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
        expandedConfigurations: []
      },
      position: {
        requestIndex: this.index
      }
    };
  },
  computed: {
    mosaicIsAllowed: function() {
      return this.mosaicAllowed(this.request, this.index);
    },
    mosaicPointings: function() {
      let pointings = [];
      for (let configuration of this.mosaic.expandedConfigurations) {
        pointings.push({
          ra: configuration.target.ra,
          dec: configuration.target.dec
        });
      }
      return pointings;
    },
    mosaicConfiguration: function() {
      // The mosaic pattern is generated from the first (and only) configuration.
      return _.get(this.request.configurations, [0], {});
    },
    mosaicInstrumentInfo: function() {
      let instrumentType = _.get(this.mosaicConfiguration, ['instrument_type']);
      let cameraTypeInfo = _.get(this.availableInstruments, [instrumentType, 'camera_type']);
      return {
        fieldOfViewDegrees: _.get(cameraTypeInfo, 'science_field_of_view', 0) / 60,
        arcSecPerPixel: _.get(cameraTypeInfo, 'pixel_scale', 0),
        // TODO: Update the defaults below to sensible values
        pixelsX: _.get(cameraTypeInfo, 'pixels_x', 2000),
        pixelsY: _.get(cameraTypeInfo, 'pixels_y', 1000),
        orientation: _.get(cameraTypeInfo, 'orientation', 10)
      };
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
          num_points: this.mosaic.parameters.numPoints,
          point_spacing: this.mosaic.parameters.pointSpacing,
          orientation: this.mosaic.parameters.orientation,
          center: this.mosaic.parameters.center
        };
      } else if (this.mosaic.pattern === 'grid') {
        parameters = {
          num_rows: this.mosaic.parameters.numRows,
          num_columns: this.mosaic.parameters.numColumns,
          point_spacing: this.mosaic.parameters.pointSpacing,
          line_spacing: this.mosaic.parameters.lineSpacing,
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
      if (!_.isEmpty(this.errors)) {
        alert('Please make sure your request is valid before generating a mosaic for it');
        return false;
      }
      this.mosaic.showModal = true;
      this.mosaic.status.loaded = false;
      this.mosaic.status.error = false;
      this.mosaic.status.notFound = false;
      this.mosaic.status.errorResponse = {};
      $.ajax({
        method: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/requests/mosaic/`,
        data: JSON.stringify(this.getMosaicParameters(false)),
        contentType: 'application/json'
      })
        .done(response => {
          if (response.configurations.length < 1) {
            this.mosaic.status.notFound = true;
          } else {
            this.mosaic.expandedConfigurations = response.configurations;
          }
        })
        .fail(response => {
          this.mosaic.status.errorResponse = response.responseJSON;
          this.mosaic.status.error = true;
        })
        .always(() => {
          this.mosaic.status.loaded = true;
        });
    },
    cancelMosaic: function() {
      this.mosaic.showModal = false;
      this.mosaic.expandedConfigurations = [];
    },
    getMosaicErrors: function() {
      let errors = [];
      for (let field in this.mosaic.status.errorResponse) {
        if (field === 'non_field_errors') {
          for (let msg of this.mosaic.status.errorResponse[field]) {
            errors.push(msg);
          }
        } else {
          for (let msg of this.mosaic.status.errorResponse[field]) {
            errors.push(`${field}: ${msg}`);
          }
        }
      }
      return errors;
    },
    acceptMosaic: function() {
      this.mosaic.showModal = false;
      // Clear out configurations before setting them again to allow any existing ones
      // to re-render so that the mounted hook is entered.
      this.configurations = [];
      this.$nextTick(() => {
        this.configurations = this.mosaic.expandedConfigurations;
        this.mosaic.expandedConfigurations = [];
      });
    }
  }
};
</script>
