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
  const [newData, setNewData] = useState({ modelSales: {}, supplierInfo: {}, creditActivity: {} });
  const { keycloak, user } = props;

  const handleCommentChange = (comment) => {
    setNewData({ ...newData, comment });
  };

  const handleSubmit = (status) => {
    const data = {
      ...newData,
      status,
    };
    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data);
    console.log(data);
  };
  const handleSalesChange = (event) => {
    const { id, name, value } = event.target;
    setNewData({ ...newData, modelSales: { ...newData.modelSales, [id]: { ...newData.modelSales[id], [name]: value } } });
    console.log(newData);
  };
  const handleInputChange = (event) => {
    const { id, name, value } = event.target;
    // seperate sections into which database table they will be inserted into ie supplierInfo
    const dataToUpdate = {
      ...newData[name],
      [id]: value,
    };
    setNewData({ ...newData, [name]: dataToUpdate });
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
          modelSales: [{
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
      handleSalesChange={handleSalesChange}
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
