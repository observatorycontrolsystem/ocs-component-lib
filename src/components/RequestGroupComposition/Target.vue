<template>
  <form-panel
    v-if="!getFromObject(formConfig, ['target', 'panel', 'hide'], false)"
    :id="'target' + position.requestIndex + position.configurationIndex"
    :title="getFromObject(formConfig, ['target', 'panel', 'title'], 'Target')"
    :icon="getFromObject(formConfig, ['target', 'panel', 'icon'], 'fas fa-crosshairs')"
    :can-copy="false"
    :can-remove="false"
    :show="show"
    :errors="errors"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alert-class="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="target-help" :data="{ target: target, position: position }"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <slot name="target-name-field" :update="update" :data="{ target: target, errors: errors.name, position: position }">
              <custom-field v-model="target.name" label="Name" field="name" :errors="errors.name" @input="update" />
            </slot>
            <custom-select
              v-model="target.type"
              field="type"
              :label="getFromObject(formConfig, ['target', 'type', 'label'], 'Type')"
              :desc="getFromObject(formConfig, ['target', 'type', 'desc'], '')"
              :hide="getFromObject(formConfig, ['target', 'type', 'hide'], false)"
              :errors="errors.type"
              :options="targetTypeOptions"
              @input="update"
            />
            <span v-show="target.type === 'ICRS'" class="sidereal">
              <sexagesimal-custom-field
                v-model="target.ra"
                coordinate="ra"
                field="ra"
                :label="getFromObject(formConfig, ['target', 'ra', 'label'], 'Right Ascension')"
                :desc="getFromObject(formConfig, ['target', 'ra', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'ra', 'hide'], false)"
                :collapse="!show"
                :errors="errors.ra"
                @input="update"
              />
              <sexagesimal-custom-field
                v-model="target.dec"
                coordinate="dec"
                field="dec"
                :label="getFromObject(formConfig, ['target', 'dec', 'label'], 'Declination')"
                :desc="getFromObject(formConfig, ['target', 'dec', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'dec', 'hide'], false)"
                :collapse="!show"
                :errors="errors.dec"
                @input="update"
              />
              <custom-field
                v-model="target.proper_motion_ra"
                field="proper_motion_ra"
                :label="getFromObject(formConfig, ['target', 'proper_motion_ra', 'label'], 'Proper Motion RA')"
                :desc="getFromObject(formConfig, ['target', 'proper_motion_ra', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'proper_motion_ra', 'hide'], false)"
                :errors="errors.proper_motion_ra"
                @input="update"
              />
              <custom-field
                v-model="target.proper_motion_dec"
                field="proper_motion_dec"
                :label="getFromObject(formConfig, ['target', 'proper_motion_dec', 'label'], 'Proper Motion Dec')"
                :desc="getFromObject(formConfig, ['target', 'proper_motion_dec', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'proper_motion_dec', 'hide'], false)"
                :errors="errors.proper_motion_dec"
                @input="update"
              />
              <custom-field
                v-model="target.epoch"
                field="epoch"
                :label="getFromObject(formConfig, ['target', 'epoch', 'label'], 'Epoch')"
                :desc="getFromObject(formConfig, ['target', 'epoch', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'epoch', 'hide'], false)"
                :errors="errors.epoch"
                @input="update"
              />
              <custom-field
                v-model="target.parallax"
                field="parallax"
                :label="getFromObject(formConfig, ['target', 'parallax', 'label'], 'Parallax')"
                :desc="getFromObject(formConfig, ['target', 'parallax', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'parallax', 'hide'], false)"
                :errors="errors.parallax"
                @input="update"
              />
            </span>
            <span v-show="target.type === 'ORBITAL_ELEMENTS'" class="non-sidereal">
              <custom-select
                v-model="target.scheme"
                field="scheme"
                :label="getFromObject(formConfig, ['target', 'scheme', 'label'], 'Scheme')"
                :desc="getFromObject(formConfig, ['target', 'scheme', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'scheme', 'hide'], false)"
                :errors="errors.scheme"
                :options="nonSiderealSchemeOptions"
                @input="update"
              />
              <custom-field
                v-model="target.epochofel"
                field="epochofel"
                :label="getFromObject(formConfig, ['target', 'epochofel', 'label'], 'Epoch of Elements')"
                :desc="getFromObject(formConfig, ['target', 'epochofel', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'epochofel', 'hide'], false)"
                :errors="errors.epochofel"
                @input="update"
              />
              <custom-field
                v-model="target.orbinc"
                field="orbinc"
                :label="getFromObject(formConfig, ['target', 'orbinc', 'label'], 'Orbital Inclination')"
                :desc="getFromObject(formConfig, ['target', 'orbinc', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'orbinc', 'hide'], false)"
                :errors="errors.orbinc"
                @input="update"
              />
              <custom-field
                v-model="target.longascnode"
                field="longascnode"
                :label="getFromObject(formConfig, ['target', 'longascnode', 'label'], 'Longitude of Ascending Node')"
                :desc="getFromObject(formConfig, ['target', 'longascnode', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'longascnode', 'hide'], false)"
                :errors="errors.longascnode"
                @input="update"
              />
              <custom-field
                v-model="target.argofperih"
                field="argofperih"
                :label="getFromObject(formConfig, ['target', 'argofperih', 'label'], 'Argument of Perihelion')"
                :desc="getFromObject(formConfig, ['target', 'argofperih', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'argofperih', 'hide'], false)"
                :errors="errors.argofperih"
                @input="update"
              />
              <custom-field
                v-model="target.eccentricity"
                field="eccentricity"
                :label="getFromObject(formConfig, ['target', 'eccentricity', 'label'], 'Eccentricity')"
                :desc="getFromObject(formConfig, ['target', 'eccentricity', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'eccentricity', 'hide'], false)"
                :errors="errors.eccentricity"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'MPC_MINOR_PLANET' || target.scheme == 'JPL_MAJOR_PLANET'">
              <custom-field
                v-model="target.meandist"
                field="meandist"
                :label="getFromObject(formConfig, ['target', 'meandist', 'label'], 'Semimajor Axis')"
                :desc="getFromObject(formConfig, ['target', 'meandist', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'meandist', 'hide'], false)"
                :errors="errors.meandist"
                @input="update"
              />
              <custom-field
                v-model="target.meananom"
                field="meananom"
                :label="getFromObject(formConfig, ['target', 'meananom', 'label'], 'Mean Anomaly')"
                :desc="getFromObject(formConfig, ['target', 'meananom', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'meananom', 'hide'], false)"
                :errors="errors.meananom"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'JPL_MAJOR_PLANET'">
              <custom-field
                v-model="target.dailymot"
                field="dailymot"
                :label="getFromObject(formConfig, ['target', 'dailymot', 'label'], 'Daily Motion')"
                :desc="getFromObject(formConfig, ['target', 'dailymot', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'dailymot', 'hide'], false)"
                :errors="errors.dailymot"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'MPC_COMET'">
              <custom-field
                v-model="target.perihdist"
                field="perihdist"
                :label="getFromObject(formConfig, ['target', 'perihdist', 'label'], 'Perihelion Distance')"
                :desc="getFromObject(formConfig, ['target', 'perihdist', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'perihdist', 'hide'], false)"
                :errors="errors.perihdist"
                @input="update"
              />
              <custom-field
                v-model="target.epochofperih"
                field="epochofperih"
                :label="getFromObject(formConfig, ['target', 'epochofperih', 'label'], 'Epoch of Perihelion')"
                :desc="getFromObject(formConfig, ['target', 'epochofperih', 'desc'], '')"
                :hide="getFromObject(formConfig, ['target', 'epochofperih', 'hide'], false)"
                :errors="errors.epochofperih"
                @input="update"
              />
            </span>
            <slot name="target-fields-footer" :update="update" :data="{ target: target, errors: errors.name, position: position }"></slot>
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
import { getFromObject } from '@/util';

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
    let nonSiderealTargetParams = {
      scheme: 'MPC_MINOR_PLANET',
      orbinc: null,
      longascnode: null,
      argofperih: null,
      eccentricity: null,
      meandist: null,
      meananom: null,
      perihdist: null,
      epochofperih: null,
      extra_params: {}
    };
    let siderealTargetParams = _.cloneDeep(this.target);
    delete siderealTargetParams['name'];
    delete siderealTargetParams['type'];
    return {
      show: this.parentShow,
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
