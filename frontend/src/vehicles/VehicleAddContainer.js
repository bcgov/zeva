/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React from 'react';

import BaseController from '../app/BaseController';
import VehicleForm from './components/VehicleForm';

class VehicleAddContainer extends BaseController {
  handleSubmit(event) {
    event.preventDefault();

    const data = this.state.fields;

    axios.post('vehicles', data).then((response) => {
      console.log(response);
    });

    return false;
  }

  render() {
    return (
      <VehicleForm
        handleInputChange={this.handleInputChange}
        handleSubmit={this.handleSubmit}
      />
    );
  }
}

VehicleAddContainer.propTypes = {
};

export default VehicleAddContainer;
