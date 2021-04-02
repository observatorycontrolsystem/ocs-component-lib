<template>
  <b-alert v-if="dismissible" dismissible :variant="alertclass" :show="alertDuration">
    <slot />
  </b-alert>
  <b-alert v-else show :variant="alertclass">
    <slot />
  </b-alert>
</template>
<script>
export default {
  name: 'CustomAlert',
  props: {
    alertclass: {
      type: String,
      default: 'primary'
    },
    dismissible: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
    return {
      alertDuration: 10
    };
  }
};
</script>
