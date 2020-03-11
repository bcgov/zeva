import PropTypes from 'prop-types';
import React, { Component } from 'react';

import StatusInterceptor from './StatusInterceptor';

class ErrorHandler extends Component {
  constructor(props) {
    super(props);

    this.state = { errorOccurred: false };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.error(info);
    this.setState({ errorOccurred: true });
  }

  render() {
    const { children } = this.props;
    const { errorOccurred } = this.state;

    if (errorOccurred) {
      return <StatusInterceptor />;
    }

    return children;
  }
}

ErrorHandler.defaultProps = {};

ErrorHandler.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorHandler;
