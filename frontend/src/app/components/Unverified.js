import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Unverified = (props) => (
  <div
    className='m-3'
    data-testid="unverified-user"
  >
    <div className='mb-3'>Your account is currently inactive. Please contact your administrator to re-activate your account.</div>
    <button
      className="button primary"
      onClick={() => {
        props.logout()
      }}
      type="button"
    >
      <FontAwesomeIcon icon="sign-out-alt" /> <span>Logout</span>
    </button>
  </div>
)

export default Unverified
