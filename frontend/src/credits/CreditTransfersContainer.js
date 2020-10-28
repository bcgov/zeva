/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import history from '../app/History';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersPage from './components/CreditTransfersPage';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers';
import ROUTES_VEHICLES from '../app/routes/Vehicles';

const CreditTransfersContainer = (props) => {
  const emptyCheckboxes = {
    authority: false, accurate: false, consent: false,
  };
  const emptyRow = {
    creditType: '', modelYear: '', quantity: 0, value: 0,
  };
  const emptyForm = {
    transferPartner: '',
  };
  const [checkboxes, setCheckboxes] = useState(emptyCheckboxes);
  const [rows, setRows] = useState([emptyRow]);
  const { user, keycloak } = props;
  const [organizations, setOrganizations] = useState([]);
  const [fields, setFields] = useState(emptyForm);
  const [years, setYears] = useState([]);
  const [unfilledRow, setUnfilledRow] = useState(true);
  const checkboxText = 'Please complete all fields in the transfer.';
  const [hoverText, setHoverText] = useState(checkboxText);

  const checkFilled = (input) => {
    Object.entries(input).forEach(([key, val]) => {
      if (
        val.creditType === ''
      || val.modelYear === ''
      || val.quantity === 0
      || val.value === 0
      || fields.transferPartner === '') {
        setUnfilledRow(true);
        setCheckboxes(emptyCheckboxes);
        setHoverText(checkboxText);
      } else {
        setUnfilledRow(false);
        setHoverText('');
      }
    });
  };
  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const input = value.trim();
    fields[name] = input;
    setFields({
      ...fields,
    });
    checkFilled(rows);
  };

  const handleRowInputChange = (event, rowId) => {
    const { value, name } = event.target;
    const rowsCopy = JSON.parse(JSON.stringify(rows));
    rowsCopy[rowId][name] = value;
    setRows(rowsCopy);
    checkFilled(rowsCopy);
  };
  const addRow = () => {
    setRows([...rows, emptyRow]);
    setHoverText(checkboxText);
  };
  const removeRow = (rowId) => {
    const filteredRows = rows.filter((item, index) => (index !== rowId));
    setRows(filteredRows);
    checkFilled(filteredRows);
  };

  const submitOrSave = (status) => {
    const creditTo = fields.transferPartner;
    const debitFrom = user.organization.id;
    const data = rows
      .filter((row) => row.quantity && row.value && row.creditType && row.modelYear)
      .map((row) => ({
        creditValue: row.quantity,
        dollarValue: row.value,
        creditClass: row.creditType,
        creditTo,
        debitFrom,
        modelYear: row.modelYear,
        transactionType: 'Credit Transfer',
        weightClass: 'LDV',
      }));
    axios.post(ROUTES_CREDIT_TRANSFERS.LIST, {
      content: data,
      status,
      creditTo,
      debitFrom,
    }).then(() => {
      history.push(ROUTES_CREDIT_TRANSFERS.LIST);
    });
  };
  const handleSave = () => {
    submitOrSave('DRAFT');
  };
  const handleSubmit = () => {
    submitOrSave('SUBMITTED');
  };

  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_ORGANIZATIONS.LIST),
      axios.get(ROUTES_VEHICLES.YEARS),
    ]).then(axios.spread((orgResponse, yearsResponse) => {
      setOrganizations(orgResponse.data);
      setYears(yearsResponse.data);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const total = rows.reduce((a, v) => a + v.quantity * v.value, 0);
  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersPage
      key="page"
      user={user}
      organizations={organizations}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      years={years}
      handleSave={handleSave}
      removeRow={removeRow}
      addRow={addRow}
      handleRowInputChange={handleRowInputChange}
      total={total}
      rows={rows}
      fields={fields}
      unfilledRow={unfilledRow}
      checkboxes={checkboxes}
      setCheckboxes={setCheckboxes}
      hoverText={hoverText}
    />,
  ]);
};

CreditTransfersContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransfersContainer;
