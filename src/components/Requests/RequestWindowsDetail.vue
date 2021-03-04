<template>
  <table class="table table-sm">
    <thead class="no-top-border">
      <tr>
        <td><strong>Start</strong></td>
        <td><strong>End</strong></td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(window, index) in windows" :key="'window-' + index">
        <td>{{ window.start | formatDate }}</td>
        <td>{{ window.end | formatDate }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import { formatDate } from '@/util';

export default {
  name: 'RequestWindowsDetail',
  filters: {
    formatDate: function(value) {
      return formatDate(value);
    }
  },
  props: {
    windows: {
      type: Array,
      required: true
    }
  }
};
</script>
