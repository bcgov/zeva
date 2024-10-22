import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import isLegacySubmission from '../../app/utilities/isLegacySubmission'

const ModelYearReportWarning = (props) => {
  const { submission, user, handleCheckboxClick, conflictingReport, issueAsMY } = props

  let checked = submission.partOfModelYearReport
  let disabled = true
  if (['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0) {
    checked = issueAsMY
    disabled = false
  }

  return (
    <>
      {
        (user.hasPermission('RECOMMEND_SALES') || user.hasPermission('SIGN_SALES')) && (
          <div className={submission.validationStatus !== 'VALIDATED' ? 'myr-alert' : 'myr-proccessed'}>
            <div className='icon-wrapper'>
              {submission.validationStatus !== 'VALIDATED'
                ? <FontAwesomeIcon icon={'exclamation-circle'} size="3x" color="red" />
                : <FontAwesomeIcon icon={'check'} size="2x" className="checkmark" />
              }
            </div>
            <div className='myr-column-wrapper'>
              {submission.validationStatus !== 'VALIDATED'
                ? <>
                    <div className='myr-alert-wrapper'>
                      <p className="bold pr-1 text-red myr-alert-header">Model Year Report In Progress</p>
                      <p>— {conflictingReport.organizationName} has a {conflictingReport.modelYear.name} Model Year Report submitted to government and not yet assessed.</p>
                    </div>
                    <div className='myr-alert-wrapper'>
                      <input
                        id="analyst-checkbox"
                        data-testid="analyst-checkbox"
                        name="confirmations"
                        onChange={(event) => {
                          handleCheckboxClick(event)
                        }}
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                      />
                      <p>Issue credit application backdated to Sept. 30 as part of their Model Year Report. Only {conflictingReport.modelYear.name} vehicles can be issued, others will be tagged as error 71.</p>
                    </div>
                  </>
                : <>
                    <div className='myr-alert-wrapper'>
                      <p className='bold pr-1 text-blue'>{conflictingReport.organizationName}&apos;s credit application has been issued as part of a Model Year Report any invalid {isLegacySubmission(submission) ? 'sales ' : ''}credits have not been issued and may be resubmitted.</p>
                    </div>
                  </>
              }
            </div>
          </div>
        )
      }
    </>
  )
}
ModelYearReportWarning.propTypes = {
  submission: PropTypes.shape().isRequired,
  user: PropTypes.shape().isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  issueAsMY: PropTypes.bool.isRequired,
  conflictingReport: PropTypes.object
}

export default ModelYearReportWarning
