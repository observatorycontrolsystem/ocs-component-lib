<template>
  <div>
    <div>
      <div v-show="!aladinLoaded" :style="'width:' + plotWidth + '; height:' + plotHeight + ';'" class="text-center m-auto">
        <span v-if="aladinLoadError">
          Plot failed to load, please try again
        </span>
        <span v-else>
          <i class="fa fa-spin fa-spinner" />
        </span>
      </div>
      <div v-show="aladinLoaded" :id="plotId" :style="'width:' + plotWidth + '; height:' + plotHeight + ';'" class="m-auto"></div>
    </div>
    <component :is="'style'" :id="styleElementId"></component>
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
    },
    aladinScriptLocation: {
      type: String,
      default: 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js'
    },
    aladinStyleLocation: {
      type: String,
      default: 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css'
    }
  },
  data: function() {
    return {
      aladinLoaded: false,
      aladinLoadError: false,
      styleElementId: `${this.plotId}-style`
    };
  },
  mounted: function() {
    // Aladin does not come bundled up as an NPM package and instead much be included like this
    // https://aladin.u-strasbg.fr/AladinLite/doc/#embedding
    $.getScript(this.aladinScriptLocation)
      .done(() => {
        // After the script loads, the global variable `A` is available. Add the following line to the page
        // where aladin is being used to silence lint errors saying that A is not defined:
        // /* global A */
        this.aladinLoaded = true;
        this.$emit('aladin-loaded');
      })
      .fail(() => {
        this.aladinLoadError = true;
      });
    // Also need to load the aladin style sheet
    $(`#${this.styleElementId}`).load(this.aladinStyleLocation);
  }
};
</script>
