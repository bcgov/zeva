/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionApprovalDetailsPage from './components/SalesSubmissionApprovalDetailsPage';

const SalesSubmissionApprovalDetailsContainer = (props) => {
  const { match, user } = props;
  const { id } = match.params;

  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatedList, setValidatedList] = useState([]);

  const refreshDetails = () => {
    axios.get(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id)).then((response) => {
      setSubmission(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleCheckboxClick = (event) => {
    const { value: submissionId, checked } = event.target;

    if (!checked) {
      setValidatedList(validatedList.filter((item) => item !== submissionId));
    } else {
      setValidatedList(() => [...validatedList, submissionId]);
    }
  };

  const handleSubmit = () => {
    const records = [];

    validatedList.forEach((recordId) => {
      records.push({
        id: recordId,
        validationStatus: 'VALIDATED',
      });
    });

    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), {
      records,
    }).then(() => {
      refreshDetails();
    });
  };

  if (loading) {
    return (<Loading />);
  }

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <SalesSubmissionApprovalDetailsPage
      handleCheckboxClick={handleCheckboxClick}
      handleSubmit={handleSubmit}
      key="page"
      routeParams={match.params}
      submission={submission}
      user={user}
    />,
  ]);
};

SalesSubmissionApprovalDetailsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesSubmissionApprovalDetailsContainer);
