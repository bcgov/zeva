/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import Loading from '../app/components/Loading';
import ROUTES_SALES from '../app/routes/Sales';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import history from '../app/History';
import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionContentPage from './components/SalesSubmissionContentPage';

const SalesSubmissionEditContainer = (props) => {
  const { user } = props;
  const { match } = props;
  const { id } = match.params;

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submission, setSubmission] = useState(false);

  const refreshDetails = () => {
    axios.get(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id)).then((response) => {
      setSubmission(response.data);
      setContent(response.data.content);

      setLoading(false);
    });
  };

  const sign = (submissionId, action) => {
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', submissionId), {
      validationStatus: action,
    }).then(() => {
      if (action === 'SUBMITTED') {
        history.push(ROUTES_SALES.CONFIRM.replace(':id', submissionId));
      } else {
        history.push(ROUTES_SALES.LIST);
      }
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);


  if (loading) {
    return (<Loading />);
  }

  return (
    <SalesSubmissionContentPage
      content={content}
      setShowModal={setShowModal}
      showModal={showModal}
      sign={sign}
      submission={submission}
      user={user}
    />
  );
};

SalesSubmissionEditContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesSubmissionEditContainer);
