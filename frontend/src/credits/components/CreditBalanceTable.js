/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React from 'react'

import ReactTable from 'react-table'
import formatNumeric from '../../app/utilities/formatNumeric'

const CreditBalanceTable = (props) => {
  const { balances, assessedBalances } = props
  const complianceYear = balances.complianceYear

  const currentBalances = {}
  if (balances.balances) {
    balances.balances.forEach((balance) => {
      if (balance.modelYear?.name && balance.creditClass?.creditClass) {
        const modelYear = balance.modelYear.name
        const creditClass = balance.creditClass.creditClass
        const totalValue = isNaN(parseFloat(balance.totalValue)) ? 0 : parseFloat(balance.totalValue)
        if (creditClass === 'A' || creditClass === 'B') {
          if (!currentBalances[modelYear]) {
            currentBalances[modelYear] = {
              A: 0,
              B: 0
            }
          }
          currentBalances[modelYear][creditClass] = currentBalances[modelYear][creditClass] + totalValue
        }
      }
    })
  }

  const assessedDeficits = {}
  let deficitAExists = false
  let deficitBExists = false
  if (assessedBalances.deficits) {
    assessedBalances.deficits.forEach((deficit) => {
      const modelYear = deficit.modelYear
      const creditA = isNaN(parseFloat(deficit.creditA)) ? 0 : parseFloat(deficit.creditA)
      const creditB = isNaN(parseFloat(deficit.creditB)) ? 0 : parseFloat(deficit.creditB)
      if (creditA) {
        deficitAExists = true
      }
      if (creditB) {
        deficitBExists = true
      }
      if (!assessedDeficits[modelYear]) {
        assessedDeficits[modelYear] = {
          A: 0,
          B: 0
        }
      }
      assessedDeficits[modelYear].A = assessedDeficits[modelYear].A + (-1 * creditA)
      assessedDeficits[modelYear].B = assessedDeficits[modelYear].B + (-1 * creditB)
    })
  }

  if ((deficitAExists || deficitBExists) && Object.keys(assessedDeficits).length === 1) {
    const key = Object.keys(assessedDeficits)[0]
    assessedDeficits.Deficit = assessedDeficits[key]
    delete assessedDeficits[key]
  }

  const bCreditsInCaseOfDeficit = {}
  if (deficitAExists && !deficitBExists) {
    if (assessedBalances.balances) {
      assessedBalances.balances.forEach((balance) => {
        const modelYear = balance.modelYear
        const creditB = isNaN(parseFloat(balance.creditB)) ? 0 : parseFloat(balance.creditB)
        if (creditB) {
          if (!bCreditsInCaseOfDeficit[modelYear]) {
            bCreditsInCaseOfDeficit[modelYear] = {
              A: 0,
              B: 0
            }
          }
          bCreditsInCaseOfDeficit[modelYear].B = bCreditsInCaseOfDeficit[modelYear].B + creditB
        }
      })
    }
  }

  const assessedCredits = {}
  if (!(deficitAExists || deficitBExists)) {
    if (assessedBalances.balances) {
      assessedBalances.balances.forEach((balance) => {
        const modelYear = balance.modelYear
        const creditA = isNaN(parseFloat(balance.creditA)) ? 0 : parseFloat(balance.creditA)
        const creditB = isNaN(parseFloat(balance.creditB)) ? 0 : parseFloat(balance.creditB)
        if (!assessedCredits[modelYear]) {
          assessedCredits[modelYear] = {
            A: 0,
            B: 0
          }
        }
        assessedCredits[modelYear].A = assessedCredits[modelYear].A + creditA
        assessedCredits[modelYear].B = assessedCredits[modelYear].B + creditB
      })
    }
  }

  const totalCredits = {}
  if (deficitAExists || deficitBExists) {
    totalCredits['Total Current LDV Credits - Your total balance cannot be calculated due to having an assessed deficit.'] = {
      A: 0,
      B: 0
    }
  } else {
    let totalA = 0
    let totalB = 0
    const structures = [currentBalances, assessedCredits]
    structures.forEach((structure) => {
      for (const [key, creditsAandB] of Object.entries(structure)) {
        if (!totalCredits[key]) {
          totalCredits[key] = {
            A: 0,
            B: 0
          }
        }
        totalCredits[key].A = totalCredits[key].A + creditsAandB.A
        totalCredits[key].B = totalCredits[key].B + creditsAandB.B
        totalA = totalA + creditsAandB.A
        totalB = totalB + creditsAandB.B
      }
    })
    totalCredits['Total Current LDV Credits'] = {
      A: totalA,
      B: totalB
    }
  }

  const getColumns = (keyColumnHeader, bColumnHeader) => {
    return [
      {
        accessor: (item) => (item.label),
        className: 'text-left',
        Header: keyColumnHeader,
        headerClassName: 'text-left',
        id: 'label'
      },
      {
        accessor: (item) => (item.A ? formatNumeric(item.A, 2, true) : '-'),
        className: 'text-right',
        Header: 'A',
        headerClassName: 'text-left',
        id: 'credit-class-A',
        maxWidth: 150
      },
      {
        accessor: (item) => (item.B ? formatNumeric(item.B, 2, true) : '-'),
        className: 'text-right',
        Header: bColumnHeader,
        id: 'credit-class-B',
        maxWidth: 150
      }
    ]
  }

  const getReactTable = (keyColumnHeader, bColumnHeader, data) => {
    const columns = getColumns(keyColumnHeader, bColumnHeader)
    const numberOfRows = Object.keys(data).length
    return (
      <ReactTable
        className="credit-balance-table"
        columns={columns}
        sortable={false}
        data={data}
        filterable={false}
        getTrProps={(state, rowInfo) => {
          if (rowInfo) {
            if (rowInfo.row.label.toLowerCase().includes('total')) {
              return {
                className: 'font-weight-bold'
              }
            }
          }
          return {}
        }}
        getTdProps={(state, rowInfo, column) => {
          if (rowInfo && column) {
            if ((rowInfo.original.A < 0 && column.Header === 'A') || (rowInfo.original.B < 0 && (column.Header === 'B' || column.Header === 'Unspecified'))) {
              return {
                className: 'background-danger'
              }
            }
          }
          return {}
        }}
        pageSize={numberOfRows > 0 ? numberOfRows : 1 }
        showPagination={false}
      />
    )
  }

  const getRows = (object, suffixForModelYears) => {
    const result = []
    for (const [key, structure] of Object.entries(object)) {
      let label = key
      if (!isNaN(parseInt(key))) {
        label = key + suffixForModelYears
      }
      result.push({ label: label, A: structure.A, B: structure.B })
    }
    return result.reverse()
  }

  return (
    <>
      {getReactTable(`Credits Issued during the ${complianceYear} Compliance Period (Oct.1, ${complianceYear} - Sept.30, ${complianceYear + 1})`, 'B', getRows(currentBalances, ' Credits'))}
      {getReactTable(`Assessed Balance at the End of Sept.30, ${complianceYear}`, deficitBExists ? 'Unspecified' : 'B', (deficitAExists || deficitBExists) ? (getRows(assessedDeficits, ' Deficit')).concat(getRows(bCreditsInCaseOfDeficit, ' Credits')) : getRows(assessedCredits, ' Credits'))}
      {getReactTable('', 'B', getRows(totalCredits, ' Credits'))}
    </>
  )
}

CreditBalanceTable.defaultProps = {}

CreditBalanceTable.propTypes = {
  balances: PropTypes.shape({
    complianceYear: PropTypes.number.isRequired,
    balances: PropTypes.arrayOf(PropTypes.shape()).isRequired
  }).isRequired,
  assessedBalances: PropTypes.shape({
    balances: PropTypes.arrayOf(PropTypes.shape()),
    deficits: PropTypes.arrayOf(PropTypes.shape())
  }).isRequired
}

export default CreditBalanceTable
