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
    axios.get(ROUTES_COMPLIANCE.SUPPLEMENTAL_HISTORY.replace(/:id/g, id)).then((response) => {
      const historyData = response.data
      setSupplementalReportHistory(historyData)
      historyData.forEach((report) => {
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

  // assumes passed in history is in order from most recent to earliest
  // returns a history that is also from most recent to earliest
  const removeSequentialHistoryItems = (history, status) => {
    const result = []
    let previousItemStatusIsStatusInQuestion = false
    const reversedHistory = history.toReversed()
    reversedHistory.forEach((item) => {
      const itemStatus = item.status
      if (itemStatus === status) {
        if (!previousItemStatusIsStatusInQuestion) {
          result.unshift(item)
        }
        previousItemStatusIsStatusInQuestion = true
      } else {
        result.unshift(item)
        previousItemStatusIsStatusInQuestion = false
      }
    })
    return result
  }

  const getHistory = (history, item) => {
    let itemHistory = history
    if (itemHistory) {
      const sequentialStatusesToRemove = ['DRAFT', 'SUBMITTED', 'RECOMMENDED', 'RETURNED']
      sequentialStatusesToRemove.forEach((status) => {
        itemHistory = removeSequentialHistoryItems(itemHistory, status)
      })
    }
    const tempHistory = []
    if (itemHistory) {
      itemHistory.forEach((obj, i) => {
        if (['DRAFT'].indexOf(obj.status) >= 0) {
          if ((itemHistory[i + 1]?.status === 'SUBMITTED' || itemHistory[i + 1]?.status === 'RETURNED')
            && (!item.isSupplementary || (itemHistory.supplementalReportId === itemHistory[i + 1].supplementalReportId))) {
            // if the status is draft and the previous status was submitted or returned,
            // it was returned to the supplier by the analyst
            const actuallyReturned = { ...obj }
            actuallyReturned.status = 'RETURNED TO THE SUPPLIER'
            tempHistory.push(actuallyReturned)
          } else if ((itemHistory[i + 1]?.status !== 'SUBMITTED'
            && itemHistory[i + 1]?.status !== 'RETURNED') || user.isGovernment)  {
            // if the current status is draft but the previous status wasn't submitted or returned
            // or if the user is government, it is just a regular draft so pass the obj
            tempHistory.push(obj)
          }
        } else if (['RETURNED'].indexOf(obj.status) >= 0 && itemHistory[i + 1]?.status === 'RECOMMENDED' && user.isGovernment){
            const actuallyReturned = { ...obj }
              // if the most recent status was recommended, but now it is returned
              // that means the director has returned it to the analyst
              actuallyReturned.status = 'RETURNED TO THE ANALYST'
              tempHistory.push(actuallyReturned)
          }
        else {
            tempHistory.push(obj)
          }
        
      })
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

    if (status === 'returned to the supplier' && !user.isGovernment) {
      byUser = ' by Government of B.C. '
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
                        getHistory(item.history, item).map((each, eachIndex) => (
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
