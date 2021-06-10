<template>
  <div>
    <div v-show="!aladin" style="width:400px; height:400px;" class="text-center">
      <i class="fa fa-spin fa-spinner" />
    </div>
    <div v-show="aladin" :id="plotId" style="width:400px; height:400px;"></div>
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'DitherPatternPlot',
  props: {
    // List of RA and Dec offsets in the form of:
    // [
    //   { offset_ra: dra1, offset_dec: ddec1 },
    //   { offset_ra: dra2, offset_dec: ddec2 },
    //   ...
    // ]
    centerRa: {
      type: Number,
      required: true
    },
    centerDec: {
      type: Number,
      required: true
    },
    offsets: {
      type: Array,
      required: true
    },
    // Unique ID for the plot
    plotId: {
      type: String,
      required: true
    },
    // Initial value of the visible field of view, in decimal degrees
    fieldOfView: {
      type: Number,
      default: 0.5
    },
    survey: {
      type: String,
      default: 'P/DSS2/color'
    }
  },
  data: function() {
    return {
      aladin: undefined
    };
  },
  computed: {
    offsetCoordinates: function() {
      let coords = [];
      let ra = this.centerRa;
      let dec = this.centerDec;
      for (let offset of this.offsets){
        ra += offset['offset_ra'] / 3600;
        dec += offset['offset_dec'] / 3600;
        coords.push([ra, dec]);
      }
      return coords;
    }
  },
  mounted: function() {
    $.getScript('https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js', () => {
      // `A` is a global variable made available in the component after the script loads
      // eslint-disable-next-line
      this.aladin = A.aladin(`#${this.plotId}`, {
        survey: this.survey,
        fov: this.fieldOfView,
        target: `${this.centerRa} ${this.centerDec}`
      });
      // eslint-disable-next-line
      let overlay = A.graphicOverlay({ color: 'cyan', lineWidth: 1 });
      this.aladin.addOverlay(overlay);
      // eslint-disable-next-line
      overlay.add(A.circle(this.centerRa, this.centerDec, 0.2))
    });
  }
};
</script>
<style>
@import 'https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css';
</style>
