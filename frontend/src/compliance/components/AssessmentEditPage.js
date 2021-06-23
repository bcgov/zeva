import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import AssessmentSupplierInformationMakes from './AssessmentSupplierInformationMakes';
import ConsumerLDVSales from './ConsumerLDVSales';
import getTotalReduction from '../../app/utilities/getTotalReduction';
import getClassACredits from '../../app/utilities/getClassAReduction';
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction';
import TextInput from '../../app/components/TextInput';
import FormDropdown from '../../credits/components/FormDropdown';

const AssessmentEditPage = (props) => {
  const {
    details,
    loading,
    makes,
    make,
    modelYear,
    statuses,
    user,
    handleChangeMake,
    handleChangeSale,
    handleDeleteMake,
    handleSubmitMake,
    handleSubmit,
    ratios,
    sales,
    supplierMakes,
    years,
    adjustments,
    handleChangeAdjustment,
    handleDeleteAdjustment,
    addAdjustment,
  } = props;

  if (loading) {
    return <Loading />;
  }

  const totalReduction = getTotalReduction(details.ldvSales, ratios.complianceRatio);
  const classAReduction = getClassACredits(details.ldvSales, ratios.zevClassA, details.supplierClass);
  const leftoverReduction = getUnspecifiedClassReduction(totalReduction, classAReduction);

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content" />
          <span className="right-content mr-3">
            <Button
              optionalClassname="button primary"
              buttonType="save"
              action={(event) => {
                handleSubmit(event);
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
  return (
    <div id="assessment-edit" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="m-0">
            {details
              && details.supplierInformation
              && details.supplierInformation.history && (
                <ComplianceReportAlert
                  next=""
                  report={details.assessment}
                  status={statuses.assessment}
                  type="Assessment"
                />
            )}
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div className="grey-border-area">
            <h3>Notice of Assessment</h3>
            <div className="mt-3">
              <h3> {details.organization.name} </h3>
            </div>
            <div className="supplier-info-ldv-makes mt-2">
              <h3>Supplier Information LDV Makes</h3>
              <div className="mt-2 p-3 grey-border-area p-4">
                <AssessmentSupplierInformationMakes
                  modelYear={modelYear}
                  loading={loading}
                  user={user}
                  makes={makes}
                  details={details}
                  handleChangeMake={handleChangeMake}
                  handleDeleteMake={handleDeleteMake}
                  handleSubmitMake={handleSubmitMake}
                  make={make}
                  supplierMakes={supplierMakes}
                />
              </div>
            </div>
            <div className="consumer-ldv-sales mt-2">
              <h3>Consumer LDV Sales</h3>
              <div className="mt-2 grey-border-area">
                <ConsumerLDVSales
                  classAReduction={classAReduction}
                  currentSales={details.ldvSales}
                  handleChangeSale={handleChangeSale}
                  leftoverReduction={leftoverReduction}
                  modelYear={modelYear}
                  ratios={ratios}
                  supplierClass={details.supplierClass}
                  totalReduction={totalReduction}
                  updatedSales={sales[modelYear]}
                />
              </div>
            </div>
            <div className="assessment-credit-adjustment mt-2">
              <h3>Assessment Credit Adjustment</h3>
              <div className="mt-2 grey-border-area">
                {adjustments && adjustments.map((adjustment, index) => (
                  <div className="form-group" key={index}>
                    <div className="d-inline-block align-middle mr-5 text-blue">
                      Credits
                    </div>
                    <div className="d-inline-block align-middle mr-5">
                      <div className="mb-2">
                        <input
                          id={`adjustment-type-${index}-allocation`}
                          checked={adjustment.type === 'Allocation'}
                          name={`adjustment-type-${index}`}
                          type="radio"
                          value="Allocation"
                          onChange={(event) => {
                            handleChangeAdjustment(event.target.value, 'type', index);
                          }}
                        />
                        <label htmlFor={`adjustment-type-${index}-allocation`}>Allocation</label>
                      </div>
                      <div>
                        <input
                          id={`adjustment-type-${index}-reduction`}
                          checked={adjustment.type === 'Reduction'}
                          name={`adjustment-type-${index}`}
                          type="radio"
                          value="Reduction"
                          onChange={(event) => {
                            handleChangeAdjustment(event.target.value, 'type', index);
                          }}
                        />
                        <label htmlFor={`adjustment-type-${index}-reduction`}>Reduction</label>
                      </div>
                    </div>
                    <div className="d-inline-block align-middle mr-5">
                      <div className="mb-2">
                        <input
                          id={`credit-type-${index}-a`}
                          checked={adjustment.creditClass === 'A'}
                          name={`credit-type-${index}`}
                          type="radio"
                          value="A"
                          onChange={(event) => {
                            handleChangeAdjustment(event.target.value, 'creditClass', index);
                          }}
                        />
                        <label htmlFor={`credit-type-${index}-a`}>A credits</label>
                      </div>
                      <div>
                        <input
                          id={`credit-type-${index}-b`}
                          checked={adjustment.creditClass === 'B'}
                          name={`credit-type-${index}`}
                          type="radio"
                          value="B"
                          onChange={(event) => {
                            handleChangeAdjustment(event.target.value, 'creditClass', index);
                          }}
                        />
                        <label htmlFor={`credit-type-${index}-b`}>B credits</label>
                      </div>
                    </div>
                    <FormDropdown
                      dropdownData={years}
                      dropdownName="model year"
                      handleInputChange={(event) => {
                        handleChangeAdjustment(event.target.value, 'modelYear', index);
                      }}
                      fieldName="modelYear"
                      accessor={(year) => year.name}
                      selectedOption={adjustment.modelYear || '--'}
                      labelClassname="mr-2 d-inline-block"
                      inputClassname="d-inline-block"
                      rowClassname="mr-5 d-inline-block align-middle"
                    />
                    <TextInput
                      label="quantity of credits"
                      id="quantityOfCredits"
                      name="quantity"
                      defaultValue={adjustment.quantity}
                      handleInputChange={(event) => {
                        handleChangeAdjustment(event.target.value, 'quantity', index);
                      }}
                      labelSize="mr-2 col-form-label d-inline-block align-middle"
                      inputSize="d-inline-block align-middle transfer-input-width"
                      mandatory
                      rowSize="mr-5 d-inline-block align-middle"
                      num
                    />
                    <button
                      type="button"
                      className="transfer-row-x"
                      onClick={() => {
                        handleDeleteAdjustment(index);
                      }}
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  </div>
                ))}

                <button
                  className="button"
                  onClick={addAdjustment}
                  type="button"
                >
                  <FontAwesomeIcon icon="plus" />{' '}
                  Add Adjustment
                </button>
              </div>
            </div>
          </div>
          {actionbar}
        </div>
      </div>
    </div>
  );
};
AssessmentEditPage.defaultProps = {};

AssessmentEditPage.propTypes = {
  details: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  supplierMakes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  modelYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  handleChangeMake: PropTypes.func.isRequired,
  handleChangeSale: PropTypes.func.isRequired,
  handleDeleteMake: PropTypes.func.isRequired,
  handleSubmitMake: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  make: PropTypes.string.isRequired,
  sales: PropTypes.shape().isRequired,
  ratios: PropTypes.shape().isRequired,
  years: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  adjustments: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleChangeAdjustment: PropTypes.func.isRequired,
  handleDeleteAdjustment: PropTypes.func.isRequired,
  addAdjustment: PropTypes.func.isRequired,
};
export default AssessmentEditPage;
