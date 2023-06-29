import PropTypes from 'prop-types'
import React, { Component } from 'react'

class StatusInterceptor extends Component {
  static render400Message () {
    return (
      <div className="alert alert-danger" role="alert">
        <p>Please review the form for errors then try again.</p>
      </div>
    )
  }

  static render401Message () {
    return (
      <div>
        <p>
          It looks like you don&apos;t have an account setup yet, or that you
          are trying to access a page that you do not have permissions to see.
        </p>
        <p>Please contact your administrator to get your account setup.</p>
      </div>
    )
  }

  static render403Message () {
    return (
      <p>
        It looks like you don&apos;t have the permission to access this page. If
        you&apos;re supposed to have access to the page. Please contact your
        administrator.
      </p>
    )
  }

  static render404Message () {
    return (
      <div>
        <p>The requested page could not be found.</p>
        <p>
          To trade this page for a valid one click{' '}
          <a href="/" className="alert-link">
            here
          </a>
          .
        </p>
      </div>
    )
  }

  static render500Message () {
    return (
      <p>
        It looks like our system is experiencing some technical difficulties.
        Please try again later.
      </p>
    )
  }

  static render502Message () {
    return (
      <p>
        It looks like our system is currently down for maintenance. Please check
        back in a few minutes.
      </p>
    )
  }

  static renderDefaultMessage () {
    return (
      <p>
        It looks like our system is experiencing some technical difficulties.
        Please try again later.
      </p>
    )
  }

  render () {
    const { statusCode } = this.props
    let content

    switch (statusCode) {
      case 400:
        return StatusInterceptor.render400Message()
      case 401:
        content = StatusInterceptor.render401Message()
        break
      case 403:
        content = StatusInterceptor.render403Message()
        break
      case 404:
        content = StatusInterceptor.render404Message()
        break
      case 500:
        content = StatusInterceptor.render500Message()
        break
      case 502:
        content = StatusInterceptor.render502Message()
        break
      default:
        content = StatusInterceptor.renderDefaultMessage()
    }

    return (
      <div className="alert alert-danger" role="alert">
        <h3 className="alert-heading mb-4">We&apos;re sorry.</h3>
        {content}
      </div>
    )
  }
}

StatusInterceptor.defaultProps = {
  statusCode: null
}

StatusInterceptor.propTypes = {
  statusCode: PropTypes.number
}

export default StatusInterceptor
