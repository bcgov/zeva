/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import history from '../app/History';
import Loading from '../app/components/Loading';
import ROUTES_CREDITS from '../app/routes/Credits';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionDetailsPage from './components/SalesSubmissionDetailsPage';

const SalesSubmissionDetailsContainer = (props) => {
  const { match, user } = props;
  const { id } = match.params;

  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatedList, setValidatedList] = useState([]);

  const refreshDetails = () => {
    axios.get(ROUTES_SALES_SUBMISSIONS.RAW.replace(':id', id)).then((response) => {
      const { data } = response;
      setSubmission(data);

      const validatedRecords = data.records.filter(
        (record) => {
          if (data.validationStatus === 'CHECKED') {
            return record.checked;
          }

          return record.icbcVerification;
        },
      ).map((record) => record.id);

      setValidatedList(validatedRecords);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleCheckboxClick = (event) => {
    const { value: submissionId, checked } = event.target;

    if (!checked) {
      setValidatedList(validatedList.filter((item) => Number(item) !== Number(submissionId)));
    } else {
      setValidatedList(() => [...validatedList, submissionId]);
    }
  };

  const handleSubmit = () => {
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), {
      records: validatedList,
      validationStatus: 'CHECKED',
    }).then(() => {
      const url = ROUTES_CREDITS.VALIDATED_CREDIT_REQUEST_DETAILS.replace(/:id/g, submission.id);

      history.push(url);
    });
  };

  if (loading) {
    return (<Loading />);
  }

  return (
    <SalesSubmissionDetailsPage
      handleCheckboxClick={handleCheckboxClick}
      handleSubmit={handleSubmit}
      routeParams={match.params}
      submission={submission}
      user={user}
      validatedList={validatedList}
    />
  );
};

SalesSubmissionDetailsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesSubmissionDetailsContainer);
