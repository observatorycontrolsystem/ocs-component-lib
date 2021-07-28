import $ from 'jquery';
import Vue from 'vue';
import { ref } from '@vue/composition-api';

export default function requestExpansionWithModalConfirm(toExpand) {
  // Provide functions to use for a workflow where:
  // 1. User enters parameters triggers a request to the backend to expand part of their observation request
  // 2. A modal displays with details of their expanded observation request
  // 3. They user can either accept the expanded observation request or cancel it
  const expansion = ref({
    showModal: false,
    status: {
      notFound: false,
      error: false,
      loaded: false,
      errorResponse: {}
    },
    expanded: []
  });

  const checkReadyToGenerateExpansion = (errorMessage, errorCheck) => {
    // Check whether the data is ready for expansion
    // `errorMessage` is a string with the message to display if not ready for expansion
    // `errorCheck` is a function that runs a check to determine whether ready for expansion
    //     returning true when ready and false when not
    if (errorCheck()) {
      alert(errorMessage);
      return false;
    } else {
      return true;
    }
  };

  const generateExpansion = (url, parameters, getExpandedFromResponse) => {
    // Generate the expansion
    // `url` is the endpoint that generates the expansion
    // `parameters` is an object containing the POST data to sent along with the HTTP request
    // `getExpandedFromResponse` is a function that returns the section of the response that is the expanded section
    expansion.value.showModal = true;
    expansion.value.status.loaded = false;
    expansion.value.status.error = false;
    expansion.value.status.notFound = false;
    expansion.value.status.errorResponse = {};
    $.ajax({
      method: 'POST',
      url: `${url}`,
      data: JSON.stringify(parameters),
      contentType: 'application/json'
    })
      .done(response => {
        let expanded = getExpandedFromResponse(response);
        if (expanded.length < 1) {
          expansion.value.status.notFound = true;
        } else {
          expansion.value.expanded = expanded;
        }
      })
      .fail(response => {
        expansion.value.status.errorResponse = response.responseJSON;
        expansion.value.status.error = true;
      })
      .always(() => {
        expansion.value.status.loaded = true;
      });
  };

  const cancelExpansion = () => {
    // Clear out the expansion.
    expansion.value.showModal = false;
    expansion.value.expanded = [];
  };

  const getExpansionErrors = () => {
    // Get the errors from the expansion endpoint and return them as a list
    let errors = [];
    for (let field in expansion.value.status.errorResponse) {
      if (field === 'non_field_errors') {
        for (let msg of expansion.value.status.errorResponse[field]) {
          errors.push(msg);
        }
      } else {
        for (let msg of expansion.value.status.errorResponse[field]) {
          errors.push(`${field}: ${msg}`);
        }
      }
    }
    return errors;
  };

  const acceptExpansion = keyToExpand => {
    // Accept the generated expansion. If the section that will be expanded is under a key in the
    // `toExpand` object, set `keyToExpand` to that key.
    expansion.value.showModal = false;
    // Clear out expanded section before setting it again to allow any existing associated components
    // to re-render so that the mounted hook is entered.
    if (keyToExpand) {
      toExpand.value[keyToExpand] = [];
    } else {
      toExpand.value = [];
    }
    toExpand.value[keyToExpand] = [];
    Vue.nextTick(() => {
      if (keyToExpand) {
        toExpand.value[keyToExpand] = expansion.value.expanded;
      } else {
        toExpand.value = expansion.value.expanded;
      }
      expansion.value.expanded = [];
    });
  };

  return {
    // Data
    expansion,
    // Methods
    acceptExpansion,
    cancelExpansion,
    checkReadyToGenerateExpansion,
    generateExpansion,
    getExpansionErrors
  };
}
