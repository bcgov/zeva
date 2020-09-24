import PropTypes from 'prop-types';

// to avoid duplication below. not exported.
const yearArrayType = PropTypes.arrayOf(PropTypes.shape({
  name: PropTypes.string,
}));

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
    organizationAddress: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          addressLine1: PropTypes.string,
          city: PropTypes.string,
          country: PropTypes.string,
          postalCode: PropTypes.string,
          state: PropTypes.string,
        }),
      ),
      PropTypes.shape({
        addressLine1: PropTypes.string,
        city: PropTypes.string,
        country: PropTypes.string,
        postalCode: PropTypes.string,
        state: PropTypes.string,
      }),
    ]),
  }),
  roles: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
  })),
  years: yearArrayType,
  referenceData: PropTypes.shape({
    years: yearArrayType,
  }),
  routeMatch: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};

export default CustomPropTypes;
