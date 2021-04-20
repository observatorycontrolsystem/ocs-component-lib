<template>
  <form-panel
    :id="'instrument-config' + position.requestIndex + position.configurationIndex + position.instrumentConfigIndex"
    :show="show"
    title="Instrument Configuration"
    icon="fas fa-camera-retro"
    :index="index"
    :errors="errors"
    :canremove="index > 0"
    :cancopy="true"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in topLevelErrors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="instrument-config-help" :data="{ instrumentConfig: instrumentConfig, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field
              v-model="instrumentConfig.exposure_count"
              field="exposure_count"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'label'], 'Exposure Count')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'desc'], '')"
              type="number"
              :errors="errors.exposure_count"
              @input="update"
            />
            <custom-field
              v-if="selectedInstrument != '2M0-SCICAM-MUSCAT'"
              v-model="instrumentConfig.exposure_time"
              field="exposure_time"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'label'], 'Exposure Time')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'desc'], '')"
              :errors="errors.exposure_time"
              @input="update"
            >
              <div v-if="suggestedLampFlatSlitExposureTime" slot="extra-help-text">
                Suggested exposure time for a Lamp Flat with slit {{ instrumentConfig.optical_elements.slit }} and readout mode
                {{ instrumentConfig.mode }} is <strong>{{ suggestedLampFlatSlitExposureTime }} seconds</strong>
              </div>
              <div v-else-if="suggestedArcExposureTime" slot="extra-help-text">
                Suggested exposure time for an Arc is <strong>{{ suggestedArcExposureTime }} seconds</strong>
              </div>
            </custom-field>

            <!-- TODO: Remove muscat -->

            <!-- MUSCAT instrument specific fields -->
            <custom-select
              v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_mode"
              field="exposure_mode"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_mode', 'label'], 'Exposure Mode')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_mode', 'desc'], '')"
              :options="exposureModeOptions"
              :errors="null"
              @input="update"
            />
            <custom-field
              v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_g"
              field="exposure_time_g"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_g', 'label'], 'Exposure Time g')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_g', 'desc'], '')"
              :errors="null"
              @input="update"
            />
            <custom-field
              v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_r"
              field="exposure_time_r"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_r', 'label'], 'Exposure Time r')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_r', 'desc'], '')"
              :errors="null"
              @input="update"
            />
            <custom-field
              v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_i"
              field="exposure_time_i"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_i', 'label'], 'Exposure Time i')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_i', 'desc'], '')"
              :errors="null"
              @input="update"
            />
            <custom-field
              v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_z"
              field="exposure_time_z"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_z', 'label'], 'Exposure Time z')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_z', 'desc'], '')"
              :errors="null"
              @input="update"
            />

            <custom-select
              v-if="readoutModeOptions.length > 1"
              v-model="instrumentConfig.mode"
              field="readout_mode"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'label'], 'Readout Mode')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'desc'], '')"
              :options="readoutModeOptions"
              :errors="errors.mode"
              @input="update"
            />
            <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type">
              <custom-select
                v-model="instrumentConfig.optical_elements[opticalElementGroup.type]"
                :field="opticalElementGroup.type"
                :label="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'label'], opticalElementGroup.label)"
                :desc="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'desc'], '')"
                :options="opticalElementGroup.options"
                :lower-options="true"
                :errors="{}"
                @input="updateOpticalElement"
              />
            </div>
            <div v-if="rotatorModeOptions.length > 0">
              <custom-select
                v-model="instrumentConfig.rotator_mode"
                field="rotator_mode"
                :label="getFromObject(fieldHelp, ['instrumentConfig', 'rotator_mode', 'label'], 'Rotator Mode')"
                :desc="getFromObject(fieldHelp, ['instrumentConfig', 'rotator_mode', 'desc'], '')"
                :errors="errors.rotator_mode"
                :options="rotatorModeOptions"
                @input="update"
              />

              <!-- TODO: Validate required field values -->
              <custom-field
                v-for="field in requiredRotatorModeFields"
                :key="field"
                v-model="instrumentConfig.extra_params[field]"
                :label="getFromObject(fieldHelp, ['instrumentConfig', field, 'label'], field)"
                :desc="getFromObject(fieldHelp, ['instrumentConfig', field, 'desc'], '')"
                :errors="null"
                @input="updateInstrumentConfigExtraParam($event, field)"
              />
            </div>

            <!-- TODO: Validate to make sure this is a floating point number -->

            <custom-field
              v-if="selectedInstrumentCategory == 'IMAGE' && !simpleInterface"
              v-model="defocus"
              field="defocus"
              :label="getFromObject(fieldHelp, ['instrumentConfig', 'defocus', 'label'], 'Defocus')"
              :desc="getFromObject(fieldHelp, ['instrumentConfig', 'defocus', 'desc'], '')"
              :errors="null"
              type="number"
              @input="update"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </form-panel>
</template>
<script>
import _ from 'lodash';

import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import { extractTopLevelErrors, getFromObject } from '@/util';
import { collapseMixin } from '@/mixins/collapseMixins.js';

export default {
  name: 'InstrumentConfig',
  components: {
    CustomField,
    CustomSelect,
    FormPanel,
    CustomAlert
  },
  mixins: [collapseMixin],
  props: {
    errors: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    configurationIndex: {
      type: Number,
      required: true
    },
    requestIndex: {
      type: Number,
      required: true
    },
    simpleInterface: {
      type: Boolean
    },
    availableInstruments: {
      type: Object,
      required: true
    },
    selectedInstrument: {
      type: String,
      required: true
    },
    selectedInstrumentCategory: {
      type: String,
      required: true
    },
    configurationType: {
      type: String,
      required: true
    },
    instrumentConfig: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean
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
      defocus: 0,
      exposure_time_g: 0,
      exposure_time_r: 0,
      exposure_time_i: 0,
      exposure_time_z: 0,
      exposure_mode: 'SYNCHRONOUS',
      opticalElementUpdates: 0,
      exposureModeOptions: [
        { value: 'SYNCHRONOUS', text: 'Synchronous' },
        { value: 'ASYNCHRONOUS', text: 'Asynchronous' }
      ],
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.configurationIndex,
        instrumentConfigIndex: this.index
      }
    };
  },
  computed: {
    topLevelErrors: function() {
      return extractTopLevelErrors(this.errors);
    },
    instrumentHasRotatorModes: function() {
      return this.availableInstruments[this.selectedInstrument] && 'rotator' in this.availableInstruments[this.selectedInstrument].modes;
    },
    instrumentHasReadoutModes: function() {
      return this.availableInstruments[this.selectedInstrument] && 'readout' in this.availableInstruments[this.selectedInstrument].modes;
    },
    readoutModeOptions: function() {
      if (this.selectedInstrument in this.availableInstruments && this.instrumentHasReadoutModes) {
        let readoutModes = [];
        for (let rm in this.availableInstruments[this.selectedInstrument].modes.readout.modes) {
          readoutModes.push({
            text: this.availableInstruments[this.selectedInstrument].modes.readout.modes[rm].name,
            value: this.availableInstruments[this.selectedInstrument].modes.readout.modes[rm].code,
            binning: this.availableInstruments[this.selectedInstrument].modes.readout.modes[rm].validation_schema.bin_x.default
          });
        }
        return readoutModes;
      } else {
        return [];
      }
    },
    availableOpticalElementGroups: function() {
      // TODO: Mofify the instruments passed to the form to remove optical elements for the simple interface
      if (this.simpleInterface) {
        return {
          filters: {
            type: 'filter',
            label: 'Filter',
            options: [
              { value: 'b', text: 'Blue' },
              { value: 'v', text: 'Green' },
              { value: 'rp', text: 'Red' }
            ]
          }
        };
      } else if (this.selectedInstrument in this.availableInstruments) {
        let oe_groups = {};
        for (let oe_group_type in this.availableInstruments[this.selectedInstrument].optical_elements) {
          // Each optical element group type has an 's' on the end, but the optical element that is
          // submitted in the optical_elements should have a key that is the same as a group, without the 's'
          let oe_type = oe_group_type.substring(0, oe_group_type.length - 1);
          oe_groups[oe_type] = {};
          oe_groups[oe_type]['type'] = oe_type;
          oe_groups[oe_type]['label'] = _.capitalize(oe_type)
            .split('_')
            .join(' ');
          let elements = [];
          for (let element in this.availableInstruments[this.selectedInstrument].optical_elements[oe_group_type]) {
            if (this.availableInstruments[this.selectedInstrument].optical_elements[oe_group_type][element].schedulable) {
              elements.push({
                value: this.availableInstruments[this.selectedInstrument].optical_elements[oe_group_type][element].code,
                text: this.availableInstruments[this.selectedInstrument].optical_elements[oe_group_type][element].name,
                default: this.availableInstruments[this.selectedInstrument].optical_elements[oe_group_type][element].default
              });
            }
          }
          oe_groups[oe_type]['options'] = _.sortBy(elements, 'text');
        }
        return oe_groups;
      } else {
        return [];
      }
    },
    rotatorModeOptions: function() {
      let options = [];
      let requiredModeFields = [];
      if (this.instrumentHasRotatorModes) {
        let modes = _.get(this.availableInstruments, [this.selectedInstrument, 'modes', 'rotator', 'modes', []]);
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
      return options;
    },
    requiredRotatorModeFields: function() {
      for (let i in this.rotatorModeOptions) {
        if (this.rotatorModeOptions[i].value == this.instrumentConfig.rotator_mode) {
          return this.rotatorModeOptions[i].requiredFields;
        }
      }
      return [];
    },
    suggestedLampFlatSlitExposureTime: function() {
      // TODO

      // Update on optical element updates
      // this.opticalElementUpdates;
      // let slitWidth = this.instrumentConfig.optical_elements.slit;
      // let readoutMode = this.instrumentConfig.mode;
      // if (this.configurationType === 'LAMP_FLAT' && slitWidth && readoutMode && this.selectedInstrument) {
      //   return lampFlatDefaultExposureTime(slitWidth, this.selectedInstrument, readoutMode);
      // } else {
      //   return undefined;
      // }
      return 10;
    },
    suggestedArcExposureTime: function() {
      // TODO

      // if (this.configurationType === 'ARC' && this.selectedInstrument) {
      //   return arcDefaultExposureTime(this.selectedInstrument);
      // } else {
      //   return undefined;
      // }

      return 10;
    }
  },
  watch: {
    'instrumentConfig.mode': function() {
      this.updateBinning();
    },
    rotatorModeOptions: function() {
      if (this.instrumentHasRotatorModes) {
        this.instrumentConfig.rotator_mode = this.availableInstruments[this.selectedInstrument].modes.rotator.default;
      } else {
        this.instrumentConfig.rotator_mode = '';
      }
      this.update();
    },
    requiredRotatorModeFields: function(newValue, oldValue) {
      // TODO: Implement rotator mode and required rotator mode fields history
      const defaultRequiredFieldValue = 0;
      for (let idx in oldValue) {
        this.instrumentConfig.extra_params[oldValue[idx]] = undefined;
      }
      for (let idx in newValue) {
        this.instrumentConfig.extra_params[newValue[idx]] = defaultRequiredFieldValue;
      }
      this.update();
    },
    readoutModeOptions: function() {
      // TODO: Implement history
      this.instrumentConfig.mode = this.availableInstruments[this.selectedInstrument].modes.readout.default;
      this.updateBinning();
      this.update();
    },
    availableOpticalElementGroups: function(value) {
      // TODO: Implement optical element history
      this.instrumentConfig.optical_elements = {};
      if (this.simpleInterface) {
        this.instrumentConfig.optical_elements.filter = 'b';
      } else {
        for (let oe_type in value) {
          for (let oe_value_idx in value[oe_type]['options']) {
            if (value[oe_type]['options'][oe_value_idx].default) {
              this.instrumentConfig.optical_elements[oe_type] = value[oe_type]['options'][oe_value_idx].value;
            }
          }
        }
      }
      this.updateOpticalElement();
    },
    defocus: function(value) {
      this.instrumentConfig.extra_params.defocus = value || undefined;
      this.update();
    },
    exposure_time_g: function(value) {
      this.instrumentConfig.extra_params.exposure_time_g = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_r: function(value) {
      this.instrumentConfig.extra_params.exposure_time_r = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_i: function(value) {
      this.instrumentConfig.extra_params.exposure_time_i = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_z: function(value) {
      this.instrumentConfig.extra_params.exposure_time_z = value || undefined;
      this.updateExposureTime();
    },
    exposure_mode: function(value) {
      this.instrumentConfig.extra_params.exposure_mode = value || undefined;
      this.update();
    },
    selectedInstrument: function(value) {
      if (value === '2M0-SCICAM-MUSCAT') {
        this.instrumentConfig.extra_params.exposure_time_g = this.exposure_time_g = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_r = this.exposure_time_r = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_i = this.exposure_time_i = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_z = this.exposure_time_z = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_mode = this.exposure_mode = 'SYNCHRONOUS';
      } else {
        this.instrumentConfig.extra_params.exposure_time_g = undefined;
        this.instrumentConfig.extra_params.exposure_time_r = undefined;
        this.instrumentConfig.extra_params.exposure_time_i = undefined;
        this.instrumentConfig.extra_params.exposure_time_z = undefined;
        this.instrumentConfig.extra_params.exposure_mode = undefined;
      }
    },
    selectedInstrumentCategory: function(value) {
      if (value === 'IMAGE') {
        this.instrumentConfig.extra_params.defocus = this.defocus;
      } else {
        this.instrumentConfig.extra_params.defocus = undefined;
      }
      this.update();
    }
  },
  mounted: function() {
    // If a draft is loaded in that has any extra_params set, update the corresponding params
    // here since extra_params is not reactive and cannot be watched
    if (this.instrumentConfig.extra_params.defocus) {
      this.defocus = this.instrumentConfig.extra_params.defocus;
    }
    if (this.instrumentConfig.extra_params.exposure_time_g) {
      this.exposure_time_g = this.instrumentConfig.extra_params.exposure_time_g;
    }
    if (this.instrumentConfig.extra_params.exposure_time_r) {
      this.exposure_time_r = this.instrumentConfig.extra_params.exposure_time_r;
    }
    if (this.instrumentConfig.extra_params.exposure_time_i) {
      this.exposure_time_i = this.instrumentConfig.extra_params.exposure_time_i;
    }
    if (this.instrumentConfig.extra_params.exposure_time_z) {
      this.exposure_time_z = this.instrumentConfig.extra_params.exposure_time_z;
    }
    if (this.instrumentConfig.extra_params.exposure_mode) {
      this.exposure_mode = this.instrumentConfig.extra_params.exposure_mode;
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    update: function() {
      this.$emit('instrumentconfigupdate');
    },
    updateInstrumentConfigExtraParam: function(value, field) {
      if (value === '') {
        // Remove the field if an empty value is entered because the validation
        // for required extra params only check if the field exists
        this.instrumentConfig.extra_params[field] = undefined;
      }
      this.update();
    },
    updateExposureTime: function() {
      this.instrumentConfig.exposure_time = Math.max(
        this.instrumentConfig.extra_params.exposure_time_g,
        this.instrumentConfig.extra_params.exposure_time_r,
        this.instrumentConfig.extra_params.exposure_time_i,
        this.instrumentConfig.extra_params.exposure_time_z
      );

      this.update();
    },
    updateOpticalElement: function() {
      // The optical element fields are not reactive as they change/ are deleted/ don't exist on start.
      // Increment this reactive variable to watch for changed to the optical elements
      this.opticalElementUpdates += 1;
      this.update();
    },
    updateBinning: function() {
      for (let mode in this.readoutModeOptions) {
        if (this.instrumentConfig.mode === this.readoutModeOptions[mode].value) {
          this.instrumentConfig.bin_x = this.readoutModeOptions[mode].binning;
          this.instrumentConfig.bin_y = this.readoutModeOptions[mode].binning;
          this.update();
          return;
        }
      }
    }
  }
};
</script>
