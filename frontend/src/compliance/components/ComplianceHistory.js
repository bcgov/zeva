/* eslint-disable react/no-array-index-key */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Link, useParams } from 'react-router-dom';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport';

require('bootstrap/js/dist/collapse.js');

const ComplianceHistory = (props) => {
  const {
    user, id, activePage, supplementaryId: detailsId, reportYear,
  } = props;
  let { supplementaryId } = useParams();

  if (!supplementaryId && detailsId) {
    supplementaryId = detailsId;
  }

  const [supplementalReportHistory, setSupplementalReportHistory] = useState([]);

  useEffect(() => {
    axios.get(ROUTES_COMPLIANCE.SUPPLEMENTAL_HISTORY.replace(/:id/g, id)).then((response) => {
      setSupplementalReportHistory(response.data);
    });
  }, []);

  const getStatus = (status) => {
    if (status === 'DRAFT') {
      return 'saved';
    }

    return status.toLowerCase();
  };

  return (
    Object.keys(supplementalReportHistory).length > 0 && (
      <div className="m-0 pt-2">
        <h3>
          {reportYear} Model Year Reporting History
        </h3>
        <div className="mt-2" id="complianceHistory">
          {supplementalReportHistory && supplementalReportHistory.map((item, index) => (
            <div id={`item-${index}`} key={`item-${index}`} className="card">
              <div className="card-header px-0 py-1">
                <h2 className="mb-0">
                  <button className="btn btn-link" type="button" data-toggle="collapse" data-target={`#collapse${item.id}`} aria-expanded="true" aria-controls={`collapse${item.id}`}>
                    Model Year Supplementary Report - {item.status}
                  </button>
                </h2>
              </div>

              <div id={`collapse${item.id}`} className="collapse show" data-parent="#complianceHistory">
                <div className="card-body p-2">
                  <ul className="py-0 my-0 px-4">
                    {item.history && item.history.map((each, eachIndex) => (
                      <li id={`each-${eachIndex}`} key={`each-${eachIndex}`}>Model year supplementary report {getStatus(each.status)} {moment(each.updateTimestamp).format('MMM D, YYYY')} by {each.createUser ? each.createUser.displayName : ''}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
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
