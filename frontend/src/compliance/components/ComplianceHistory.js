/* eslint-disable react/no-array-index-key */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { useParams } from 'react-router-dom';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport';
import history from '../../app/History';

require('bootstrap/js/dist/collapse.js');

const ComplianceHistory = (props) => {
  const {
    id, activePage, supplementaryId: detailsId, reportYear,
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

  const getHistory = (itemHistory) => {
    const tempHistory = [];

    if (itemHistory) {
      itemHistory.forEach((obj) => {
        if (['SUBMITTED', 'DRAFT'].indexOf(obj.status) >= 0) {
          const found = tempHistory.findIndex((each) => ['SUBMITTED', 'DRAFT'].indexOf(each.status) >= 0);

          if (found < 0) {
            tempHistory.push(obj);
          }
        }

        if (['RECOMMENDED', 'ASSESSED', 'REASSESSED'].indexOf(obj.status) >= 0) {
          const found = tempHistory.findIndex((each) => obj.status === each.status);

          if (found < 0) {
            tempHistory.push(obj);
          }
        }
      });
    }

    return tempHistory;
  };

  const getStatus = (item, each) => {
    let status = each.status.toLowerCase();

    if (status === 'draft') {
      status = ' saved ';
    }

    if (status === 'submitted') {
      status = ' signed and submitted to the Government of B.C. ';
    }

    let byUser = '';
    if (each.createUser) {
      byUser = ` by ${each.createUser.displayName} `;
    }

    let reportType = 'Model year report ';

    if (item.isSupplementary) {
      if (each.isReassessment) {
        reportType = 'Reassessment ';
      } else {
        reportType = 'Supplementary report ';
      }

      if (status === 'assessed') {
        status = 'reassessed';
        reportType = 'Supplementary report ';
        byUser = ' by the Director ';
      }
    }

    return `${reportType} ${status} ${moment(each.updateTimestamp).format('MMM D, YYYY')} ${byUser}`;
  };

  const getColor = (status) => {
    let classname = '';
    switch (status) {
      case 'DRAFT':
        classname = 'alert-warning';
        break;
      case 'UNSAVED':
        classname = 'alert-warning';
        break;
      case 'SUBMITTED':
        classname = 'alert-primary';
        break;
      case 'RECOMMENDED':
        classname = 'alert-primary';
        break;
      case 'RETURNED':
        classname = 'alert-primary';
        break;
      case 'ASSESSED':
        classname = 'alert-success';
        break;
      default:
        classname = '';
    }

    return classname;
  };

  const getShow = (item) => {
    if (activePage === 'supplementary' && item.isSupplementary && Number(item.id) === Number(detailsId)) {
      return 'show';
    }

    if (activePage === 'assessment' && !item.isSupplementary) {
      return 'show';
    }

    return '';
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
              <div className={`card-header px-0 py-1 ${getColor(item.status)}`}>
                <h2 className="mb-0">
                  <button
                    className={`btn ${getShow(item) === 'show' ? '' : 'btn-link'}`}
                    type="button"
                    data-toggle="collapse"
                    data-target={`#collapse${item.id}`}
                    aria-expanded="true"
                    aria-controls={`collapse${item.id}`}
                    onClick={() => {
                      if (item.isSupplementary) {
                        history.push(ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id).replace(':supplementaryId', item.id));
                      } else {
                        history.push(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
                      }
                    }}
                  >
                    Model Year {item.isSupplementary ? 'Supplementary' : ''} Report - {item.status}
                  </button>
                </h2>
              </div>

              <div
                id={`collapse${item.id}`}
                className={`collapse ${getShow(item)}`}
                data-parent="#complianceHistory"
              >
                <div className="card-body p-2">
                  <ul className="py-0 my-0 px-4">
                    {item.history && getHistory(item.history).map((each, eachIndex) => (
                      <li id={`each-${eachIndex}`} key={`each-${eachIndex}`}>{getStatus(item, each)}</li>
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
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  activePage: PropTypes.string.isRequired,
  supplementaryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reportYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
export default ComplianceHistory;
