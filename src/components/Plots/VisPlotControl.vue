<template>
  <b-container class="plot-control">
    <b-button id="zoom-in" class="float-right" variant="transparent" @click="zoomIn">
      <i class="fas fa-search-plus" />
    </b-button>
    <b-button id="zoom-in" class="float-right" variant="transparent" @click="zoomOut">
      <i class="fas fa-search-minus" />
    </b-button>
  </b-container>
</template>
<script>
export default {
  name: 'VisPlotControl',
  props: {
    zoomInPercent: {
      type: Number,
      default: -0.2
    },
    zoomOutPercent: {
      type: Number,
      default: 0.2
    }
  },
  methods: {
    zoomIn: function() {
      this.$emit('plotZoom', this.zoomInPercent);
    },
    zoomOut: function() {
      this.$emit('plotZoom', this.zoomOutPercent);
    }
  }
};
</script>
<style scoped>
.plot-control {
  position: absolute;
  right: 0;
  /* Stays under modals but above its vis graph */
  z-index: 500;
}
</style>
