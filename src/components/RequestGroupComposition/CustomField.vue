<template>
  <span v-if="!hide">
    <span v-if="$parent.show" class="text-right font-italic extra-help-text">
      <slot name="extra-help-text" />
    </span>
    <b-form-group
      v-if="$parent.show"
      :id="field + '-fieldgroup-' + $parent.id"
      label-size="sm"
      label-align-sm="right"
      label-cols-sm="4"
      :label-for="field"
    >
      <template slot="label">
        {{ label }}
        <sup v-if="desc" v-b-tooltip="tooltipConfig" class="text-primary" :title="desc">
          ?
        </sup>
      </template>
      <b-input-group>
        <b-form-input
          :id="field + '-field-' + $parent.id"
          :value="value"
          :state="validationState"
          :type="type"
          @input="update($event)"
          @blur="blur($event)"
        />
        <slot name="inline-input" />
      </b-input-group>
      <span v-for="error in errors" :key="error" class="errors text-danger">
        {{ error }}
      </span>
    </b-form-group>
    <span v-if="!hideWhenCollapsed && !$parent.show" class="mr-4" :class="collapsedValidationStyle">
      {{ label }}: <strong>{{ displayValue(value) }}</strong>
    </span>
  </span>
</template>
<script>
import _ from 'lodash';

import { defaultTooltipConfig } from '@/util';

export default {
  name: 'CustomField',
  props: {
    value: {
      validator: function(value) {
        return value === null || value === undefined || typeof value === 'string' || typeof value === 'number';
      },
      required: true
    },
    label: {
      type: String,
      required: true
    },
    hide: {
      type: Boolean
    },
    // Hide this field when collapsed
    hideWhenCollapsed: {
      type: Boolean
    },
    field: {
      type: String,
      default: function() {
        return _.kebabCase(this.label);
      }
    },
    errors: {
      validator: function(value) {
        return value === null || typeof value === 'object';
      },
      default: function() {
        return null;
      }
    },
    type: {
      type: String,
      default: 'text'
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
    }
  },
  computed: {
    hasErrors: function() {
      return !_.isEmpty(this.errors);
    },
    validationState: function() {
      if (this.errors === null) {
        // No validation displayed
        return null;
      } else if (this.hasErrors) {
        return false;
      } else {
        return null;
      }
    },
    collapsedValidationStyle: function() {
      return {
        'text-danger': this.validationState === null ? false : true
      };
    }
  },
  methods: {
    displayValue: function(value) {
      if (value === 0) {
        return '0';
      } else if (value === '' || value === null) {
        return '...';
      } else {
        return value;
      }
    },
    update: function(value) {
      this.$emit('input', value);
    },
    blur: function(value) {
      this.$emit('blur', value);
    }
  }
};
</script>
<style scoped>
.errors {
  font-size: 90%;
}
.extra-help-text,
.extra-help-text div {
  font-size: 90%;
  margin-left: auto !important;
  max-width: 220px;
}
</style>
