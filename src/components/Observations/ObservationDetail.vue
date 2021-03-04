<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Request</th>
          <th>Site</th>
          <th>Enclosure</th>
          <th>Telescope</th>
          <th>Start</th>
          <th>End</th>
          <th>State</th>
          <th>Priority</th>
          <th>Modified</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <b-link v-if="requestLink.href" :href="requestLink.href" class="request-display-code">
              {{ observation.request }}
            </b-link>
            <b-link v-else-if="requestLink.to" :to="requestLink.to" class="request-display-code">
              {{ observation.request }}
            </b-link>
            <span v-else class="request-display-code">
              {{ observation.request }}
            </span>
          </td>
          <td>{{ observation.site }}</td>
          <td>{{ observation.enclosure }}</td>
          <td>{{ observation.telescope }}</td>
          <td>{{ observation.start | formatDate }}</td>
          <td>{{ observation.end | formatDate }}</td>
          <td>{{ observation.state }}</td>
          <td>{{ observation.priority }}</td>
          <td>{{ observation.modified | formatDate }}</td>
          <td>{{ observation.created | formatDate }}</td>
        </tr>
      </tbody>
    </table>
    <table class="table table-striped">
      <thead>
        <tr>
          <th colspan="4" style="border-right: 2px solid black">Config Status</th>
          <th colspan="6">Summary</th>
        </tr>
        <tr>
          <th>Id</th>
          <th>Instrument</th>
          <th>Guider</th>
          <th style="border-right: 2px solid black">State</th>
          <th>State</th>
          <th>Start</th>
          <th>End</th>
          <th>Reason</th>
          <th>Time</th>
          <th>Events</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cStatus in observation.configuration_statuses" :key="cStatus.id">
          <td>{{ cStatus.id }}</td>
          <td>{{ cStatus.instrument_name }}</td>
          <td>{{ cStatus.guide_camera_name }}</td>
          <td style="border-right: 2px solid black">{{ cStatus.state }}</td>
          <template v-if="cStatus.summary">
            <td>{{ cStatus.summary.state }}</td>
            <td>{{ cStatus.summary.start | formatDate }}</td>
            <td>{{ cStatus.summary.end | formatDate }}</td>
            <td>{{ cStatus.summary.reason }}</td>
            <td>{{ cStatus.summary.time_completed }}</td>
            <td><a href="#" @click="openEvents(cStatus.summary.events)">View</a></td>
          </template>
          <template v-else>
            <td colspan="6">No summary</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import _ from 'lodash';

import { formatDate } from '@/util';

export default {
  name: 'ObservationDetail',
  filters: {
    formatDate(value) {
      return formatDate(value);
    }
  },
  props: {
    observation: {
      type: Object,
      required: true
    },
    // Set `requestLink` to turn the displayed request ID into a link. Pass in an object with either { "href": "..." } specifying
    // the "href" attribute for a normal <a> tag or { "to": ... } specifying a vue-router target route "to" attribute
    // for the <router-link> tag.
    requestLink: {
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
      }
    }
  },
  methods: {
    openEvents: function(events_text) {
      var y = window.top.outerHeight / 2 + window.top.screenY - 300;
      var x = window.top.outerWidth / 2 + window.top.screenX - 300;
      var newWin = open(
        '',
        'Events',
        'scrollbars=yes, toolbar=no, location=no, menubar=no, width=' + 600 + ', height=' + 600 + ', top=' + y + ', left=' + x
      );
      newWin.document.write('<pre>' + JSON.stringify(events_text, null, 2) + '</pre>');
    }
  }
};
</script>
