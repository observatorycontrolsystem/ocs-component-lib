import $ from 'jquery';

export var getDataMixin = {
  /*
  Mixin to retrieve a single object from the observation portal API given an endpoint to query.
  You must override the `initializeDataEndpoint()` function. This mixin works well with the DataLoader
  component.
  */
  data: function() {
    const dataEndpoint = this.initializeDataEndpoint();
    return {
      dataLoadError: false,
      dataLoaded: false,
      dataNotFound: false,
      data: this.initializeEmptyData(),
      dataEndpoint: dataEndpoint
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  created: function() {
    this.getData();
  },
  methods: {
    initializeDataEndpoint: function() {
      // Override this method to initialize the endpoint from which data will be retrieved.
      return '';
    },
    setDataEndpoint: function(newEndpoint) {
      this.dataEndpoint = newEndpoint;
    },
    initializeEmptyData: function() {
      return {};
    },
    getData: function() {
      this.clearLoadStates();
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + this.dataEndpoint
      })
        .done(function(response) {
          that.successCallback(response);
        })
        .fail(function(response) {
          that.failCallback(response);
        })
        .always(function() {
          that.dataLoaded = true;
        });
    },
    clearLoadStates: function() {
      this.dataLoaded = false;
      this.dataLoadError = false;
      this.dataNotFound = false;
    },
    failCallback: function(response) {
      if (response.status === 404 || response.status === 403) {
        this.dataNotFound = true;
      } else {
        this.dataLoadError = true;
      }
    },
    successCallback: function(response) {
      this.data = response;
      this.onSuccessfulRetrieval(response);
    },
    onSuccessfulRetrieval: function(response) {
      // Override this function to run an action when data retrieval is successful.
      return response;
    }
  }
};

export var getDataListMixin = {
  /*
  Extends `getDataMixin`.

  Mixin to retrieve a list of objects from the observation portal API given an endpoint to query.
  You must override the `initializeDataEndpoint()` function.
  */
  mixins: [getDataMixin],
  data: function() {
    return {
      setNotFoundOnEmptyList: this.initializeSetNotFoundOnEmptyList()
    };
  },
  methods: {
    initializeEmptyData: function() {
      return [];
    },
    initializeSetNotFoundOnEmptyList: function() {
      // Override this to return true if the desired behavior is to set that data is not found
      // when an empty list is returned.
      return false;
    },
    successCallback(response) {
      if (response.length < 1 && this.setNotFoundOnEmptyList) {
        this.dataNotFound = true;
      } else {
        this.onSuccessfulRetrieval(response);
        this.data = response;
      }
    }
  }
};

export var getDataListWithCountMixin = {
  /*
  Extends `getDataListMixin`.

  Mixin to retrieve an object containing a list of results as well as a count of how many results
  there are in total from the observation portal API given an endpoint to query. You must override
  the `initializeDataEndpoint()` function.
  */
  mixins: [getDataListMixin],
  methods: {
    initializeEmptyData: function() {
      return { count: 0, results: [] };
    },
    successCallback(response) {
      if (response.results.length < 1 && this.setNotFoundOnEmptyList) {
        this.dataNotFound = true;
      } else {
        this.onSuccessfulRetrieval(response);
        this.data = response;
      }
    }
  }
};
