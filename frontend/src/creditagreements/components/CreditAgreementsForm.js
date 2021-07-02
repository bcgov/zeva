import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import Alert from '../../app/components/Alert';
import formatNumeric from '../../app/utilities/formatNumeric';
import DisplayComment from '../../app/components/DisplayComment';

const CreditAgreementsForm = (props) => {
  const { id } = props;
  return (
    <div id="credit-agreements-form" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Credit Agreements &amp; Adjustments</h2>
        </div>
      </div>
    </div>
  );
};

export default CreditAgreementsForm;
