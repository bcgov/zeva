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
    const data = {
      ...newData,
      status,
    };
    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewData({ ...newData, [name]: value });
    console.log(newData);
  };
  const refreshDetails = () => {
    const fakeData = {
      legalName: 'test car manufacturing company limited',
      organizationAddress: [{
        addressLine1: '123 Street',
        addressLine2: null,
        addressLine3: null,
        addressType: { addressType: 'Records' },
        city: 'VICTORIA',
        country: 'Canada',
        county: null,
        id: 209,
        postalCode: '-',
        representativeName: 'Emily H',
        state: 'BC',
      }, {
        addressLine1: '73 TEST ST',
        addressLine2: null,
        addressLine3: null,
        addressType: { addressType: 'Service' },
        city: 'VICTORIA',
        country: 'Canada',
        county: null,
        id: 210,
        postalCode: 'V9A 3V5',
        representativeName: 'Emily H',
        state: 'BC',
      }],
      makes: ['KIA', 'JEEP', 'BMW'],
      supplierClass: 'Large Volume Supplier',
    };
    setLoading(true);
    axios.get(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)).then((response) => {
      if (response.data) {
        setDetails(response.data);
      }
      setLoading(false);
    });
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
