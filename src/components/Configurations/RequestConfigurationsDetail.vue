<template>
  <div>
    <b-card v-for="(configuration, index) in configurations" :key="configuration.id" no-body class="mb-1">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button v-b-toggle="'accordion-' + index" block href="#" variant="light" :class="'configuration-toggle-' + index">
          <b-row>
            <b-col md="4"> Type: {{ configuration.type }} </b-col>
            <b-col v-if="configuration.repeat_duration" md="4"> Duration: {{ configuration.repeat_duration }} </b-col>
            <b-col v-else md="4" />
            <b-col v-if="configuration.target" md="4"> Target: {{ configuration.target.name }} </b-col>
            <b-col v-else md="4">
              Target: None
            </b-col>
          </b-row>
        </b-button>
      </b-card-header>
      <b-collapse :id="'accordion-' + index" :visible="index === 0" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-row>
            <b-col md="6">
              <h4>Target</h4>
              <div v-if="!configuration.target">
                No target
              </div>
              <ul v-else class="list-unstyled card-count card-column-two target-information">
                <li v-for="(x, idx) in configuration.target" :key="'target-' + idx">
                  <b-row v-if="configuration.target[idx] && x">
                    <b-col v-if="configuration.target[idx]" class="font-weight-bold text-nowrap">
                      {{ idx | formatField }}
                    </b-col>
                    <b-col v-if="x" class="text-right">
                      <span v-if="idx === 'name'">{{ x }}</span>
                      <span v-else-if="isObjEmpty(x) && idx === 'extra_params'">None</span>
                      <span v-else>{{ x | formatValue }}</span>
                      <em v-if="idx === 'ra'" class="text-muted"> ({{ x | raAsSexigesimal }})</em>
                      <em v-if="idx === 'dec'" class="text-muted"> ({{ x | decAsSexigesimal }})</em>
                    </b-col>
                  </b-row>
                </li>
              </ul>
              <br />
              <h4>Instrument Configs</h4>
              <table class="table table-sm table-responsive instrument-configs">
                <thead class="no-top-border">
                  <tr>
                    <td><strong>Mode</strong></td>
                    <td><strong>Exposure Time</strong></td>
                    <td><strong>Exposure Count</strong></td>
                    <td><strong>Optical Elements</strong></td>
                    <td><strong>Extra Params</strong></td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(instrument_config, idx) in configuration.instrument_configs" :key="'instrument_config-' + idx">
                    <td v-if="instrument_config.mode">
                      {{ instrument_config.mode }}
                    </td>
                    <td v-else>
                      N/A
                    </td>
                    <td>
                      {{ instrument_config.exposure_time | formatValue }}
                    </td>
                    <td>
                      {{ instrument_config.exposure_count | formatValue }}
                    </td>
                    <td v-if="!isObjEmpty(instrument_config.optical_elements)">
                      {{ instrument_config.optical_elements | formatValue }}
                    </td>
                    <td v-else>
                      None
                    </td>
                    <td v-if="!isObjEmpty(instrument_config.extra_params)">
                      {{ instrument_config.extra_params | formatValue }}
                    </td>
                    <td v-else>
                      None
                    </td>
                  </tr>
                </tbody>
              </table>
            </b-col>
            <b-col md="6">
              <h4>Acquisition</h4>
              <ul class="list-unstyled card-count card-column-two">
                <li v-for="(x, idx) in configuration.acquisition_config" :key="'acquisition-' + idx">
                  <b-row v-if="configuration.acquisition_config[idx] && x">
                    <b-col v-if="configuration.acquisition_config[idx]" class="font-weight-bold text-nowrap">
                      {{ idx | formatField }}
                    </b-col>
                    <b-col v-if="x" class="text-right">
                      <span v-if="idx === 'name'">{{ x }}</span>
                      <span v-else-if="isObjEmpty(x) && idx === 'extra_params'">None</span>
                      <span v-else>{{ x | formatValue }}</span>
                    </b-col>
                  </b-row>
                </li>
              </ul>
              <br />
              <h4>Guiding</h4>
              <ul class="list-unstyled card-count card-column-two">
                <li v-for="(x, idx) in configuration.guiding_config" :key="'guiding-' + idx">
                  <b-row v-if="configuration.guiding_config[idx] && x">
                    <b-col v-if="configuration.guiding_config[idx]" class="font-weight-bold text-nowrap">
                      {{ idx | formatField }}
                    </b-col>
                    <b-col v-if="x" class="text-right">
                      <span v-if="idx === 'name'">{{ x }}</span>
                      <span v-else-if="isObjEmpty(x) && (idx === 'extra_params' || idx === 'optical_elements')">None</span>
                      <span v-else>{{ x | formatValue }}</span>
                    </b-col>
                  </b-row>
                </li>
              </ul>
              <br />
              <h4>Constraints</h4>
              <ul class="list-unstyled card-count card-column-two">
                <li v-for="(x, idx) in configuration.constraints" :key="'constraints-' + idx">
                  <b-row v-if="configuration.constraints[idx] && x">
                    <b-col v-if="configuration.constraints[idx]" class="font-weight-bold text-nowrap">
                      {{ idx | formatField }}
                    </b-col>
                    <b-col v-if="x" class="text-right">
                      <span v-if="isObjEmpty(x) && idx === 'extra_params'">None</span>
                      <span v-else>{{ x | formatValue }}</span>
                    </b-col>
                  </b-row>
                </li>
              </ul>
            </b-col>
          </b-row>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>
<script>
import $ from 'jquery';

import { decimalDecToSexigesimal, decimalRaToSexigesimal, formatValue, formatField } from '@/util';

export default {
  name: 'RequestConfigurationsDetail',
  filters: {
    formatValue: function(value) {
      return formatValue(value);
    },
    formatField: function(value) {
      return formatField(value);
    },
    raAsSexigesimal: function(value) {
      return decimalRaToSexigesimal(value).str;
    },
    decAsSexigesimal: function(value) {
      return decimalDecToSexigesimal(value).str;
    }
  },
  props: {
    configurations: {
      type: Array,
      required: true
    }
  },
  methods: {
    isObjEmpty: function(obj) {
      return $.isEmptyObject(obj);
    }
  }
};
</script>
