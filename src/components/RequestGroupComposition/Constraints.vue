<template>
  <panel
    :id="'constraints' + position.requestIndex + position.configurationIndex"
    :show="show"
    :errors="errors"
    :canremove="false"
    :cancopy="false"
    icon="fas fa-lock"
    title="Constraints"
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
              label="Maximum Airmass"
              field="max_airmass"
              :errors="errors.max_airmass"
              desc="Maximum acceptable airmass at which the observation can be scheduled. A plane-parallel atmosphere is assumed."
              @input="update"
            />
            <custom-field
              v-model="constraints.min_lunar_distance"
              label="Minimum Lunar Separation"
              field="min_lunar_distance"
              :errors="errors.min_lunar_distance"
              desc="Minimum acceptable angular separation (degrees) between the target and the moon."
              @input="update"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </panel>
</template>
<script>
import Panel from '@/components/RequestGroupComposition/Panel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';

import { collapseMixin } from '@/mixins/collapseMixins.js';

export default {
  components: {
    CustomField,
    Panel,
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
    parentshow: {
      type: Boolean
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
    update: function() {
      this.$emit('constraintsupdate');
    }
  }
};
</script>
