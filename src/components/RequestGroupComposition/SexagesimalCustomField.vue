<template>
  <custom-field
    v-model="displayValue"
    :label="label"
    :field="field"
    :desc="desc"
    :hide="hide"
    :errors="errors"
    :tooltip-config="tooltipConfig"
    @blur="update($event)"
  >
    <div v-if="value" slot="extra-help-text">
      {{ helpText }}
    </div>
  </custom-field>
</template>
<script>
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import { decimalRaToSexigesimal, decimalDecToSexigesimal, sexagesimalRaToDecimal, sexagesimalDecToDecimal, defaultTooltipConfig } from '@/util';

export default {
  name: 'SexagesimalCustomField',
  components: {
    CustomField
  },
  props: {
    coordinate: {
      type: String,
      required: true,
      validator: value => {
        return ['ra', 'dec'].indexOf(value) > -1;
      }
    },
    // Decimal value of the coordinate
    value: {
      validator: function(value) {
        return value === null || value === undefined || typeof value === 'string' || typeof value === 'number';
      },
      required: true
    },
    field: {
      type: String,
      required: true
    },
    hide: {
      type: Boolean
    },
    // Whether to collaspe field to just display the value.
    collapse: {
      type: Boolean
    },
    label: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      default: ''
    },
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
    },
    errors: {
      validator: function(value) {
        return value === null || typeof value === 'object';
      },
      default: function() {
        return null;
      }
    }
  },
  data: function() {
    return {
      displayValue: this.value,
      helpText: this.getHelpText(this.value)
    };
  },
  computed: {
    show: function() {
      return !this.collapse;
    }
  },
  watch: {
    value: function(value) {
      // `value` will always be in decimal, but `displayValue` can be either in decimal or sexigesimal. Try to convert `displayValue` to
      // decimal, and compare that to `value` to decide whether they are the same or not - only update the `displayValue` if they are
      // different.
      let displayValueAsDecimal;
      if (this.coordinate === 'ra') {
        displayValueAsDecimal = sexagesimalRaToDecimal(this.displayValue);
      } else {
        displayValueAsDecimal = sexagesimalDecToDecimal(this.displayValue);
      }

      if (value !== displayValueAsDecimal) {
        this.displayValue = value;
        this.update();
      }
    }
  },
  methods: {
    update: function() {
      if (this.coordinate === 'ra') {
        this.$emit('input', sexagesimalRaToDecimal(this.displayValue));
      } else {
        this.$emit('input', sexagesimalDecToDecimal(this.displayValue));
      }
      this.helpText = this.getHelpText(this.displayValue);
    },
    getHelpText: function(coordValue) {
      if (this.coordinate === 'ra') {
        return this.getRaHelpText(coordValue);
      } else {
        return this.getDecHelpText(coordValue);
      }
    },
    getRaHelpText: function(coordValue) {
      if (isNaN(Number(coordValue))) {
        return 'Decimal: ' + Number(sexagesimalRaToDecimal(coordValue));
      } else {
        return 'Sexagesimal: ' + decimalRaToSexigesimal(coordValue).str;
      }
    },
    getDecHelpText: function(coordValue) {
      if (isNaN(Number(coordValue))) {
        return 'Decimal: ' + Number(sexagesimalDecToDecimal(coordValue));
      } else {
        return 'Sexagesimal: ' + decimalDecToSexigesimal(coordValue).str;
      }
    }
  }
};
</script>
