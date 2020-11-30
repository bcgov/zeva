/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import history from '../app/History';
import Loading from '../app/components/Loading';
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestVINListPage from './components/CreditRequestVINListPage';

const CreditRequestVINListContainer = (props) => {
  const { match, user } = props;
  const { id } = match.params;

  const [content, setContent] = useState([]);
  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatedList, setValidatedList] = useState([]);

  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id)),
      axios.get(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', id)),
    ]).then(axios.spread((submissionResponse, contentResponse) => {
      const { data: submissionData } = submissionResponse;
      setSubmission(submissionData);

      const { data } = contentResponse;
      setContent(data.content);

      const validatedRecords = data.content.filter(
        (record) => {
          if (record.warnings && record.warnings.some((warning) => [
            'DUPLICATE_VIN', 'INVALID_MODEL', 'VIN_ALREADY_AWARDED',
          ].indexOf(warning) >= 0)) {
            return false;
          }

          // if (data.validationStatus === 'CHECKED') {
          //   return record.recordOfSale;
          // }

          return record.icbcVerification;
        },
      ).map((record) => record.id);

      setValidatedList(validatedRecords);
      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleCheckboxClick = (event) => {
    const { value: submissionId, checked } = event.target;
    const newId = Number(submissionId);
    if (!checked) {
      setValidatedList(validatedList.filter((item) => Number(item) !== Number(submissionId)));
    } else {
      setValidatedList(() => [...validatedList, newId]);
    }
  };

  const handleSubmit = () => {
    axios.patch(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id), {
      records: validatedList,
      validationStatus: 'CHECKED',
    }).then(() => {
      const url = ROUTES_CREDIT_REQUESTS.VALIDATED.replace(/:id/g, submission.id);

      history.push(url);
    });
  };

  if (loading) {
    return (<Loading />);
  }

  return (
    <CreditRequestVINListPage
      content={content}
      handleCheckboxClick={handleCheckboxClick}
      handleSubmit={handleSubmit}
      routeParams={match.params}
      setContent={setContent}
      submission={submission}
      user={user}
      validatedList={validatedList}
    />
  );
};

CreditRequestVINListContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(CreditRequestVINListContainer);
