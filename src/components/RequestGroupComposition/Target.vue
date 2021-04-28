<template>
  <form-panel
    v-if="!getFromObject(fieldHelp, ['target', 'panel', 'hide'], false)"
    :id="'target' + position.requestIndex + position.configurationIndex"
    :title="getFromObject(fieldHelp, ['target', 'panel', 'title'], 'Target')"
    :icon="getFromObject(fieldHelp, ['target', 'panel', 'icon'], 'fas fa-crosshairs')"
    :cancopy="false"
    :canremove="false"
    :show="show"
    :errors="errors"
    :tooltip-config="tooltipConfig"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="target-help" :data="{ target: target, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <slot name="target-name-field" :data="{ target: target, errors: errors.name, position: position }">
              <custom-field v-model="target.name" label="Name" field="name" :errors="errors.name" @input="update" />
            </slot>
            <slot name="target-type-field" :data="{ target: target, errors: errors.name, position: position }">
              <custom-select
                v-model="target.type"
                field="type"
                :label="getFromObject(fieldHelp, ['target', 'type', 'label'], 'Type')"
                :desc="getFromObject(fieldHelp, ['target', 'type', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'type', 'hide'], false)"
                :errors="errors.type"
                :tooltip-config="tooltipConfig"
                :options="targetTypeOptions"
                @input="update"
              />
            </slot>
            <span v-show="target.type === 'ICRS'" class="sidereal">
              <sexagesimal-custom-field
                v-model="target.ra"
                coordinate="ra"
                field="ra"
                :label="getFromObject(fieldHelp, ['target', 'ra', 'label'], 'Right Ascension')"
                :desc="getFromObject(fieldHelp, ['target', 'ra', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'ra', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.ra"
                @input="update"
              />
              <sexagesimal-custom-field
                v-model="target.dec"
                coordinate="dec"
                field="dec"
                :label="getFromObject(fieldHelp, ['target', 'dec', 'label'], 'Declination')"
                :desc="getFromObject(fieldHelp, ['target', 'dec', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'dec', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.dec"
                @input="update"
              />
              <custom-field
                v-model="target.proper_motion_ra"
                field="proper_motion_ra"
                :label="getFromObject(fieldHelp, ['target', 'proper_motion_ra', 'label'], 'Proper Motion RA')"
                :desc="getFromObject(fieldHelp, ['target', 'proper_motion_ra', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'proper_motion_ra', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.proper_motion_ra"
                @input="update"
              />
              <custom-field
                v-model="target.proper_motion_dec"
                field="proper_motion_dec"
                :label="getFromObject(fieldHelp, ['target', 'proper_motion_dec', 'label'], 'Proper Motion Dec')"
                :desc="getFromObject(fieldHelp, ['target', 'proper_motion_dec', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'proper_motion_dec', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.proper_motion_dec"
                @input="update"
              />
              <custom-field
                v-model="target.epoch"
                field="epoch"
                :label="getFromObject(fieldHelp, ['target', 'epoch', 'label'], 'Epoch')"
                :desc="getFromObject(fieldHelp, ['target', 'epoch', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'epoch', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.epoch"
                @input="update"
              />
              <custom-field
                v-model="target.parallax"
                field="parallax"
                :label="getFromObject(fieldHelp, ['target', 'parallax', 'label'], 'Parallax')"
                :desc="getFromObject(fieldHelp, ['target', 'parallax', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'parallax', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.parallax"
                @input="update"
              />
            </span>
            <span v-show="target.type === 'ORBITAL_ELEMENTS'" class="non-sidereal">
              <custom-select
                v-model="target.scheme"
                field="scheme"
                :label="getFromObject(fieldHelp, ['target', 'scheme', 'label'], 'Scheme')"
                :desc="getFromObject(fieldHelp, ['target', 'scheme', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'scheme', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.scheme"
                :options="nonSiderealSchemeOptions"
                @input="update"
              />
              <custom-field
                v-model="target.epochofel"
                field="epochofel"
                :label="getFromObject(fieldHelp, ['target', 'epochofel', 'label'], 'Epoch of Elements')"
                :desc="getFromObject(fieldHelp, ['target', 'epochofel', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'epochofel', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.epochofel"
                @input="update"
              />
              <custom-field
                v-model="target.orbinc"
                field="orbinc"
                :label="getFromObject(fieldHelp, ['target', 'orbinc', 'label'], 'Orbital Inclination')"
                :desc="getFromObject(fieldHelp, ['target', 'orbinc', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'orbinc', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.orbinc"
                @input="update"
              />
              <custom-field
                v-model="target.longascnode"
                field="longascnode"
                :label="getFromObject(fieldHelp, ['target', 'longascnode', 'label'], 'Longitude of Ascending Node')"
                :desc="getFromObject(fieldHelp, ['target', 'longascnode', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'longascnode', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.longascnode"
                @input="update"
              />
              <custom-field
                v-model="target.argofperih"
                field="argofperih"
                :label="getFromObject(fieldHelp, ['target', 'argofperih', 'label'], 'Argument of Perihelion')"
                :desc="getFromObject(fieldHelp, ['target', 'argofperih', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'argofperih', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.argofperih"
                @input="update"
              />
              <custom-field
                v-model="target.eccentricity"
                field="eccentricity"
                :label="getFromObject(fieldHelp, ['target', 'eccentricity', 'label'], 'Eccentricity')"
                :desc="getFromObject(fieldHelp, ['target', 'eccentricity', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'eccentricity', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.eccentricity"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'MPC_MINOR_PLANET' || target.scheme == 'JPL_MAJOR_PLANET'">
              <custom-field
                v-model="target.meandist"
                field="meandist"
                :label="getFromObject(fieldHelp, ['target', 'meandist', 'label'], 'Semimajor Axis')"
                :desc="getFromObject(fieldHelp, ['target', 'meandist', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'meandist', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.meandist"
                @input="update"
              />
              <custom-field
                v-model="target.meananom"
                field="meananom"
                :label="getFromObject(fieldHelp, ['target', 'meananom', 'label'], 'Mean Anomaly')"
                :desc="getFromObject(fieldHelp, ['target', 'meananom', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'meananom', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.meananom"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'JPL_MAJOR_PLANET'">
              <custom-field
                v-model="target.dailymot"
                field="dailymot"
                :label="getFromObject(fieldHelp, ['target', 'dailymot', 'label'], 'Daily Motion')"
                :desc="getFromObject(fieldHelp, ['target', 'dailymot', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'dailymot', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.dailymot"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'MPC_COMET'">
              <custom-field
                v-model="target.perihdist"
                field="perihdist"
                :label="getFromObject(fieldHelp, ['target', 'perihdist', 'label'], 'Perihelion Distance')"
                :desc="getFromObject(fieldHelp, ['target', 'perihdist', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'perihdist', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.perihdist"
                @input="update"
              />
              <custom-field
                v-model="target.epochofperih"
                field="epochofperih"
                :label="getFromObject(fieldHelp, ['target', 'epochofperih', 'label'], 'Epoch of Perihelion')"
                :desc="getFromObject(fieldHelp, ['target', 'epochofperih', 'desc'], '')"
                :hide="getFromObject(fieldHelp, ['target', 'epochofperih', 'hide'], false)"
                :tooltip-config="tooltipConfig"
                :errors="errors.epochofperih"
                @input="update"
              />
            </span>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </form-panel>
</template>
<script>
import _ from 'lodash';

import FormPanel from '@/components/RequestGroupComposition/FormPanel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import SexagesimalCustomField from '@/components/RequestGroupComposition/SexagesimalCustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import { collapseMixin } from '@/mixins/collapseMixins.js';
import { getFromObject, defaultTooltipConfig } from '@/util';

export default {
  name: 'Target',
  components: {
    CustomField,
    SexagesimalCustomField,
    CustomSelect,
    FormPanel,
    CustomAlert
  },
  mixins: [collapseMixin],
  props: {
    target: {
      type: Object,
      required: true
    },
    errors: {
      validator: function(value) {
        return value === null || typeof value === 'object';
      },
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
    parentshow: {
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
    let nonSiderealTargetParams = {
      scheme: 'MPC_MINOR_PLANET',
      orbinc: null,
      longascnode: null,
      argofperih: null,
      eccentricity: null,
      meandist: null,
      meananom: null,
      perihdist: null,
      epochofperih: null
    };
    let siderealTargetParams = _.cloneDeep(this.target);
    delete siderealTargetParams['name'];
    delete siderealTargetParams['type'];
    return {
      show: true,
      nonSiderealTargetParams: nonSiderealTargetParams,
      siderealTargetParams: siderealTargetParams,
      targetTypeOptions: [
        { value: 'ICRS', text: 'Sidereal' },
        { value: 'ORBITAL_ELEMENTS', text: 'Non-Sidereal' }
      ],
      nonSiderealSchemeOptions: [
        { value: 'MPC_MINOR_PLANET', text: 'MPC Minor Planet' },
        { value: 'MPC_COMET', text: 'MPC Comet' },
        { value: 'JPL_MAJOR_PLANET', text: 'JPL Major Planet' }
      ],
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.configurationIndex
      }
    };
  },
  watch: {
    'target.type': function(value) {
      if (value === 'ICRS') {
        for (let x in this.nonSiderealTargetParams) {
          this.nonSiderealTargetParams[x] = this.target[x];
          this.target[x] = undefined;
        }
        for (let y in this.siderealTargetParams) {
          this.target[y] = this.siderealTargetParams[y];
        }
      } else if (value === 'ORBITAL_ELEMENTS') {
        for (let z in this.siderealTargetParams) {
          this.siderealTargetParams[z] = this.target[z];
          this.target[z] = undefined;
        }
        for (let a in this.nonSiderealTargetParams) {
          this.target[a] = this.nonSiderealTargetParams[a];
        }
      }
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return getFromObject(obj, path, defaultValue);
    },
    update: function() {
      this.$emit('target-updated', {});
    }
  }
};
</script>