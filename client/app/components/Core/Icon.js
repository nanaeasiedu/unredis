import React, { Component, PropTypes } from 'react';

export default class Icon extends Component {
  render () {
    var { name, className } = this.props;
    className = className || '';

    return (
      <i className={`fa fa-${name} ${className}`}></i>
    );
  }
}

Icon.propTypes = {
  name: PropTypes.string.isRequired
}
