import React, { Component, PropTypes } from 'react';
import * as utils from '../utils';
import _ from 'lodash';

export default class Graph extends Component {
  constructor (props) {
    super(props);
    this.keyspaceGraph = null;
    this.memGraph = null;
    this.instantsGraph = null;

    this.drawnGraph = false;
  }

  componentWillUnmount () {
    this.keyspaceGraph.destroy();
    this.keyspaceGraph = null;
  }

  drawGraph (data, previousData) {
    if (this.drawnGraph) {
      if (_.isEqual(data, previousData)) return;

      var diff = [];
      for (var i = 0, l = data.length; i < l; i++) {
        var dataPoint = _.find(previousData, { created_at: data[i].created_at });
        if (!dataPoint) diff.push(data[i]);
      }

      diff.forEach((point) => {
        var label = utils.humanizeDate(point.created_at);
        var hit = point.hit_rate;
        var ops = point.keyspace_misses;

        this.keyspaceGraph.addData([hit, ops], label);
        this.keyspaceGraph.removeData();
      });
    } else {
      var labels = [];
      var dataForHitRate = [];
      var dataForMisses = [];

      data.sort((a, b) => a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0);
      data.forEach((graphData) => {
        labels.push(utils.humanizeDate(graphData.created_at));
        dataForHitRate.push(graphData.hit_rate);
        dataForMisses.push(graphData.keyspace_misses);
      });
      var startingData = {
        labels: labels,
        datasets: [
          {
            label: 'Hit rate',
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: dataForHitRate
          },
          {
            label: 'Keyspace Misses - keyspace hits/(keyspace hits + keyspace misses)',
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: dataForMisses
          }
        ]
      };
      const canvas = document.getElementById('line-chart');
      const ctx = canvas.getContext('2d');
      this.keyspaceGraph = new Chart(ctx).Line(startingData, { responsive: true });
      document.getElementById('js-legend').innerHTML = this.keyspaceGraph.generateLegend();
      this.drawnGraph = true;
    }
  }

  componentWillReceiveProps (nextProps) {
    this.drawGraph(nextProps.data, this.props.data);
  }

  componentDidMount () {
    this.drawGraph(this.props.data);
  }

  render () {
    return (
      <div>

        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">Keyspace</div>
              <div className="panel-body">
                <div id="js-legend" className="chart-legend"></div>
                <div className="canvas-wrapper">
                  <canvas className="stats-chart" id="line-chart" height="200" width="600"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-default">
              <div className="panel-heading">Memory Usage</div>
              <div className="panel-body">
                <div id="mem-legend" className="chart-legend"></div>
                <div className="canvas-wrapper">
                  <canvas className="stats-chart" id="mem-chart" height="200" width="600"></canvas>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="panel panel-default">
              <div className="panel-heading">Instantaneous Ops Per Sec</div>
              <div className="panel-body">
                <div id="ops-legend" className="chart-legend"></div>
                <div className="canvas-wrapper">
                  <canvas className="stats-chart" id="ops-chart" height="200" width="600"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    );
  }
}

Graph.propTypes = {
  data: PropTypes.array.isRequired
};
