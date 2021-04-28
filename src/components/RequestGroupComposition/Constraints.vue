<template>
  <form-panel
    v-if="!getFromObject(fieldHelp, ['constraints', 'panel', 'hide'], false)"
    :id="'constraints' + position.requestIndex + position.configurationIndex"
    :title="getFromObject(fieldHelp, ['constraints', 'panel', 'title'], 'Constraints')"
    :icon="getFromObject(fieldHelp, ['constraints', 'panel', 'icon'], 'fas fa-lock')"
    :cancopy="false"
    :canremove="false"
    :errors="errors"
    :show="show"
    :tooltip-config="tooltipConfig"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="constraints-help" :data="{ constraints: constraints, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field
              v-model="constraints.max_airmass"
              field="max_airmass"
              :label="getFromObject(fieldHelp, ['constraints', 'max_airmass', 'label'], 'Maximum Airmass')"
              :desc="getFromObject(fieldHelp, ['constraints', 'max_airmass', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['constraints', 'max_airmass', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.max_airmass"
              @input="update"
            />
            <custom-field
              v-model="constraints.min_lunar_distance"
              field="min_lunar_distance"
              :label="getFromObject(fieldHelp, ['constraints', 'min_lunar_distance', 'label'], 'Minimum Lunar Separation')"
              :desc="getFromObject(fieldHelp, ['constraints', 'min_lunar_distance', 'desc'], '')"
              :hide="getFromObject(fieldHelp, ['constraints', 'min_lunar_distance', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.min_lunar_distance"
              @input="update"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </form-panel>
</template>
<script>
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';

import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig } from '@/util';

export default {
  name: 'Constraints',
  components: {
    CustomField,
    FormPanel,
    CustomAlert
  },
  mixins: [collapseMixin],
  props: {
    constraints: {
      type: Object,
      required: true
    },
    configurationIndex: {
      type: Number,
      required: true
    },
    requestIndex: {
      type: Number,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
    },
    parentshow: {
      type: Boolean
    },
    fieldHelp: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data: function() {
    return {
      show: true,
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.configurationIndex
      }
    };
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    update: function() {
      this.$emit('constraintsupdate');
    }
  }
};
</script>
