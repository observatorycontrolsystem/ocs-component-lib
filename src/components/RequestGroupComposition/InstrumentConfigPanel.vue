<template>
  <form-panel
    :id="'instrument-config' + position.requestIndex + position.configurationIndex + position.instrumentConfigIndex"
    :show="show"
    title="Instrument Configuration"
    icon="fas fa-camera-retro"
    :index="index"
    :errors="errors"
    :canremove="index > 0"
    :cancopy="true"
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
import { extractTopLevelErrors } from '@/util';
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
  }
};
</script>
