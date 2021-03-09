<template>
  <b-row class="m-0 border position-relative">
    <div class="state-color-marker" :class="request.state | stateToBsClass('bg')"></div>
    <b-col>
      <b-row>
        <b-col cols="12" md class="request-block border-right">
          <text-display :link="requestLink" :text="'# ' + request.id" text-classes="request-display-code request-title" />
          <p>
            <i class="far fa-clock" />
            <span title="Total exposure time + observing overhead">Duration: {{ request.duration }} seconds</span>
          </p>
          <p>
            <i class="fa fa-camera" />
            Instrument: {{ instrumentName }}
          </p>
        </b-col>
        <b-col cols="12" md class="request-block border-right">
          <p>
            <span :class="request.state | stateToBsClass('text')">
              <i :class="request.state | stateToIcon" />
              {{ request.state }}
            </span>
          </p>
          <p>
            <i class="fa fa-clipboard-check" />
            Acceptability Threshold: {{ request.acceptability_threshold }}%
          </p>
          <p>
            <i class="fa fa-calendar" />
            {{ request.modified | formatDate }}
          </p>
        </b-col>
        <b-col v-if="showExtraColumn" v-bind="extraColumnAttrs" :class="extraColumnClasses">
          <slot name="extra-column-content"></slot>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>
<script>
import _ from 'lodash';

import { TextDisplay } from '@/components/Util';
import { stateToBsClass, stateToIcon, formatDate } from '@/util';

export default {
  name: 'RequestOverview',
  filters: {
    stateToBsClass: function(state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function(state) {
      return stateToIcon(state);
    },
    formatDate(value) {
      return formatDate(value);
    }
  },
  components: {
    TextDisplay
  },
  props: {
    request: {
      type: Object,
      required: true
    },
    // Response from the /api/instruments/ endpoint or a mapping like {"instrument_type": { "name": "Instrument display name" }, ... }
    instruments: {
      type: Object,
      required: true
    },
    // If true, content in the "extra-column-content" named slot is displayed.
    showExtraColumn: {
      type: Boolean
    },
    extraColumnAttrs: {
      type: Object,
      default: () => {
        return {};
      }
    },
    extraColumnClasses: {
      type: String,
      default: ''
    },
    // Set `requestLink` to turn the displayed request ID into a link. Pass in an object with either { "href": "..." } specifying
    // the "href" attribute for a normal <a> tag or { "to": ... } specifying a vue-router target route "to" attribute
    // for the <router-link> tag.
    requestLink: {
      type: Object,
      required: false,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    instrumentName: function() {
      let instrumentType = _.get(this.request, ['configurations', 0, 'instrument_type']);
      if (instrumentType && instrumentType in this.instruments) {
        return this.instruments[instrumentType].name;
      } else {
        return instrumentType;
      }
    }
  }
};
</script>
<style scoped>
.request-block > p {
  margin: 0px;
  padding-bottom: 0px;
}
.request-title {
  font-size: 1em;
  margin-left: 4px;
  font-weight: 600;
}
.state-color-marker {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 10px;
  min-width: 10px;
  height: 100%;
}
</style>
