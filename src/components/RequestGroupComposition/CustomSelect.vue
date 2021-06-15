<template>
  <span v-if="!hide">
    <span class="text-right font-italic extra-help-text">
      <slot name="extra-help-text" />
    </span>
    <b-form-group
      v-show="$parent.show"
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
        <b-form-select
          :id="field + '-select-' + $parent.id"
          :value="value | toLowerCase(lowerOptions)"
          :state="validationState"
          :options="selectOptions"
          @input="onInput"
          @change="onChange"
        />
        <slot name="inline-input" />
      </b-input-group>
      <span v-for="error in errors" :key="error" class="errors text-danger">
        {{ error }}
      </span>
    </b-form-group>
    <span v-show="!$parent.show" class="mr-4">
      {{ label }}: <strong>{{ value || '...' }}</strong>
    </span>
  </span>
</template>
<script>
import _ from 'lodash';

import { defaultTooltipConfig } from '@/util';

export default {
  name: 'CustomSelect',
  filters: {
    toLowerCase: function(value, lowerOptions) {
      if (lowerOptions && _.isString(value)) {
        return _.toLower(value);
      }
      return value;
    }
  },
  props: {
    value: {
      validator: function(value) {
        return value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
      },
      required: true
    },
    label: {
      type: String,
      required: true
    },
    field: {
      type: String,
      default: function() {
        return _.kebabCase(this.label);
      }
    },
    hide: {
      type: Boolean
    },
    options: {
      type: Array,
      required: true
    },
    errors: {
      validator: function(value) {
        return value === null || typeof value === 'object';
      },
      default: function() {
        return null;
      }
    },
    desc: {
      type: String,
      default: ''
    },
    // Setting this to `true` will ensure that all string options that are passed in are lowercased
    lowerOptions: {
      type: Boolean
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
    selectOptions: function() {
      if (this.lowerOptions) {
        return _.mapValues(this.options, function(opt) {
          if (_.isString(opt.value)) {
            return { value: _.toLower(opt.value), text: opt.text };
          } else {
            return { value: opt.value, text: opt.text };
          }
        });
      } else {
        return this.options;
      }
    }
  },
  methods: {
    onInput: function(value) {
      this.$emit('input', value);
    },
    onChange: function(value) {
      this.$emit('change', value);
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
