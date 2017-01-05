import React, { Component, PropTypes } from 'react';
import Icon from '../Core/Icon';

export default class Sidebar extends Component {
  render () {
    const { path } = this.props;
    return (
      <div id="sidebar-collapse" className="col-sm-3 col-lg-2 sidebar">
        <ul className="nav menu">
          <li className={path === '/' ? 'active' : ''}>
            <a href="#/"><Icon className="glyph" name="tachometer" /> Dashboard</a>
          </li>
        </ul>
      </div>
    );
  }
}

Sidebar.propTypes = {
  path: PropTypes.string.isRequired
};
