<template>
  <b-form :id="id">
    <custom-field
      v-model="constraints.max_airmass"
      field="max_airmass"
      :label="getFromObject(formConfig, ['constraints', 'max_airmass', 'label'], 'Maximum Airmass')"
      :desc="getFromObject(formConfig, ['constraints', 'max_airmass', 'desc'], '')"
      :hide="getFromObject(formConfig, ['constraints', 'max_airmass', 'hide'], false)"
      :errors="errors.max_airmass"
      @input="update"
    />
    <custom-field
      v-model="constraints.min_lunar_distance"
      field="min_lunar_distance"
      :label="getFromObject(formConfig, ['constraints', 'min_lunar_distance', 'label'], 'Minimum Lunar Separation')"
      :desc="getFromObject(formConfig, ['constraints', 'min_lunar_distance', 'desc'], '')"
      :hide="getFromObject(formConfig, ['constraints', 'min_lunar_distance', 'hide'], false)"
      :errors="errors.min_lunar_distance"
      @input="update"
    />
    <custom-field
      v-model="constraints.max_lunar_phase"
      field="max_lunar_phase"
      :label="getFromObject(formConfig, ['constraints', 'max_lunar_phase', 'label'], 'Maximum Lunar Phase')"
      :desc="getFromObject(formConfig, ['constraints', 'max_lunar_phase', 'desc'], '')"
      :hide="getFromObject(formConfig, ['constraints', 'max_lunar_phase', 'hide'], false)"
      :errors="errors.max_lunar_phase"
      @input="update"
    />
    <custom-select
      v-model="constraints.max_seeing"
      field="max_seeing"
      :label="getFromObject(formConfig, ['constraints', 'max_seeing', 'label'], 'Maximum Seeing')"
      :desc="getFromObject(formConfig, ['constraints', 'max_seeing', 'desc'], '')"
      :hide="getFromObject(formConfig, ['constraints', 'max_seeing', 'hide'], false)"
      :options="availableSeeingOptions"
      :errors="errors.max_seeing"
      @input="update"
    />
    <custom-field
      v-model="constraints.min_transparency"
      field="min_transparency"
      :label="getFromObject(formConfig, ['constraints', 'min_transparency', 'label'], 'Minimum Transparency')"
      :desc="getFromObject(formConfig, ['constraints', 'min_transparency', 'desc'], '')"
      :hide="getFromObject(formConfig, ['constraints', 'min_transparency', 'hide'], false)"
      :errors="errors.min_transparency"
      @input="update"
    />
  </b-form>
</template>
<script>
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import baseConstraints from '@/composables/baseConstraints.js';
import { getFromObject } from '@/util';

export default {
  name: 'Constraints',
  components: {
    CustomField,
    CustomSelect
  },
  props: {
    id: {
      type: String,
      required: true
    },
    constraints: {
      type: Object,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean
    },
    availableSeeingOptions: {
      type: Array,
      default: () => {
        return [];
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
    const { update } = baseConstraints(context);
    return { update };
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    }
  }
};
</script>
