import React from 'react'

const NoticeOfAssessmentSection = ({
  name,
  addresses,
  addressesAreStrings,
  makes,
  supplierClass,
  disabledInputs
}) => {
  const getClassDescriptions = (_supplierClass) => {
    switch (_supplierClass) {
      case 'L':
        return 'Large'
      case 'M':
        return 'Medium'
      default:
        return 'Small'
    }
  }
  return (
    <>
      <h3>Notice of Assessment</h3>
      <div className="mt-3">
        <h3> {name} </h3>
      </div>
      {addressesAreStrings && addresses && addresses.length > 0 && (
        <div>
          <div className="d-inline-block mr-5 mt-3 col-5 text-blue">
            <h4>Service Address</h4>
            <div>{addresses[0]}</div>
          </div>
          <div className="d-inline-block mr-5 mt-3 col-5 text-blue">
            <h4>Records Address</h4>
            <div>{addresses[1]}</div>
          </div>
        </div>
      )}
      {!addressesAreStrings && addresses && addresses.length > 0 && (
        <div>
          <div className="d-inline-block mr-5 mt-3 col-5 text-blue">
            <h4>Service Address</h4>
            {addresses.map(
              (address) =>
                address.addressType.addressType === 'Service' && (
                  <div key={address.id}>
                    {address.representativeName && (
                      <div> {address.representativeName} </div>
                    )}
                    <div> {address.addressLine1} </div>
                    <div> {address.addressLine2} </div>
                    <div>
                      {' '}
                      {address.city} {address.state} {address.country}{' '}
                    </div>
                    <div> {address.postalCode} </div>
                  </div>
                )
            )}
          </div>
          <div className="d-inline-block mt-3 col-xs-12 col-sm-5 text-blue">
            <h4>Records Address</h4>
            {addresses.map(
              (address) =>
                address.addressType.addressType === 'Records' && (
                  <div key={address.id}>
                    {address.representativeName && (
                      <div> {address.representativeName} </div>
                    )}
                    <div> {address.addressLine1} </div>
                    <div> {address.addressLine2} </div>
                    <div>
                      {' '}
                      {address.city} {address.state} {address.country}{' '}
                    </div>
                    <div> {address.postalCode} </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}
      <div className="mt-4">
        <h4>Light Duty Vehicle Makes:</h4>
        {makes.length > 0 && (
          <div className={`mt-0 list ${disabledInputs ? 'disabled' : ''}`}>
            <ul>
              {makes.map((item, index) => (
                <li key={index}>
                  <div className="col-11">{item}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h4 className="d-inline">Vehicle Supplier Class:</h4>
        <p className="d-inline ml-2">
          {getClassDescriptions(supplierClass)} Volume Supplier
        </p>
      </div>
    </>
  )
}

export default NoticeOfAssessmentSection
