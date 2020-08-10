import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Accordion from '../../app/components/Accordion';
import AccordionPanel from '../../app/components/AccordionPanel';

import SalesSubmissionSignaturesModal from './SalesSubmissionSignaturesModal';
import ValidationErrorsTable from './ValidationErrorsTable';
import VINListTable from './VINListTable';

import CustomPropTypes from '../../app/utilities/props';

const SalesSubmissionValidationPage = (props) => {
  const {
    backToStart,
    details,
    setShowModal,
    showModal,
    sign,
    user,
  } = props;

  const [valid, setValid] = useState([]);
  const [previouslyValidated, setPreviouslyValidated] = useState([]);
  const [noProvincialMatch, setnoProvincialMatch] = useState([]);
  const [VINMismatch, setVINMismatch] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  let entries = [];

  useEffect(() => {
    const newValid = [];
    const newPreviouslyValidated = [];
    const newNoProvincialMatch = [];
    const newVINMismatch = [];

    if (details.entries) {
      ({ entries } = details);
    }

    console.error(details.records);
    if (details.records) {
      entries = details.records;
    }

    // eslint-disable-next-line array-callback-return
    entries.map((e) => {
      console.error(e.vin_validation_status);
      switch (e.vinValidationStatus) {
        case 'VALID':
          newValid.push(e);
          break;
        case 'UNCHECKED': // @todo enable VIN checking. This is just for the demo
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
    setValidationErrors(details.validationProblems);
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
              onClick={() => {
                setShowModal(true);
              }}
              type="button"
            >
              <FontAwesomeIcon icon="paper-plane" /> Submit
            </button>
          </span>
        </div>
      </div>
    </div>
  );

  const modal = (
    <SalesSubmissionSignaturesModal
      handleCancel={() => {
        setShowModal(false);
      }}
      handleSubmit={() => {
        sign(details.id);
      }}
      showModal={showModal}
      user={user}
    />
  );

  return (
    <div id="sales-validate" className="page">

      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name} Sales Submission {details.submissionId}</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <Accordion>
            {validationErrors && (
            <AccordionPanel title={`${validationErrors.length} VIN were rejected, see rejected VIN`}>
              <ValidationErrorsTable data={validationErrors} />
            </AccordionPanel>
            )}
            <AccordionPanel
              title={`The following ${entries.length} VIN can be submitted to government for further analysis to receive credits.`}
              startExpanded
            >
              <VINListTable data={valid} />
            </AccordionPanel>
          </Accordion>
        </div>
      </div>
      {actionbar}
      {modal}
    </div>
  );
};

SalesSubmissionValidationPage.defaultProps = {};

SalesSubmissionValidationPage.propTypes = {
  backToStart: PropTypes.func.isRequired,
  details: PropTypes.shape({
    id: PropTypes.number,
    submissionId: PropTypes.string.isRequired,
    entries: PropTypes.arrayOf(PropTypes.object),
    records: PropTypes.arrayOf(PropTypes.object),
    validationProblems: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
  setShowModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  sign: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionValidationPage;
