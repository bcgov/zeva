/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import Loading from '../app/components/Loading';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';

import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionDetailsPage from './components/SalesSubmissionDetailsPage';

const SalesDetailsContainer = (props) => {
  const { user } = props;
  const { match } = props;
  const id = match.params.id;

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


  if (loading) {
    return (<Loading />);
  }

  return (
    <SalesSubmissionDetailsPage
      submission={submission}
      user={user}
    />
  );
};

SalesDetailsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesDetailsContainer);
