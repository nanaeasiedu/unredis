import React, { Component, PropTypes } from 'react';
import Icon from './Core/Icon';

export default class Summary extends Component {
  render () {
    const { data } = this.props;
    return (
      <div className="row">
        <div className="col-xs-12 col-md-6 col-lg-3">
          <div className="panel panel-blue panel-widget ">
            <div className="row no-padding">
              <div className="col-sm-3 col-lg-5 widget-left">
                <Icon name="floppy-o" className="fa-3x" />
              </div>
              <div className="col-sm-9 col-lg-7 widget-right">
                <div className="large">{data.Memory.used_memory_human}</div>
                <div className="text-muted">Memory Usage</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-md-6 col-lg-3">
          <div className="panel panel-orange panel-widget">
            <div className="row no-padding">
              <div className="col-sm-3 col-lg-5 widget-left">
                <Icon name="tachometer" className="fa-3x" />
              </div>
              <div className="col-sm-9 col-lg-7 widget-right">
                <div className="large">{data.Stats.instantaneous_ops_per_sec}</div>
                <div className="text-muted">Commands/Sec</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-md-6 col-lg-3">
          <div className="panel panel-teal panel-widget">
            <div className="row no-padding">
              <div className="col-sm-3 col-lg-5 widget-left">
                <Icon name="bolt" className="fa-3x" />
              </div>
              <div className="col-sm-9 col-lg-7 widget-right">
                <div className="large">{data.CPU.used_cpu_sys}</div>
                <div className="text-muted">CPU Usage</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-md-6 col-lg-3">
          <div className="panel panel-red panel-widget">
            <div className="row no-padding">
              <div className="col-sm-3 col-lg-5 widget-left">
                <Icon name="user-o" className="fa-3x" />
              </div>
              <div className="col-sm-9 col-lg-7 widget-right">
                <div className="large">{data.Clients.connected_clients}</div>
                <div className="text-muted">Connected Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Summary.propTypes = {
  data: PropTypes.object.isRequired
}
