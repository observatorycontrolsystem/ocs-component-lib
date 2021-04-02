<template>
  <div>
    <b-button :href="dataAsEncodedStr" :download="downloadFilename" v-bind="extraDownloadButtonAttrs">
      <slot name="download-button-content"> <i class="fa fa-download" /> Download as JSON </slot>
    </b-button>
    <pre>{{ JSON.stringify(requestGroup, null, 4) }}</pre>
  </div>
</template>
<script>
export default {
  name: 'RequestGroupApiDisplay',
  props: {
    requestGroup: {
      type: Object,
      required: true
    },
    extraDownloadButtonAttrs: {
      type: Object,
      default: () => {
        return {};
      }
    },
    downloadFilename: {
      type: String,
      default: 'apiview.json'
    }
  },
  computed: {
    dataAsEncodedStr: function() {
      return 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.requestGroup));
    }
  }
};
</script>
