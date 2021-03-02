<template>
  <b-row>
    <b-col md="9" cols="12">
      <b-pagination
        v-if="totalRows > perPage"
        :value="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        :aria-controls="tableId"
        @change="onPageChange"
      />
    </b-col>
    <b-col md="3" cols="12" class="text-right font-weight-bold">
      <template v-if="displayPerPageDropdown">
        <b-form-group label-for="perPageSelect">
          <b-form-select id="perPageSelect" :value="perPage" :options="perPageOptions" @change="onLimitChange" />
        </b-form-group>
      </template>
      <template v-else-if="!displayPerPageDropdown && totalRows > 0">
        <div>{{ totalRows }} result{{ totalRows === 1 ? '' : 's' }}</div>
      </template>
    </b-col>
  </b-row>
</template>
<script>
export default {
  name: 'Pagination',
  props: {
    // `tableId` is the ID of the table element to which the pagination applies
    tableId: {
      type: String,
      required: true
    },
    perPage: {
      validator: value => {
        return !isNaN(value);
      },
      required: true
    },
    totalRows: {
      validator: value => {
        return !isNaN(value);
      },
      required: true
    },
    currentPage: {
      validator: value => {
        return !isNaN(value);
      },
      required: true
    },
    displayPerPageDropdown: {
      type: Boolean
    }
  },
  data: function() {
    return {
      // TODO: Make this configurable
      perPageOptions: [
        { value: '5', text: 'Show: 5' },
        { value: '10', text: 'Show: 10' },
        { value: '20', text: 'Show: 20' },
        { value: '50', text: 'Show: 50' },
        { value: '100', text: 'Show: 100' }
      ]
    };
  },
  methods: {
    onPageChange: function(evt) {
      this.$emit('pageChange', evt);
    },
    onLimitChange: function(evt) {
      this.$emit('limitChange', evt);
    }
  }
};
</script>
