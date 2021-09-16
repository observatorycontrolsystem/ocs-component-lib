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
  </b-form>
</template>
<script>
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import baseConstraints from '@/composables/baseConstraints.js';
import { getFromObject } from '@/util';

export default {
  name: 'Constraints',
  components: {
    CustomField
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
