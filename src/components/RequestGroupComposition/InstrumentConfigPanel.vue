<template>
  <form-panel
    v-if="!getFromObject(fieldHelp, ['instrumentConfig', 'panel', 'hide'], false)"
    :id="'instrument-config' + position.requestIndex + position.configurationIndex + position.instrumentConfigIndex"
    :title="getFromObject(fieldHelp, ['instrumentConfig', 'panel', 'title'], 'Instrument Configuration')"
    :icon="getFromObject(fieldHelp, ['instrumentConfig', 'panel', 'icon'], 'fas fa-camera-retro')"
    :cancopy="getFromObject(fieldHelp, ['instrumentConfig', 'panel', 'canCopy'], true)"
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
          <slot name="instrument-config-help" :data="{ instrumentConfig: instrumentConfig, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <slot name="instrument-config-form" :data="{ instrumentConfig: instrumentConfig, errors: errors, show: show, position: position }">
            <instrument-config-form
              :show="show"
              :instrument-config="instrumentConfig"
              :selected-instrument="selectedInstrument"
              :available-instruments="availableInstruments"
              :errors="errors"
              :tooltip-config="tooltipConfig"
              :field-help="fieldHelp"
            />
          </slot>
        </b-col>
      </b-row>
    </b-container>
  </form-panel>
</template>
<script>
import InstrumentConfigForm from '@//components/RequestGroupComposition/InstrumentConfigForm.vue';
import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import { extractTopLevelErrors, getFromObject, defaultTooltipConfig } from '@/util';
import { collapseMixin } from '@/mixins/collapseMixins.js';

export default {
  name: 'InstrumentConfigPanel',
  components: {
    FormPanel,
    CustomAlert,
    InstrumentConfigForm
  },
  mixins: [collapseMixin],
  props: {
    errors: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
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
    availableInstruments: {
      type: Object,
      required: true
    },
    selectedInstrument: {
      type: String,
      required: true
    },
    instrumentConfig: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean
    },
    tooltipConfig: {
      type: Object,
      default: () => {
        return defaultTooltipConfig;
      }
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
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.configurationIndex,
        instrumentConfigIndex: this.index
      }
    };
  },
  computed: {
    topLevelErrors: function() {
      return extractTopLevelErrors(this.errors);
    }
  },
  watch: {
    instrumentConfig: {
      deep: true,
      handler: function() {
        this.$emit('instrumentconfigupdate', { position: this.position });
      }
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    }
  }
};
</script>
