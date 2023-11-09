import axios from 'axios'
import React from 'react'
import getFileSize from '../../app/utilities/getFileSize'

const creditApplicationHeader = (props) => {
  const { submission, user, setDisplayUploadPage } = props

  const serviceAddress = submission.organization.organizationAddress.find(
    (address) => address.addressType.addressType === 'Service'
  )
  const recordsAddress = submission.organization.organizationAddress.find(
    (address) => address.addressType.addressType === 'Records'
  )

  return (
    <div className="p-2">
      <h4>
        Credit Application as Submitted{' '}
        {submission.organization && `${submission.organization.name} `}
      </h4>
      <div>
        <h4 className="mt-2">{submission.organization.name}</h4>
        <h5 className="d-inline-block sales-upload-grey my-2">
          Service address:{' '}
        </h5>
        {serviceAddress && (
          <h5 className="d-inline-block sales-upload-blue">
            {serviceAddress.addressLine1} {serviceAddress.addressLine2}{' '}
            {serviceAddress.city} {serviceAddress.state}{' '}
            {serviceAddress.postalCode}
          </h5>
        )}
        <br />
        <h5 className="d-inline-block sales-upload-grey">Records address: </h5>
        {recordsAddress && (
          <h5 className="d-inline-block sales-upload-blue">
            {recordsAddress.addressLine1} {recordsAddress.addressLine2}{' '}
            {recordsAddress.city} {recordsAddress.state}{' '}
            {recordsAddress.postalCode}
          </h5>
        )}
        {submission.evidence.length > 0 && (
          <>
            <h3 className="mt-3">Sales Evidence</h3>
            <div id="sales-edit" className="mt-2 col-8 pl-0">
              <div className="files px-3">
                {submission.evidence.map((file) => (
                  <div className="row py-1" key={file.id}>
                    <div className="col-9 filename pl-1">
                      <button
                        className="link"
                        onClick={() => {
                          axios
                            .get(file.url, {
                              responseType: 'blob',
                              headers: {
                                Authorization: null
                              }
                            })
                            .then((response) => {
                              const objectURL = window.URL.createObjectURL(
                                new Blob([response.data])
                              )
                              const link = document.createElement('a')
                              link.href = objectURL
                              link.setAttribute('download', file.filename)
                              document.body.appendChild(link)
                              link.click()
                            })
                        }}
                        type="button"
                      >
                        {file.filename}
                      </button>
                    </div>
                    <div className="col-3 size">{getFileSize(file.size)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {user.isGovernment &&
          <div className='py-2'>
            <button
              className="link"
              onClick={() => {
                setDisplayUploadPage(true)
              }}
            >
              Attach Additional Documents
            </button>
          </div>
        }
      </div>
    </div>
  )
}

export default creditApplicationHeader
