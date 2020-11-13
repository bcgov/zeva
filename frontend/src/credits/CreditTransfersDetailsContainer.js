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
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersDetailsPage from './components/CreditTransfersDetailsPage';

const CreditTransfersDetailsContainer = (props) => {
  const {
    location, user, match,
  } = props;
  const { state: locationState } = location;
  const [negativeCredit, setNegativeCredit] = useState(false)
  const { id } = match.params;
  const [submission, setSubmission] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshDetails = () => {
    let orgId;
    let transferContentA=0,transferContentB=0;
    let currentBalanceA=0, currentBalanceB=0;
    let newValueA, newValueB;
    
    axios.get(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id))
      .then((response) => {
        setSubmission(response.data);
        orgId = response.data.debitFrom.id;
        setLoading(false);
      });
    
    axios.get(ROUTES_CREDIT_TRANSFERS.LIST).then((listresponse) => {
      const organization_transfers = listresponse.data.filter((eachRecord) => eachRecord.debitFrom.id === orgId);
      organization_transfers.forEach((each) => currentBalanceA += each.debitFrom.balance.A);
      organization_transfers.forEach((each) => currentBalanceB += each.debitFrom.balance.B);
      organization_transfers.forEach((each) => {
        each.creditTransferContent.forEach((eachContent) => {
          (eachContent.creditClass.creditClass === 'A') ?
          transferContentA += eachContent.creditValue * eachContent.dollarValue : transferContentB += eachContent.creditValue * eachContent.dollarValue
        })
      })
      newValueA = currentBalanceA - transferContentA;
      newValueB = currentBalanceB - transferContentB;
      (newValueA < 0 || newValueB < 0 ? setNegativeCredit(true): setNegativeCredit(false))
 });
};

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleSubmit = (status, comment = '') => {
    const submissionContent = {status}
    if (comment.length > 0) {
      submissionContent.creditTransferComment = {comment}
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
    <CreditTransfersDetailsPage submission={submission} key="page" user={user} negativeCredit={negativeCredit} handleSubmit={handleSubmit} />,
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
