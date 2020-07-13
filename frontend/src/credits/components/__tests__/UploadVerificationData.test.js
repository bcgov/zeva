import { React } from 'react';
import { render } from '@testing-library/react';
import UploadVerificationData from '../UploadVerificationData';
// import '@testing-library/jest-dom/extend-expect';


it('renders without crashing', () => {
  render(<UploadVerificationData
    title="test"
    errorMessage="test erro"
    files={[]}
    setUploadFiles={() => { console.log('hi'); }}
    upload={() => { console.log('hi'); }}
    dateCurrentTo="2020-04-06"
    setDateCurrentTo={() => { console.log('hi'); }}
  />);
});
