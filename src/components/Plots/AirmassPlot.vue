<template>
  <div ref="plot" class="airmassPlot">
    <vis-plot-control v-show="showZoomControls" @plotZoom="plotZoom" />
  </div>
</template>
<script>
import vis from 'vis';
import 'vis/dist/vis.css';
import $ from 'jquery';
import _ from 'lodash';
import '@/assets/css/visPlot.css';

import VisPlotControl from './VisPlotControl.vue';
import { plotZoomMixin } from './visPlotMixins.js';

export default {
  name: 'AirmassPlot',
  components: {
    VisPlotControl
  },
  mixins: [plotZoomMixin],
  props: {
    // Airmass data. Assuming there is visibility at a site with site code "abc", data is in the following form:
    // {
    //   "airmass_data": {
    //     "abc": {
    //       "times": [
    //         "2021-02-10T03:08",
    //         "2021-02-11T03:04"
    //       ],
    //       "airmasses": [
    //         1.9937497463966114,
    //         1.993729745536924
    //       ]
    //     }
    //   },
    //   "airmass_limit": 2.0
    // }
    data: {
      type: Object,
      required: true
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
    showZoomControls: {
      type: Boolean
    },
    alignleft: {
      type: Boolean
    }
  },
  data: function() {
    let options = {
      dataAxis: {
        left: {
          format: function(value) {
            return Math.abs(value).toPrecision(2);
          }
        },
        width: this.alignleft ? '129px' : ''
      },
      orientation: 'top',
      legend: {
        enabled: true,
        left: {
          visible: true,
          position: 'bottom-right'
        }
      },
      zoomKey: 'ctrlKey',
      moment: function(date) {
        return vis.moment(date).utc();
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
      if (!$.isEmptyObject(this.data)) {
        let i = 0;
        let airmass_limit = this.data.airmass_limit;
        for (let site in this.data.airmass_data) {
          let airmasses = this.data.airmass_data[site]['airmasses'];
          let airmass_times = this.data.airmass_data[site]['times'];
          let p = 0;
          let last_time = new Date(airmass_times[0] + 'Z');
          let current_time = last_time;
          plotSites.add({
            id: i,
            content: _.get(this.siteCodeToName, [site], site),
            options: {
              drawPoints: {
                enabled: true,
                size: 9,
                style: 'circle',
                styles: 'stroke:' + this.siteCodeToColor[site] + '; fill: ' + this.siteCodeToColor[site] + '; visibility: hidden;'
              },
              excludeFromLegend: false
            },
            style: 'stroke: ' + this.siteCodeToColor[site] + ';'
          });
          for (p = 0; p < airmass_times.length; p++) {
            current_time = new Date(airmass_times[p] + 'Z');
            // This 16 is a magic number, greater than the spacing between datapoints to detect horizon split
            if (Math.floor((current_time - last_time) / 1000.0 / 60.0) > 16.0) {
              //another group is used for the case when the horizon is split in the >24 hour period, so we
              //have separate time groups that are above the airmass threshold
              i++;
              plotSites.add({
                id: i,
                content: _.get(this.siteCodeToName, [site], site),
                options: {
                  drawPoints: {
                    enabled: true,
                    size: 7,
                    style: 'circle',
                    styles: 'stroke:' + this.siteCodeToColor[site] + '; fill: ' + this.siteCodeToColor[site] + '; visibility: hidden;'
                  },
                  excludeFromLegend: true
                },
                style: 'stroke: ' + this.siteCodeToColor[site] + ';'
              });
            }
            last_time = current_time;
            visData.add([
              {
                x: airmass_times[p] + 'Z',
                y: -airmasses[p],
                group: i,
                label: {
                  content:
                    'Site: ' +
                    _.get(this.siteCodeToName, [site], site) +
                    '<br>Time: ' +
                    airmass_times[p].replace('T', ' ') +
                    '<br>Airmass: ' +
                    airmasses[p].toFixed(2),
                  className: 'graphtt'
                }
              }
            ]);
          }
          i++;
        }
        // Now add a group for the airmass limit line
        plotSites.add({
          id: i,
          content: 'limit',
          options: {
            drawPoints: { enabled: false },
            excludeFromLegend: false
          },
          style: 'stroke: black;'
        });
        if (airmass_limit) {
          let limitMin = new Date(visData.min('x')['x']);
          limitMin.setMinutes(limitMin.getMinutes() - 30);
          let limitMax = new Date(visData.max('x')['x']);
          limitMax.setMinutes(limitMax.getMinutes() + 30);
          visData.add([
            { x: limitMin, y: -1 * airmass_limit, group: i },
            { x: limitMax, y: -1 * airmass_limit, group: i }
          ]);
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
      this.plot.fit();
    }
  },
  mounted: function() {
    this.plot = this.buildPlot();
  },
  methods: {
    buildPlot: function() {
      // Set a unique name for the plot element, since vis.js needs this to separate plots
      this.$refs.plot.setAttribute('class', _.uniqueId(this.$refs.plot.className));
      let plot = new vis.Graph2d(this.$refs.plot, new vis.DataSet([]), this.options);
      let that = this;
      plot.on('changed', function() {
        $(that.$el)
          .find('.vis-point')
          .each(function() {
            $(this).attr(
              'title',
              $(this)
                .next()
                .text()
            );
            $(this).attr(
              'data-original-title',
              $(this)
                .next()
                .text()
            );
            $(this).attr('data-html', 'true');
            let label = $(this).next();
            $(this).appendTo($(this).parent());
            label.appendTo($(this).parent());
          });
        $(that.$el)
          .find('.vis-legend svg path')
          .each(function() {
            $(this).appendTo($(this).parent());
          });
      });
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
