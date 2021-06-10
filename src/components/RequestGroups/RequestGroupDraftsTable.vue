<template>
  <div>
    <b-table
      :id="tableId"
      :fields="fields"
      :items="data.results"
      :per-page="perPage"
      :current-page="currentPage"
      :busy="!dataLoaded"
      show-empty
      v-bind="extraTableAttrs"
    >
      <template #table-busy>
        <slot name="table-busy">
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading draft observation requests</div>
        </slot>
      </template>
      <template #empty>
        <slot name="table-empty">
          <div>You have no draft observation requests</div>
        </slot>
      </template>
      <template #cell(extra-field)="data">
        <slot name="extra-field-content" :row-data="data.item"></slot>
      </template>
      <template v-slot:cell(delete)="data">
        <b-button v-bind="extraDeleteButtonAttrs" @click="confirm('Are you sure you want to delete this draft?', deleteDraft, data.item.id)">
          <slot name="delete-button-content">
            <i class="fa fa-trash" />
          </slot>
        </b-button>
      </template>
    </b-table>
    <pagination :current-page="currentPage" :table-id="tableId" :per-page="perPage" :total-rows="totalRows" @pageChange="onPageChange" />
  </div>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { getDataListWithCountMixin } from '@/mixins/getDataMixins.js';
import { confirmMixin } from '@/mixins/confirmMixins.js';
import { Pagination } from '@/components/Util';
import { formatDate } from '@/util.js';

export default {
  name: 'RequestGroupDraftsTable',
  components: {
    Pagination
  },
  mixins: [getDataListWithCountMixin, confirmMixin],
  props: {
    tableId: {
      type: String,
      required: true
    },
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    perPage: {
      type: Number,
      default: 20
    },
    extraTableAttrs: {
      type: Object,
      default: () => {
        return {};
      }
    },
    showExtraField: {
      type: Boolean
    },
    extraFieldPositionIndex: {
      type: Number,
      default: 0
    },
    extraFieldLabel: {
      type: String,
      default: ''
    },
    showDeleteButton: {
      type: Boolean
    },
    extraDeleteButtonAttrs: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data: function() {
    let fields = [
      'id',
      'title',
      'author',
      'proposal',
      {
        key: 'modified',
        label: 'Modified Time',
        formatter: function(value) {
          return formatDate(value);
        }
      }
    ];
    if (this.showDeleteButton) {
      fields.push({ key: 'delete', class: 'text-center' });
    }
    if (this.showExtraField && this.extraFieldPositionIndex >= 0) {
      fields.splice(this.extraFieldPositionIndex, 0, { key: 'extra-field', label: this.extraFieldLabel });
    }
    return {
      currentPage: 1,
      fields: fields
    };
  },
  computed: {
    totalRows: function() {
      // TODO: Update when table is paginated properly
      return _.min([this.data.count, 100]);
    }
  },
  methods: {
    // Overrides method in getDataListWithCountMixin
    initializeDataEndpoint: function() {
      // TODO: Paginate results in table properly.
      return `${this.observationPortalApiBaseUrl}/api/drafts/?limit=100`;
    },
    // Overrides method in getDataListWithCountMixin
    onSuccessfulRetrieval: function(response) {
      this.$emit('onSuccessfulRetrieval', response);
    },
    // Overrides method in getDataListWithCountMixin
    onDataRetrievalError: function(response) {
      this.$emit('onDataRetrievalError', response);
    },
    onPageChange: function(newPage) {
      this.currentPage = newPage;
    },
    deleteDraft: function(draftId) {
      $.ajax({
        type: 'DELETE',
        url: `${this.observationPortalApiBaseUrl}/api/drafts/${draftId}/`
      })
        .done(response => {
          this.$emit('delete-draft-succeeded', response);
          this.getData();
        })
        .fail(response => {
          this.$emit('delete-draft-failed', response);
        });
    }
  }
};
</script>
