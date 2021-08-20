<template>
  <b-form :id="id">
    <custom-field
      v-model="instrumentConfig.exposure_count"
      field="exposure_count"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_count', 'label'], 'Exposure Count')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_count', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_count', 'hide'], false)"
      type="number"
      :tooltip-config="tooltipConfig"
      :errors="errors.exposure_count"
      @input="update"
    />
    <custom-field
      v-model="instrumentConfig.exposure_time"
      field="exposure_time"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_time', 'label'], 'Exposure Time')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_time', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_time', 'hide'], false)"
      :tooltip-config="tooltipConfig"
      :errors="errors.exposure_time"
      @input="update"
    />
    <custom-select
      v-if="readoutModeOptions.length > 1"
      v-model="instrumentConfig.mode"
      field="readout_mode"
      :label="getFromObject(formConfig, ['instrumentConfig', 'readout_mode', 'label'], 'Readout Mode')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'readout_mode', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'readout_mode', 'hide'], false)"
      :options="readoutModeOptions"
      :tooltip-config="tooltipConfig"
      :errors="errors.mode"
      @input="update"
    />
    <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type" class="d-inline">
      <custom-select
        v-model="instrumentConfig.optical_elements[opticalElementGroup.type]"
        :field="opticalElementGroup.type"
        :label="getFromObject(formConfig, ['instrumentConfig', opticalElementGroup.type, 'label'], opticalElementGroup.label)"
        :desc="getFromObject(formConfig, ['instrumentConfig', opticalElementGroup.type, 'desc'], '')"
        :hide="getFromObject(formConfig, ['instrumentConfig', opticalElementGroup.type, 'hide'], false)"
        :options="opticalElementGroup.options"
        lower-options
        :tooltip-config="tooltipConfig"
        :errors="{}"
        @input="updateOpticalElement"
      />
    </div>
    <div v-if="rotatorModeOptions.length > 0" class="d-inline">
      <custom-select
        v-model="instrumentConfig.rotator_mode"
        field="rotator_mode"
        :label="getFromObject(formConfig, ['instrumentConfig', 'rotator_mode', 'label'], 'Rotator Mode')"
        :desc="getFromObject(formConfig, ['instrumentConfig', 'rotator_mode', 'desc'], '')"
        :hide="getFromObject(formConfig, ['instrumentConfig', 'rotator_mode', 'hide'], false)"
        :tooltip-config="tooltipConfig"
        :errors="errors.rotator_mode"
        :options="rotatorModeOptions"
        @input="update"
      />
      <!-- TODO: Validate required field values -->
      <custom-field
        v-for="field in requiredRotatorModeFields"
        :key="field"
        v-model="instrumentConfig.extra_params[field]"
        :label="getFromObject(formConfig, ['instrumentConfig', field, 'label'], field)"
        :desc="getFromObject(formConfig, ['instrumentConfig', field, 'desc'], '')"
        :hide="getFromObject(formConfig, ['instrumentConfig', field, 'desc'], false)"
        :tooltip-config="tooltipConfig"
        :errors="null"
        @input="updateInstrumentConfigExtraParam($event, field)"
      />
    </div>
    <custom-field
      v-model="offsetRA"
      field="offset-ra"
      :label="getFromObject(formConfig, ['instrumentConfig', 'offset_ra', 'label'], 'Offset RA')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'offset_ra', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'offset_ra', 'hide'], !ditheringIsAllowed)"
      :errors="null"
      @input="update"
    />
    <custom-field
      v-model="offsetDec"
      field="offset-dec"
      :label="getFromObject(formConfig, ['instrumentConfig', 'offset_dec', 'label'], 'Offset Dec')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'offset_dec', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'offset_dec', 'hide'], !ditheringIsAllowed)"
      :errors="null"
      @input="update"
    />
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
    id: {
      type: String,
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
    selectedInstrument: {
      type: String,
      required: true
    },
    instrumentConfig: {
      type: Object,
      required: true
    },
    // Boolean used to control whether fields for RA and Dec offsets used for dithering are displayed.
    ditheringIsAllowed: {
      type: Boolean
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
    formConfig: {
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
      offsetRA,
      offsetDec,
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      update,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    } = baseInstrumentConfig(instrumentConfig, availableInstruments, selectedInstrument, context);

    return {
      // Data
      offsetRA,
      offsetDec,
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      // Methods
      update,
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
