/* eslint-disable react/no-array-index-key */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Link, useParams } from 'react-router-dom';
import Button from '../../app/components/Button';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport';

const ComplianceHistory = (props) => {
  const {
    user, id, activePage,
  } = props;
  const { supplementaryId } = useParams();

  const [noaHistory, setNoaHistory] = useState({});
  useEffect(() => {
    axios.get(ROUTES_COMPLIANCE.NOA_HISTORY.replace(/:id/g, id)).then((response) => {
      setNoaHistory(response.data);
    });
  }, []);
  const draftText = (item) => `Supplementary report saved ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
  const submittedText = (item) => {
    if (user.isGovernment) {
      return `Supplementary report signed and submitted ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
    }
    return `Supplementary report signed and submitted to the Government of B.C. ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
  };
  const recommendedText = (item) => `Supplementary report recommended ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
  const reassessmentText = (item) => `Notice of Reassessment ${moment(item.updateTimestamp).format('MMM D, YYYY')}`;
  const getLinkByStatus = (item) => {
    if (item.status === 'DRAFT') {
      if (Number(item.supplementalReportId) === Number(supplementaryId)) {
        return (<span>{draftText(item)}</span>);
      }
      return (
        <Link
          className="text-blue text-underline"
          to={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.supplementalReportId)}
        >
          {draftText(item)}
        </Link>
      );
    }
    if (item.status === 'SUBMITTED') {
      if (Number(item.supplementalReportId) === Number(supplementaryId)) {
        return (
          <span>{submittedText(item)}</span>
        );
      }

      return (
        <Link
          className="text-blue text-underline"
          to={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.supplementalReportId)}
        >
          {submittedText(item)}
        </Link>
      );
    }
    if (item.status === 'RECOMMENDED') {
      if (Number(item.supplementalReportId) === Number(supplementaryId)) {
        return (<span>{recommendedText(item)}</span>);
      }

      return (
        <Link
          className="text-blue text-underline"
          to={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.supplementalReportId)}
        >
          {recommendedText(item)}
        </Link>
      );
    }
    if (item.status === 'ASSESSED') {
      if (Number(item.supplementalReportId) === Number(supplementaryId)) {
        return (<span>{reassessmentText(item)}</span>);
      }

      return (
        <Link
          className="text-blue text-underline"
          to={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.supplementalReportId)}
        >
          {reassessmentText(item)}
        </Link>
      );
    }
    return '';
  };

  return (
    Object.keys(noaHistory).length > 0 && noaHistory.supplemental && noaHistory.supplemental.length > 0 && (
      <div className="m-0 pt-2">
        <h3>
          Model Year Report Assessment History
        </h3>
        <div className="grey-border-area p-3 comment-box mt-2">
          <ul className="mb-0">
            {noaHistory.assessment
            && (
            <li className={`main-list-item ${activePage === 'assessment' ? 'active-history' : ''}`}>
              {activePage !== 'assessment'
                && (
                <Link
                  className="text-blue text-underline"
                  to={ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id)}
                >
                  Notice of Assessment {moment(noaHistory.assessment.updateTimestamp).format('MMM D, YYYY')}
                </Link>
                )}
              {activePage === 'assessment'
                && <span>Notice of Assessment {moment(noaHistory.assessment.updateTimestamp).format('MMM D, YYYY')}</span>}
              {noaHistory.supplemental ? <span className="text-red"> Superseded</span> : ''}
            </li>
            )}
            {noaHistory.supplemental
            && (
              noaHistory.supplemental.map((item) => (
                <li key={item.id} className={item.status === 'ASSESSED' ? 'main-list-item' : 'sub-list-item'}>
                  {getLinkByStatus(item)}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    )
  );
};

ComplianceHistory.propTypes = {
  user: CustomPropTypes.user.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  activePage: PropTypes.string.isRequired,
};
export default ComplianceHistory;
