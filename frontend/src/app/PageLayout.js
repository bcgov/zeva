import React, {Component} from 'react';
import {hot} from 'react-hot-loader/root';
import './css/App.scss';
import {withRouter} from "react-router";
import {withKeycloak} from "react-keycloak";

class PageLayout extends Component {

  render() {
    return (
      <div>
        {this.props.keycloak.authenticated && <span>Authenticated</span>}
        {this.props.keycloak.authenticated || <div>
          <span>Not Authenticated</span>
          <button onClick={() => this.props.keycloak.login()}>Login</button>
        </div>}
        {this.props.children}
      </div>
    );
  }
}


export default hot(withRouter(withKeycloak(PageLayout)));
