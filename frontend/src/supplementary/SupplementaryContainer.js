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
  const [newData, setNewData] = useState({ zevSales: {}, supplierInfo: {}, creditActivity: {} });
  const { keycloak, user } = props;

  const handleCommentChange = (comment) => {
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
    };

    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data);
    console.log(data);
  };

  const handleInputChange = (event) => {
    const { id, name, value } = event.target;
    if (name === 'zevSales') {
      const vehicleId = id.split('-')[1];
      const type = id.split('-')[0];
      setNewData({
        ...newData,
        zevSales: {
          ...newData.zevSales,
          [vehicleId]: {
            ...newData.zevSales[vehicleId], [type]: value,
          },
        },
      });
    } else {
      // seperate sections into which database table they will be inserted into ie supplierInfo
      const dataToUpdate = {
        ...newData[name],
        [id]: value,
      };
      setNewData({ ...newData, [name]: dataToUpdate });
    }
    console.log(newData);
  };
  const refreshDetails = () => {
    setLoading(true);
    axios.get(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)).then((response) => {
      if (response.data) {
        setDetails(response.data);
        console.log(response.data);

        console.log(details);
        setDetails({
          ...response.data,
          zevSales: [{
            id: 0,
            sales: 100,
            modelYear: 2020,
            make: 'BMW',
            model: 'testModel',
            type: 'compact',
            range: 10,
            zevClass: 'A',
          }, {
            id: 2,
            sales: 200,
            modelYear: 2021,
            make: 'KIA',
            model: 'test kia',
            type: 'full size',
            range: 28,
            zevClass: 'B',

          }],
        });
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <SupplementaryDetailsPage
      handleCommentChange={handleCommentChange}
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
