/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import axios from 'axios'
import moment from 'moment-timezone'
import { useParams } from 'react-router-dom'
import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import history from '../app/History'
import Loading from '../app/components/Loading'
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests'
import CustomPropTypes from '../app/utilities/props'
import { upload, getFileUploadPromises } from '../app/utilities/upload'
import CreditRequestsUploadPage from './components/CreditRequestsUploadPage'
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification'

const UploadCreditRequestsContainer = (props) => {
  const { user } = props
  const [errorMessage, setErrorMessage] = useState(null)
  const [evidenceCheckbox, setEvidenceCheckbox] = useState(false)
  const [evidenceDeleteList, setEvidenceDeleteList] = useState([])
  const [evidenceErrorMessage, setEvidenceErrorMessage] = useState(null)
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [files, setFiles] = useState([])
  const [icbcDate, setIcbcDate] = useState('- no icbc data yet -')
  const [loading, setLoading] = useState()
  const [progressBars, setProgressBars] = useState({})
  const [showProgressBars, setShowProgressBars] = useState(false)
  const [submission, setSubmission] = useState({})
  const [uploadNewExcel, setUploadNewExcel] = useState(false)
  const { id } = useParams()
  const refreshDetails = () => {
    if (id) {
      setLoading(true)
      axios
        .get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id))
        .then((response) => {
          setSubmission(response.data)
          setUploadNewExcel(false)
          if (response.data.evidence.length > 0) {
            setEvidenceCheckbox(true)
          }
          setLoading(false)
        })
    } else {
      setUploadNewExcel(true)
    }
    axios.get(ROUTES_ICBCVERIFICATION.DATE).then((response) => {
      if (response.data.uploadDate) {
        setIcbcDate(moment(response.data.uploadDate).format('MMM D, YYYY'))
      }
    })
  }

  const updateProgressBars = (progressEvent, index) => {
    const percentage = Math.round(
      (100 * progressEvent.loaded) / progressEvent.total
    )
    setProgressBars({
      ...progressBars,
      [index]: percentage
    })

    progressBars[index] = percentage
  }

  const handleEvidenceUpload = (paramId) => {
    setShowProgressBars(true)
    const promises = getFileUploadPromises(ROUTES_CREDIT_REQUESTS.MINIO_URL.replace(/:id/gi, paramId), evidenceFiles, updateProgressBars)
    return promises
  }

  const doUpload = () => {
    setLoading(true)
    let data = {}

    if (id) {
      data = {
        id
      }
    }
    if (uploadNewExcel && files.length > 0) {
      data.upload_new = true
    }
    upload(ROUTES_CREDIT_REQUESTS.UPLOAD, files, data)
      .then((response) => {
        const { id: creditRequestId } = response.data
        if (evidenceCheckbox === true) {
          const uploadPromises = handleEvidenceUpload(creditRequestId)
          Promise.all(uploadPromises).then((attachments) => {
            const patchData = {}

            if (attachments.length > 0) {
              patchData.salesEvidences = attachments
            }

            axios
              .patch(
                ROUTES_CREDIT_REQUESTS.DETAILS.replace(
                  /:id/gi,
                  creditRequestId
                ),
                {
                  ...patchData,
                  evidenceDeleteList
                }
              )
              .then(() => {
                history.push(
                  ROUTES_CREDIT_REQUESTS.DETAILS.replace(
                    /:id/gi,
                    creditRequestId
                  )
                )
              })
          })
        } else {
          history.push(
            ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/gi, creditRequestId)
          )
        }
      })
      .catch((error) => {
        const { response } = error

        if (response.status === 400) {
          setErrorMessage(error.response.data)
        } else {
          setErrorMessage(
            'An error has occurred while uploading. Please try again later.'
          )
        }

        setLoading(false)
      })
  }

  useEffect(() => {
    refreshDetails()
  }, [])
  if (loading) {
    return <Loading />
  }
  return [
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <CreditRequestsUploadPage
      errorMessage={errorMessage}
      evidenceCheckbox={evidenceCheckbox}
      evidenceDeleteList={evidenceDeleteList}
      evidenceErrorMessage={evidenceErrorMessage}
      files={files}
      icbcDate={icbcDate}
      key="page"
      progressBars={progressBars}
      setErrorMessage={setErrorMessage}
      setEvidenceCheckbox={setEvidenceCheckbox}
      setEvidenceDeleteList={setEvidenceDeleteList}
      setEvidenceErrorMessage={setEvidenceErrorMessage}
      setEvidenceUploadFiles={setEvidenceFiles}
      setUploadFiles={setFiles}
      setUploadNewExcel={setUploadNewExcel}
      showProgressBars={showProgressBars}
      submission={submission}
      uploadEvidenceFiles={evidenceFiles}
      uploadNewExcel={uploadNewExcel}
      upload={doUpload}
      user={user}
    />
  ]
}

UploadCreditRequestsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired
}

export default withRouter(UploadCreditRequestsContainer)
