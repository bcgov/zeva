import React from 'react'
import Modal from '../../app/components/Modal'

const ComplianceReportDeleteModal = ({ show, setShow, handleDelete }) => {
  return (
    <Modal
      cancelLabel="Cancel"
      confirmLabel="Delete"
      handleCancel={() => {
        setShow(false)
      }}
      handleSubmit={() => {
        setShow(false)
        handleDelete()
      }}
      modalClass="w-75"
      showModal={show}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>
          Do you want to delete this report?
        </h3>
      </div>
    </Modal>
  )
}

export default ComplianceReportDeleteModal
