import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import UploadVerificationData from '../UploadVerificationData'

// import '@testing-library/jest-dom/extend-expect';

it('renders without crashing', () => {
  render(
    <Router>
      <UploadVerificationData
        title="test"
        errorMessage="test erro"
        files={[]}
        setUploadFiles={() => {}}
        upload={() => {}}
        dateCurrentTo="2020-04-06"
        setDateCurrentTo={() => {}}
        user={{ isGovernment: true }}
        showProcessing={true}
        showProgressBar={true}
        uploadProgress={1}
      />
    </Router>
  )
})
