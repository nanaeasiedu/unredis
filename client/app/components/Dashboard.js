import React, { Component, PropTypes } from 'react';
import Event from '../services/event';
import { getStats, getInfo, action, FETCH_STATS_SUCCESS } from '../actions';
import Summary from './Summary';
import Graph from './Graph';

export default class Dashboard extends Component {
  constructor (props) {
    super(props);

    const self = this;

    self.timer = null;
    self.eventSourceManager = new Event(function (data) {
      self.props.dispatch(action(FETCH_STATS_SUCCESS, { data }));
    });
  }

  dashboardInit () {
    this.props.dispatch(getStats());
    this.props.dispatch(getInfo());
  }

  componentDidMount () {
    this.dashboardInit();
    this.eventSourceManager.start();
    this.timer = setInterval(() => {
      this.props.dispatch(getInfo());
    }, 5000);
  }

  componentWillUnmount () {
    this.eventSourceManager.stop();
    clearInterval(this.timer);
  }

  render () {
    const { unredis } = this.props;

    if (!unredis || !unredis.data) return null;

    return (
      <div>
        <div className="row">
          <ol className="breadcrumb">
            <li><a href="#">Home</a></li>
            <li className="active">Dashboard</li>
          </ol>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <h1 className="page-header">Dashboard</h1>
          </div>
        </div>

        {unredis.data.info && (<Summary data={unredis.data.info} />)}
        {unredis.data.stats && (<Graph data={unredis.data.stats} recent={unredis.recent} />)}
      </div>
    );
  }
}
