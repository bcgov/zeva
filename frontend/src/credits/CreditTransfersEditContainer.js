/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import history from '../app/History'
import Loading from '../app/components/Loading'
import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import CustomPropTypes from '../app/utilities/props'
import CreditTransfersForm from './components/CreditTransfersForm'
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations'
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers'
import ROUTES_VEHICLES from '../app/routes/Vehicles'
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions'

const CreditTransfersEditContainer = (props) => {
  const { id } = useParams()
  const emptyRow = {
    creditType: '',
    modelYear: '',
    quantity: '',
    value: ''
  }
  const emptyForm = {
    transferPartner: ''
  }
  const [transferComments, setTransferComments] = useState([])
  const [submission, setSubmission] = useState({})
  const [errorMessage, setErrorMessage] = useState([])
  const [assertions, setAssertions] = useState([])
  const [checkboxes, setCheckboxes] = useState([])
  const [rows, setRows] = useState([emptyRow])
  const { user, keycloak, newTransfer } = props
  const [organizations, setOrganizations] = useState([])
  const [fields, setFields] = useState(emptyForm)
  const [years, setYears] = useState([])
  const [unfilledRow, setUnfilledRow] = useState(true)
  const checkboxText = 'Please complete all fields in the transfer.'
  const [hoverText, setHoverText] = useState(checkboxText)
  const [loading, setLoading] = useState(true)

  const updateRows = (newRows) => {
    setRows(newRows);
    checkFilled(newRows);
  };

  const checkFilled = (inputRows) => {
    const hasUnfilledEntry = Object.values(inputRows).some(row =>
      row.creditType.length === 0 ||
      row.modelYear.length === 0 ||
      row.quantity.length === 0 ||
      parseInt(row.quantity) === 0 ||
      row.value.length === 0
      // User can enter 0 for the value for transfering credit for free,
      //   so we don't check for it.
    ) || inputRows.length === 0 || fields.transferPartner.length === 0;
    setUnfilledRow(hasUnfilledEntry);
    if (hasUnfilledEntry) {
      setCheckboxes([]);
      setHoverText(checkboxText);
    } else {
      setHoverText('');
    }
  }

  const handleInputChange = (event) => {
    const { value, name } = event.target
    const input = value.trim()
    fields[name] = input
    setFields({
      ...fields
    })
    checkFilled(rows)
  }

  const handleRowInputChange = (event, rowId) => {
    const { value, name } = event.target
    const rowsCopy = JSON.parse(JSON.stringify(rows))
    rowsCopy[rowId][name] = value
    if (name === 'value') {
      const hasDecimal = value.indexOf('.') >= 0
      if (hasDecimal) {
        const numberOfDecimals = value.split('.')[1].length
        if (numberOfDecimals > 2) {
          rowsCopy[rowId][name] = parseFloat(value).toFixed(2)
        }
      }
    }
    if (name === 'quantity') {
      const hasDecimal = value.indexOf('.') >= 0
      if (hasDecimal) {
        rowsCopy[rowId][name] = parseFloat(value).toFixed(0)
      }
    }
    updateRows(rowsCopy)
  }

  const addRow = () => {
    updateRows([...rows, emptyRow])
  }

  const removeRow = (rowId) => {
    const filteredRows = rows.filter((item, index) => index !== rowId)
    updateRows(filteredRows)
  }

  const submitOrSave = (status) => {
    const creditTo = fields.transferPartner
    const debitFrom = user.organization.id

    const data = rows
      .filter(
        (row) => row.quantity && row.value && row.creditType && row.modelYear
      )
      .map((row) => ({
        creditValue: row.quantity,
        dollarValue: row.value,
        creditClass: row.creditType,
        creditTo,
        debitFrom,
        modelYear: row.modelYear,
        transactionType: 'Credit Transfer',
        weightClass: 'LDV'
      }))

    if (newTransfer) {
      axios
        .post(ROUTES_CREDIT_TRANSFERS.LIST, {
          content: data,
          status,
          creditTo,
          debitFrom,
          signingConfirmation: checkboxes
        })
        .then((response) => {
          if (status === 'DRAFT') {
            history.push(
              ROUTES_CREDIT_TRANSFERS.EDIT.replace(/:id/gi, response.data.id)
            )
          } else {
            history.push(
              ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/gi, response.data.id)
            )
          }
        })
        .catch((error) => {
          const { response } = error
          if (response.status === 400) {
            setErrorMessage(error.response.data.status)
          }
        })
    } else {
      axios
        .patch(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/gi, id), {
          content: data,
          status,
          creditTo,
          debitFrom,
          signingConfirmation: checkboxes
        })
        .then(() => {
          history.push(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/g, id))
          if (status === 'DRAFT') {
            history.replace(ROUTES_CREDIT_TRANSFERS.EDIT.replace(/:id/g, id))
          }
        })
        .catch((error) => {
          const { response } = error
          if (response.status === 400) {
            setErrorMessage(error.response.data.status)
          }
        })
    }
  }

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter(
        (each) => Number(each) !== Number(event.target.id)
      )
      setCheckboxes(checked)
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id)
      setCheckboxes(checked)
    }
  }

  const handleSave = () => {
    submitOrSave('DRAFT')
  }

  const handleSubmit = (type) => {
    submitOrSave(type)
  }

  const refreshDetails = () => {
    setLoading(true)
    axios
      .all([
        axios.get(ROUTES_ORGANIZATIONS.LIST),
        axios.get(ROUTES_VEHICLES.YEARS),
        axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST)
      ])
      .then(
        axios.spread((orgResponse, yearsResponse, assertionsResponse) => {
          setOrganizations(orgResponse.data)
          setYears(yearsResponse.data)
          const filteredAssertions = assertionsResponse.data.filter(
            (data) => data.module === 'credit_transfer'
          )
          setAssertions(filteredAssertions)
        })
      )
    if (!newTransfer) {
      axios
        .get(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/gi, id))
        .then((response) => {
          const details = response.data
          if (
            details.debitFrom.id !== user.organization.id ||
            ['DRAFT', 'RESCINDED', 'RESCIND_PRE_APPROVAL'].indexOf(
              details.status
            ) < 0
          ) {
            history.push(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/g, id))
          }
          setFields({ ...fields, transferPartner: details.creditTo.id })
          const rowInfo = details.creditTransferContent.map((each) => ({
            creditType: each.creditClass.creditClass,
            modelYear: each.modelYear.name,
            quantity: each.creditValue,
            value: each.dollarValue
          }))
          setTransferComments(
            details.history
              .filter((each) => each.comment)
              .map((comment) => comment.comment)
          )
          setSubmission(details)
          setRows(rowInfo)
          setUnfilledRow(false)
          setHoverText('')
        })
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated])
  const total = rows.reduce((a, v) => a + v.quantity * v.value, 0)
  if (loading) {
    return <Loading />
  }
  return [
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersForm
      errorMessage={errorMessage}
      addRow={addRow}
      assertions={assertions}
      checkboxes={checkboxes}
      fields={fields}
      handleCheckboxClick={handleCheckboxClick}
      handleInputChange={handleInputChange}
      handleRowInputChange={handleRowInputChange}
      handleSave={handleSave}
      handleSubmit={handleSubmit}
      hoverText={hoverText}
      key="page"
      loading={loading}
      organizations={organizations}
      removeRow={removeRow}
      rows={rows}
      setCheckboxes={setCheckboxes}
      total={total}
      unfilledRow={unfilledRow}
      user={user}
      years={years}
      transferComments={transferComments}
      submission={submission}
    />
  ]
}

CreditTransfersEditContainer.defaultProps = {
  newTransfer: false
}

CreditTransfersEditContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  newTransfer: PropTypes.bool
}

export default CreditTransfersEditContainer
