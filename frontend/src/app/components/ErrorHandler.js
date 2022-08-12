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
    const { children, statusCode } = this.props;
    const { errorOccurred } = this.state;

    if (errorOccurred) {
      return <StatusInterceptor />;
    }

    if (statusCode && statusCode > 400) {
      return <StatusInterceptor statusCode={statusCode} />;
    }

    return children;
  }
}

ErrorHandler.defaultProps = {
  statusCode: null
};

ErrorHandler.propTypes = {
  children: PropTypes.node.isRequired,
  statusCode: PropTypes.number
};

export default ErrorHandler;
