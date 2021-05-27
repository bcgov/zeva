import React from 'react';
import PropTypes from 'prop-types';

const AssessmentSupplierInformationMakes = (props) => {
  const {
    details,
    makes,
    make,
    modelYear,
    handleChangeMake,
    handleDeleteMake,
    handleSubmitMake,
    supplierMakes,
  } = props;

  return (
    <>
      <table>
        <tbody>
          <tr>
            <th className="large-column" />
            <th className="large-column">Supplier Information</th>
            <th className="large-column">Analyst Adjustment</th>
          </tr>
          <tr>
            <td className="text-blue text-left">
              LDV makes {details.organization.name} supplied in British Columbia
              in the {modelYear} compliance period ending September 30,{' '}
              {modelYear + 1}.
            </td>
            <td className="text-blue text-left">
              {supplierMakes.length > 0 && (
                <div className="mt-0 list">
                  <ul>
                    {supplierMakes.map((item, index) => (
                      <div className="form-row my-2" key={index}>
                        <li>
                          <div className="col-11">{item}</div>
                        </li>
                      </div>
                    ))}
                  </ul>
                </div>
              )}
            </td>
            <td>
              <div className="ldv-makes p-3">
                <form onSubmit={handleSubmitMake}>
                  <div className="form-row">
                    <div className="col-sm-8 col-xs-12">
                      <input
                        className="form-control mr-3"
                        onChange={handleChangeMake}
                        type="text"
                        value={make}
                      />
                    </div>
                    <div className="col">
                      <button className="btn btn-primary" type="submit">
                        Add Make
                      </button>
                    </div>
                  </div>
                </form>

                {makes.length > 0 && (
                  <div className="list mt-3 p-2">
                    {makes.map((item, index) => (
                      <div className="form-row my-2" key={index}>
                        <div className="col-11">{item}</div>
                        <div className="col-1 delete">
                          <button
                            onClick={() => {
                              handleDeleteMake(index);
                            }}
                            type="button"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

AssessmentSupplierInformationMakes.defaultProps = {};

AssessmentSupplierInformationMakes.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    supplierInformation: PropTypes.shape(),
  }).isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  supplierMakes: PropTypes.arrayOf(PropTypes.string).isRequired,
  modelYear: PropTypes.number.isRequired,
  handleChangeMake: PropTypes.func.isRequired,
  handleDeleteMake: PropTypes.func.isRequired,
  handleSubmitMake: PropTypes.func.isRequired,
  make: PropTypes.string.isRequired,
};
export default AssessmentSupplierInformationMakes;
