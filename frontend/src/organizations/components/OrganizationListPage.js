import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';
import Loading from '../../app/components/Loading';
import OrganizationsTable from './OrganizationsTable';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';

const OrganizationListPage = (props) => {
  const { loading, organizations } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="organization-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Vehicle Suppliers</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content" />

            <span className="right-content">
              <button
                className="button primary"
                type="button"
                onClick={() => {
                  history.push(ROUTES_ORGANIZATIONS.NEW);
                }}
              >
                <FontAwesomeIcon icon="plus" /> New Supplier
              </button>
            </span>
          </div>

          <OrganizationsTable
            items={organizations}
          />

          <div className="action-bar">
            <span className="left-content" />

            <span className="right-content">
              <button
                className="button primary"
                type="button"
                onClick={() => {
                  history.push(ROUTES_ORGANIZATIONS.NEW);
                }}
              >
                <FontAwesomeIcon icon="plus" /> New Supplier
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

OrganizationListPage.defaultProps = {
  organizations: [],
};

OrganizationListPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.shape()),
};

export default OrganizationListPage;
