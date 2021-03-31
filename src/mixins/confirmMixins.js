export var confirmMixin = {
  /* Display a modal where the user can either proceed or cancel running a callback function */
  methods: {
    confirm: function(confirmationMessage, callback, args) {
      this.$bvModal.msgBoxConfirm(confirmationMessage).then(proceed => {
        if (proceed) {
          callback(args);
        }
      });
    }
  }
};
