/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import history from '../app/History';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersForm from './components/CreditTransfersForm';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const CreditTransfersEditContainer = (props) => {
  const { id } = useParams();
  const emptyCheckboxes = {
    authority: false, accurate: false, consent: false,
  };
  const emptyRow = {
    creditType: '', modelYear: '', quantity: 0, value: 0,
  };
  const emptyForm = {
    transferPartner: '',
  };
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [rows, setRows] = useState([emptyRow]);
  const { user, keycloak, newTransfer } = props;
  const [organizations, setOrganizations] = useState([]);
  const [fields, setFields] = useState(emptyForm);
  const [years, setYears] = useState([]);
  const [unfilledRow, setUnfilledRow] = useState(true);
  const checkboxText = 'Please complete all fields in the transfer.';
  const [hoverText, setHoverText] = useState(checkboxText);
  const [loading, setLoading] = useState(true);
  const checkFilled = (input, partner=fields) => {
    Object.entries(input).forEach(([key, val]) => {
      if (
        val.creditType === ''
      || val.modelYear === ''
      || val.quantity === 0
      || val.value === 0
      || fields.transferPartner === '') {
        setUnfilledRow(true);
        // setCheckboxes(emptyCheckboxes);
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
    if (newTransfer) {
      axios.post(ROUTES_CREDIT_TRANSFERS.LIST, {
        content: data,
        status,
        creditTo,
        debitFrom,
      }).then(() => {
        history.push(ROUTES_CREDIT_TRANSFERS.LIST);
      });
    } else {
      axios.patch(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/gi, id), {
        content: data,
        status,
        creditTo,
        debitFrom,
      }).then((response) => {
        history.push(ROUTES_CREDIT_TRANSFERS.LIST);
      });
    }
  };

  const handleCheckboxClick = (event) => {
    console.error('click');
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };

  const handleSave = () => {
    console.error(checkboxes);
    // submitOrSave('DRAFT');
  };

  const handleSubmit = () => {
    submitOrSave('SUBMITTED');
  };

  const refreshDetails = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_ORGANIZATIONS.LIST),
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST),
    ]).then(axios.spread((orgResponse, yearsResponse, assertionsResponse) => {
      setOrganizations(orgResponse.data);
      setYears(yearsResponse.data);
      setAssertions(assertionsResponse.data);
    }));
    if (!newTransfer) {
      axios.get(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/gi, id)).then((response) => {
        const details = response.data;
        setFields({ ...fields, transferPartner: details.creditTo.id });
        const rowInfo = details.creditTransferContent.map((each) => ({
          creditType: each.creditClass.creditClass,
          modelYear: each.modelYear.name,
          quantity: each.creditValue,
          value: each.dollarValue,
        }));
        setRows(rowInfo);
        setUnfilledRow(false);
        setHoverText('');
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const total = rows.reduce((a, v) => a + v.quantity * v.value, 0);
  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersForm
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
    />,
  ]);
};

CreditTransfersEditContainer.defaultProps = {
  newTransfer: false,
};

CreditTransfersEditContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  newTransfer: PropTypes.bool,
};

export default CreditTransfersEditContainer;
