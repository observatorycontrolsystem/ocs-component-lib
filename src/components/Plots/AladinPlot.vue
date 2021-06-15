<template>
  <div>
    <div v-show="!aladinLoaded" :style="'width:' + plotWidth + '; height:' + plotHeight + ';'" class="text-center m-auto">
      <i class="fa fa-spin fa-spinner" />
    </div>
    <div v-show="aladinLoaded" :id="plotId" :style="'width:' + plotWidth + '; height:' + plotHeight + ';'" class="m-auto"></div>
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'AladinPlot',
  props: {
    // Unique ID for the plot
    plotId: {
      type: String,
      required: true
    },
    plotWidth: {
      type: String,
      default: '400px'
    },
    plotHeight: {
      type: String,
      default: '400px'
    }
  },
  data: function() {
    return {
      aladinLoaded: false
    };
  },
  mounted: function() {
    // Aladin does not come bundled up as an NPM package and instead much be included like this
    // https://aladin.u-strasbg.fr/AladinLite/doc/#embedding
    $.getScript('https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js', () => {
      // After the script loads, the global variable `A` is available in the component
      this.aladinLoaded = true;
      this.$emit('aladin-loaded');
    });
  }
};
</script>
<style>
@import 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css';
</style>
