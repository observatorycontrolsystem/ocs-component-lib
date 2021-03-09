<template>
  <div class="d-flex flex-wrap">
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold">State</div>
      <div :class="requestgroup.state | stateToBsClass('text')" class="text-truncate" :title="requestgroup.state">
        <i :class="requestgroup.state | stateToIcon" />{{ requestgroup.state }}
      </div>
    </b-col>
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold">Updated</div>
      <div>{{ requestgroup.modified | formatDate }}</div>
    </b-col>
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold">Submitted</div>
      <div>{{ requestgroup.created | formatDate }}</div>
    </b-col>
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold">Proposal</div>
      <div>
        <text-display :link="proposalLink" :text="requestgroup.proposal" text-classes="proposal-display-code" />
      </div>
    </b-col>
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold text-truncate">Submitter</div>
      <div>{{ requestgroup.submitter }}</div>
    </b-col>
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold">IPP</div>
      <div>{{ requestgroup.ipp_value | formatIpp }}</div>
    </b-col>
    <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
      <div class="font-weight-bold" title="Observation Type">Type</div>
      <div>{{ requestgroup.observation_type }}</div>
    </b-col>
    <b-col v-if="showExtraColumn" lg="auto" cols="12" class="p-1 flex-lg-fill" v-bind="extraColumnAttrs" :class="extraColumnClasses">
      <slot name="extra-column-content"></slot>
    </b-col>
  </div>
</template>
<script>
import { formatFloat, stateToBsClass, stateToIcon, formatDate } from '@/util';
import { TextDisplay } from '@/components/Util';

export default {
  name: 'RequestGroupHeader',
  components: {
    TextDisplay
  },
  filters: {
    stateToBsClass: function(state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function(state) {
      return stateToIcon(state);
    },
    formatIpp: function(ipp) {
      return formatFloat(ipp, 6);
    },
    formatDate: function(date) {
      return formatDate(date);
    }
  },
  props: {
    requestgroup: {
      type: Object,
      required: true
    },
    // If true, an extra flex column is diplayed, showing the content in the "extra-column-content" named slot.
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
    // Set `proposalLink` to turn the displayed proposal ID into a link. Pass in an object with either { "href": "..." } specifying
    // the "href" attribute for a normal <a> tag or { "to": ... } specifying a vue-router target route "to" attribute
    // for the <router-link> tag.
    proposalLink: {
      type: Object,
      required: false,
      default: () => {
        return {};
      }
    }
  }
};
</script>
