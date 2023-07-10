import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'

const AnalystRecommendationHeader = (props) => {
  const { submission, user, handleCheckboxClick, issueAsMY } = props
  const { id, validationStatus } = submission

  return (
    <div className="p-2">
      {[
        'RECOMMEND_APPROVAL',
        'RECOMMEND_REJECTION',
        'CHECKED',
        'REJECTED',
        'VALIDATED'
      ].indexOf(validationStatus) >= 0 &&
        (user.hasPermission('RECOMMEND_SALES') ||
          user.hasPermission('SIGN_SALES')) && (
          <>
            <h4>Analyst Recommendation</h4>
            {[
              'RECOMMEND_APPROVAL',
              'RECOMMEND_REJECTION',
              'REJECTED',
              'VALIDATED'
            ].indexOf(validationStatus) >= 0 &&
              (user.hasPermission('RECOMMEND_SALES') ||
                user.hasPermission('SIGN_SALES')) && (
                <>
                  <ul className="mt-2 mb-0 pl-4">
                    <li className="font-italic text-blue">
                      <Link
                        to={ROUTES_CREDIT_REQUESTS.VALIDATED_DETAILS.replace(
                          /:id/g,
                          id
                        )}
                      >
                        View the credit application detail as processed by the
                        analyst.
                      </Link>
                    </li>
                  </ul>
                </>
            )}
            <div className="row mt-2">
              <div className="col-1">
                <input
                  id="analyst-checkbox"
                  data-testid="analyst-checkbox"
                  name="confirmations"
                  onChange={(event) => {
                    handleCheckboxClick(event)
                  }}
                  type="checkbox"
                  defaultChecked={issueAsMY}
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
              </div>
              <div className="col-9">
                <ul className="pl-0" style={{ listStyle: 'none' }}>
                  <li className="font-italic text-blue">
                    <label className="pl-0 text-blue">
                      Issue as Sept 30 as part of a Model Year Report{' '}
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </>
      )}
    </div>
  )
}
AnalystRecommendationHeader.propTypes = {
  submission: PropTypes.shape().isRequired,
  user: PropTypes.shape().isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  issueAsMY: PropTypes.bool.isRequired
}
export default AnalystRecommendationHeader
