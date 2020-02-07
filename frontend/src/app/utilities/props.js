import PropTypes from 'prop-types';

const CustomPropTypes = {
  keycloak: PropTypes.shape({
    authenticated: PropTypes.bool,
    login: PropTypes.func,
    realmAccess: PropTypes.shape({
      roles: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  user: PropTypes.shape({
    organization: PropTypes.shape({}),
    displayName: PropTypes.string,
  }),
  organizationDetails: PropTypes.shape({
    name: PropTypes.string,
    organizationAddress: PropTypes.shape({
      addressLine1: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string,
      postalCode: PropTypes.string,
      state: PropTypes.string,
    }),
  }),
};

export default CustomPropTypes;
