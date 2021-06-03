<template>
  <div>
    <div ref="plot" class="telescopeStatesPlot">
      <vis-plot-control v-show="showZoomControls" @plotZoom="plotZoom" />
    </div>
    <div v-if="showLegend && legendData.length > 0" class="telescopeStatesPlotLegend text-center">
      <ul class="list-inline mt-1">
        <li v-for="legendItem in legendData" :key="legendItem.eventType" class="list-inline-item">
          <span class="legend-item align-middle mb-1 mr-1" :class="legendItem.eventType" />
          {{ legendItem.text }}
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
  name: 'TelescopeStatesPlot',
  components: {
    VisPlotControl
  },
  mixins: [plotZoomMixin],
  props: {
    // Telescope states data. Given telescope states at telescopes `abc.domx.1m0a` and `def.domx.2m0a` where
    // the first item is the site code, the second is the enclosure code, and the third is the telescope code,
    // the data is structured as such:
    //
    // {
    //   "abc.domx.1m0a": [
    //     {
    //       "telescope": "abc.domx.1m0a",
    //       "event_type": "AVAILABLE",
    //       "event_reason": "Available for scheduling",
    //       "start": "2021-02-10T03:08:21.512615Z",
    //       "end": "2021-02-10T03:12:42.221100Z"
    //     },
    //     {
    //       "telescope": "abc.domx.1m0a",
    //       "event_type": "AVAILABLE",
    //       "event_reason": "Available for scheduling",
    //       "start": "2021-02-11T03:04:25.780467Z",
    //       "end": "2021-02-11T03:13:46.530521Z"
    //     }
    //   ],
    //   "def.domx.2m0a": [
    //     {
    //       "telescope": "def.domx.2m0a",
    //       "event_type": "AVAILABLE",
    //       "event_reason": "Available for scheduling",
    //       "start": "2021-02-01T02:51:28.304584Z",
    //       "end": "2021-02-01T03:28:38.828000Z"
    //     },
    //     {
    //       "telescope": "def.domx.2m0a",
    //       "event_type": "NOT_OK_TO_OPEN",
    //       "event_reason": "Weather: Raining",
    //       "start": "2021-02-01T03:28:38.828000Z",
    //       "end": "2021-02-01T03:28:40.059000Z"
    //     }
    //   ]
    // }
    //
    // The event type code of the event will be applied as a class to each event on the plot. CSS rules setting the
    // `background-color` and `border-color` can be added to visually differentiate the states on the plot.
    data: {
      validator: function(value) {
        return value === undefined || typeof value === 'object';
      },
      default: function() {
        return undefined;
      }
    },
    // Mapping of 3-letter site code to CSS color
    siteCodeToColor: {
      type: Object,
      required: true
    },
    // Mapping of 3-letter site code to display name
    siteCodeToName: {
      type: Object,
      required: true
    },
    activeObservation: {
      type: Object,
      default: function() {
        return null;
      }
    },
    showZoomControls: {
      type: Boolean
    },
    // Array of objects with mapping from eventType to event type description to be displayed in the legend.
    legendData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    showLegend: {
      type: Boolean
    }
  },
  data: function() {
    let options = {
      groupOrder: 'id',
      stack: false,
      maxHeight: '450px',
      minHeight: '120px',
      align: 'left',
      dataAttributes: ['toggle', 'html'],
      selectable: false,
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
      let plotSites = new vis.DataSet();
      let visData = new vis.DataSet();

      if (this.data !== undefined) {
        let sorted_telescopes = Object.keys(this.data).sort(function keyOrder(k1, k2) {
          let s1 = k1.split('.')[2];
          let s2 = k2.split('.')[2];

          if (s1 < s2) return -1;
          else if (s1 > s2) return +1;
          else if (k1 < k2) return -1;
          else if (k1 > k2) return +1;
          else return 0;
        });

        let g = 0;
        let used_telescopes = {};
        for (let telescope in sorted_telescopes) {
          let site = sorted_telescopes[telescope].split('.')[0];
          if (!(site in used_telescopes)) {
            used_telescopes[site] = 0;
          }
          used_telescopes[site]++;
          plotSites.add({
            id: g,
            content: _.get(this.siteCodeToName, [site], site) + ' ' + used_telescopes[site],
            title: sorted_telescopes[telescope],
            style: 'color: ' + this.siteCodeToColor[sorted_telescopes[telescope].split('.')[0]] + ';' + 'width: 130px;'
          });
          for (let index in this.data[sorted_telescopes[telescope]]) {
            let event = this.data[sorted_telescopes[telescope]][index];
            visData.add({
              group: g,
              title: event['event_reason'] + '<br/>start: ' + event['start'].replace('T', ' ') + '<br/>end: ' + event['end'].replace('T', ' '),
              className: event['event_type'],
              start: event['start'],
              end: event['end'],
              toggle: 'tooltip',
              html: true,
              type: 'range'
            });
          }
          if (
            this.activeObservation !== null &&
            this.activeObservation.site === site &&
            this.activeObservation.enclosure === sorted_telescopes[telescope].split('.')[1] &&
            this.activeObservation.telescope === sorted_telescopes[telescope].split('.')[2]
          ) {
            visData.add({
              group: g,
              title:
                this.activeObservation.state.toLowerCase() +
                ' at ' +
                sorted_telescopes[telescope] +
                '<br/>start: ' +
                this.activeObservation.start +
                '<br/>end: ' +
                this.activeObservation.end,
              className: this.activeObservation.state,
              start: this.activeObservation.start,
              end: this.activeObservation.end,
              toggle: 'tooltip',
              html: true,
              type: 'range'
            });
          }
          g++;
        }
      }
      return { datasets: visData, groups: plotSites };
    }
  },
  watch: {
    data: function() {
      let datasets = this.toVis;
      // Need to first zero out the items and groups or vis.js throws an error
      this.plot.setItems(new vis.DataSet());
      this.plot.setGroups(new vis.DataSet());
      this.plot.setGroups(datasets.groups);
      this.plot.setItems(datasets.datasets);
    }
  },
  mounted: function() {
    this.plot = this.buildPlot();
  },
  methods: {
    buildPlot: function() {
      // Set a unique name for the plot element, since vis.js needs this to separate plots
      this.$refs.plot.setAttribute('class', _.uniqueId(this.$refs.plot.className));
      let plot = new vis.Timeline(this.$refs.plot, new vis.DataSet([]), this.options);
      let that = this;
      plot.on('rangechanged', function() {
        // On rangechanged, the user of this component can call the .updateWindow() method on the
        // component that is provided by the plotZoomMixin mixin.
        that.$emit('rangechanged', that.plot.getWindow());
      });
      return plot;
    }
  }
};
</script>
