/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTES_CREDITS from '../app/routes/Credits';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestDetailsPage from './components/CreditRequestDetailsPage';

const CreditRequestDetailsContainer = (props) => {
  const { match, user, validatedOnly } = props;
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

  const handleSubmit = (validationStatus) => {
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), {
      validationStatus,
    }).then(() => {
      history.push(ROUTES_CREDITS.CREDIT_REQUESTS);
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
      validatedOnly={validatedOnly}
    />
  );
};

CreditRequestDetailsContainer.defaultProps = {
  validatedOnly: false,
};

CreditRequestDetailsContainer.propTypes = {
  match: CustomPropTypes.routeMatch.isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool,
};

export default withRouter(CreditRequestDetailsContainer);
