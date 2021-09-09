<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['instrumentConfig', 'panel', 'hide'], false)"
    :id="'instrument-config' + position.requestIndex + position.configurationIndex + position.instrumentConfigIndex"
    :title="getFromObject(formConfig, ['instrumentConfig', 'panel', 'title'], 'Instrument Configuration')"
    :icon="getFromObject(formConfig, ['instrumentConfig', 'panel', 'icon'], 'fas fa-camera-retro')"
    :can-copy="getFromObject(formConfig, ['instrumentConfig', 'panel', 'canCopy'], true)"
    :can-remove="index > 0"
    :errors="errors"
    :show="show"
    :index="index"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in topLevelErrors" :key="error" alert-class="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="instrument-config-help" :data="{ instrumentConfig: instrumentConfig, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <slot
            name="instrument-config-form"
            :update="update"
            :data="{ instrumentConfig: instrumentConfig, ditheringIsAllowed: ditheringIsAllowed, errors: errors, show: show, position: position }"
          >
            <instrument-config-form
              :id="'instrument-config-form' + position.requestIndex + position.configurationIndex + position.instrumentConfigIndex"
              :show="show"
              :instrument-config="instrumentConfig"
              :dithering-is-allowed="ditheringIsAllowed"
              :selected-instrument="selectedInstrument"
              :available-instruments="availableInstruments"
              :errors="errors"
              :form-config="formConfig"
              @instrument-config-update="update"
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
import { extractTopLevelErrors, getFromObject } from '@/util';
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
    ditheringIsAllowed: {
      type: Boolean
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
  methods: {
    update: function() {
      this.$emit('instrumentconfigupdate', { position: this.position });
    },
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    }
  }
};
</script>
