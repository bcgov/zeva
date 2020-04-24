import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPropTypes from '../../app/utilities/props';
import UserDetailsTextInput from './UserDetailsTextInput';
import Loading from '../../app/components/Loading';
import History from '../../app/History';

const VehicleSupplierEditForm = (props) => {
  const {
    details,
    loading,
    user,
    handleInputChange,
    handleSubmit,
    setEditForm,

  } = props;

  if (loading) {
    return <Loading />;
  }
  return (
    <div id="user-form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h5>Edit Supplier</h5>
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <fieldset>
            <div className="form-layout row">
              <span className="col-xs-8">
                <UserDetailsTextInput
                  label="Legal Organization Name"
                  id="LegalOrganizationName"
                  name="Legal Organization Name"
                  defaultValue={details.name}
                  handleInputChange={handleInputChange}
                />
              </span>
            </div>
            <div className="action-bar form-group row">
              <span className="left-content">
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    setEditForm(false);
                    History.goBack();
                  }}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Back
                </button>
                <button type="button" className="delete-button"> Delete
                </button>
              </span>

              <span className="right-content">
                <button className="button primary" type="button" onClick={handleSubmit}>
                  <FontAwesomeIcon icon="save" /> Save
                </button>
              </span>
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
};
// VehicleSupplierEditForm.propTypes = {
//   user: CustomPropTypes.user.isRequired,
// };

export default VehicleSupplierEditForm;
