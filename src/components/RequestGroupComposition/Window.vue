<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['window', 'panel', 'hide'], false)"
    :id="'window' + position.requestIndex + position.windowIndex"
    :title="getFromObject(formConfig, ['window', 'panel', 'title'], 'Window')"
    :icon="getFromObject(formConfig, ['window', 'panel', 'icon'], 'fas fa-calendar')"
    :cancopy="getFromObject(formConfig, ['window', 'panel', 'canCopy'], true)"
    :canremove="index > 0"
    :errors="errors"
    :show="show"
    :index="index"
    :tooltip-config="tooltipConfig"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in topLevelErrors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="window-help" :data="{ window: window, position: position }"></slot>
          <template v-if="showAirmassPlot">
            <h4 v-show="showAirmass" class="text-center">
              Visibility
            </h4>
            <airmass-plot
              v-show="showAirmass"
              :data="airmassData"
              :site-code-to-color="siteCodeToColor"
              :site-code-to-name="siteCodeToName"
              show-zoom-controls
            />
          </template>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-datetime
              v-if="observationType !== 'RAPID_RESPONSE'"
              v-model="window.start"
              field="start"
              :label="getFromObject(formConfig, ['window', 'start', 'label'], 'Start')"
              :desc="getFromObject(formConfig, ['window', 'start', 'desc'], '')"
              :hide="getFromObject(formConfig, ['window', 'start', 'hide'], false)"
              :datetime-format="datetimeFormat"
              :tooltip-config="tooltipConfig"
              :errors="errors.start"
              @input="update"
            />
            <custom-datetime
              v-model="window.end"
              field="end"
              :label="getFromObject(formConfig, ['window', 'end', 'label'], 'End')"
              :desc="getFromObject(formConfig, ['window', 'end', 'desc'], '')"
              :hide="getFromObject(formConfig, ['window', 'end', 'hide'], false)"
              :datetime-format="datetimeFormat"
              :tooltip-config="tooltipConfig"
              :errors="errors.end"
              @input="update"
            />
            <custom-select
              v-model="cadence"
              field="cadence"
              :label="getFromObject(formConfig, ['window', 'cadence', 'label'], 'Cadence')"
              :desc="getFromObject(formConfig, ['window', 'cadence', 'desc'], '')"
              :hide="getFromObject(formConfig, ['window', 'cadence', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :options="[
                { text: 'None', value: 'none' },
                { text: 'Simple Period', value: 'simple' }
              ]"
            />
            <custom-field
              v-show="cadence === 'simple'"
              v-model="period"
              field="period"
              :label="getFromObject(formConfig, ['window', 'period', 'label'], 'Period')"
              :desc="getFromObject(formConfig, ['window', 'period', 'desc'], '')"
              :hide="getFromObject(formConfig, ['window', 'period', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.period"
              @input="update"
            />
            <custom-field
              v-show="cadence === 'simple'"
              v-model="jitter"
              field="jitter"
              :label="getFromObject(formConfig, ['window', 'jitter', 'label'], 'Jitter')"
              :desc="getFromObject(formConfig, ['window', 'jitter', 'desc'], '')"
              :hide="getFromObject(formConfig, ['window', 'jitter', 'hide'], false)"
              :tooltip-config="tooltipConfig"
              :errors="errors.jitter"
              @input="update"
            />
            <b-form-group
              v-show="cadence !== 'none' && show"
              label-size="sm"
              label-align-sm="right"
              label-cols-sm="4"
              label=""
              label-for="cadence-button"
            >
              <b-button id="cadence-button" block variant="outline-primary" @click="generateCadence">
                Generate Cadence
              </b-button>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </form-panel>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import CustomDatetime from '@/components/RequestGroupComposition/CustomDatetime.vue';
import AirmassPlot from '@/components/Plots/AirmassPlot.vue';

import { extractTopLevelErrors, getFromObject, defaultTooltipConfig, defaultDatetimeFormat } from '@/util.js';
import { collapseMixin } from '@/mixins/collapseMixins.js';

export default {
  name: 'Window',
  components: {
    CustomDatetime,
    CustomField,
    CustomSelect,
    FormPanel,
    CustomAlert,
    AirmassPlot
  },
  mixins: [collapseMixin],
  props: {
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    window: {
      type: Object,
      required: true
    },
    index: {
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
    // Mapping of 3-letter site code to CSS color
    siteCodeToColor: {
      type: Object,
      required: true
    },
    // Mapping of 3-letter site code to display name
    siteCodeToName: {
      type: Object,
      required: true
    },
    showAirmassPlot: {
      type: Boolean
    },
    parentshow: {
      type: Boolean
    },
    datetimeFormat: {
      type: String,
      default: defaultDatetimeFormat
    },
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
    },
    observationType: {
      type: String,
      required: true
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
      show: this.parentshow,
      airmassData: {},
      showAirmass: false,
      cadence: 'none',
      period: 24.0,
      jitter: 12.0,
      position: {
        requestIndex: this.requestIndex,
        windowIndex: this.index
      }
    };
  },
  computed: {
    topLevelErrors: function() {
      return extractTopLevelErrors(this.errors);
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    update: function() {
      this.$emit('window-updated');
    },
    generateCadence: function() {
      this.$emit('generate-cadence', {
        start: this.window.start,
        end: this.window.end,
        period: this.period,
        jitter: this.jitter
      });
    },
    updateAirmassPlot: function(req) {
      let request = _.cloneDeep(req);
      // Replace the window list with a single window with this start/end
      request['windows'] = [{ start: this.window.start, end: this.window.end }];
      $.ajax({
        type: 'POST',
        url: `${this.observationPortalApiBaseUrl}/api/airmass/`,
        data: JSON.stringify(request),
        contentType: 'application/json',
        success: data => {
          this.airmassData = data;
          this.showAirmass = 'airmass_limit' in data;
        }
      });
    }
  }
};
</script>
