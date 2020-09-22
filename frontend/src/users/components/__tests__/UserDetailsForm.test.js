import React from 'react';

import {
  render, cleanup,
} from '@testing-library/react';

import UserDetailsForm from '../UserDetailsForm';

afterEach(cleanup);

const handleInputChange = (event) => {
  const { name } = event.target;
  if (name === 'roles-manager') {
    if (!event.target.checked) {
      console.log('unchecked');
    }
    if (event.target.checked) {
      console.log('checked');
    }
  }
  console.log('!');
};

const handleSubmit = () => {
  console.log(userToView);
  console.log(roles);
};

const details = {
  id: 2,
  firstName: 'Test F Name',
  lastName: 'Test L Name',
  email: 'user@gmail.com',
  username: 'fs2',
  displayName: null,
  isActive: true,
  organization: {
    name: 'test organization',
  },
};
const user = {
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
};
describe('User Form', () => {
  it('renders without crashing', () => {
    render(<UserDetailsForm
      details={details}
      loading={false}
      user={user}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      rolesList={['test']}
      roles={[{ 1: 'test' }, { 2: 'test1' }]}
    />);
  });
});
