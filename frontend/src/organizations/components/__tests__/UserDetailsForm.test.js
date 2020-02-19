import React from 'react';

import { render, cleanup } from '@testing-library/react';

import UserDetailsForm from '../UserDetailsForm';


afterEach(cleanup);

const handleInputChange = (event) => {
  const { value, name } = event.target;
  if (name === 'roles-manager') {
    if (!event.target.checked) {
      const newRoles = roles.filter((each) => each !== event.target.id);
      setRoles([newRoles]);
    }
    if (event.target.checked) {
      const newRoles = roles.concat(event.target.id);
      setRoles(newRoles);
    }
  }
  setUserView({
    ...userToView,
    [name]: value,
  });
};

const handleSubmit = () => {
  console.log(userToView);
  console.log(roles);
};


describe('User Form', () => {
  it('renders without crashing', () => {
    render(<UserDetailsForm
      details={{
        id: 2,
        firstName: 'Test F Name',
        lastName: 'Test L Name',
        email: 'user@gmail.com',
        username: 'fs2',
        displayName: null,
        isActive: true,
      }}
      loading="false"
      user={{
        id: 2,
        firstName: 'Test F Name',
        lastName: 'Test L Name',
        email: 'user@gmail.com',
        username: 'fs2',
        displayName: null,
        isActive: true,
        organization: {
          id: 3, name: 'BMW Canada Inc.', organizationAddress: null, createTimestamp: '2020-02-12T10:08:09.566993-08:00',
        },
        phone: '(604) 111-1111',
        isGovernment: false,
      }}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      rolesList={['test']}
      roles={['test', 'test1']}
    />);
  });
});
