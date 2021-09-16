<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['constraints', 'panel', 'hide'], false)"
    :id="'constraints' + position.requestIndex + position.configurationIndex"
    :title="getFromObject(formConfig, ['constraints', 'panel', 'title'], 'Constraints')"
    :icon="getFromObject(formConfig, ['constraints', 'panel', 'icon'], 'fas fa-lock')"
    :can-copy="false"
    :can-remove="false"
    :errors="errors"
    :show="show"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alert-class="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="constraints-help" :data="{ constraints: constraints, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <slot name="constraints-form" :update="update" :data="{ constraints: constraints, errors: errors, show: show, position: position }">
            <constraints-form
              :id="'constraints-form' + position.requestIndex + position.configurationIndex"
              :show="show"
              :constraints="constraints"
              :errors="errors"
              :form-config="formConfig"
              @constraints-update="update"
            />
          </slot>
        </b-col>
      </b-row>
    </b-container>
  </form-panel>
</template>
<script>
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import ConstraintsForm from '@/components/RequestGroupComposition/ConstraintsForm.vue';

import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject } from '@/util';

export default {
  name: 'Constraints',
  components: {
    FormPanel,
    ConstraintsForm
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
    parentShow: {
      type: Boolean
    },
    formConfig: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data: function() {
    return {
      show: this.parentShow,
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
      this.$emit('constraints-update');
    }
  }
};
</script>
