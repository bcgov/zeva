import axios from 'axios'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import Button from '../../app/components/Button'
import Modal from '../../app/components/Modal'
import Loading from '../../app/components/Loading'
import DetailField from '../../app/components/DetailField'
import history from '../../app/History'
import ROUTES_VEHICLES from '../../app/routes/Vehicles'
import getFileSize from '../../app/utilities/getFileSize'
import CustomPropTypes from '../../app/utilities/props'
import VehicleAlert from './VehicleAlert'
import Comment from '../../app/components/Comment'

const VehicleDetailsPage = (props) => {
  const {
    comments,
    details,
    loading,
    postComment,
    requestStateChange,
    setComments,
    title,
    user,
    locationState,
    isActiveChange
  } = props
  const [requestChangeCheck, setRequestChangeCheck] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const validWeight = details.weightKg <= 4536
  if (loading) {
    return <Loading />
  }
  const { id } = details
  const handleChange = (event) => {
    setComments({
      ...comments,
      vehicleComment: { comment: event.target.value }
    })
  }

  const handleCheckboxClick = (event) => {
    const { checked } = event.target
    if (checked) {
      setRequestChangeCheck(true)
      setComments({
        ...comments,
        vehicleComment: { comment: 'Please provide range test results.' }
      })
    } else {
      setRequestChangeCheck(false)
    }
  }
  let modalProps
  switch (modalType) {
    case 'makeInactive':
      modalProps = {
        confirmLabel: 'Make Inactive',
        modalText:
          'Making a ZEV model inactive will remove it from various areas of the system including the Credit Application Excel template and the compliance calculator. Inactive ZEV models can be re-activated if required.',
        title: 'Make ZEV Model Inactive?',
        handleSubmit: () => {
          setShowModal(false)
          isActiveChange(false)
        }
      }
      break
    case 'makeActive':
      modalProps = {
        confirmLabel: 'Make Active',
        modalText: 'Make ZEV model active for submitting consumer sales?',
        handleSubmit: () => {
          setShowModal(false)
          isActiveChange(true)
        }
      }
      break
    case 'submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => {
          requestStateChange('SUBMITTED')
        },
        buttonClass: 'button primary',
        modalText:
          details.attachments.length > 0
            ? 'Submit vehicle model and range test results to Government of B.C.?'
            : 'Submit ZEV model to Government of B.C.?'
      }
      break
    case 'accept':
      modalProps = {
        confirmLabel: 'Validate',
        handleSubmit: () => {
          requestStateChange('VALIDATED')
        },
        buttonClass: 'button primary',
        modalText: 'Validate ZEV model'
      }
      break
    case 'reject':
      modalProps = {
        handleSubmit: () => {
          postComment('REJECTED')
        },
        confirmLabel: 'Reject',
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject ZEV model'
      }
      break
    case 'request':
      modalProps = {
        confirmLabel: 'Request',
        buttonClass: 'button primary',
        modalText: 'Request range change/test results',
        handleSubmit: () => {
          postComment('CHANGES_REQUESTED')
        }
      }
      break
    case 'delete':
      modalProps = {
        confirmLabel: 'Delete',
        modalText: 'Delete the ZEV model?',
        handleSubmit: () => {
          requestStateChange('DELETED')
        },
        buttonClass: 'btn-outline-danger'
      }
      break
    default:
      modalProps = {
        confirmLabel: '',
        buttonClass: '',
        modalText: '',
        handleSubmit: () => {}
      }
      break
  }

  let alertUser

  if (details.validationStatus === 'SUBMITTED') {
    alertUser = details.createUser
  } else {
    alertUser = details.updateUser
  }
  return (
    <div id="vehicle-validation" className="page">
      <div className="row mb-2">
        <div className="col-sm-12">
          <h2>{title}</h2>
          <VehicleAlert
            isActive={details.isActive}
            status={details.validationStatus}
            user={
              alertUser && alertUser.displayName
                ? alertUser.displayName
                : alertUser
            }
            date={moment(details.updateTimestamp).format('MMM D, YYYY')}
          />
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col-md-12 col-lg-9 col-xl-7">
          {details.vehicleComment &&
            (details.validationStatus === 'CHANGES_REQUESTED' ||
              details.validationStatus === 'REJECTED') && (
              <Comment commentArray={[details.vehicleComment]} />
          )}
          <div className="form p-4">
            {user.isGovernment && (
              <DetailField
                label="Supplier"
                value={
                  details.organization.shortName || details.organization.name
                }
              />
            )}
            <DetailField label="Model Year" value={details.modelYear.name} />
            <DetailField label="Make" value={details.make} />
            <DetailField label="Model" value={details.modelName} />
            <DetailField
              label="ZEV Type"
              value={details.vehicleZevType.description}
            />
            {['EREV', 'PHEV'].indexOf(details.vehicleZevType.vehicleZevCode) >=
              0 && (
              <DetailField
                label="Passed US06 Test"
                value={details.hasPassedUs06Test ? 'Yes' : 'No'}
              />
            )}
            <DetailField
              label="Electric EPA Range (km)"
              value={details.range}
            />
            <DetailField
              label="Body Type"
              value={details.vehicleClassCode.description}
            />
            <DetailField label="Weight (kg)" value={details.weightKg} />
            {user.isGovernment && (
              <DetailField
              label="Vehicle Class"
              id={eligibleWeight ? '' : 'danger-text'}
              value={
                details.weightKg > 3856 && details.weightKg < 4537
                  ? '2b'
                  : 'LDV (Calculated)'
              }
            />
            )}
            {details.creditClass && (
              <DetailField
                label="ZEV Class"
                value={
                  validWeight ? ` ${details.creditClass} (calculated)` : ''
                }
              />
            )}
            {(details.creditValue > 0 || details.creditValue < 0) && (
              <DetailField
                label="Credit Entitlement"
                value={
                  validWeight ? ` ${details.creditValue} (calculated)` : ''
                }
              />
            )}

            {details.attachments.length > 0 && (
              <div className="attachments mt-4">
                <div className="font-weight-bold label">Range Test Results</div>
                <div className="row">
                  <div className="col-9 filename header pl-4">Filename</div>
                  <div className="col-3 size header">Size</div>
                </div>

                {details.attachments.map((attachment) => (
                  <div className="row" key={attachment.id}>
                    <div className="col-9 filename pl-4">
                      <button
                        className="link"
                        onClick={() => {
                          axios
                            .get(attachment.url, {
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
                              link.setAttribute(
                                'download',
                                attachment.filename
                              )
                              document.body.appendChild(link)
                              link.click()
                            })
                        }}
                        type="button"
                      >
                        {attachment.filename}
                      </button>
                    </div>
                    <div className="col-3 size">
                      {getFileSize(attachment.size)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {details.validationStatus === 'SUBMITTED' &&
        user.isGovernment &&
        typeof user.hasPermission === 'function' &&
        user.hasPermission('REQUEST_ZEV_CHANGES') && (
          <div className="row">
            <div className="col-md-12 col-lg-9 col-xl-7 pt-4 pb-2">
              <div className="form">
                <div className="request-changes-check">
                  <input type="checkbox" onChange={handleCheckboxClick} />
                  Request range results and/or a change to the range value from
                  the vehicle supplier, specify below.
                </div>
                <div>
                  Add a comment to the vehicle supplier for request or
                  rejection.
                </div>
                <textarea
                  className="form-control"
                  rows="3"
                  onChange={handleChange}
                  defaultValue={comments.vehicleComment.comment}
                />
                <div className="text-right">
                  <button
                    className="button primary"
                    disabled={!requestChangeCheck || !comments.vehicleComment}
                    type="button"
                    key="REQUEST"
                    onClick={() => {
                      setModalType('request')
                      setShowModal(true)
                    }}
                  >
                    Request Range Change/Test Results
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_VEHICLES.LIST}
                locationState={locationState}
              />
              {details.validationStatus &&
                (details.validationStatus === 'CHANGES_REQUESTED' ||
                  details.validationStatus === 'DRAFT' ||
                    details.validationStatus === 'REJECTED') && (
                  <Button
                    buttonType="delete"
                    action={() => {
                      setModalType('delete')
                      setShowModal(true)
                    }}
                  />
              )}
            </span>
            <span className="right-content">
              <Button
                buttonType="button"
                optionalClassname="ml-2 mr-2 button btn"
                optionalText="Print/Download Page"
                action={() => {
                  window.print()
                }}
              />
              {['DRAFT', 'CHANGES_REQUESTED'].indexOf(
                details.validationStatus
              ) >= 0 &&
                !user.isGovernment && (
                  <>
                    <button
                      className="button primary"
                      onClick={() => {
                        history.push(ROUTES_VEHICLES.EDIT.replace(/:id/gi, id))
                      }}
                      type="button"
                    >
                      <FontAwesomeIcon icon="edit" /> Edit
                    </button>
                    <Button
                      buttonType="submit"
                      disabled={!validWeight}
                      action={() => {
                        setModalType('submit')
                        setShowModal(true)
                      }}
                    />
                  </>
              )}
              {['VALIDATED'].indexOf(details.validationStatus) >= 0 &&
                !user.isGovernment &&
                details.isActive && (
                  <Button
                    buttonType="makeInactive"
                    optionalText="Make Inactive"
                    action={() => {
                      setModalType('makeInactive')
                      setShowModal(true)
                    }}
                  />
              )}
              {['VALIDATED'].indexOf(details.validationStatus) >= 0 &&
                !user.isGovernment &&
                !details.isActive && (
                  <Button
                    buttonType="makeActive"
                    optionalText="Make Active"
                    action={() => {
                      setModalType('makeActive')
                      setShowModal(true)
                    }}
                  />
              )}
              {details.validationStatus === 'SUBMITTED' &&
                user.isGovernment &&
                typeof user.hasPermission === 'function' &&
                user.hasPermission('VALIDATE_ZEV') && [
                  <button
                    className="btn btn-outline-danger"
                    disabled={
                      !comments.vehicleComment.comment || requestChangeCheck
                    }
                    type="button"
                    key="REJECTED"
                    onClick={() => {
                      setModalType('reject')
                      setShowModal(true)
                    }}
                  >
                    Reject
                  </button>,
                  <button
                    className="button primary"
                    disabled={
                      comments.vehicleComment.comment || requestChangeCheck
                    }
                    type="button"
                    key="VALIDATED"
                    onClick={() => {
                      setModalType('accept')
                      setShowModal(true)
                    }}
                  >
                    Validate
                  </button>
              ]}
            </span>
          </div>

          <Modal
            confirmLabel={modalProps.confirmLabel}
            handleCancel={() => {
              setShowModal(false)
            }}
            handleSubmit={modalProps.handleSubmit}
            modalClass="w-75"
            showModal={showModal}
            confirmClass={modalProps.buttonClass}
            title={modalProps.title ? modalProps.title : 'Confirm'}
          >
            <div>
              <div>
                <br />
                <br />
              </div>
              <h3 className="d-inline">{modalProps.modalText}</h3>
              <div>
                <br />
                <br />
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

VehicleDetailsPage.defaultProps = {
  comments: undefined,
  postComment: undefined,
  setComments: undefined,
  title: 'Vehicle Details',
  locationState: undefined
}

VehicleDetailsPage.propTypes = {
  comments: PropTypes.shape({
    vehicleComment: PropTypes.shape({
      comment: PropTypes.string.isRequired
    })
  }),
  details: PropTypes.shape({
    actions: PropTypes.arrayOf(PropTypes.string),
    attachments: PropTypes.arrayOf(PropTypes.shape()),
    createUser: PropTypes.oneOfType([
      PropTypes.shape({
        displayName: PropTypes.string
      }),
      PropTypes.string
    ]),
    creditClass: PropTypes.string,
    creditValue: PropTypes.number,
    hasPassedUs06Test: PropTypes.bool,
    history: PropTypes.arrayOf(PropTypes.object),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    make: PropTypes.string,
    modelName: PropTypes.string,
    modelYear: PropTypes.shape({
      name: PropTypes.string
    }),
    organization: PropTypes.shape(),
    range: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    validationStatus: PropTypes.string,
    vehicleClassCode: PropTypes.shape({
      description: PropTypes.string
    }),
    updateUser: PropTypes.oneOfType([
      PropTypes.shape({
        displayName: PropTypes.string
      }),
      PropTypes.string
    ]),
    vehicleComment: PropTypes.shape(),
    vehicleZevType: PropTypes.shape({
      description: PropTypes.string,
      vehicleZevCode: PropTypes.string
    }),
    weightKg: PropTypes.string
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  postComment: PropTypes.func,
  requestStateChange: PropTypes.func.isRequired,
  setComments: PropTypes.func,
  title: PropTypes.string,
  user: CustomPropTypes.user.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  isActiveChange: PropTypes.func.isRequired
}

export default VehicleDetailsPage
