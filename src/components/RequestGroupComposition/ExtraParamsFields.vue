<template>
  <span>
    <span v-for="field in fields" :key="field.field">
      <custom-field
        v-if="!field.options && field.show"
        v-model="extraParams[field.field]"
        :field="field.field"
        :type="field.type"
        :errors="fieldError(field.field)"
        :label="field.label"
        :desc="field.description"
        :hide="!show"
        hide-when-collapsed
        @input="update"
      >
      </custom-field>
      <custom-select
        v-if="field.options && field.show"
        v-model="extraParams[field.field]"
        :field="field.field"
        :options="field.options"
        :errors="fieldError(field.field)"
        :label="field.label"
        :desc="field.description"
        :hide="!show"
        hide-when-collapsed
        @input="update"
      >
      </custom-select>
    </span>
  </span>
</template>
<script>
import _ from 'lodash';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';

export default {
  name: 'ExtraParamsFields',
  components: {
    CustomField,
    CustomSelect,
  },
  props: {
    extraParams: {
      type: Object,
      default: () => {
        return {};
      }
    },
    validationSchema: {
      type: Object,
      default: () => {
        return {};
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
    hide: {
      type: Boolean
    },
    parentShow: {
      type: Boolean
    }
  },
  data: function() {
    return {
      show: this.parentShow
    };
  },
  watch: {
    validationSchema: function() {
      // When the validation schema changes, this means the selected instrument type has changed
      // Clear the extra_params section and set any default values in the schema here
      var cleanedExtraParams = {};
      for (let fieldIndex in this.fields) {
        let field = this.fields[fieldIndex];
        if (field.default) {
          cleanedExtraParams[field.field] = field.default;
        }
      }
      // Add some other extra_params fields that are handled separately back into the config if they were there
      let separate_params = ['offset_ra', 'offset_dec'];
      for (let index in separate_params) {
        if (separate_params[index] in this.extraParams) {
          cleanedExtraParams[separate_params[index]] = this.extraParams[separate_params[index]]
        }
      }
      this.$emit("update:extraParams", cleanedExtraParams);
      console.log("Schema changed!")
    }
  },
  computed: {
    fields: function() {
      var extraParamsFields = [];
      if (this.validationSchema) {
        if (this.validationSchema.schema) {
          for (const [field, schema] of Object.entries(this.validationSchema.schema)) {
            var extraParamsField = {
              'field': field,
              'type': this.typeMapping(schema.type),
              'description': schema.description,
              'label': schema.label || _.capitalize(field).split('_').join(' '),
              'show': schema.show || true,
              'default': schema.default,
              'min': schema.min,
              'max': schema.max,
              'options': schema.allowed,
              'required': schema.required || false
            };
            extraParamsFields.push(extraParamsField);
          }
        }
      }
      return extraParamsFields;
    }
  },
  methods: {
    fieldError: function(field) {
      if (this.errors){
        return this.errors[field]
      }
      return null
    },
    update: function() {
      this.$emit("extraparamsupdate");
    },
    typeMapping: function(type) {
      if (type == 'string') {
        return 'text';
      }
      else if(type == 'float' || type == 'integer') {
        return 'number';
      }
      return type;
    }
  }
};
</script>
<style scoped>
</style>
