<template>
  <b-container fluid class="p-0">
    <template v-if="dataLoadError">
      <slot name="data-load-error">
        <p class="text-center my-2">
          {{ loadErrorMessage }}
        </p>
      </slot>
    </template>
    <template v-else-if="!dataLoaded">
      <slot name="data-loading">
        <div class="text-center my-2">
          <i class="fa fa-spin fa-spinner" />
        </div>
      </slot>
    </template>
    <template v-else-if="dataLoaded && dataNotFound">
      <slot name="not-found">
        {{ notFoundMessage }}
      </slot>
    </template>
    <template v-else>
      <slot> </slot>
    </template>
  </b-container>
</template>
<script>
export default {
  name: 'DataLoader',
  props: {
    dataLoaded: {
      type: Boolean,
      required: true
    },
    dataLoadError: {
      type: Boolean,
      required: true
    },
    dataNotFound: {
      type: Boolean,
      required: true
    },
    loadErrorMessage: {
      type: String,
      default: 'Oops, there was a problem getting your data. Please try again.'
    },
    notFoundMessage: {
      type: String,
      default: 'Not found.'
    }
  }
};
</script>
