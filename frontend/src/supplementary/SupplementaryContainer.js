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
  const { keycloak, user } = props;

  const handleAddComment = (comment) => {
    setDetails({ ...details, comment });
  };

  const handleSubmit = (status) => {
    const data = {
      ...details,
      status,
    };
    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDetails({ ...details, [name]: value });
  };
  const refreshDetails = () => {
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
    />
  );
};
export default SupplementaryContainer;
