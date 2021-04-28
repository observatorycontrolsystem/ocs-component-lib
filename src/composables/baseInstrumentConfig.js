import _ from 'lodash';
import { ref, computed, watch } from '@vue/composition-api';

export default function baseInstrumentConfig(instrumentConfig, availableInstruments, selectedInstrument) {
  const opticalElementUpdates = ref(0);

  const updateOpticalElement = () => {
    // The optical element fields are not reactive as they change/ are deleted/ don't exist on start.
    // Increment this reactive variable to watch for changed to the optical elements
    opticalElementUpdates.value += 1;
  };

  const updateInstrumentConfigExtraParam = (value, field) => {
    if (value === '') {
      // Remove the field if an empty value is entered because the validation
      // for required extra params only check if the field exists
      instrumentConfig.value.extra_params[field] = undefined;
    }
  };

  const updateBinning = () => {
    for (let mode in readoutModeOptions.value) {
      if (instrumentConfig.value.mode === readoutModeOptions.value[mode].value) {
        instrumentConfig.value.bin_x = readoutModeOptions.value[mode].binning;
        instrumentConfig.value.bin_y = readoutModeOptions.value[mode].binning;
      }
    }
  };

  const hasModes = modeType => {
    return modeType in _.get(availableInstruments.value, [selectedInstrument.value, 'modes'], {});
  };

  const readoutModeOptions = computed(() => {
    let readoutModes = [];
    if (selectedInstrument.value in availableInstruments.value && hasModes('readout')) {
      for (let rm in availableInstruments.value[selectedInstrument.value].modes.readout.modes) {
        readoutModes.push({
          text: availableInstruments.value[selectedInstrument.value].modes.readout.modes[rm].name,
          value: availableInstruments.value[selectedInstrument.value].modes.readout.modes[rm].code,
          binning: availableInstruments.value[selectedInstrument.value].modes.readout.modes[rm].validation_schema.bin_x.default
        });
      }
    }
    return readoutModes;
  });

  const rotatorModeOptions = computed(() => {
    let options = [];
    let requiredModeFields = [];
    if (hasModes('rotator')) {
      let modes = _.get(availableInstruments.value, [selectedInstrument.value, 'modes', 'rotator', 'modes'], []);
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
  });

  const requiredRotatorModeFields = computed(() => {
    for (let i in rotatorModeOptions.value) {
      if (rotatorModeOptions.value[i].value == instrumentConfig.value.rotator_mode) {
        return rotatorModeOptions.value[i].requiredFields;
      }
    }
    return [];
  });

  const availableOpticalElementGroups = computed(() => {
    if (selectedInstrument.value in availableInstruments.value) {
      let oe_groups = {};
      for (let oe_group_type in availableInstruments.value[selectedInstrument.value].optical_elements) {
        // Each optical element group type has an 's' on the end, but the optical element that is
        // submitted in the optical_elements should have a key that is the same as a group, without the 's'
        let oe_type = oe_group_type.substring(0, oe_group_type.length - 1);
        oe_groups[oe_type] = {};
        oe_groups[oe_type]['type'] = oe_type;
        oe_groups[oe_type]['label'] = _.capitalize(oe_type)
          .split('_')
          .join(' ');
        let elements = [];
        for (let element in availableInstruments.value[selectedInstrument.value].optical_elements[oe_group_type]) {
          if (availableInstruments.value[selectedInstrument.value].optical_elements[oe_group_type][element].schedulable) {
            elements.push({
              value: availableInstruments.value[selectedInstrument.value].optical_elements[oe_group_type][element].code,
              text: availableInstruments.value[selectedInstrument.value].optical_elements[oe_group_type][element].name,
              default: availableInstruments.value[selectedInstrument.value].optical_elements[oe_group_type][element].default
            });
          }
        }
        oe_groups[oe_type]['options'] = _.sortBy(elements, 'text');
      }
      return oe_groups;
    } else {
      return [];
    }
  });

  watch(
    () => instrumentConfig.value.mode,
    () => {
      updateBinning();
    }
  );

  watch(readoutModeOptions, () => {
    // TODO: implement history
    if (hasModes('readout')) {
      instrumentConfig.value.mode = availableInstruments.value[selectedInstrument.value].modes.readout.default;
      updateBinning();
    }
  });

  watch(rotatorModeOptions, () => {
    if (hasModes('rotator')) {
      instrumentConfig.value.rotator_mode = availableInstruments.value[selectedInstrument.value].modes.rotator.default;
    } else {
      instrumentConfig.value.rotator_mode = '';
    }
  });

  watch(requiredRotatorModeFields, (newValue, oldValue) => {
    // TODO: Implement rotator mode and required rotator mode fields history
    const defaultRequiredFieldValue = 0;
    for (let idx in oldValue) {
      instrumentConfig.value.extra_params[oldValue[idx]] = undefined;
    }
    for (let idx in newValue) {
      instrumentConfig.value.extra_params[newValue[idx]] = defaultRequiredFieldValue;
    }
  });

  watch(availableOpticalElementGroups, value => {
    // TODO: Implement optical element history
    instrumentConfig.value.optical_elements = {};
    for (let oe_type in value) {
      for (let oe_value_idx in value[oe_type]['options']) {
        if (value[oe_type]['options'][oe_value_idx].default) {
          instrumentConfig.value.optical_elements[oe_type] = value[oe_type]['options'][oe_value_idx].value;
        }
      }
    }
    updateOpticalElement();
  });

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
}