<template>
  <custom-field v-model="displayValue" :label="label" :field="field" :desc="desc" :errors="errors" @blur="update($event)">
    <div v-if="value" slot="extra-help-text">
      {{ helpText }}
    </div>
  </custom-field>
</template>
<script>
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import { decimalRaToSexigesimal, decimalDecToSexigesimal, sexagesimalRaToDecimal, sexagesimalDecToDecimal } from '@/util';

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
    label: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      default: ''
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
      show: this.$parent.show,
      displayValue: this.value,
      helpText: this.getHelpText(this.value)
    };
  },
  watch: {
    value: function(value) {
      this.displayValue = value;
      this.update();
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
