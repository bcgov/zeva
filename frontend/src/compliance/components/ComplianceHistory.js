/* eslint-disable react/no-array-index-key */
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { useParams } from 'react-router-dom'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport'
import history from '../../app/History'

require('bootstrap/js/dist/collapse.js')

const ComplianceHistory = (props) => {
  const {
    id, activePage, supplementaryId: detailsId,
    reportYear, isReassessment, tabName, user
  } = props
  let { supplementaryId } = useParams()

  if (!supplementaryId && detailsId) {
    supplementaryId = detailsId
  }

  const [supplementalReportHistory, setSupplementalReportHistory] = useState([])
  const [startedAsSupplemental, setStartedAsSupplemental] = useState(false)

  useEffect(() => {
    axios
      .get(ROUTES_COMPLIANCE.SUPPLEMENTAL_HISTORY.replace(/:id/g, id))
      .then((response) => {
        setSupplementalReportHistory(response.data)
        response.data.forEach((report) => {
          if (report.isSupplementary === true) {
            report.history.forEach((row) => {
              if (row.isReassessment === false) {
                setStartedAsSupplemental(true)
              }
            })
          }
        })
      })
  }, [])

  const getHistory = (itemHistory, reportType) => {
    const tempHistory = []
    if (itemHistory) {
      itemHistory.forEach((obj, i) => {
        if(i === 0 && reportType.includes("Model Year Report")){
          tempHistory.push(itemHistory[itemHistory.length - 1])
        }
        else if (['DRAFT'].indexOf(obj.status) >= 0) {
          const found = tempHistory.findIndex(
            (each) => ['DRAFT'].indexOf(each.status) >= 0
          )
          // Check to see if a report has been returned to a draft status from submitted and if it has
          // Then we need to modify the recorded object to correctly display the returned status instead of draft
          // We also never capture returns in a reassessment because it is strictly internal
          if (itemHistory[i + 1]?.status === "SUBMITTED" && !reportType.includes("Reassessment")){
            let actuallyReturned = {...obj}
            actuallyReturned.status = "RETURNED"
            tempHistory.push(actuallyReturned)
          }
          else if (found < 0 && ['DRAFT', 'SUBMITTED'].includes(obj.status)){
            tempHistory.push(obj)
          }
        }
        else if (['SUBMITTED'].indexOf(obj.status) >= 0) {
          // Check if a submitted history status comes after a returned/draft status
          // We capture this as it has been re-submitted
          if(["RETURNED", "DRAFT"].includes(itemHistory[i + 1]?.status)){
            tempHistory.push(obj)
          }
        }
        else if (
          ['RETURNED'].indexOf(obj.status) >= 0
        ) {
          // Checking to find any return to a supplier, we don't want to capture when a director returns to an analyst
          // The history reads from most recent to least recent so i + 1 to check the previous status
          // There is a case where the entry before a return is Recommended but it is correctly returned to a supplier so we also need to look at i - 1 to see if it is submitted
          if(["RETURNED", "SUBMITTED"].includes(itemHistory[i + 1]?.status) && !reportType.includes("Reassessment") || itemHistory[i - 1]?.status === "SUBMITTED" && !reportType.includes("Reassessment")){
              tempHistory.push(obj)
          }
        }
        if (
          ['RECOMMENDED', 'ASSESSED', 'REASSESSED'].indexOf(obj.status) >= 0
        ) {
          const found = tempHistory.findIndex(
            (each) => obj.status === each.status
          )
          if (found < 0) {
            tempHistory.push(obj)
          }
        }
      })
    }
    // If we are in a model year report it will have a created status at the top
    // Therefore we need to move the first entry to the end of the history array
    if(reportType.includes("Model Year Report")){
      tempHistory.push(tempHistory.shift())
    }
    return tempHistory
  }
  const getTitle = (item) => {
    const type = item.isSupplementary ? startedAsSupplemental ? 'Supplementary Report' : 'Reassessment' : 'Model Year Report'
    let status = item.status
    if (item.isSupplementary) {
      if (item.status === 'RECOMMENDED') {
        status = 'REASSESSMENT RECOMMENDED'
      } else if (item.status === 'ASSESSED') {
        status = ' REASSESSED'
      }
    } else if (item.status === 'RECOMMENDED') {
      status = 'ASSESSMENT RECOMMENDED'
    }
    return `${type} - ${status}`
  }
  const getStatus = (item, each) => {
    let status = each.status.toLowerCase()

    if (status === 'draft') {
      status = ' created '
    }
    if (status === 'recommended') {
      if (item.isSupplementary) {
        status = ' recommended to Director '
      } else {
        status = ' assessment recommended to Director '
      }
    }
    if (status === 'submitted') {
      status = ' signed and submitted to the Government of B.C. '
    }

    let byUser = ''
    if (each.createUser) {
      byUser = ` by ${each.createUser.displayName} `
    }

    if (status === 'assessed') {
      status = ' assessed '
      if (!user.isGovernment) {
        byUser = ' by Government of B.C. '
      }
    }

    let reportType = 'Model year report '

    if (item.isSupplementary) {
      if (each.isReassessment) {
        reportType = 'Reassessment '
      } else {
        reportType = 'Supplementary report '
      }

      if (status === 'assessed') {
        status = 'reassessed'
        reportType = 'Supplementary report '
        byUser = ' by Government of B.C. '
      }
    }
    return `${reportType} ${status} ${moment(each.updateTimestamp).format(
      'MMM D, YYYY'
    )} ${byUser}`
  }

  const getColor = (status) => {
    let classname = ''
    switch (status) {
      case 'DRAFT':
        classname = 'alert-warning'
        break
      case 'UNSAVED':
        classname = 'alert-warning'
        break
      case 'SUBMITTED':
        classname = 'alert-primary'
        break
      case 'RECOMMENDED':
        classname = 'alert-primary'
        break
      case 'RETURNED':
        classname = 'alert-primary'
        break
      case 'ASSESSED':
        classname = 'alert-success'
        break
      default:
        classname = ''
    }

    return classname
  }

  const getShow = (item) => {
    if (
      activePage === 'supplementary' &&
      item.isSupplementary &&
      Number(item.id) === Number(detailsId)
    ) {
      return 'show'
    }

    if (activePage === 'assessment' && !item.isSupplementary) {
      return 'show'
    }

    return ''
  }

  return (
    Object.keys(supplementalReportHistory).length > 0 && (
      <div className="m-0 pt-2">
        <h3>{reportYear} Model Year Reporting History</h3>
        <div className="mt-2" id="complianceHistory">
          {supplementalReportHistory &&
            supplementalReportHistory.map((item, index) => (
              <div id={`item-${index}`} key={`item-${index}`} className="card">
                <div
                  className={`card-header px-0 py-1 ${getColor(item.status)}`}
                >
                  <h2 className="mb-0">
                    <button
                      className={`btn ${
                        getShow(item) === 'show' ? '' : 'btn-link'
                      }`}
                      type="button"
                      data-toggle="collapse"
                      data-target={`#collapse${item.id}`}
                      aria-expanded="true"
                      aria-controls={`collapse${item.id}`}
                      onClick={() => {
                        if (item.isSupplementary) {
                          history.push(
                            ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(
                              ':id',
                              id
                            ).replace(':supplementaryId', item.id)
                          )
                        } else {
                          history.push(
                            ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(
                              ':id',
                              id
                            ) + (isReassessment ? '?reassessment=Y' : '') +
                              `?tab=${tabName}`
                          )
                        }
                      }}
                    >
                     {getTitle(item)}
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
                      {item.history &&
                        getHistory(item.history, getTitle(item)).map((each, eachIndex) => (
                          <li
                            id={`each-${eachIndex}`}
                            key={`each-${eachIndex}`}
                          >
                            {getStatus(item, each)}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  )
}

ComplianceHistory.defaultProps = {
  supplementaryId: null
}

ComplianceHistory.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  activePage: PropTypes.string.isRequired,
  isReassessment: PropTypes.bool,
  supplementaryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reportYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired
}
export default ComplianceHistory
