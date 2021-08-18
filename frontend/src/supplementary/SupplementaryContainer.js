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
      creditActivity: [{
        category: 'creditBalanceStart',
        modelYearId: 2,
        creditAValue: '100',
        creditBValue: '50',
      }, {
        category: 'creditBalanceEnd',
        modelYearId: 1,
        creditAValue: '100',
        creditBValue: '50',
      }],
      zevSales: [{
        sales: 250,
        make: 'TESLA',
        model_name: 'TEST 1',
        model_year_id: 2,
        vehicle_zev_type: 2,
        range: 87,
        zev_class: 1,
      }],
    };

    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data);
    console.log(data);
  };

  const handleInputChange = (event) => {
    const { id, name, value } = event.target;
    // seperate sections into which database table they will be inserted into ie supplierInfo
    const dataToUpdate = {
      ...newData[name],
      [id]: value,
    };
    setNewData({
      ...newData,
      [name]: dataToUpdate,
    });
  };
  const refreshDetails = () => {
    setLoading(true);
    axios.get(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)).then((response) => {
      if (response.data) {
        setDetails(response.data);

        console.log(response.data);
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
