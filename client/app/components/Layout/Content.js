import React, { Component, PropTypes } from 'react';

export default class Content extends Component {
  render () {
    const { content } = this.props;

    return (
      <div className="col-sm-9 col-sm-offset-3 col-lg-10 col-lg-offset-2 main">
        {content}
      </div>
    );
  }
}
