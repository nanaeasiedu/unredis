import React, { Component, PropTypes } from 'react';
import * as utils from '../utils';
import _ from 'lodash';

export default class Graph extends Component {
  constructor (props) {
    super(props);

    this.graph = null;
  }

  drawGraph (data, nextData) {
    if (this.graph) {
      if (_.isEqual(data, nextData)) return;

      var diff = [];
      for (var i = 0, l = data.length; i < l; i++) {
        var dataPoint = _.find(nextData, { created_at: data[i].created_at });
        if (!dataPoint) diff.push(nextData[i]);
      }

      diff.forEach((point) => {
        var label = utils.humanizeDate(point.created_at);
        var hit = point.hit_rate;
        var ops = point.instantaneous_ops_per_sec;

        this.graph.addData([hit, ops], label);
        this.graph.removeData();
      });
    } else {
      var labels = [];
      var dataForHitRate = [];
      var dataForOpsPerSec = [];

      data.sort((a, b) => a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0);
      data.forEach((graphData) => {
        labels.push(utils.humanizeDate(graphData.created_at));
        dataForHitRate.push(graphData.hit_rate);
        dataForOpsPerSec.push(graphData.instantaneous_ops_per_sec);
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
            label: 'Instantaneous Ops Per Sec',
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: dataForOpsPerSec
          }
        ]
      };
      const canvas = document.getElementById('line-chart');
      const ctx = canvas.getContext('2d');
      this.graph = new Chart(ctx).Line(startingData, { responsive: true });
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
      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-default">
            <div className="panel-heading">Real Time Statistics</div>
            <div className="panel-body">
              <div className="canvas-wrapper">
                <canvas className="stats-chart" id="line-chart" height="200" width="600"></canvas>
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
