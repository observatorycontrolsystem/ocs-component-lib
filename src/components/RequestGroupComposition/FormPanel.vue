<template>
  <b-container class="p-0">
    <b-form-row :id="id">
      <b-col>
        <b-card no-body>
          <b-card-header class="p-2">
            <b-container class="p-0">
              <b-form-row>
                <b-col class="text-left">
                  <i class="align-middle fa-lg mx-2" :class="icon" />
                  <i
                    v-show="hasError"
                    v-b-tooltip="tooltipConfig"
                    class="fas fa-exclamation-triangle fa-lg text-danger align-middle"
                    title="Errors in form"
                  />
                  <i
                    v-show="!hasError"
                    v-b-tooltip="tooltipConfig"
                    class="fas fa-check fa-lg text-success align-middle"
                    title="Section is complete"
                  />
                </b-col>
                <b-col class="text-center">
                  <h6>
                    {{ title }} <span v-if="index > 0">#{{ index + 1 }}</span>
                  </h6>
                </b-col>
                <b-col class="text-right">
                  <b-button
                    v-b-toggle.collapse-1
                    v-b-tooltip="tooltipConfig"
                    size="sm"
                    variant="primary"
                    :title="show ? 'Minimize' : 'Maximize'"
                    @click="clickShow"
                  >
                    <i class="far" :class="show ? 'fa-window-minimize' : 'fa-window-maximize'" />
                  </b-button>
                  <b-button v-show="canCopy" v-b-tooltip="tooltipConfig" size="sm" class="mx-1" variant="success" title="Copy" @click="copy">
                    <i class="fa fa-copy fa-fw" />
                  </b-button>
                  <b-button
                    v-show="canRemove"
                    v-b-tooltip="tooltipConfig"
                    variant="danger"
                    title="Remove"
                    size="sm"
                    @click="confirm('Are you sure you want to remove this item?', remove)"
                  >
                    <i class="fa fa-trash fa-fw" />
                  </b-button>
                </b-col>
              </b-form-row>
            </b-container>
          </b-card-header>
          <b-card-body class="p-3">
            <slot :show="show" />
          </b-card-body>
        </b-card>
      </b-col>
    </b-form-row>
  </b-container>
</template>
<script>
import _ from 'lodash';
import { inject } from '@vue/composition-api';

import { defaultTooltipConfig } from '@/util';
import { confirmMixin } from '@/mixins/confirmMixins';

export default {
  name: 'FormPanel',
  mixins: [confirmMixin],
  props: {
    id: {
      type: String,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    },
    canRemove: {
      type: Boolean,
      required: true
    },
    canCopy: {
      type: Boolean,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      default: 0
    }
  },
  setup: function() {
    const tooltipConfig = inject(
      'tooltipConfig',
      () => {
        return defaultTooltipConfig;
      },
      true
    );
    return { tooltipConfig };
  },
  computed: {
    hasError: function() {
      return !_.isEmpty(this.errors);
    }
  },
  methods: {
    remove: function() {
      this.$emit('remove');
    },
    copy: function() {
      this.$emit('copy');
    },
    clickShow: function() {
      this.$emit('show', !this.show);
    }
  }
};
</script>
