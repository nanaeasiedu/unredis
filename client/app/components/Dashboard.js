import React, { Component, PropTypes } from 'react';
import { getStats } from '../actions';
import Summary from './Summary';
import Graph from './Graph';

export default class Dashboard extends Component {
  constructor (props) {
    super(props);

    this.timer = null;
  }

  dashboardInit () {
    this.props.dispatch(getStats());
  }

  componentDidMount () {
    this.dashboardInit();

    this.timer = setInterval(() => {
      this.dashboardInit();
    }, 5000);
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

        <Summary data={unredis.data.infoData} />
        <Graph data={unredis.data.statsData} />
      </div>
    );
  }
}
