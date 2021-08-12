import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_SUPPLEMENTARY from '../app/routes/SupplementaryReport';
import SupplementaryDetailsPage from './components/SupplementaryDetailsPage';

const SupplementaryContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [newData, setNewData] = useState({});
  const { keycloak, user } = props;

  const handleAddComment = (comment) => {
    setNewData({ ...newData, comment });
  };

  const handleSubmit = (status) => {
    setNewData({ ...newData, status });
    console.log(newData)
    // axios.post(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id), newData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewData({ ...newData, [name]: value });
    console.log(newData);
  };
  const refreshDetails = () => {
    const data = {
      legalName: 'test',
      organizationAddress: [{
        addressLine1: '1004 CATHERINE ST',
        addressLine2: null,
        addressLine3: null,
        addressType: { addressType: 'Records' },
        city: 'VICTORIA',
        country: 'Canada',
        county: null,
        id: 209,
        postalCode: 'V9A 3V4',
        representativeName: 'Emily Hillier',
        state: 'BC',
      }, {
        addressLine1: 'TEST ST',
        addressLine2: null,
        addressLine3: null,
        addressType: { addressType: 'Service' },
        city: 'VICTORIA',
        country: 'Canada',
        county: null,
        id: 209,
        postalCode: 'V9A 3V4',
        representativeName: 'Emily Hillier',
        state: 'BC',
      }],
      makes: ['KIA', 'JEEP', 'BMW'],
    };
    const serviceAddress = data.organizationAddress.find((each) => each.addressType.addressType === 'Service');
    const recordsAddress = data.organizationAddress.find((each) => each.addressType.addressType === 'Records');
    setDetails({
      legalName: data.legalName, serviceAddress, recordsAddress, makes: data.makes,
    });
    // setLoading(true);
    // axios.get(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)).then((response) => {
    //   setDetails(response.details);
    setLoading(false);
    // });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <SupplementaryDetailsPage
      handleAddComment={handleAddComment}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      user={user}
      details={details}
      newData={newData}
    />
  );
};
export default SupplementaryContainer;
