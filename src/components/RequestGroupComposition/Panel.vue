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
                  <!-- TODO: The warning and success flicker on page load -->

                  <!-- TODO: This section -->
                  <!-- <i
                    v-show="hasError"
                    v-b-tooltip="tooltipConfig"
                    class="fas fa-exclamation-triangle fa-lg text-danger align-middle"
                    title="Errors in form"
                  /> -->
                  <!-- <i
                    v-show="!hasError"
                    v-b-tooltip="tooltipConfig"
                    class="fas fa-check fa-lg text-success align-middle"
                    title="Section is complete"
                  /> -->
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
                  <b-button v-show="cancopy" v-b-tooltip="tooltipConfig" size="sm" class="mx-1" variant="success" title="Copy" @click="copy">
                    <i class="fa fa-copy fa-fw" />
                  </b-button>
                  <b-button v-show="canremove" v-b-tooltip="tooltipConfig" variant="danger" title="Remove" size="sm" @click="remove">
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

// import { tooltipConfig } from '@/utils.js';

export default {
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
    canremove: {
      type: Boolean,
      required: true
    },
    cancopy: {
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
  data: function() {
    return {
      // tooltipConfig: tooltipConfig
    };
  },
  computed: {
    hasError: function() {
      return !_.isEmpty(this.errors);
    }
  },
  methods: {
    remove: function() {
      // TODO: Use modal instead

      if (confirm('Are you sure you want to remove this item?')) {
        this.$emit('remove');
      }
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
