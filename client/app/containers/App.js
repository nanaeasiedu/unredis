import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Content from '../components/Layout/Content';

export class App extends Component {
  render () {
    const self = this;
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { dispatch: self.props.dispatch, unredis: self.props.unredis });
    });

    return (
      <div>
        <Header />
        <Sidebar path={this.props.location.pathname} />
        <Content content={children} />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    unredis: state.init
  };
})(App)
