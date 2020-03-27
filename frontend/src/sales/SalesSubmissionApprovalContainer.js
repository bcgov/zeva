/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTE_SALES from '../app/routes/Sales';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionApprovalPage from './components/SalesSubmissionApprovalPage';

const SalesSubmissionApprovalContainer = (props) => {
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

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <SalesSubmissionApprovalPage
      handleSubmit={handleSubmit}
      key="page"
      submission={submission}
      user={user}
    />,
  ]);
};

SalesSubmissionApprovalContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesSubmissionApprovalContainer);
