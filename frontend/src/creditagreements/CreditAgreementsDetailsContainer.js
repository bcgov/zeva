import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreditAgreementsDetailsPage from './components/CreditAgreementsDetailsPage';
import Loading from '../app/components/Loading';
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements';
import CustomPropTypes from '../app/utilities/props';

const CreditAgreementsDetailsContainer = (props) => {
  const { keycloak, user } = props;
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const items = [
    { creditValue: '50', modelYear: '2021', creditClass: 'A' },
    { creditValue: '100', modelYear: '2021', creditClass: 'B' },
  ];

  if (loading) {
    return <Loading />;
  }
  const refreshDetails = () => {
    //TODO axios.get call to retrieve detail information of agreement based on ID
    setLoading(false);
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return [<CreditAgreementsDetailsPage id={id} user={user} items={items} />];
};

CreditAgreementsDetailsContainer.prototype = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditAgreementsDetailsContainer;
