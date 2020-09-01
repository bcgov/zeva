/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import CustomPropTypes from '../app/utilities/props';
import VehicleSupplierEditForm from './components/VehicleSupplierEditForm';
import history from '../app/History';
import parseErrorResponse from '../app/utilities/parseErrorResponse';

const VehicleSupplierEditContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [display, setDisplay] = useState({});
  const [errorFields, setErrorFields] = useState({});
  const [loading, setLoading] = useState(true);
  const { keycloak, newSupplier } = props;
  const [serviceSame, setServiceSame] = useState(false);
  const refreshDetails = () => {
    if (newSupplier) {
      setLoading(false);
      setDetails({
        organizationAddress: {},
      });
    }

    if (!newSupplier) {
      setLoading(true);
      axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
        const addresses = {};
        response.data.organizationAddress.forEach(element => {
          addresses[`${element.addressType.addressType}_addressLine_1`] = element.addressLine1;
          addresses[`${element.addressType.addressType}_addressLine_2`] = element.addressLine2;
          addresses[`${element.addressType.addressType}_addressLine_3`] = element.addressLine3;
          addresses[`${element.addressType.addressType}_city`] = element.city;
          addresses[`${element.addressType.addressType}_state`] = element.state;
          addresses[`${element.addressType.addressType}_country`] = element.country;
          addresses[`${element.addressType.addressType}_postalCode`] = element.postalCode;
        });

        setDetails({
          ...response.data,
          organizationAddress: addresses,
        });
        setDisplay({ ...response.data, organizationAddress: addresses });
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    setDetails({
      ...details,
      [name]: value,
    });
  };

  const handleAddressChange = (event) => {
    const { value, name } = event.target;
    setDetails({
      ...details,
      organizationAddress: {
        ...details.organizationAddress,
        [name]: value,
      },
    });
  };

  const handleSubmit = () => {
    let formData = {};
    const recordsAddress = {
      addressType: 'Records',
      addressLine_1: details.organizationAddress.Records_addressLine_1,
      addressLine_2: details.organizationAddress.Records_addressLine_2,
      city: details.organizationAddress.Records_city,
      state: 'BC',
      country: 'Canada',
      postalCode: details.organizationAddress.Records_postalCode,
    };
    let serviceAddress;
    if (serviceSame) {
      serviceAddress = { ...recordsAddress, addressType: 'Service' };
    } else {
      serviceAddress = {
        addressType: 'Service',
        addressLine_1: details.organizationAddress.Service_addressLine_1,
        addressLine_2: details.organizationAddress.Service_addressLine_2,
        city: details.organizationAddress.Service_city,
        state: details.organizationAddress.Service_state,
        country: details.organizationAddress.Service_country,
        postalCode: details.organizationAddress.Service_postalCode,
      };
    }
    formData = {...details, organizationAddress: [recordsAddress, serviceAddress]}
    if (newSupplier) {
      axios.post(ROUTES_ORGANIZATIONS.LIST, formData).then((response) => {
        history.push(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, response.data.id));
      }).catch((errors) => {
        if (!errors.response) {
          return;
        }

        const { data } = errors.response;
        const err = {};

        parseErrorResponse(err, data);
        setErrorFields(err);
      });
    } else {
      axios.patch(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id), formData).then(() => {
        history.push(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id));
      }).catch((errors) => {
        if (!errors.response) {
          return;
        }

        const { data } = errors.response;
        const err = {};

        parseErrorResponse(err, data);
        setErrorFields(err);
      });
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-sm-12">
          <h1>{display.name}</h1>
        </div>
      </div>

      <VehicleSupplierEditForm
        details={details}
        display={display}
        errorFields={errorFields}
        handleAddressChange={handleAddressChange}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        loading={loading}
        newSupplier={newSupplier}
        setDetails={setDetails}
        serviceSame={serviceSame}
        setServiceSame={setServiceSame}
      />
    </div>
  );
};

VehicleSupplierEditContainer.defaultProps = {
  newSupplier: false,
};

VehicleSupplierEditContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  newSupplier: PropTypes.bool,
};

export default VehicleSupplierEditContainer;
