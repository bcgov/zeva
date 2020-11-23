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
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersDetailsPage from './components/CreditTransfersDetailsPage';

const CreditTransfersDetailsContainer = (props) => {
  const {
    location, user, match,
  } = props;
  const { state: locationState } = location;

  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [negativeCredit, setNegativeCredit] = useState(false);
  const { id } = match.params;
  const [submission, setSubmission] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshDetails = () => {
    let orgId;
    let transferContentA = 0;
    let transferContentB = 0;
    let currentBalanceA = 0;
    let currentBalanceB = 0;
    let newValueA;
    let newValueB;

    axios.all([
      axios.get(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id)),
      axios.get(ROUTES_CREDIT_TRANSFERS.LIST),
      axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST),
    ]).then(axios.spread((response, listresponse, assertionsResponse) => {
      setAssertions(assertionsResponse.data);
      setSubmission(response.data);
      orgId = response.data.debitFrom.id;

      const organizationTransfers = listresponse.data.filter((eachRecord) => eachRecord.debitFrom.id === orgId);
      currentBalanceA = organizationTransfers[0].debitFrom.balance.A;
      currentBalanceB = organizationTransfers[0].debitFrom.balance.B;
      organizationTransfers.forEach((each) => {
        each.creditTransferContent.forEach((eachContent) => {
          if (eachContent.creditClass.creditClass === 'A') {
            transferContentA += eachContent.creditValue * eachContent.dollarValue;
          } else if (eachContent.creditClass.creditClass === 'B') {
            transferContentB += eachContent.creditValue * eachContent.dollarValue;
          }
        });
      });

      newValueA = currentBalanceA - transferContentA;
      newValueB = currentBalanceB - transferContentB;

      if (newValueA < 0 || newValueB < 0) {
        setNegativeCredit(true);
      } else {
        setNegativeCredit(false);
      }

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
    axios.patch(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id), submissionContent).then(() => {
      history.push(ROUTES_CREDIT_TRANSFERS.LIST);
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
      negativeCredit={negativeCredit}
      submission={submission}
      user={user}
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
