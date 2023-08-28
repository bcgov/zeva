import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

const ModelYearReportWarning = (props) => {
    const { submission, user, handleCheckboxClick, conflictingReport, issueAsMY} = props
    const { id, validationStatus } = submission

    return (
        <>
        {[
        'RECOMMEND_APPROVAL',
        'RECOMMEND_REJECTION',
        'CHECKED',
      ].indexOf(validationStatus) >= 0 &&
        (user.hasPermission('RECOMMEND_SALES') ||
          user.hasPermission('SIGN_SALES')) && (
            <div className='myr-alert'>
            <div className='col-1 myr-alert-wrapper'>
                <FontAwesomeIcon icon={"exclamation-circle"} size="3x" color="red"/>
            </div>
            <div className='myr-column-wrapper'>
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
            </div>
        </div>
        )}
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