import { React, useState } from 'react';
import { render } from '@testing-library/react';
import UploadVerificationData from '../UploadVerificationData';
import '@testing-library/jest-dom/extend-expect';

const doUpload = () => {
  console.log('test upload!');
};



it('renders without crashing', () => {
  render(<UploadVerificationData
    title="test"
    errorMessage="test erro"
    files="testfile.xls"
    setUploadFiles="test"
    upload={doUpload}
    dateCurrentTo="2020-04-06"
    setDateCurrentTo="test"
  />);
});
