/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React from 'react'

import ReactTable from '../../app/components/ReactTable'
import CustomPropTypes from '../../app/utilities/props'
import AnalystRecommendationHeader from './AnalystRecommendationHeader'
import getAnalystRecommendationColumns from './getAnalystRecommendationColumns'
import CreditApplicationHeader from './CreditApplicationHeader'
import isLegacySubmission from '../../app/utilities/isLegacySubmission'

const ModelListTable = (props) => {
  const { submission, user, handleCheckboxClick, issueAsMY, setDisplayUploadPage } = props

  const columns = [
    {
      Header: (
        <AnalystRecommendationHeader
          submission={submission}
          user={user}
          handleCheckboxClick={handleCheckboxClick}
          issueAsMY={issueAsMY}
        />
      ),
      headerClassName: 'header-group text-left analyst-recommendation',
      columns: getAnalystRecommendationColumns(props)
    },
    {
      Header: <CreditApplicationHeader submission={submission} user={user} setDisplayUploadPage={setDisplayUploadPage} />,
      headerClassName: `header-group text-left gap-left ${
        !user.isGovernment ? 'd-none' : ''
      }`,
      columns: [
        {
          accessor: 'sales',
          className: 'text-right gap-left sales-submitted',
          Footer: (reactTable) => {
            const sum = reactTable.data.map(item => {
              if (isNaN(item.sales)) {
                return 0
              }
              return item.sales
            }).reduce((a, b) => a + b)

            if (sum === 0) {
              return '-'
            }

            return sum
          },
          Header: isLegacySubmission(submission) ? 'Sales Submitted' : 'Vehicles Submitted',
          headerClassName: 'gap-left',
          id: 'sales',
          width: 150
        },
        {
          accessor: (item) => {
            const { vehicle, sales } = item

            if (!sales) {
              return '-'
            }

            if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
              return (sales * (Math.round((vehicle.creditValue + Number.EPSILON) * 100) / 100)).toFixed(2)
            }

            return '-'
          },
          className: `text-right credits-applied-for ${
            !user.isGovernment ? 'd-none' : ''
          }`,
          Footer: (reactTable) => {
            const sum = reactTable.data.map(item => {
              if (isNaN(item['credits-applied-for'])) {
                return 0
              }
              return Number(item['credits-applied-for'])
            }).reduce((a, b) => a + b)

            if (sum === 0) {
              return '-'
            }

            return (Math.round((sum + Number.EPSILON) * 100) / 100).toFixed(2)
          },
          Header: 'Credits Applied For',
          headerClassName: `${!user.isGovernment ? 'd-none' : ''}`,
          id: 'credits-applied-for',
          width: 175
        },
        {
          accessor: (item) => {
            if (!submission.eligible) {
              return '-'
            }

            const eligibleSales = submission.eligible.find(
              (eligible) => eligible.vehicleId === item.vehicle.id
            )

            if (!eligibleSales) {
              return '-'
            }

            return eligibleSales.vinCount
          },
          className: 'text-right no-footer',
          Header: 'Eligible Sales',
          id: 'eligible-sales',
          show:
            !user.isGovernment && submission.validationStatus === 'VALIDATED',
          width: 150
        },
        {
          accessor: (item) => {
            const { vehicle } = item

            if (!submission.eligible) {
              return '-'
            }

            const eligibleSales = submission.eligible.find(
              (eligible) => eligible.vehicleId === vehicle.id
            )

            if (!eligibleSales) {
              return '-'
            }

            if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
              return (
                eligibleSales.vinCount * (Math.round((vehicle.creditValue + Number.EPSILON) * 100) / 100)
              ).toFixed(2)
            }

            return '-'
          },
          className: 'text-right no-footer',
          Header: 'Eligible ZEV Credits',
          id: 'eligible-zev-credits',
          show:
            !user.isGovernment && submission.validationStatus === 'VALIDATED',
          width: 200
        },
        {
          accessor: (item) =>
            `${item.xlsModelYear} ${item.xlsMake} ${item.xlsModel}`,
          className: 'no-footer',
          Header: 'Model',
          id: 'model'
        },
        {
          accessor: (item) => {
            const { vehicle } = item

            if (vehicle) {
              return vehicle.creditClass
            }

            return ''
          },
          className: 'text-center no-footer',
          Header: 'ZEV Class',
          id: 'credit-class',
          width: 120
        },
        {
          accessor: (item) => {
            const { vehicle } = item

            if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
              return (Math.round((vehicle.creditValue + Number.EPSILON) * 100) / 100).toFixed(2)
            }

            return '-'
          },
          className: 'text-right no-footer',
          Header: 'Credit Entitlement',
          id: 'credits',
          width: 150
        },
        {
          accessor: 'vehicle.vehicleZevType.vehicleZevCode',
          className: 'text-center no-footer',
          Header: 'ZEV Type',
          width: 150
        },
        {
          accessor: 'vehicle.range',
          className: 'text-right no-footer',
          Header: 'Range (km)',
          width: 150
        }
      ]
    }
  ]

  return (
    <div
      className={`model-list-table ${!user.isGovernment ? 'bceid-user' : ''}`}
    >
      <ReactTable
        columns={columns}
        data={submission.content}
        defaultSorted={[
          {
            id: 'make'
          }
        ]}
        getTrProps={(state, row) => {
          if (
            row &&
            row.original &&
            (!row.original.vehicle ||
              !row.original.vehicle.id ||
              row.original.modelName === '')
          ) {
            return {
              className: 'danger'
            }
          }

          return {}
        }}
        key="table"
      />
    </div>
  )
}

ModelListTable.defaultProps = {}

ModelListTable.propTypes = {
  submission: PropTypes.shape({
    content: PropTypes.arrayOf(PropTypes.shape()),
    eligible: PropTypes.arrayOf(PropTypes.shape()),
    evidence: PropTypes.arrayOf(PropTypes.shape()),
    id: PropTypes.number,
    organization: PropTypes.shape(),
    validationStatus: PropTypes.string
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  issueAsMY: PropTypes.bool.isRequired,
  setDisplayUploadPage: PropTypes.func.isRequired
}

export default ModelListTable
