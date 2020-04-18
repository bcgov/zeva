/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTE_SALES from '../app/routes/Sales';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestDetailsPage from './components/CreditRequestDetailsPage';

const CreditRequestDetailsContainer = (props) => {
  const { match, user } = props;
  const { id } = match.params;

  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshDetails = () => {
    axios.get(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id)).then((response) => {
      setSubmission(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleSubmit = () => {
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), {
      validationStatus: 'VALIDATED',
    }).then(() => {
      history.push(ROUTE_SALES.LIST);
    });
  };

  if (loading) {
    return (<Loading />);
  }

  return (
    <CreditRequestDetailsPage
      handleSubmit={handleSubmit}
      submission={submission}
      user={user}
    />
  );
};

CreditRequestDetailsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(CreditRequestDetailsContainer);
