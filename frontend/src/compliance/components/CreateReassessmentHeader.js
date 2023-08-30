import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport'
import history from '../../app/History'
import CustomPropTypes from '../../app/utilities/props'
import CONFIG from '../../app/config'

const CreateReassessmentHeader = (props) => {
  const { id, user } = props
  const [canCreateSupplementalOrReassessment, setCanCreateSupplementalOrReassessment] = useState(false)

  useEffect(() => {
    axios.get(ROUTES_COMPLIANCE.STATUSES_ALLOW_REASSESSMENT.replace(/:id/g, id)).then((response) => {
      const statusesAllowReassessment = response.data
      let hasPermissionToSupplementOrReassess = false
      if (!user.isGovernment || (user.isGovernment && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT'))) {
        hasPermissionToSupplementOrReassess = true
      }
      if (CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED && statusesAllowReassessment && hasPermissionToSupplementOrReassess) {
        setCanCreateSupplementalOrReassessment(true)
      }
    })
  }, [])

  let supplementaryText = 'Supplementary'
  let supplementaryRoute = ROUTES_SUPPLEMENTARY.CREATE
  if (user.isGovernment) {
    supplementaryText = 'Reassessment'
    supplementaryRoute = ROUTES_SUPPLEMENTARY.REASSESSMENT
  }

  return (
    <div className='action-bar right-content'>
      <div></div>
      <div>
        {canCreateSupplementalOrReassessment && <button
          className='button primary ml-4'
          onClick={() => {
            history.push(
              `${supplementaryRoute.replace(
                /:id/g,
                id
              )}`
            )
          }}
        >
          {`Create ${supplementaryText} Report`}
        </button>}
        <button
          className='button ml-2'
          onClick={() => {
            window.print()
          }}
        >
          Print Page
        </button>
      </div>
    </div>
  )
}

CreateReassessmentHeader.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  user: CustomPropTypes.user.isRequired
}

export default CreateReassessmentHeader
