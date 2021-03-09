<template>
  <div>
    <div ref="plot" class="observationHistoryPlot">
      <vis-plot-control v-show="showZoomControls" @plotZoom="plotZoom" />
    </div>
    <div v-if="showLegend" class="observationHistoryPlotLegend text-center">
      <ul class="list-inline mt-1">
        <li class="list-inline-item">
          <span class="legend-item CANCELED align-middle mb-1 mr-1" />
          Superseded by new schedule
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item SCHEDULED align-middle mb-1 mr-1" />
          Scheduled
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item NOT_ATTEMPTED align-middle mb-1 mr-1" />
          Not Attempted
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item IN_PROGRESS align-middle mb-1 mr-1" />
          In Progress
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item FAILED align-middle mb-1 mr-1" />
          Failed
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item ABORTED align-middle mb-1 mr-1" />
          Aborted
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item PARTIALLY-COMPLETED align-middle mb-1 mr-1" />
          Partially Completed
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item COMPLETED align-middle mb-1 mr-1" />
          Completed
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import vis from 'vis';
import 'vis/dist/vis.css';
import _ from 'lodash';

import '@/assets/css/visPlot.css';
import VisPlotControl from './VisPlotControl.vue';
import { plotZoomMixin } from './visPlotMixins.js';

export default {
  name: 'ObservationHistoryPlot',
  components: {
    VisPlotControl
  },
  mixins: [plotZoomMixin],
  props: {
    // Observation data in the form returned from the `/api/requests/{requestId}/observations/` endpoint of the observation portal.
    // Observation states are applied as CSS classes to each observation in the plot, these can be used to customize styling.
    data: {
      type: Array,
      required: true
    },
    showZoomControls: {
      type: Boolean
    },
    showLegend: {
      type: Boolean
    }
  },
  data: function() {
    let options = {
      groupOrder: 'content',
      maxHeight: '450px',
      minHeight: '120px',
      align: 'right',
      dataAttributes: ['toggle', 'html'],
      selectable: false,
      snap: null,
      zoomKey: 'ctrlKey',
      moment: function(date) {
        return vis.moment(date).utc();
      },
      tooltip: {
        overflowMethod: 'cap'
      }
    };
    return {
      options: options
    };
  },
  computed: {
    toVis: function() {
      let visGroups = new vis.DataSet();
      let visData = new vis.DataSet();
      let timeline_min = 0;
      let timeline_max = 0;
      if (this.data.length > 0) {
        let previousObservation = this.data[0];
        let previousObservationIndex = 1;
        let index = 0;
        for (let i = 0; i < this.data.length; i++) {
          let observation = this.data[i];
          let state = observation.state;
          if (state === 'PENDING') {
            if (new Date(observation.end) > new Date()) {
              state = 'SCHEDULED';
            } else {
              state = 'NOT_ATTEMPTED';
            }
          }
          if (state != 'COMPLETED' && new Date(observation.end) < new Date() && observation.percent_completed > 0) {
            state = 'PARTIALLY-COMPLETED';
          }
          observation.state = state;

          if (_.isString(observation.fail_reason) && observation.fail_reason !== '') {
            observation.fail_reason = '<br/>reason: ' + observation.fail_reason;
          } else {
            observation.fail_reason = '';
          }

          if (_.isFinite(observation.percent_completed) && observation.percent_completed > 0) {
            observation.percent_completed = '<br/>percent completed: ' + observation.percent_completed.toFixed(1);
          } else {
            observation.percent_completed = '';
          }
          if (
            observation.start !== previousObservation.start ||
            observation.site !== previousObservation.site ||
            observation.state !== previousObservation.state ||
            observation.enclosure !== previousObservation.enclosure ||
            observation.telescope !== previousObservation.telescope
          ) {
            let className = 'timeline_observation ' + previousObservation.state;
            visGroups.add({ id: index, content: previousObservationIndex });
            visData.add({
              id: index,
              group: index,
              observationId: previousObservation.id,
              title:
                'telescope: ' +
                previousObservation.site +
                '.' +
                previousObservation.enclosure +
                '.' +
                previousObservation.telescope +
                previousObservation.percent_completed +
                previousObservation.fail_reason +
                '<br/>start: ' +
                previousObservation.start.replace('T', ' ') +
                '<br/>end: ' +
                previousObservation.end.replace('T', ' '),
              className: className,
              start: previousObservation.start,
              end: previousObservation.end,
              toggle: 'tooltip',
              html: true,
              type: 'range'
            });
            index++;
            previousObservationIndex = i + 1;
          }
          previousObservation = observation;
        }
        visGroups.add({ id: index, content: previousObservationIndex });
        visData.add({
          id: index,
          group: index,
          observationId: previousObservation.id,
          title:
            'telescope: ' +
            previousObservation.site +
            '.' +
            previousObservation.enclosure +
            '.' +
            previousObservation.telescope +
            previousObservation.percent_completed +
            previousObservation.fail_reason +
            '<br/>start: ' +
            previousObservation.start.replace('T', ' ') +
            '<br/>end: ' +
            previousObservation.end.replace('T', ' '),
          className: 'timeline_observation ' + previousObservation.state,
          start: previousObservation.start,
          end: previousObservation.end,
          toggle: 'tooltip',
          html: true,
          type: 'range'
        });
        index++;
        timeline_min = new Date(visData.get(index - 1)['start']);
        timeline_max = new Date(visData.get(index - 1)['end']);
        if (index > 12) {
          for (let k = index - 1; k >= index - 12; k--) {
            let start = new Date(visData.get(k)['start']);
            let end = new Date(visData.get(k)['end']);
            if (start < timeline_min) {
              timeline_min = start;
            }
            if (end > timeline_max) {
              timeline_max = end;
            }
          }
          timeline_max.setMinutes(timeline_max.getMinutes() + 30);
          timeline_min.setMinutes(timeline_min.getMinutes() - 30);
        }
      }
      return { datasets: visData, groups: visGroups, window: { start: timeline_min, end: timeline_max } };
    }
  },
  watch: {
    data: function() {
      let datasets = this.toVis;
      //Need to first zero out the items and groups or vis.js throws an error
      this.plot.setItems(new vis.DataSet());
      this.plot.setGroups(new vis.DataSet());
      this.plot.setGroups(datasets.groups);
      this.plot.setItems(datasets.datasets);
      this.plot.setWindow(datasets.window.start, datasets.window.end);
    }
  },
  mounted: function() {
    this.plot = this.buildPlot();
    let that = this;
    this.plot.on('click', function(event) {
      if (event.item !== null) {
        // An observation on the timeline was cliked, get that observation info
        let item = that.toVis.datasets.get(event.item);
        if (item !== null) {
          that.$emit('observationClicked', item.observationId);
        }
      }
    });
  },
  methods: {
    buildPlot: function() {
      // Set a unique name for the plot element, since vis.js needs this to separate plots
      this.$refs.plot.setAttribute('class', _.uniqueId(this.$refs.plot.className));
      return new vis.Timeline(this.$refs.plot, new vis.DataSet([]), this.options);
    }
  }
};
</script>
<style>
.SCHEDULED {
  background-color: #c8dac2;
  border-color: #658e57;
}

.NOT_ATTEMPTED {
  background-color: olive;
  border-color: darkolivegreen;
}

.CANCELED {
  background-color: grey;
  border-color: darkgrey;
}

.IN_PROGRESS {
  background-color: lightgreen;
  border-color: green;
}

.COMPLETED {
  color: white;
  background-color: green;
  border-color: darkgreen;
}

.PARTIALLY-COMPLETED {
  background-color: yellow;
  border-color: goldenrod;
}

.FAILED {
  background-color: red;
  border-color: maroon;
}

.ABORTED {
  background-color: orange;
  border-color: darkorange;
}
</style>
