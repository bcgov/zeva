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
import SalesSubmissionValidationPage from './components/SalesSubmissionValidationPage';

const SalesSubmissionReviewContainer = (props) => {
  const { match, user } = props;
  const { id } = match.params;

  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [validatedList, setValidatedList] = useState([]);

  const refreshDetails = () => {
    axios.get(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id)).then((response) => {
      const submission = response.data;
      setSubmission(submission);
      // const validatedRecords = submissions.records.filter(
      //   (record) => record.validationStatus === 'VALIDATED' || record.icbcVerification,
      // ).map((record) => record.id);
      // setValidatedList(validatedRecords);
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

  const sign = (id) => {
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), {
      validationStatus: 'SUBMITTED',
    });
  };


  if (loading) {
    return (<Loading />);
  }

  return (
    <SalesSubmissionValidationPage
      backToStart={() => {}}
      details={submission}
      setShowModal={setShowModal}
      showModal={showModal}
      sign={sign}
      user={user}
    />
  );
};

SalesSubmissionReviewContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesSubmissionReviewContainer);
