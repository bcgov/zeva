import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import ReactTable from 'react-table';
import Accordion from '../../app/components/Accordion';
import AccordionPanel from '../../app/components/AccordionPanel';

import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ExcelFileDrop from './ExcelFileDrop';

// @todo format numeric all numbers

const VINTable = (props) => {

  const cols = [
    {
      Header: 'make',
      accessor: 'make',
    },
    {
      Header: 'Model Year',
      id: 'modelYear',
      accessor: () => ('2021'),
    },
    {
      Header: 'Model',
      accessor: 'model',
    },
    {
      Header: 'VIN',
      accessor: 'VIN',
    },
    {
      Header: 'Sale Date',
      id: 'saleDate',
      accessor: () => '2020-02-27',
    },
    {
      Header: 'Type',
      accessor: 'type',
    },
    {
      Header: 'Range (km)',
      accessor: 'range',
    },
    {
      Header: 'Credit Class',
      accessor: 'class',
    },
    {
      Header: 'Credits',
      accessor: 'credits',
    },

  ];
  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };


  return (
    <ReactTable
      columns={cols}
      data={props.data}
      className="searchable"
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'VIN',
      }]}
      filterable
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};


const ValidationErrorsTable = (props) => {

  const cols = [
    {
      Header: 'Row Number',
      id: 'row',
      accessor: (item) => item.row ? item.row : 'N/A',
    },
    {
      Header: 'Message',
      accessor: 'message',
    },
  ];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };


  return (
    <ReactTable
      columns={cols}
      data={props.data}
      className="searchable"
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'row',
      }]}
      filterable
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
}

const SalesSubmissionValidationPage = (props) => {
  const {
    user,
    readyToSign,
    backToStart,
    submissionID,
    details
  } = props;

  const [valid, setValid] = useState([]);
  const [previouslyValidated, setPreviouslyValidated] = useState([]);
  const [noProvincialMatch, setnoProvincialMatch] = useState([]);
  const [VINMismatch, setVINMismatch] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);


  useEffect(() => {
    let newValid = [];
    let newPreviouslyValidated = [];
    let newNoProvincialMatch = [];
    let newVINMismatch = [];

    details.entries.map(e => {
      switch (e.VINStatus) {
        case 'VALID':
          newValid.push(e);
          break;
        case 'MODEL_MISMATCH':
        case 'MODELYEAR_MISMATCH':
          newVINMismatch.push(e);
          break;
        case 'NOT_IN_PROVINCIAL_RECORDS':
          newNoProvincialMatch.push(e);
          break;
        case 'PREVIOUSLY_MATCHED':
          newPreviouslyValidated.push(e);
          break;
        default:
          break;
      }
    });

    setValid(newValid);
    setPreviouslyValidated(newPreviouslyValidated);
    setnoProvincialMatch(newNoProvincialMatch);
    setVINMismatch(newVINMismatch);
    setValidationErrors(details.validationErrors);

  }, [details]);

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
            <span className="left-content">
              Step 2 of 3
            </span>
          <span className="right-content">
                          <button
                            className="button"
                            onClick={() => backToStart()}
                            type="button"
                          >
                <FontAwesomeIcon icon="arrow-left" /> Restart Submission
              </button>
              <button
                className="button primary"
                onClick={() => readyToSign()}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-right" /> Proceed to Signature
              </button>
            </span>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sales-validate" className="page">

      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name} Sales Submission {submissionID}</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <strong>{`${details.entries.length} VIN uploaded`}</strong><br />
          <strong>{`${previouslyValidated.length + noProvincialMatch.length + VINMismatch.length} VIN had validation issues`}</strong><br />
          <strong>{`${validationErrors.length} data validation errors occurred`}</strong><br />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <Accordion>
            <AccordionPanel
              title={`${previouslyValidated.length} VIN had been previously validated and will be removed from this submission`}>
              <VINTable data={previouslyValidated} /></AccordionPanel>
            <AccordionPanel
              title={`${VINMismatch.length} VIN does not match expected values for the specified vehicle or model year and have been removed from this submission`}>
              <VINTable data={VINMismatch} /></AccordionPanel>
            <AccordionPanel
              title={`${noProvincialMatch.length} VIN did not validate with provincial registry data and have been saved separately in draft`}>
              <VINTable data={noProvincialMatch} /></AccordionPanel>
            <AccordionPanel title={`${validationErrors.length} entries had miscellaneous validation errors`}>
              <ValidationErrorsTable data={validationErrors} /></AccordionPanel>
            <AccordionPanel
              title={`${valid.length} VIN validated as follows and can be submitted to the Government of British Columbia for the credit totals indicated below`}
              startExpanded> <VINTable data={valid} /></AccordionPanel>
          </Accordion>
        </div>
      </div>
      {actionbar}
    </div>
  );
};

SalesSubmissionValidationPage.defaultProps = {
  mode: 'edit',
};

SalesSubmissionValidationPage.propTypes = {
  readyToSign: PropTypes.func.isRequired,
  backToStart: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionValidationPage;
