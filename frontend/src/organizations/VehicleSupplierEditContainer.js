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
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import History from '../app/History';

const VehicleSupplierEditContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState({});
  const { keycloak, newSupplier } = props;


  const refreshDetails = () => {
    if (newSupplier) {
      setLoading(false);
      setDetails({
        organizationAddress: {
          addressLine_1: '',
          addressLine_2: '',
          addressLine_3: '',
        },
      });
    }
    if (!newSupplier) {
      setLoading(true);
      const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
        setDetails({
          ...response.data,
          organizationAddress: {
            ...response.data.organizationAddress,
            addressLine_1: response.data.organizationAddress ? response.data.organizationAddress.addressLine1 : '',
            addressLine_2: response.data.organizationAddress ? response.data.organizationAddress.addressLine2 : '',
            addressLine_3: response.data.organizationAddress ? response.data.organizationAddress.addressLine3 : '',
          },
        });

        setDisplay(response.data);
      });

      Promise.all([detailsPromise]).then(() => {
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const address1 = details.organizationAddress ? details.organizationAddress.addressLine1 : '';
    const address2 = details.organizationAddress ? details.organizationAddress.addressLine2 : '';
    setDetails({
      ...details,
      [name]: value,
      organizationAddress: {
        ...details.organizationAddress,
        addressLine_1: address1,
        addressLine_2: address2,
      },
    });
  };

  const handleAddressChange = (event) => {
    const { value, name } = event.target;
    const address1 = details.organizationAddress ? details.organizationAddress.addressLine1 : '';
    const address2 = details.organizationAddress ? details.organizationAddress.addressLine2 : '';
    setDetails({
      ...details,
      organizationAddress: {
        ...details.organizationAddress,
        addressLine_1: address1,
        addressLine_2: address2,
        [name]: value,
      },
    });
  };

  const handleSubmit = () => {
    axios.patch(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id), details).then(() => {
      refreshDetails();
      History.push(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id));
    });
  };

  return (
    <div>
      <div className="row">
        <div className="col-sm-12">
          <h1>{display.name}</h1>
        </div>
      </div>
      <VehicleSupplierTabs supplierId={details.id} active="supplier-info" />
      <VehicleSupplierEditForm
        display={display}
        setDetails={setDetails}
        details={details}
        handleAddressChange={handleAddressChange}
        handleInputChange={handleInputChange}
        loading={loading}
        handleSubmit={handleSubmit}
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
