<template>
  <b-row class="p-3">
    <b-col cols="10" md="10">
      <pagination
        v-if="!isBusy"
        table-id="observations-table"
        :per-page="queryParams.limit"
        :total-rows="data.count"
        :current-page="currentPage"
        @pageChange="onPageChange"
      ></pagination>
      <b-row>
        <b-table
          id="observations-table"
          :items="data.results"
          :fields="fields"
          :tbody-tr-class="observationGroupRowClass"
          :busy="isBusy"
          small
          show-empty
          responsive
        >
          <template v-slot:table-busy>
            <br />
            <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading observations...</div>
            <br />
          </template>
          <template v-slot:empty>
            <div>
              <center>
                <br />
                <h2>No observations found</h2>
                <br />
              </center>
            </div>
          </template>
          <template v-slot:cell(id)="data">
            <text-display :text="data.item.id.toString()" :link="observationDetailLink(data.item.id)" />
          </template>
          <template v-slot:cell(start)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(end)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(modified)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(created)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(requestId)="data">
            <text-display :text="data.item.request.id.toString()" :link="requestgroupLink(data.item.request.id)" />
          </template>
          <template v-slot:cell(instruments)="data">
            <span v-for="instrument in parseInstrumentsInObservation(data.item)" :key="instrument">{{ instrument }}</span
            ><br />
          </template>
        </b-table>
      </b-row>
      <pagination
        v-if="!isBusy"
        table-id="observations-table"
        :per-page="queryParams.limit"
        :total-rows="data.count"
        :current-page="currentPage"
        @pageChange="onPageChange"
      ></pagination>
    </b-col>
    <b-col cols="2" md="2">
      <template v-if="filtersLoaded">
        <b-form @submit="onSubmit" @reset="onReset">
          <b-button-group class="my-2">
            <b-button type="submit" variant="outline-primary" :disabled="isBusy">
              <span>Filter</span>
            </b-button>
            <b-button type="reset" variant="outline-danger" :disabled="isBusy">
              <span>Reset</span>
            </b-button>
          </b-button-group>
          <b-form-group id="input-group-site" label="Site" label-for="input-site">
            <b-form-select id="input-site" v-model="queryParams.site" :options="formattedFilterOptions.site" multiple />
          </b-form-group>
          <b-form-group id="input-group-enclosure" label="Enclosure" label-for="input-enclosure">
            <b-form-select id="input-enclosure" v-model="queryParams.enclosure" :options="formattedFilterOptions.enclosure" multiple />
          </b-form-group>
          <b-form-group id="input-group-telescope" label="Telescope" label-for="input-telescope">
            <b-form-select id="input-telescope" v-model="queryParams.telescope" :options="formattedFilterOptions.telescope" multiple />
          </b-form-group>
          <b-form-group id="input-group-priority" label="Priority" label-for="input-priority">
            <b-form-input id="input-priority" v-model="queryParams.priority" type="number" />
          </b-form-group>
          <b-form-group id="input-group-state" label="State" label-for="input-state">
            <b-form-select id="input-state" v-model="queryParams.state" :options="formattedFilterOptions.state" multiple />
          </b-form-group>
          <b-form-group id="input-group-time-span" label="Time Span" label-for="input-time-span">
            <b-form-select id="input-time-span" v-model="queryParams.time_span" :options="formattedFilterOptions.time_span" />
          </b-form-group>
          <b-form-group id="input-group-start-after" label="Start After (Inclusive)" label-for="input-start-after">
            <b-form-input id="input-start-after" v-model="queryParams.start_after" type="date" />
          </b-form-group>
          <b-form-group id="input-group-start-before" label="Start Before" label-for="input-start-before">
            <b-form-input id="input-start-before" v-model="queryParams.start_before" type="date" />
          </b-form-group>
          <b-form-group id="input-group-modified-after" label="Modified After (Inclusive)" label-for="input-modified-after">
            <b-form-input id="input-modified-after" v-model="queryParams.modified_after" type="date" />
          </b-form-group>
          <b-form-group id="input-group-request-id" label="Request ID" label-for="input-request-id">
            <b-form-input id="input-request-id" v-model="queryParams.request_id" type="number" />
          </b-form-group>
          <b-form-group id="input-group-request-group-id" label="Request Group ID" label-for="input-request-group-id">
            <b-form-input id="input-request-group-id" v-model="queryParams.request_group_id" type="number" />
          </b-form-group>
          <b-form-group id="input-group-observation-type" label="Observation Type" label-for="input-observation-type">
            <b-form-select
              id="input-observation-type"
              v-model="queryParams.observation_type"
              :options="formattedFilterOptions.observation_type"
              multiple
            />
          </b-form-group>
          <b-form-group id="input-group-request-state" label="Request State" label-for="input-request-state">
            <b-form-select id="input-request-state" v-model="queryParams.request_state" :options="formattedFilterOptions.request_state" multiple />
          </b-form-group>
          <b-form-group id="input-group-proposal" label="Proposal" label-for="input-proposal">
            <b-form-input id="input-proposal" v-model="queryParams.proposal" type="text" />
          </b-form-group>
          <b-form-group id="input-group-instrument-type" label="Instrument Type" label-for="input-instrument-type">
            <b-form-select
              id="input-instrument-type"
              v-model="queryParams.instrument_type"
              :options="formattedFilterOptions.instrument_type"
              multiple
            />
          </b-form-group>
          <b-form-group id="input-group-configuration-type" label="Configuration Type" label-for="input-configuration-type">
            <b-form-select
              id="input-configuration-type"
              v-model="queryParams.configuration_type"
              :options="formattedFilterOptions.configuration_type"
              multiple
            />
          </b-form-group>
          <b-form-group id="input-group-ordering" label="Ordering" label-for="input-ordering">
            <b-form-select id="input-ordering" v-model="queryParams.ordering" :options="formattedFilterOptions.ordering" />
          </b-form-group>
          <b-button-group>
            <b-button type="submit" variant="outline-primary" :disabled="isBusy">
              <span>Filter</span>
            </b-button>
            <b-button type="reset" variant="outline-danger" :disabled="isBusy">
              <span>Reset</span>
            </b-button>
          </b-button-group>
        </b-form>
      </template>
      <template v-else>
        <div class="text-center">
          <i class="fa fa-spin fa-spinner" />
        </div>
      </template>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';
import Pagination from '@/components/Util/Pagination.vue';
import { TextDisplay } from '@/components/Util';
import { formatDate } from '@/util';
import { paginationAndFilteringMixin } from '@/mixins/paginationMixins.js';

export default {
  name: 'ObservationsTable',
  components: {
    Pagination,
    TextDisplay
  },
  filters: { formatDate },
  mixins: [paginationAndFilteringMixin],
  props: {
    observationPortalApiBaseUrl: {
      type: String,
      required: true
    },
    // `observationDetailLink` is a function that takes an observation ID as input and returns an object describing the
    // link to the proposal page, either { "href": ... } for a URL or { "to": ... } for a vue router target.
    // If supplied, the observation ID displayed for each row in the table will be a link.
    observationDetailLink: {
      type: Function,
      required: false,
      default: () => {} // By default, we don't generate a link.
    },
    // `requestgroupLink` is a function that takes a requestgroup ID as input and returns an object describing the
    // link to the proposal page, either { "href": ... } for a URL or { "to": ... } for a vue router target.
    // If supplied, the requestgroup ID displayed for each row in the table will be a link.
    requestgroupLink: {
      type: Function,
      required: false,
      default: () => {} // By default, don't generate a link.
    }
  },
  data: function() {
    return {
      fields: [
        { key: 'id' },
        'site',
        { key: 'enclosure', label: 'Enc.' },
        { key: 'telescope', label: 'Tel.' },
        { key: 'start' },
        { key: 'end' },
        { key: 'requestId', label: 'Req.ID' },
        'proposal',
        'instruments',
        { key: 'modified' },
        { key: 'created' }
      ],
      filtersLoaded: false,
      filterOptions: { fields: [], choice_fields: [] }
    };
  },
  computed: {
    formattedFilterOptions: function() {
      let options = {};
      for (let choiceField of this.filterOptions.choice_fields) {
        options[choiceField.name] = [];
        for (let option of choiceField.options) {
          options[choiceField.name].push({ value: option[0], text: option[1] });
        }
      }
      return options;
    }
  },
  created: function() {
    this.getFilterOptions();
  },
  methods: {
    // Overrides method in paginationAndFilteringMixin
    initializeDataEndpoint: function() {
      return this.observationPortalApiBaseUrl + '/api/observations/';
    },
    // Overrides method in paginationAndFilteringMixin
    initializeDefaultQueryParams: function() {
      const defaultQueryParams = {
        site: [],
        enclosure: [],
        telescope: [],
        state: ['COMPLETED', 'PENDING', 'IN_PROGRESS', 'ABORTED', 'FAILED', 'NOT_ATTEMPTED'],
        time_span: '',
        observation_type: [],
        request_state: [],
        instrument_type: [],
        configuration_type: [],
        ordering: '-start',
        start_after: '',
        start_before: '',
        modified_after: '',
        request_id: '',
        request_group_id: '',
        priority: '',
        limit: 50,
        offset: 0
      };
      return defaultQueryParams;
    },
    // Overrides method in pagination mixin
    onSuccessfulDataRetrieval: function() {
      this.$emit('onSuccessfulDataRetrieval');
    },
    // Overrides method in pagination mixin
    onErrorRetrievingData: function(response) {
      this.$emit('onErrorRetrievingData', response);
    },
    parseInstrumentsInObservation: function(observation) {
      let instruments = [];
      if (observation.request) {
        for (let configuration of observation.request.configurations) {
          if (instruments.indexOf(configuration.instrument_type) === -1) {
            instruments.push(configuration.instrument_type);
          }
        }
      }
      return instruments;
    },
    observationGroupRowClass: function(item, type) {
      if (!item || type !== 'row') {
        return;
      } else {
        if (item.state === 'COMPLETED') {
          return 'table-success';
        } else if (item.state === 'CANCELED' || item.state === 'NOT_ATTEMPTED') {
          return 'table-secondary';
        } else if (item.state === 'FAILED' || item.state === 'ABORTED') {
          return 'table-danger';
        } else if (item.state === 'IN_PROGRESS') {
          return 'table-warning';
        } else {
          return 'table-default';
        }
      }
    },
    getFilterOptions: function() {
      $.ajax({
        url: this.observationPortalApiBaseUrl + '/api/observations/filters/'
      }).done(response => {
        this.filterOptions = response;
        this.filtersLoaded = true;
      });
    }
  }
};
</script>
