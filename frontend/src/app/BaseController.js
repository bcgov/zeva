/*
 * Base Container component
 * All data handling & manipulation should be handled here.
 */
import { Component } from 'react';

class BaseController extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: {},
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const { fields } = this.state;
    const { value, name } = event.target;

    fields[name] = value;
    this.setState({
      fields,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state);

    return false;
  }
}

export default BaseController;
