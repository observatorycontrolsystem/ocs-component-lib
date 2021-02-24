<template>
  <b-col>
    <b-row class="position-relative">
      <div class="state-color-marker" :class="requestgroup.state | stateToBsClass('bg')"></div>
      <b-col md="8" cols="12">
        <b-link v-if="requestgroupLink.href" :href="requestgroupLink.href" class="requestgroup-title">
          {{ requestgroupDisplayName }}
        </b-link>
        <b-link v-if="requestgroupLink.to" :to="requestgroupLink.to" class="requestgroup-title">
          {{ requestgroupDisplayName }}
        </b-link>
        <span v-else class="requestgroup-title">
          {{ requestgroupDisplayName }}
        </span>
        <b-row>
          <b-col class="pr-1 text-truncate">
            <div class="requestgroup-details border-right">
              <div><i class="fa fa-fw fa-user" /> {{ requestgroup.submitter }}</div>
              <div>
                <i class="fa fa-fw fa-users" />
                <b-link v-if="proposalLink.href" :href="proposalLink.href">
                  {{ requestgroup.proposal }}
                </b-link>
                <b-link v-if="proposalLink.to" :to="proposalLink.to">
                  {{ requestgroup.proposal }}
                </b-link>
                <span v-else>
                  {{ requestgroup.proposal }}
                </span>
              </div>
            </div>
          </b-col>
          <b-col class="p-0">
            <div class="requestgroup-details">
              <div :class="requestgroup.state | stateToBsClass('text')"><i :class="requestgroup.state | stateToIcon" />{{ requestgroup.state }}</div>
              <div>
                <i class="fa fa-fw fa-calendar" />
                <span :title="requestgroup.modified | timeFromNow">{{ requestgroup.modified | formatDate }}</span>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
      <b-col md="1" cols="12" class="request-count request-block">
        <div class="text-center align-middle" title="Total number of requests">{{ requestgroup.requests.length }}</div>
      </b-col>
      <b-col md="1" cols="12" class="request-count request-block text-info">
        <div class="text-center align-middle" title="Number of pending requests">{{ requestgroup | requestStateCount(['PENDING']) }}</div>
      </b-col>
      <b-col md="1" cols="12" class="request-count request-block text-danger">
        <div class="text-center align-middle" title="Number of failed requests">
          {{ requestgroup | requestStateCount(['WINDOW_EXPIRED', 'FAILURE_LIMIT_REACHED']) }}
        </div>
      </b-col>
      <b-col md="1" cols="12" class="request-count request-block text-success">
        <div class="text-center align-middle" title="Number of completed requests">{{ requestgroup | requestStateCount(['COMPLETED']) }}</div>
      </b-col>
    </b-row>
  </b-col>
</template>
<script>
import _ from 'lodash';

import { stateToBsClass, stateToIcon, formatDate, timeFromNow } from '@/util';

export default {
  name: 'RequestGroupOverview',
  filters: {
    requestStateCount: function(requestgroup, states) {
      let count = 0;
      for (let request of requestgroup.requests) {
        if (states.includes(request.state)) {
          count++;
        }
      }
      return count;
    },
    stateToBsClass: function(state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function(state) {
      return stateToIcon(state);
    },
    formatDate(value) {
      return formatDate(value);
    },
    timeFromNow: function(value) {
      return timeFromNow(value);
    }
  },
  props: {
    requestgroup: {
      type: Object,
      required: true
    },
    proposalLink: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
      validator: value => {
        let hasHref = 'href' in value;
        let hasTo = 'to' in value;
        if (hasHref && hasTo) return false;
        if (_.isEmpty(value)) return true;
        return hasHref || hasTo;
      },
      description:
        'Set to turn the displayed proposal ID into a link. Pass in an object with either { "href": "..." } specifying ' +
        'the "href" attribute for a normal <a> tag or { "to": ... } specifying a vue-router target route "to" attribute ' +
        'for the <router-link> tag.'
    },
    requestgroupLink: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
      validator: value => {
        let hasHref = 'href' in value;
        let hasTo = 'to' in value;
        if (hasHref && hasTo) return false;
        if (_.isEmpty(value)) return true;
        return hasHref || hasTo;
      },
      description:
        'Set to turn the displayed requestgroup ID into a link. Pass in an object with either { "href": "..." } specifying ' +
        'the "href" attribute for a normal <a> tag or { "to": ... } specifying a vue-router target route "to" attribute ' +
        'for the <router-link> tag.'
    }
  },
  computed: {
    requestgroupDisplayName: function() {
      return this.requestgroup.name || 'Unnamed Request';
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.requestgroup-title {
  font-size: 1em;
  margin-left: 4px;
  font-weight: 600;
}
.requestgroup-details div {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.request-count {
  font-size: 1.9em;
  display: flex;
  justify-content: center;
  align-items: center;
}
.request-block {
  min-height: 75px;
  border: 1px solid $request-block-border;
  background-color: $request-block-background;
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
