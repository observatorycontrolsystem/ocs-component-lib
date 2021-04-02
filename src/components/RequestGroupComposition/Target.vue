<template>
  <panel
    :id="'target' + $parent.$parent.$parent.index + $parent.index"
    :show="show"
    :errors="errors"
    :canremove="false"
    :cancopy="false"
    icon="fas fa-crosshairs"
    title="Target"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <slot name="target-help"></slot>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field v-model="target.name" label="Name" field="name" :errors="errors.name" @input="update">
              <!-- TODO: Move this over to the client -->
              <!-- <div v-show="lookingUP || lookupFail" slot="extra-help-text">
                <i v-show="lookingUP" class="fa fa-spinner fa-spin fa-fw" /> {{ lookupText }}
              </div> -->
            </custom-field>
            <custom-select
              v-if="!simpleInterface"
              v-model="target.type"
              label="Type"
              field="type"
              :errors="errors.type"
              :options="targetTypeOptions"
              @input="update"
            />
            <span v-show="target.type === 'ICRS'" class="sidereal">
              <custom-field
                v-model="raDisplay"
                label="Right Ascension"
                field="ra"
                desc="Decimal degrees or HH:MM:SS.S"
                :errors="errors.ra"
                @blur="updateRA"
              >
                <div v-if="target.ra" slot="extra-help-text">
                  {{ raHelpText }}
                </div>
              </custom-field>
              <custom-field
                v-model="decDisplay"
                label="Declination"
                field="dec"
                desc="Decimal degrees or DD:MM:SS.S"
                :errors="errors.dec"
                @blur="updateDec"
              >
                <div v-if="target.dec" slot="extra-help-text">
                  {{ decHelpText }}
                </div>
              </custom-field>
              <custom-field
                v-if="!simpleInterface"
                v-model="target.proper_motion_ra"
                label="Proper Motion RA"
                field="proper_motion_ra"
                desc="Units are milliarcseconds per year. Max 20000."
                :errors="errors.proper_motion_ra"
                @input="update"
              />
              <custom-field
                v-if="!simpleInterface"
                v-model="target.proper_motion_dec"
                label="Proper Motion Dec"
                field="proper_motion_dec"
                desc="Units are milliarcseconds per year. Max 20000."
                :errors="errors.proper_motion_dec"
                @input="update"
              />
              <custom-field
                v-if="!simpleInterface"
                v-model="target.epoch"
                label="Epoch"
                field="epoch"
                desc="Julian Years. Max 2100."
                :errors="errors.epoch"
                @input="update"
              />
              <custom-field
                v-if="!simpleInterface"
                v-model="target.parallax"
                label="Parallax"
                field="parallax"
                desc="+0.45 mas. Max 2000."
                :errors="errors.parallax"
                @input="update"
              />
            </span>
            <span v-show="target.type === 'ORBITAL_ELEMENTS'" class="non-sidereal">
              <custom-select
                v-model="target.scheme"
                label="Scheme"
                field="scheme"
                desc="The orbital elements scheme to use with this target"
                :errors="errors.scheme"
                :options="nonSiderealSchemeOptions"
                @input="update"
              />
              <custom-field
                v-model="target.epochofel"
                label="Epoch of Elements"
                field="epochofel"
                desc="The epoch of the orbital elements in MJD. MJD = JD - 2400000.5"
                :errors="errors.epochofel"
                @input="update"
              />
              <custom-field
                v-model="target.orbinc"
                label="Orbital Inclination"
                field="orbinc"
                :errors="errors.orbinc"
                desc="Angle in Degrees"
                @input="update"
              />
              <custom-field
                v-model="target.longascnode"
                label="Longitude of Ascending Node"
                field="longascnode"
                desc="Angle in Degrees"
                :errors="errors.longascnode"
                @input="update"
              />
              <custom-field
                v-model="target.argofperih"
                label="Argument of Perihelion"
                field="argofperih"
                desc="Angle in Degrees"
                :errors="errors.argofperih"
                @input="update"
              />
              <custom-field
                v-model="target.eccentricity"
                label="Eccentricity"
                field="eccentricity"
                desc="0 to 0.99"
                :errors="errors.eccentricity"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'MPC_MINOR_PLANET' || target.scheme == 'JPL_MAJOR_PLANET'">
              <custom-field
                v-model="target.meandist"
                label="Semimajor Axis"
                field="meandist"
                desc="Astronomical Units (AU)"
                :errors="errors.meandist"
                @input="update"
              />
              <custom-field
                v-model="target.meananom"
                label="Mean Anomaly"
                field="meananom"
                desc="Angle in Degrees"
                :errors="errors.meananom"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'JPL_MAJOR_PLANET'">
              <custom-field
                v-model="target.dailymot"
                label="Daily Motion"
                field="dailymot"
                desc="Degrees"
                :errors="errors.dailymot"
                @input="update"
              />
            </span>
            <span v-show="target.scheme === 'MPC_COMET'">
              <custom-field
                v-model="target.perihdist"
                label="Perihelion Distance"
                field="perihdist"
                desc="Astronomical Units (AU)"
                :errors="errors.perihdist"
                @input="update"
              />
              <custom-field
                v-model="target.epochofperih"
                label="Epoch of Perihelion"
                field="epochofperih"
                desc="Modified Juian Days"
                :errors="errors.epochofperih"
                @input="update"
              />
            </span>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </panel>
</template>
<script>
import _ from 'lodash';

import Panel from '@/components/RequestGroupComposition/Panel.vue';
import CustomAlert from '@/components/RequestGroupComposition/CustomAlert.vue';
import CustomField from '@/components/RequestGroupComposition/CustomField.vue';
import CustomSelect from '@/components/RequestGroupComposition/CustomSelect.vue';
import { collapseMixin } from '@/mixins/collapseMixins.js';
import { decimalRaToSexigesimal, decimalDecToSexigesimal, sexagesimalRaToDecimal, sexagesimalDecToDecimal } from '@/util';

export default {
  components: {
    CustomField,
    CustomSelect,
    Panel,
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
    simpleInterface: {
      type: Boolean
    },
    parentshow: {
      type: Boolean
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
      raDisplay: this.target.ra,
      decDisplay: this.target.dec,
      raHelpText: this.raHelp(this.target.ra),
      decHelpText: this.decHelp(this.target.dec),
      targetTypeOptions: [
        { value: 'ICRS', text: 'Sidereal' },
        { value: 'ORBITAL_ELEMENTS', text: 'Non-Sidereal' }
      ],
      nonSiderealSchemeOptions: [
        { value: 'MPC_MINOR_PLANET', text: 'MPC Minor Planet' },
        { value: 'MPC_COMET', text: 'MPC Comet' },
        { value: 'JPL_MAJOR_PLANET', text: 'JPL Major Planet' }
      ]
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
    update: function() {
      this.$emit('target-updated', {});
    },
    updateRA: function() {
      this.target.ra = sexagesimalRaToDecimal(this.raDisplay);
      this.raHelpText = this.raHelp(this.raDisplay);
      this.update();
    },
    updateDec: function() {
      this.target.dec = sexagesimalDecToDecimal(this.decDisplay);
      this.decHelpText = this.decHelp(this.decDisplay);
      this.update();
    },
    raHelp: function(ra) {
      if (isNaN(Number(ra))) {
        return 'Decimal: ' + Number(sexagesimalRaToDecimal(ra));
      } else {
        return 'Sexagesimal: ' + decimalRaToSexigesimal(ra).str;
      }
    },
    decHelp: function(dec) {
      if (isNaN(Number(dec))) {
        return 'Decimal: ' + Number(sexagesimalDecToDecimal(dec));
      } else {
        return 'Sexagesimal: ' + decimalDecToSexigesimal(dec).str;
      }
    }
  }
};
</script>
