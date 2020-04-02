import React from 'react';
import { render } from '@testing-library/react';
import UploadVerificationData from '../UploadVerificationData';
import '@testing-library/jest-dom/extend-expect';

const doUpload = () => {
  console.log('test');
};

it('renders without crashing', () => {
  render(<UploadVerificationData
    title="test"
    title="Upload ICBC Registration Data"
    errorMessage={errorMessage}
    files={files}
    setUploadFiles={setFiles}
    upload={doUpload}
    dateCurrentTo="2020-04-02"
    setDateCurrentTo="test"
  />);
});
