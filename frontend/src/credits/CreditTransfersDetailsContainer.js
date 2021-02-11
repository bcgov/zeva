/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersDetailsPage from './components/CreditTransfersDetailsPage';

const CreditTransfersDetailsContainer = (props) => {
  const {
    location, user, match,
  } = props;
  const { state: locationState } = location;
  const [errorMessage, setErrorMessage] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [sufficientCredit, setSufficientCredit] = useState(true);
  const { id } = match.params;
  const [submission, setSubmission] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id)),
      axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST),
    ]).then(axios.spread((response, assertionsResponse) => {
      setAssertions(assertionsResponse.data);
      setSubmission(response.data);
      setSufficientCredit(response.data.sufficientCredits);

      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };

  const handleSubmit = (status, comment = '') => {
    const submissionContent = { status };
    if (comment.length > 0) {
      submissionContent.creditTransferComment = { comment };
    }
    if (checkboxes.length > 0) {
      submissionContent.signingConfirmation = checkboxes;
    }
    axios.patch(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id), submissionContent)
      .then(() => {
        if (status == "RESCINDED" || status == "DRAFT") {
          history.push(ROUTES_CREDIT_TRANSFERS.EDIT.replace(':id', id))
        } else {
          window.location.reload();
        }
      })
      .catch((error) => {
        const { response } = error;
        if (response.status === 400) {
          if (typeof response.data === 'object') {
            setErrorMessage(Object.values(response.data));
          } else {
            setErrorMessage(response.data.status);
          }
        }
      });
  };

  if (loading) {
    return (<Loading />);
  }
  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersDetailsPage
      assertions={assertions}
      checkboxes={checkboxes}
      handleCheckboxClick={handleCheckboxClick}
      handleSubmit={handleSubmit}
      key="page"
      sufficientCredit={sufficientCredit}
      submission={submission}
      user={user}
      errorMessage={errorMessage}
    />,
  ]);
};

CreditTransfersDetailsContainer.defaultProps = {
  validatedOnly: false,
};

CreditTransfersDetailsContainer.propTypes = {
  match: CustomPropTypes.routeMatch.isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool,
};

export default withRouter(CreditTransfersDetailsContainer);
