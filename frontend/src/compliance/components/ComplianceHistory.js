/* eslint-disable react/no-array-index-key */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Link, useParams } from 'react-router-dom';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport';

const ComplianceHistory = (props) => {
  const {
    user, id, activePage, supplementaryId: detailsId,
  } = props;
  let { supplementaryId } = useParams();

  if (!supplementaryId && detailsId) {
    supplementaryId = detailsId;
  }

  const [noaHistory, setNoaHistory] = useState({});
  const [supplementalHistory, setSupplementalHistory] = useState([]);

  let displayMYSuperseded;
  useEffect(() => {
    axios.get(ROUTES_COMPLIANCE.NOA_HISTORY.replace(/:id/g, id)).then((response) => {
      setNoaHistory(response.data);

      const { supplemental } = response.data;

      const tempSupplementalHistory = [];

      supplemental.forEach((each) => {
        if (each.status === 'DRAFT') {
          const index = tempSupplementalHistory.findIndex((temp) => temp.status === 'DRAFT' && temp.supplementalReportId === each.supplementalReportId);

          if (index >= 0) {
            tempSupplementalHistory[index] = each;
          } else {
            tempSupplementalHistory.push(each);
          }
        }

        if (each.status === 'SUBMITTED') {
          const index = tempSupplementalHistory.findIndex((temp) => ['DRAFT', 'SUBMITTED'].indexOf(temp.status) >= 0 && temp.supplementalReportId === each.supplementalReportId);

          if (index >= 0) {
            tempSupplementalHistory[index] = each;
          } else {
            tempSupplementalHistory.push(each);
          }
        }

        if (['RETURNED', 'RECOMMENDED', 'ASSESSED'].indexOf(each.status) >= 0) {
          tempSupplementalHistory.push(each);
        }
      });

      setSupplementalHistory(tempSupplementalHistory);
    });
  }, []);

  const modelYearReportSuperseded = () => {
    if (noaHistory.supplemental) {
      noaHistory.supplemental.forEach((each) => {
        if (each.status === 'ASSESSED') {
          displayMYSuperseded = true;
        }
      });
    }
    return true;
  }
  const returnedText = (item) => `${item.isReassessment ? 'Reassessment' : 'Supplementary'} report returned ${moment(item.updateTimestamp).format('MMM D, YYYY')} by the Government of B.C.`;
  const draftText = (item) => `${item.isReassessment ? 'Reassessment' : 'Supplementary'} report saved ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
  const submittedText = (item) => {
    if (user.isGovernment) {
      return `${item.isReassessment ? 'Reassessment' : 'Supplementary'} report signed and submitted ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
    }
    return `${item.isReassessment ? 'Reassessment' : 'Supplementary'} report signed and submitted to the Government of B.C. ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;
  };
  const recommendedText = (item) => `${item.isReassessment ? 'Reassessment' : 'Supplementary'} report recommended ${moment(item.updateTimestamp).format('MMM D, YYYY')} by ${item.updateUser}`;

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
    if (item.status === 'RETURNED') {
      if (Number(item.supplementalReportId) === Number(supplementaryId)) {
        return (<span>{returnedText(item)}</span>);
      }

      return (
        <Link
          className="text-blue text-underline"
          to={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.supplementalReportId)}
        >
          {returnedText(item)}
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
        return (<span>Notice of Reassessment {moment(item.updateTimestamp).format('MMM D, YYYY')}{item.displaySupersededText ? <span className="text-red"> Superseded</span> : ''}</span>);
      }

      return (
        <Link
          className="text-blue text-underline"
          to={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.supplementalReportId)}
        >
          Notice of Reassessment {moment(item.updateTimestamp).format('MMM D, YYYY')}{item.displaySupersededText ? <span className="text-red"> Superseded</span> : ''}
        </Link>
      );
    }
    return '';
  };

  return (
    Object.keys(noaHistory).length > 0 && noaHistory.supplemental && noaHistory.supplemental.length > 0 && (
      <div className="m-0 pt-2">
        {modelYearReportSuperseded()}
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
              {noaHistory.supplemental && displayMYSuperseded ? <span className="text-red"> Superseded</span> : ''}
            </li>
            )}
            {supplementalHistory
            && (
              supplementalHistory.map((item) => (
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

ComplianceHistory.defaultProps = {
  supplementaryId: null,
};

ComplianceHistory.propTypes = {
  user: CustomPropTypes.user.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  activePage: PropTypes.string.isRequired,
  supplementaryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
export default ComplianceHistory;
