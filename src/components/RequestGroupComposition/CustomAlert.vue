<template>
  <b-alert v-if="dismissible" dismissible :variant="alertClass" :show="alertDuration">
    <slot />
  </b-alert>
  <b-alert v-else show :variant="alertClass">
    <slot />
  </b-alert>
</template>
<script>
export default {
  name: 'CustomAlert',
  props: {
    alertClass: {
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
