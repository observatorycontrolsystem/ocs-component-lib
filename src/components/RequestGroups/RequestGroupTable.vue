<template>
  <b-container>
    <b-row>
      <b-col md="8" cols="12">
        <h3>{{ title }}</h3>
      </b-col>
      <b-col md="4" cols="12">
        <b-dropdown id="dropdown-rg-query-params" variant="outline-secondary" block right>
          <template v-slot:button-content><i class="fa fa-filter" /> Filter List</template>
          <b-dropdown-form>
            <b-form @submit="onSubmit" @reset="onReset">
              <b-form-group id="input-group-order" label-for="input-order" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fa fa-sort" /> Sort </template>
                <b-form-select id="input-order" v-model="queryParams.order" :options="orderOptions" size="sm" />
              </b-form-group>
              <b-form-group id="input-group-state" label-for="input-state" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fas fa-sync" /> State </template>
                <b-form-select id="input-state" v-model="queryParams.state" :options="stateOptions" multiple size="sm" />
              </b-form-group>
              <b-form-group id="input-group-exclude-state" label-for="input-exclude-state" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fas fa-sync" /> Exclude State </template>
                <b-form-select id="input-exclude-state" v-model="queryParams.exclude_state" :options="stateOptions" multiple size="sm" />
              </b-form-group>
              <b-form-group id="input-group-name" label-for="input-name" label-class="m-0" class="my-2">
                <b-form-input id="input-name" v-model="queryParams.name" placeholder="Name contains" size="sm" />
                <template v-slot:label> <i class="fa fa-paragraph" /> Name Contains </template>
              </b-form-group>
              <b-form-group id="input-group-target" label-for="input-target" label-class="m-0" class="my-2">
                <b-form-input id="input-target" v-model="queryParams.target" placeholder="Target Name Contains" size="sm" />
                <template v-slot:label> <i class="fa fa-crosshairs" /> Target Name Contains </template>
              </b-form-group>
              <b-form-group id="input-group-proposal" label-for="input-proposal" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fa fa-users" /> Proposal </template>
                <b-form-select id="input-proposal" v-model="queryParams.proposal" :options="proposalOptions" size="sm" />
              </b-form-group>
              <b-form-group id="input-group-semester" label-for="input-semester" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fa fa-calendar-check" /> Semester </template>
                <b-form-select id="input-semester" v-model="semesterSelect" :options="semesterOptions" size="sm" @change="onSemesterChange" />
              </b-form-group>
              <b-form-group id="input-group-created-after" label-for="input-created-after" label-class="m-0" class="my-2">
                <b-form-input id="input-created-after" v-model="queryParams.created_after" type="date" size="sm" />
                <template v-slot:label>
                  <i class="fa fa-calendar"> <i class="fa fa-arrow-right" /> </i> Submitted After
                </template>
              </b-form-group>
              <b-form-group id="input-group-created-before" label-for="input-created-before" label-class="m-0" class="my-2">
                <b-form-input id="input-created-before" v-model="queryParams.created_before" type="date" size="sm" />
                <template v-slot:label> <i class="fa fa-arrow-left" /> <i class="fa fa-calendar" /> Submitted Before </template>
              </b-form-group>
              <div v-if="!viewAuthoredRequestsOnly">
                <b-form-group id="input-group-user" label-for="input-user" label-class="m-0" class="my-2">
                  <b-form-input id="input-user" v-model="queryParams.user" placeholder="Username Contains" size="sm" />
                  <template v-slot:label> <i class="fa fa-user" /> Username Contains </template>
                </b-form-group>
              </div>
              <b-dropdown-divider />
              <b-button-group class="mx-4">
                <b-button type="submit" variant="outline-primary" :disabled="isBusy">
                  <span class="text-nowrap">Filter Results</span>
                </b-button>
                <b-button type="reset" variant="outline-danger" :disabled="isBusy">
                  <span class="text-nowrap">Clear All Fields</span>
                </b-button>
              </b-button-group>
            </b-form>
          </b-dropdown-form>
        </b-dropdown>
      </b-col>
    </b-row>
    <div>
      <b-table id="requestgroups-table" :items="data.results" :fields="fields" :tbody-tr-class="['border-bottom']" :busy="isBusy" small show-empty>
        <template v-slot:head(requestgroupInfo)>
          <b-row>
            <b-col md="4" cols="12">
              <div class="small">User Info</div>
            </b-col>
            <b-col md="4" cols="12">
              <div class="small">State Info</div>
            </b-col>
            <b-col md="4" cols="12">
              <div class="small text-truncate" title="#Requests / Pending / Failed / Complete">#Requests / Pending / Failed / Complete</div>
            </b-col>
          </b-row>
        </template>
        <template v-slot:table-busy>
          <slot name="loading-requests">
            <br />
            <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading observation requests...</div>
            <br />
          </slot>
        </template>
        <template v-slot:empty>
          <div>
            <slot name="empty-requests">No observation requests found.</slot>
          </div>
        </template>
        <template v-slot:cell(requestgroupInfo)="data">
          <request-group-overview
            :requestgroup="data.item"
            :proposal-link="proposalLink(data.item.proposal)"
            :requestgroup-link="requestgroupLink(data.item.id)"
          >
          </request-group-overview>
        </template>
      </b-table>
      <pagination
        v-if="!isBusy"
        table-id="requestgroups-table"
        :per-page="queryParams.limit"
        :total-rows="data.count"
        :current-page="currentPage"
        display-per-page-dropdown
        @pageChange="onPageChange"
        @limitChange="onLimitChange"
      ></pagination>
    </div>
  </b-container>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';

import { paginationAndFilteringMixin } from '@/mixins/paginationMixins.js';
import RequestGroupOverview from '@/components/RequestGroups/RequestGroupOverview.vue';
import Pagination from '@/components/Util/Pagination.vue';
import { formatDate } from '@/util';

export default {
  name: 'RequestGroupTable',
  components: {
    Pagination,
    RequestGroupOverview
  },
  mixins: [paginationAndFilteringMixin],
  props: {
    title: {
      type: String,
      required: false,
      default: 'Submitted Observation Requests',
      description: 'Title to be placed above the list of request groups'
    },
    observationPortalApiBaseUrl: {
      type: String,
      required: true,
      description: 'The base observation portal URL.'
    },
    profile: {
      type: Object,
      required: true,
      description: 'Object containing the response from the profile API endpoint.'
    },
    // `proposalLink` is a function that takes a proposal ID as input and returns an object describing the
    // link to the proposal page, either { "href": ... } for a URL or { "to": ... } for a vue router target.
    // If supplied, the proposal ID displayed for each row in the table will be a link.
    proposalLink: {
      type: Function,
      required: false,
      // eslint-disable-next-line no-unused-vars
      default: proposalId => {
        return {};
      }
    },
    // `requestgroupLink` is a function that takes a requestgroup ID as input and returns an object describing the
    // link to the proposal page, either { "href": ... } for a URL or { "to": ... } for a vue router target.
    // If supplied, the requestgroup ID displayed for each row in the table will be a link.
    requestgroupLink: {
      type: Function,
      required: false,
      // eslint-disable-next-line no-unused-vars
      default: requestgroupId => {
        return {};
      }
    }
  },
  data: function() {
    const stateOptions = [
      { value: '', text: '---------' },
      { value: 'PENDING', text: 'PENDING' },
      { value: 'COMPLETED', text: 'COMPLETED' },
      { value: 'FAILURE_LIMIT_REACHED', text: 'FAILURE_LIMIT_REACHED' },
      { value: 'WINDOW_EXPIRED', text: 'WINDOW_EXPIRED' },
      { value: 'CANCELED', text: 'CANCELED' }
    ];
    const orderOptions = [
      { value: '', text: '---------' },
      { value: 'name', text: 'Name' },
      { value: '-name', text: 'Name (descending)' },
      { value: 'modified', text: 'Last Update' },
      { value: '-modified', text: 'Last Update (descending)' },
      { value: 'created', text: 'Created' },
      { value: '-created', text: 'Created (descending)' },
      { value: 'end', text: 'End of window' },
      { value: '-end', text: 'End of window (descending)' }
    ];
    const semesterData = {};
    const semesterSelect = '';
    return {
      orderOptions: orderOptions,
      stateOptions: stateOptions,
      semesterData: semesterData,
      semesterSelect: semesterSelect,
      fields: [{ key: 'requestgroupInfo', tdClass: 'p-0 m-0', thClass: 'border-0' }]
    };
  },
  computed: {
    proposalOptions: function() {
      let selected = this.queryParams.proposal;
      let proposalInQuery = _.get(this.$route, 'query.proposal', '');
      let staffView = _.get(this.profile, 'profile.staff_view', false);
      let options = [{ value: '', text: '---------', selected: selected === '' }];
      // If an admin user is checking out proposals for a proposal they don't belong to, allow filtering to work
      if (staffView && proposalInQuery) {
        options.push({ value: proposalInQuery, text: proposalInQuery, selected: selected === proposalInQuery });
      }
      if (this.profile.proposals) {
        for (let proposal of this.profile.proposals) {
          let proposalText = `${proposal.id}: ${proposal.title}`;
          options.push({ value: proposal.id, text: proposalText, selected: selected === proposal.id });
        }
      }
      return options;
    },
    semesterOptions: function() {
      let semesterOptions = [{ value: '', text: '---------' }];
      for (let semesterId of Object.keys(this.semesterData)) {
        semesterOptions.push({ value: semesterId, text: semesterId });
      }
      return semesterOptions;
    },
    viewAuthoredRequestsOnly: function() {
      return this.profile.profile && this.profile.profile.view_authored_requests_only && !this.profile.profile.staff_view;
    }
  },
  created: function() {
    this.getSemesterOptions();
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.observationPortalApiBaseUrl + '/api/requestgroups/';
    },
    initializeDefaultQueryParams: function() {
      const defaultQueryParams = {
        proposal: '',
        order: '',
        state: [],
        exclude_state: [],
        name: '',
        target: '',
        created_after: '',
        created_before: '',
        user: '',
        limit: 20,
        offset: 0
      };
      return defaultQueryParams;
    },
    updateSemesterData: function(data) {
      for (let semester of data.results) {
        this.$set(this.semesterData, semester.id, semester);
      }
    },
    onSemesterChange: function(semesterId) {
      let selectedSemesterData = this.semesterData[semesterId];
      this.queryParams.created_after = formatDate(_.get(selectedSemesterData, 'start', ''), 'YYYY-MM-DD');
      this.queryParams.created_before = formatDate(_.get(selectedSemesterData, 'end', ''), 'YYYY-MM-DD');
    },
    onSuccessfulDataRetrieval: function(response) {
      this.$emit('success', response);
    },
    onErrorRetrievingData: function(response) {
      this.$emit('error', response);
    },
    getSemesterOptions: function() {
      let that = this;
      let datetimeNow = formatDate(moment.utc().format());
      $.ajax({
        url: this.observationPortalApiBaseUrl + '/api/semesters/?limit=20&start_lte=' + datetimeNow,
        type: 'GET'
      }).done(function(data) {
        that.updateSemesterData(data);
      });
    }
  }
};
</script>
