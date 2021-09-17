import $ from 'jquery';
import Vue from 'vue';
import { ref } from '@vue/composition-api';

export default function requestExpansionWithModalConfirm() {
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
    expanded: [],
    expansionExtraInfo: {}
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

  const generateExpansion = (
    url,
    parameters,
    getExpandedFromResponse,
    {
      saveExtraInfo = false,
      getExtraInfoFromResponse = response => {
        return response.extra_params || {};
      }
    } = {}
  ) => {
    // Generate the expansion
    // `url` is the endpoint that generates the expansion
    // `parameters` is an object containing the POST data to sent along with the HTTP request
    // `getExpandedFromResponse` is a function that returns the section of the response that is the expanded section. Expected
    //      to return an array.
    // `saveExtraInfo` is a boolean indicating whether to save extra information about the request.
    // `getExtraInfoFromResponse` is a function that returns the section of the response that contains extra information about
    //      the expansion if `saveExtraInfo` is `true`. Expected to return an object. By default it saves the `extra_params` field
    //      of the response.
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
          if (saveExtraInfo) {
            expansion.value.expansionExtraInfo = getExtraInfoFromResponse(response);
          }
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
    expansion.value.expansionExtraInfo = {};
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

  const acceptExpansionForKeyOnObject = (obj, key, { addExtraInfo = false, onDone = () => {}, extraInfoKey = 'extra_params' } = {}) => {
    // Accept the generated expansion by setting the `key` of the provided `obj` to the expanded data.
    // Updating the `key` of `obj` means that the `obj` itself that is passed is updated (pass-by-reference),
    // so that if it was a reactive variable inside a component, the component will re-render. To add the
    // saved extra expansion information onto the object, set `addExtraInfo` to `true`.
    expansion.value.showModal = false;
    // Clear out expanded section before setting it again to allow any existing associated components
    // to re-render so that the mounted hook is entered.
    obj[key] = [];
    Vue.nextTick(() => {
      obj[key] = expansion.value.expanded;
      if (addExtraInfo) {
        obj[extraInfoKey] = expansion.value.expansionExtraInfo;
      }
      expansion.value.expanded = [];
      expansion.value.expansionExtraInfo = {};
      onDone();
      return obj;
    });
  };

  return {
    // Data
    expansion,
    // Methods
    acceptExpansionForKeyOnObject,
    cancelExpansion,
    checkReadyToGenerateExpansion,
    generateExpansion,
    getExpansionErrors
  };
}
