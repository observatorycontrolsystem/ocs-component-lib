<template>
  <div>Dither pattern plot content! {{ offsets }}</div>
</template>
<script>
export default {
  name: 'DitherPatternPlot',
  props: {
    // List of RA and Dec offsets in the form of:
    // [
    //   { offset_ra: dra1, offset_dec: ddec1 },
    //   { offset_ra: dra2, offset_dec: ddec2 },
    //   ...
    // ]
    offsets: {
      type: Array,
      required: true
    }
  }
};
</script>
