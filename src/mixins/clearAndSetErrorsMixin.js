export const clearAndSetErrorsMixin = {
  /* Methods to modify page messages */
  data: function () {
    return {
      errorMessages: []
    };
  },
  methods: {
    clearErrors: function () {
      for (let message of this.errorMessages) {
        this.$store.commit('deleteMessage', message);
      }
      this.errorMessages = [];
    },
    setErrors: function (errorMessagesObject) {
      for (let field in errorMessagesObject) {
        let message = '';
        if (field === 'retrieving') {
          message = errorMessagesObject[field];
        } else {
          message = field + ': ' + errorMessagesObject[field];
        }
        this.errorMessages.push(message);
        this.$store.commit('addMessage', { text: message, variant: 'danger' });
      }
    },
    setErrorsOnFailedAJAXCall: function (errorAjaxResponse) {
      this.clearErrors();
      if (errorAjaxResponse.status === 400) {
        this.setErrors(errorAjaxResponse.responseJSON);
      } else {
        this.setErrors({ retrieving: 'There was a problem retrieving your data, please try again.' });
      }
    }
  }
};
