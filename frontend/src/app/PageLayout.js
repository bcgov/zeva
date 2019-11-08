import React, {Component} from 'react';
import {hot} from 'react-hot-loader/root';
import './css/App.scss';
import {withRouter} from "react-router";

class PageLayout extends Component {

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}


export default hot(withRouter(PageLayout));
