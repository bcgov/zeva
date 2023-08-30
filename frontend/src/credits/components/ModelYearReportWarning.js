import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

const ModelYearReportWarning = (props) => {
    const { submission, user, handleCheckboxClick, conflictingReport, issueAsMY} = props
    const { validationStatus } = submission

    return (
        <>
            {
                [
                    'RECOMMEND_APPROVAL',
                    'RECOMMEND_REJECTION',
                    'CHECKED',
                    'VALIDATED'
                ].indexOf(validationStatus) >= 0 &&
                (user.hasPermission('RECOMMEND_SALES') || user.hasPermission('SIGN_SALES')) && (
                    <div className={submission.validationStatus !== 'VALIDATED' ? 'myr-alert' : 'myr-proccessed'}>
                        <div className='icon-wrapper'>
                            {submission.validationStatus !== 'VALIDATED' ?
                                <FontAwesomeIcon icon={"exclamation-circle"} size="3x" color="red" />
                                :
                                <FontAwesomeIcon icon={"check"} size="2x" className="checkmark" />
                            }
                        </div>
                        <div className='myr-column-wrapper'>
                            {submission.validationStatus !== 'VALIDATED' ?
                                <>
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
                                            defaultChecked={true}
                                            checked={issueAsMY}
                                            disabled={
                                                !!(user.hasPermission('SIGN_SALES') &&
                                                [
                                                    'RECOMMEND_APPROVAL',
                                                    'RECOMMEND_REJECTION',
                                                    'REJECTED',
                                                    'VALIDATED'
                                                ].indexOf(validationStatus) >= 0)
                                            }
                                        />
                                        <p>Issue credit application backdated to Sept. 30 as part of their Model Year Report. Only {conflictingReport.modelYear.name} vehicles can be issued, others will be tagged as error 71.</p>
                                    </div>
                                </>
                                :
                                <>
                                    <div className='myr-alert-wrapper'>
                                        <p className='bold pr-1 text-blue'>{conflictingReport.organizationName}'s credit application has been issued as part of a Model Year Report any invalid sales credits have not been issued and may be resubmitted.</p>
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