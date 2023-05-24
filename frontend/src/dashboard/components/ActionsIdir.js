import React from 'react'
import PropTypes from 'prop-types'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'
import ROUTES_VEHICLES from '../../app/routes/Vehicles'
import Loading from '../../app/components/Loading'
import CustomPropTypes from '../../app/utilities/props'
import ActivityBanner from './ActivityBanner'
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements'
import CONFIG from '../../app/config'

const ActionsIdir = (props) => {
  const { user, activityCount, loading } = props
  if (loading) {
    return <Loading />
  }
  return (
    <div id="actions" className="dashboard-card">
      <div className="content">
        <h1>Latest Activity</h1>
        {activityCount.modelsAwaitingValidation > 0 &&
          user.hasPermission('VALIDATE_ZEV') && (
            <ActivityBanner
              colour="yellow"
              icon="car"
              boldText="ZEV Models"
              regularText={`${activityCount.modelsAwaitingValidation} submitted for validation`}
              linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Submitted`}
            />
        )}
        {user.hasPermission('VALIDATE_ZEV') &&
          activityCount.modelsAwaitingValidation === 0 && (
            <ActivityBanner
              colour="green"
              icon="car"
              boldText="ZEV Models"
              regularText="no current activity"
              linkTo={ROUTES_VEHICLES.LIST}
            />
        )}
        {activityCount.creditsAnalyst > 0 &&
          user.hasPermission('RECOMMEND_SALES') && (
            <ActivityBanner
              colour="yellow"
              icon="check-square"
              boldText="Credit Applications"
              regularText={`${activityCount.creditsAnalyst} require analyst/engineer validation`}
              linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Submitted,Validated`}
            />
        )}
        {activityCount.creditsRecommendApprove > 0 && (
          <ActivityBanner
            colour="blue"
            icon="check-square"
            boldText="Credit Applications"
            regularText={`${activityCount.creditsRecommendApprove} recommended for director approval`}
            linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Recommend%20Issuance`}
          />
        )}
        {activityCount.creditsRecommendReject > 0 && (
          <ActivityBanner
            colour="blue"
            icon="check-square"
            boldText="Credit Applications"
            regularText={`${activityCount.creditsRecommendReject} recommended for director rejection`}
            linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Recommend%20Rejection`}
          />
        )}
        {((!user.hasPermission('RECOMMEND_SALES') &&
          activityCount.creditsRecommendApprove === 0 &&
          activityCount.creditsRecommendReject === 0) ||
          (user.hasPermission('RECOMMEND_SALES') &&
            activityCount.creditsRecommendApprove === 0 &&
            activityCount.creditsRecommendReject === 0 &&
            activityCount.creditsAnalyst === 0)) && (
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
          user.hasPermission('RECOMMEND_SALES') && (
            <ActivityBanner
              colour="yellow"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersAwaitingPartner} awaiting partner confirmation`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Submitted%20to%20Transfer%20Partner`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersAwaitingAnalyst > 0 &&
          user.hasPermission('RECOMMEND_CREDIT_TRANSFER') && (
            <ActivityBanner
              colour="blue"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersAwaitingAnalyst} require analyst recommendation`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Submitted%20to%20Government`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          activityCount.transfersAwaitingDirector > 0 &&
          user.hasPermission('SIGN_CREDIT_TRANSFERS') && (
            <ActivityBanner
              colour="blue"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText={`${activityCount.transfersAwaitingDirector} recommended for director action`}
              linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Recommend`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED &&
          ((user.hasPermission('SIGN_CREDIT_TRANSFERS') &&
            activityCount.transfersAwaitingDirector === 0) ||
            (user.hasPermission('RECOMMEND_CREDIT_TRANSFER') &&
              activityCount.transfersAwaitingAnalyst === 0)) && (
            <ActivityBanner
              colour="green"
              icon="exchange-alt"
              boldText="Credit Transfer"
              regularText="no current activity"
              linkTo={ROUTES_CREDIT_TRANSFERS.LIST}
            />
        )}
        {CONFIG.FEATURES.CREDIT_AGREEMENTS.ENABLED &&
          activityCount.creditAgreementsAnalyst > 0 &&
          user.hasPermission('CREATE_INITIATIVE_AGREEMENTS') && (
            <ActivityBanner
              colour="yellow"
              icon="list"
              boldText="Credit Agreements"
              regularText={`${activityCount.creditAgreementsAnalyst} require analyst/engineer action`}
              linkTo={`${ROUTES_CREDIT_AGREEMENTS.LIST}?col-status=Draft, Returned`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_AGREEMENTS.ENABLED &&
          activityCount.creditAgreementsRecommended > 0 &&
          user.hasPermission('SIGN_INITIATIVE_AGREEMENTS') && (
            <ActivityBanner
              colour="blue"
              icon="list"
              boldText="Credit Agreements"
              regularText={`${activityCount.creditAgreementsRecommended} recommended for director action`}
              linkTo={`${ROUTES_CREDIT_AGREEMENTS.LIST}?col-status=Recommended`}
            />
        )}
        {CONFIG.FEATURES.CREDIT_AGREEMENTS.ENABLED &&
          ((activityCount.creditAgreementsRecommended === 0 &&
            user.hasPermission('SIGN_INITIATIVE_AGREEMENTS')) ||
            (activityCount.creditAgreementsAnalyst === 0 &&
              user.hasPermission('CREATE_INITIATIVE_AGREEMENTS'))) && (
            <ActivityBanner
              colour="green"
              icon="list"
              boldText="Credit Agreements"
              regularText="no current activity"
              linkTo={ROUTES_CREDIT_AGREEMENTS.LIST}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          activityCount.reportsAnalyst > 0 &&
          user.hasPermission('RECOMMEND_COMPLIANCE_REPORT') && (
            <ActivityBanner
              colour="yellow"
              icon="file-alt"
              boldText="Model Year Reports"
              regularText={`${activityCount.reportsAnalyst} require analyst/engineer action`}
              linkTo={`${ROUTES_COMPLIANCE.REPORTS}?status=Submitted, Draft`}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          activityCount.reportsReturned > 0 &&
          user.hasPermission('RECOMMEND_COMPLIANCE_REPORT') && (
            <ActivityBanner
              colour="yellow"
              icon="file-alt"
              boldText="Model Year Reports"
              regularText={`${activityCount.reportsReturned} were returned by the director`}
              linkTo={`${ROUTES_COMPLIANCE.REPORTS}?status=Returned`}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          ((user.hasPermission('RECOMMEND_COMPLIANCE_REPORT') &&
            activityCount.reportsAnalyst === 0 &&
            activityCount.reportsReturned === 0) ||
            (user.hasPermission('SIGN_COMPLIANCE_REPORT') &&
              activityCount.reportsDirector === 0)) &&
          !(
            user.hasPermission('RECOMMEND_COMPLIANCE_REPORT') &&
            user.hasPermission('SIGN_COMPLIANCE_REPORT') &&
            (activityCount.reportsDirector > 0 ||
              activityCount.reportsAnalyst > 0 ||
              activityCount.reportsReturned > 0)
          ) && (
            <ActivityBanner
              colour="green"
              icon="file-alt"
              boldText="Model Year Reports"
              regularText="no current activity"
              linkTo={ROUTES_COMPLIANCE.REPORTS}
            />
        )}
        {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED &&
          user.hasPermission('SIGN_COMPLIANCE_REPORT') &&
          activityCount.reportsDirector > 0 && (
            <ActivityBanner
              colour="blue"
              icon="file-alt"
              boldText="Model Year Reports"
              regularText={`${activityCount.reportsDirector} recommended for director action`}
              linkTo={`${ROUTES_COMPLIANCE.REPORTS}?status=Recommended`}
            />
        )}
      </div>
    </div>
  )
}

ActionsIdir.defaultProps = {}

ActionsIdir.propTypes = {
  activityCount: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ActionsIdir
