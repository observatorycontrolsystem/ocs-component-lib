<template>
  <b-form>
    <custom-field
      v-model="instrumentConfig.exposure_count"
      field="exposure_count"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'label'], 'Exposure Count')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'desc'], '')"
      :hide="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'hide'], false)"
      type="number"
      :tooltip-config="tooltipConfig"
      :errors="errors.exposure_count"
    />
    <custom-field
      v-model="instrumentConfig.exposure_time"
      field="exposure_time"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'label'], 'Exposure Time')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'desc'], '')"
      :hide="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'hide'], false)"
      :tooltip-config="tooltipConfig"
      :errors="errors.exposure_time"
    />
    <custom-select
      v-if="readoutModeOptions.length > 1"
      v-model="instrumentConfig.mode"
      field="readout_mode"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'label'], 'Readout Mode')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'desc'], '')"
      :hide="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'hide'], false)"
      :options="readoutModeOptions"
      :tooltip-config="tooltipConfig"
      :errors="errors.mode"
    />
    <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type">
      <custom-select
        v-model="instrumentConfig.optical_elements[opticalElementGroup.type]"
        :field="opticalElementGroup.type"
        :label="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'label'], opticalElementGroup.label)"
        :desc="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'desc'], '')"
        :hide="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'hide'], false)"
        :options="opticalElementGroup.options"
        lower-options
        :tooltip-config="tooltipConfig"
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
        :hide="getFromObject(fieldHelp, ['instrumentConfig', 'rotator_mode', 'hide'], false)"
        :tooltip-config="tooltipConfig"
        :errors="errors.rotator_mode"
        :options="rotatorModeOptions"
      />
      <!-- TODO: Validate required field values -->
      <custom-field
        v-for="field in requiredRotatorModeFields"
        :key="field"
        v-model="instrumentConfig.extra_params[field]"
        :label="getFromObject(fieldHelp, ['instrumentConfig', field, 'label'], field)"
        :desc="getFromObject(fieldHelp, ['instrumentConfig', field, 'desc'], '')"
        :hide="getFromObject(fieldHelp, ['instrumentConfig', field, 'desc'], false)"
        :tooltip-config="tooltipConfig"
        :errors="null"
        @input="updateInstrumentConfigExtraParam($event, field)"
      />
    </div>
  </b-form>
</template>
<script>
import { toRef } from '@vue/composition-api';

import baseInstrumentConfig from '@/composables/baseInstrumentConfig.js';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import { getFromObject, defaultTooltipConfig } from '@/util';

export default {
  name: 'InstrumentConfigForm',
  components: {
    CustomField,
    CustomSelect
  },
  props: {
    errors: {
      type: Object,
      required: true
    },
    availableInstruments: {
      type: Object,
      required: true
    },
    selectedInstrument: {
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
  setup: function(props, context) {
    const instrumentConfig = toRef(props, 'instrumentConfig');
    const availableInstruments = toRef(props, 'availableInstruments');
    const selectedInstrument = toRef(props, 'selectedInstrument');

    const {
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      updateBinning,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    } = baseInstrumentConfig(instrumentConfig, availableInstruments, selectedInstrument, context);

    return {
      // Data
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      // Methods
      updateBinning,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    };
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    }
  }
};
</script>