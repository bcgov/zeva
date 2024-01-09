import React from 'react'
import PropTypes from 'prop-types'
import Loading from '../../app/components/Loading'
import axios from 'axios'
import ROUTES_USERS from '../../app/routes/Users'
import Button from '../../app/components/Button'

const ActiveUsersListPage = (props) => {
  const { activeIdirUsers, activeBceidUsers, loading } = props

  const handleDownload = async () => {
    try {
      const response = await axios.get(ROUTES_USERS.DOWNLOAD_ACTIVE, {responseType: 'blob'})

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Active_BCEID_Users.xls'); // File name for download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file: ', error)
    }
    
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div id="organization-list" className="page">
      <div className="col-md-8">
        <h2>Active Users</h2>
      </div>
      <div className="mt-3 mb-3 pt-3">
        <h4>BCEID Users</h4>
        <textarea
          rows="11"
          className="form-control d-inline-block align-top mt-2 col-sm-9"
          value={activeBceidUsers}
          readOnly
        />
      </div>
      <Button
        buttonType="download"
        optionalText="Download List"
        optionalClassname="button primary"
        action={() => {
          handleDownload()
        }}
      />
      <div className="mt-3 pt-4">
        <h4>IDIR Users</h4>
        <textarea
          rows="11"
          className="form-control d-inline-block align-top mt-2 col-sm-9"
          value={activeIdirUsers}
          readOnly
        />
      </div>
    </div>
  )
}

ActiveUsersListPage.propTypes = {
  activeIdirUsers: PropTypes.string.isRequired,
  activeBceidUsers: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired
}

export default ActiveUsersListPage
