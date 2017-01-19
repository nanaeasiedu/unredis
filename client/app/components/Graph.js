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

    this.keyspaceConfig = null;
    this.memConfig = null;
    this.instantsConfig = null;
    this.lastTime = null;
  }

  componentWillUnmount () {
    this.keyspaceGraph.destroy();
    this.keyspaceGraph = null;
  }

  drawGraph (props, prevProps) {
    if (this.drawnGraph) {
      if (_.isEqual(props.recent, prevProps.recent)) return;

      this.lastTime = props.recent.created_at;
      var point = props.recent;
      var label = utils.humanizeDate(point.created_at);
      var hit = point.hit_rate;
      var keypsaceMisses = point.keyspace_misses;
      var mem = point.used_memory;
      var ops = point.instantaneous_ops_per_sec;

      this.keyspaceGraph.addData([hit, keypsaceMisses], label);
      this.memGraph.addData([mem], label);
      this.instantsGraph.addData([ops], label);

      this.keyspaceGraph.removeData();
      this.instantsGraph.removeData();
      this.memGraph.removeData();
  } else {
      const defaultOptions = {
        responsive: true,
        animationSteps: 15
      };

      var data = props.data;
      var labels = [];
      var dataForHitRate = [];
      var dataForMisses = [];
      var lastFiveDataPoints = data.slice(data.length - 5);
      var lastFiveMem = [];
      var lastFiveOps = [];

      data.sort((a, b) => a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0);
      data.forEach((graphData) => {
        labels.push(utils.humanizeDate(graphData.created_at));
        dataForHitRate.push(graphData.hit_rate);
        dataForMisses.push(graphData.keyspace_misses);
      });
      lastFiveDataPoints.forEach((data) => {
        lastFiveMem.push(data.used_memory);
        lastFiveOps.push(data.instantaneous_ops_per_sec);
      });

      var lastFiveLabels = labels.slice(labels.length - 5);
      var lastFiveLabelsAnother = [...lastFiveLabels];

      const keyspaceConfig = {
        labels: labels,
        datasets: [
          {
            label: 'Hit rate - keyspace hits/(keyspace hits + keyspace misses)',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            data: dataForHitRate
          },
          {
            label: 'Keyspace Misses',
            fillColor: 'rgba(151,187,205,0.2)',
            strokeColor: 'rgba(151,187,205,1)',
            pointColor: 'rgba(151,187,205,1)',
            pointStrokeColor: '#fff',
            data: dataForMisses
          }
        ]
      };

      const memConfig = {
        labels: lastFiveLabels,
        datasets: [{
          label: 'Memory Usage',
          fillColor: '#1ebfae',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          data: lastFiveMem
        }]
      };

      const instantsConfig = {
        labels: lastFiveLabelsAnother,
        datasets: [{
          label: 'Instantaneous Ops/sec',
          fillColor: '#30a5ff',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          data: lastFiveOps
        }]
      };

      const canvas = document.getElementById('line-chart');
      const canvasForMem = document.getElementById('mem-chart');
      const canvasForOps = document.getElementById('ops-chart');

      this.keyspaceGraph = new Chart(canvas.getContext('2d')).Line(keyspaceConfig, defaultOptions);
      this.memGraph = new Chart(canvasForMem.getContext('2d')).Line(memConfig, defaultOptions);
      this.instantsGraph = new Chart(canvasForOps.getContext('2d')).Line(instantsConfig, defaultOptions);
      document.getElementById('js-legend').innerHTML = this.keyspaceGraph.generateLegend();
      this.drawnGraph = true;
    }
  }

  componentDidUpdate (prevProps) {
    this.drawGraph(this.props, prevProps);
  }

  componentDidMount () {
    this.drawGraph(this.props);
  }

  render () {
    return (
      <div>

        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">Keyspace</div>
              <div className="panel-body">
                <div id="js-legend"></div>
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
