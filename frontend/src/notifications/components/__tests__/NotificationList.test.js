import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import NotificationListPage from '../NotificationListPage';

const baseProps = {
  handleCheckboxClick: jest.fn(),
  notifications: [{'id':1,'name':'test this'},{'id':2,'name':'test that'}],
  checkboxes:[2]
}

it('renders without crashing', () => {
  render(
    <Router>
      <NotificationListPage
        handleCheckboxClick={baseProps.handleCheckboxClick}
        notifications={baseProps.notifications}
        checkboxes={baseProps.checkboxes}
        user={{ isGovernment: true }}
       
      />
    </Router>,
  );
});
