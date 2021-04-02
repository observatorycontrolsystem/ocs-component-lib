<template>
  <b-modal ref="my-modal" size="xl" :title="header">
    <slot />
    <div slot="modal-footer">
      <b-button v-show="showCancel" variant="secondary" class="float-right m-1" @click="close">
        Cancel
      </b-button>
      <b-button v-show="showAccept" variant="primary" class="float-right m-1" @click="submit">
        Ok
      </b-button>
    </div>
  </b-modal>
</template>
<script>
export default {
  props: {
    show: Boolean,
    header: {
      type: String,
      default: ''
    },
    showAccept: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    show: function(value) {
      if (value) {
        this.$refs['my-modal'].show();
      } else {
        this.$refs['my-modal'].hide();
      }
    }
  },
  mounted: function() {
    if (this.show) {
      this.$refs['my-modal'].show();
    }
  },
  methods: {
    close: function() {
      this.$refs['my-modal'].hide();
      this.$emit('close');
    },
    submit: function() {
      this.$refs['my-modal'].hide();
      this.$emit('submit');
    }
  }
};
</script>
