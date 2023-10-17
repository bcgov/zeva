import React from 'react'
import PropTypes from 'prop-types'
import Loading from '../../app/components/Loading'
import ActivityBanner from './ActivityBanner'
import ROUTES_VEHICLES from '../../app/routes/Vehicles'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements'
import CONFIG from '../../app/config'
import CustomPropTypes from '../../app/utilities/props'

const ActionsBceid = (props) => {
  const { user, activityCount, loading } = props
  if (loading) {
    return <Loading />
  }
  return (
    <div id="actions" className="dashboard-card">
      <div className="content">
        <h1>Latest Activity</h1>
        {activityCount.modelsInfoRequest > 0 &&
          user.hasPermission('VIEW_ZEV') && (
            <ActivityBanner
              colour="yellow"
              icon="car"
              boldText="ZEV Models"
              regularText={`${activityCount.modelsInfoRequest} range information requests`}
              linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Changes%20Requested`}
            />
        )}
        {activityCount.modelsDraft > 0 && user.hasPermission('VIEW_ZEV') && (
          <ActivityBanner
            colour="yellow"
            icon="car"
            boldText="ZEV Models"
            regularText={`${activityCount.modelsDraft} saved in draft`}
            linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Draft`}
          />
        )}
        {activityCount.modelsAwaitingValidation > 0 &&
          user.hasPermission('VIEW_ZEV') && (
            <ActivityBanner
              colour="blue"
              icon="car"
              boldText="ZEV Models"
              regularText={`${activityCount.modelsAwaitingValidation} awaiting validation`}
              linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Submitted`}
            />
        )}
        {activityCount.modelsValidated > 0 &&
          user.hasPermission('VIEW_ZEV') && (
            <ActivityBanner
              colour="green"
              icon="car"
              boldText="ZEV Models"
              regularText={`${activityCount.modelsValidated} validated by Government of B.C.`}
              linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Validated`}
            />
        )}
        {activityCount.modelsRejected > 0 && user.hasPermission('VIEW_ZEV') && (
          <ActivityBanner
            colour="red"
            icon="car"
            boldText="ZEV Models"
            regularText={`${activityCount.modelsRejected} rejected by Government of B.C.`}
            linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Rejected`}
          />
        )}
        {activityCount.modelsInfoRequest === 0 &&
          activityCount.modelsAwaitingValidation === 0 &&
          activityCount.modelsValidated === 0 &&
          user.hasPermission('VIEW_ZEV') && (
            <ActivityBanner
              colour="green"
              icon="car"
              boldText="ZEV Models"
              regularText="no current activity"
              linkTo={ROUTES_VEHICLES.LIST}
            />
        )}

        {activityCount.creditsDraft > 0 && user.hasPermission('EDIT_SALES') && (
          <ActivityBanner
            colour="yellow"
            icon="check-square"
            boldText="Credit Applications"
            regularText={`${activityCount.creditsDraft} saved awaiting submission`}
            linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Draft`}
          />
        )}
        {activityCount.creditsAwaiting > 0 &&
          user.hasPermission('EDIT_SALES') && (
            <ActivityBanner
              colour="blue"
              icon="check-square"
              boldText="Credit Applications"
              regularText={`${activityCount.creditsAwaiting} awaiting validation`}
              linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Submitted`}
            />
        )}
        {activityCount.creditsIssued > 0 &&
          user.hasPermission('EDIT_SALES') && (
            <ActivityBanner
              colour="green"
              icon="check-square"
              boldText="Credit Applications"
              regularText={`${activityCount.creditsIssued} processed by Government of B.C.`}
              linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Issued`}
            />
        )}
        {activityCount.creditsDraft === 0 &&
          activityCount.creditsAwaiting === 0 &&
          activityCount.creditsIssued === 0 &&
          user.hasPermission('EDIT_SALES') && (
            <ActivityBanner
              colour="green"
              icon="check-square"
              boldText="Credit Applications"
              regularText="no current activity"
              linkTo={ROUTES_CREDIT_REQUESTS.LIST}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersAwaitingPartner > 0 &&
          user.hasPermission('VIEW_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="yellow"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersAwaitingPartner} awaiting partner confirmation`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Submitted%20to%20Transfer%20Partner`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersAwaitingGovernment > 0 &&
          user.hasPermission('VIEW_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="blue"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersAwaitingGovernment} awaiting  Government of B.C. action`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Submitted%20to%20Government`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersRecorded > 0 &&
          user.hasPermission('VIEW_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="green"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersRecorded} recorded by Government of B.C.`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Recorded`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersAwaitingGovernment === 0 &&
          activityCount.transfersAwaitingPartner === 0 &&
          activityCount.transfersRecorded === 0 &&
          user.hasPermission('VIEW_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="green"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText="no current activity"
              linkTo={ROUTES_CREDIT_TRANSFERS.LIST}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersRejectedByPartner > 0 &&
          user.hasPermission('VIEW_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="red"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersRejectedByPartner} rejected by Transfer Partner`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Rejected By Transfer Partner`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersRejected > 0 &&
          user.hasPermission('VIEW_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="red"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersRejected} rejected by Government of B.C.`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Rejected By Government`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_AGREEMENTS.ENABLED &&
          activityCount.creditAgreementsIssued > 0 && (
            // && user.hasPermission('')
            <ActivityBanner
              colour="green"
              icon="list"
              boldText="Credit Agreements"
              regularText={`${activityCount.creditAgreementsIssued} recorded by the Government of B.C.`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}`}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          activityCount.reportsDraft > 0 &&
          user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && (
            <ActivityBanner
              colour="yellow"
              icon="file-alt"
              boldText="Model Year Report"
              regularText={`${activityCount.reportsDraft} awaiting submission`}
              linkTo={`${ROUTES_COMPLIANCE.REPORTS}?status=Draft`}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          activityCount.reportsSubmitted > 0 &&
          user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && (
            <ActivityBanner
              colour="blue"
              icon="file-alt"
              boldText="Model Year Report"
              regularText={`${activityCount.reportsSubmitted} awaiting government assessment`}
              linkTo={`${ROUTES_COMPLIANCE.REPORTS}?status=Submitted`}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          activityCount.reportsAssessed > 0 &&
          user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && (
            <ActivityBanner
              colour="green"
              icon="file-alt"
              boldText="Model Year Report"
              regularText={`${activityCount.reportsAssessed} assessed by government`}
              linkTo={`${ROUTES_COMPLIANCE.REPORTS}?status=Assessed`}
            />
        )}
      </div>
    </div>
  )
}

ActionsBceid.defaultProps = {}

ActionsBceid.propTypes = {
  activityCount: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ActionsBceid
