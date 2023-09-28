import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useParams, useLocation } from 'react-router-dom'

import ROUTES_SUPPLEMENTARY from '../app/routes/SupplementaryReport'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import history from '../app/History'
import CustomPropTypes from '../app/utilities/props'
import reconcileSupplementaries from '../app/utilities/reconcileSupplementaries'
import SupplementarySupplierDetails from './components/SupplementarySupplierDetails'
import SupplementaryDirectorDetails from './components/SupplementaryDirectorDetails'
import SupplementaryAnalystDetails from './components/SupplementaryAnalystDetails'
import SupplementaryCreate from './components/SupplementaryCreate'

const qs = require('qs')

const SupplementaryContainer = (props) => {
  const { id, supplementaryId } = useParams()
  const [checkboxConfirmed, setCheckboxConfirmed] = useState(false)
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [salesRows, setSalesRows] = useState([])
  const { keycloak, user } = props
  const [files, setFiles] = useState([])
  const [deleteFiles, setDeleteFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [newData, setNewData] = useState({ zevSales: [], creditActivity: [] })
  const [obligationDetails, setObligationDetails] = useState([])
  const [ldvSales, setLdvSales] = useState()
  const [ratios, setRatios] = useState()
  const [newBalances, setNewBalances] = useState({})
  const [commentArray, setCommentArray] = useState({})
  const [idirComment, setIdirComment] = useState([])
  const [bceidComment, setBceidComment] = useState([])
  const [supplementaryAssessmentData, setSupplementaryAssessmentData] =
    useState({})
  const [radioDescriptions, setRadioDescriptions] = useState([
    { id: 0, description: '' }
  ])
  const location = useLocation()
  const [reassessmentReductions, setReassessmentReductions] = useState({})

  const query = qs.parse(location.search, { ignoreQueryPrefix: true })

  const getNumeric = (parmValue) => {
    let value = parmValue

    if (value) {
      value += ''
      return value.replace(',', '')
    }

    return value
  }

  const isSupplier = !user.isGovernment
  const isAnalyst = user.isGovernment && !user.roles.some((r) => r.roleCode === 'Director')
  const isDirector = user.isGovernment && user.roles.some((r) => r.roleCode === 'Director')

  const analystAction =
    user.isGovernment && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT')

  const directorAction =
    user.isGovernment && user.hasPermission('SIGN_COMPLIANCE_REPORT')

  const calculateBalance = () => {
    const balances = {}

    const newDataCreditActivity = []
    if (newData && newData.creditActivity) {
      for (let i = 0; i < newData.creditActivity.length; i++) {
        const creditAtom = { ...newData.creditActivity[i] }
        const creditAValue = creditAtom.creditAValue
        const creditBValue = creditAtom.creditBValue
        const originalAValue = creditAtom.originalAValue
        const originalBValue = creditAtom.originalBValue
        if ((creditAValue === '' || isNaN(Number(creditAValue)))) {
          if (!originalAValue && originalAValue !== 0) {
            creditAtom.creditAValue = 0
          } else {
            creditAtom.creditAValue = originalAValue
          }
        }
        if ((creditBValue === '' || isNaN(Number(creditBValue)))) {
          if (!originalBValue && originalBValue !== 0) {
            creditAtom.creditBValue = 0
          } else {
            creditAtom.creditBValue = originalBValue
          }
        }
        newDataCreditActivity.push(creditAtom)
      }
    }

    obligationDetails.forEach((each) => {
      if (!(each.modelYear.name in balances)) {
        balances[each.modelYear.name] = {
          A: 0,
          B: 0
        }
      }

      if (
        [
          'administrativeAllocation',
          'automaticAdministrativePenalty',
          'creditBalanceStart',
          'creditsIssuedSales',
          'initiativeAgreement',
          'purchaseAgreement',
          'pendingBalance',
          'transfersIn'
        ].indexOf(each.category) >= 0
      ) {
        const found = newDataCreditActivity.findIndex(
          (activity) =>
            activity.category === each.category &&
            Number(activity.modelYear) === Number(each.modelYear.name)
        )

        if (found >= 0) {
          balances[each.modelYear.name].A += newDataCreditActivity[found].creditAValue
            ? Number(getNumeric(newDataCreditActivity[found].creditAValue))
            : Number(getNumeric(each.creditAValue))
          balances[each.modelYear.name].B += newDataCreditActivity[found].creditBValue
            ? Number(getNumeric(newDataCreditActivity[found].creditBValue))
            : Number(getNumeric(each.creditBValue))
        } else {
          balances[each.modelYear.name].A += Number(
            getNumeric(each.creditAValue)
          )
          balances[each.modelYear.name].B += Number(
            getNumeric(each.creditBValue)
          )
        }
      }

      if (
        ['administrativeReduction', 'deficit', 'transfersOut'].indexOf(
          each.category
        ) >= 0
      ) {
        const found = newDataCreditActivity.findIndex(
          (activity) =>
            activity.category === each.category &&
            Number(activity.modelYear) === Number(each.modelYear.name)
        )

        if (found >= 0) {
          balances[each.modelYear.name].A -= newDataCreditActivity[found].creditAValue
            ? Number(getNumeric(newDataCreditActivity[found].creditAValue))
            : Number(getNumeric(each.creditAValue))
          balances[each.modelYear.name].B -= newDataCreditActivity[found].creditBValue
            ? Number(getNumeric(newDataCreditActivity[found].creditBValue))
            : Number(getNumeric(each.creditBValue))
        } else {
          balances[each.modelYear.name].A -= Number(
            getNumeric(each.creditAValue)
          )
          balances[each.modelYear.name].B -= Number(
            getNumeric(each.creditBValue)
          )
        }
      }
    })

    setNewBalances(balances)
  }

  const handleAddIdirComment = () => {
    const commentData = { fromGovtComment: idirComment, director: true }
    if (query.reassessment === 'Y') {
      const zevSales =
        newData &&
        newData.zevSales &&
        newData.zevSales.filter((each) => Number(each.sales) > 0)

      const data = {
        ...newData,
        zevSales,
        status: 'DRAFT'
      }

      if (analystAction) {
        data.analystAction = true
        data.penalty =
          supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty
        data.description =
          supplementaryAssessmentData.supplementaryAssessment.decision.id
      }

      axios
        .patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data)
        .then((response) => {
          const { id: supplementalId } = response.data
          commentData.supplementalId = supplementalId

          axios
            .post(
              ROUTES_SUPPLEMENTARY.COMMENT_SAVE.replace(':id', id),
              commentData
            )
            .then(() => {
              history.push(ROUTES_COMPLIANCE.REPORTS)
              history.replace(
                ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(
                  ':id',
                  id
                ).replace(':supplementaryId', supplementalId)
              )
            })
        })
    } else {
      axios
        .post(ROUTES_SUPPLEMENTARY.COMMENT_SAVE.replace(':id', id), commentData)
        .then(() => {
          history.push(ROUTES_COMPLIANCE.REPORTS)
          if (supplementaryId) {
            history.replace(
              ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(
                ':id',
                id
              ).replace(':supplementaryId', supplementaryId)
            )
          } else {
            history.replace(
              ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(
                ':id',
                id
              ).replace(':supplementaryId', '')
            )
          }
        })
    }
  }

  const handleCommentChangeIdir = (text) => {
    setIdirComment(text)
  }

  const handleEditIdirComment = (commentId, commentText) => {
    axios
      .patch(ROUTES_SUPPLEMENTARY.COMMENT_EDIT.replace(':id', id), {
        commentId,
        comment: commentText
      })
      .then((response) => {
        const updatedComment = response.data
        setCommentArray((prev) => {
          const commentIndex = prev.idirComment.findIndex(
            (comment) => {
              return comment.id === updatedComment.id
            }
          )
          const comment = prev.idirComment[commentIndex]
          const commentCopy = { ...comment }
          commentCopy.comment = updatedComment.comment
          commentCopy.updateTimestamp = updatedComment.updateTimestamp

          const comments = prev.idirComment
          const commentsCopy = [...comments]
          commentsCopy[commentIndex] = commentCopy

          const commentArrayCopy = { ...prev }
          commentArrayCopy.idirComment = commentsCopy
          return commentArrayCopy
        })
      })
  }

  const handleDeleteIdirComment = (commentId) => {
    axios
      .patch(ROUTES_SUPPLEMENTARY.COMMENT_DELETE.replace(':id', id), {
        commentId
      })
      .then(() => {
        setCommentArray((prev) => {
          const commentIndex = prev.idirComment.findIndex(
            (comment) => {
              return comment.id === commentId
            }
          )
          const comments = prev.idirComment
          const commentsCopy = [...comments]
          commentsCopy.splice(commentIndex, 1)

          const commentArrayCopy = { ...prev }
          commentArrayCopy.idirComment = commentsCopy
          return commentArrayCopy
        })
      })
  }

  const handleCommentChangeBceid = (text) => {
    setBceidComment(text)
  }

  const handleCommentChange = (content) => {
    setComment(content)
  }

  const handleCheckboxClick = (event) => {
    setCheckboxConfirmed(event.target.checked)
  }

  const addSalesRow = () => {
    salesRows.push({
      oldData: {},
      newData: {
        modelYearReportVehicle: ''
      }
    })
    setSalesRows([...salesRows])
  }
  const handleUpload = (paramId) => {
    const promises = []
    files.forEach((file, index) => {
      promises.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const blob = reader.result

            axios
              .get(ROUTES_SUPPLEMENTARY.MINIO_URL.replace(/:id/gi, paramId))
              .then((response) => {
                const { url: uploadUrl, minioObjectName } = response.data
                axios
                  .put(uploadUrl, blob, {
                    headers: {
                      Authorization: null
                    },
                    onUploadProgress: (progressEvent) => {
                      if (progressEvent.loaded >= progressEvent.total) {
                        resolve({
                          filename: file.name,
                          mimeType: file.type,
                          minioObjectName,
                          size: file.size
                        })
                      }
                    }
                  })
                  .catch((error) => {
                    reject(error)
                  })
              })
          }

          reader.readAsArrayBuffer(file)
        })
      )
    })

    return promises
  }

  const handleSupplementalChange = (obj) => {
    let creditActivity = []

    if (newData && newData.creditActivity) {
      creditActivity = [...newData.creditActivity]
    }

    obj.forEach((balance) => {
      if (balance.modelYear && balance.title) {
        const index = creditActivity.findIndex((each) => {
          return (
            Number(each.modelYear) === Number(balance.modelYear) &&
            each.category === balance.title
          )
        })
        if (index >= 0) {
          if (
            ((balance.creditA || balance.creditA === '' || balance.creditA === 0) &&
              (balance.creditB || balance.creditB === '' || balance.creditB === 0))
          ) {
            // contains both credit type changes
            creditActivity[index] = {
              ...newData.creditActivity[index],
              creditAValue: balance.creditA,
              creditBValue: balance.creditB,
              originalAValue: balance.originalAValue,
              originalBValue: balance.originalBValue
            }
          } else if (balance.creditA || balance.creditA === '' || balance.creditA === 0) {
            // contains A credit changes
            creditActivity[index] = {
              ...newData.creditActivity[index],
              creditAValue: balance.creditA,
              originalAValue: balance.originalAValue,
              originalBValue: balance.originalBValue
            }
          } else if (balance.creditB || balance.creditB === '' || balance.creditB === 0) {
            // contains B credit changes
            creditActivity[index] = {
              ...newData.creditActivity[index],
              creditBValue: balance.creditB,
              originalAValue: balance.originalAValue,
              originalBValue: balance.originalBValue
            }
          }
        } else {
          creditActivity.push({
            originalAValue: balance.originalAValue,
            originalBValue: balance.originalBValue,
            category: balance.title,
            modelYear: balance.modelYear,
            creditAValue: balance.creditA,
            creditBValue: balance.creditB
          })
        }
      }
    })
    setNewData({
      ...newData,
      creditActivity
    })
  }

  const handleSubmit = (status, paramNewReport, returnToSupplier) => {
    if (
      (status === 'ASSESSED' && paramNewReport) ||
      (status === 'SUBMITTED' && analystAction)
    ) {
      status = 'DRAFT'
    }

    const uploadPromises = handleUpload(id)
    Promise.all(uploadPromises)
      .then((attachments) => {
        const evidenceAttachments = {}
        if (attachments.length > 0) {
          evidenceAttachments.attachments = attachments
        }
        const zevSales = JSON.parse(JSON.stringify(newData.zevSales))
        for (const each of zevSales) {
          if (each.sales === '') {
            // if sales are null then use the number from the original
            each.sales = each.oldData.sales
          }
          if (each.range === '') {
            each.range = each.oldData.range
          }
        }
        // create a new array, if any rows from newData.creditActivity are null, pass the original value to new array otherwise pass new value
        const creditActivity = []
        for (const each of newData.creditActivity) {
          let creditActivityAddition = { category: each.category, modelYear: each.modelYear }
          if (each.creditAValue === '' && each.creditBValue === '') {
            creditActivityAddition = { ...creditActivityAddition, creditAValue: each.originalAValue, creditBValue: each.originalBValue }
          } else if (each.creditAValue === '') {
            creditActivityAddition = { ...creditActivityAddition, creditAValue: each.originalAValue, creditBValue: each.creditBValue }
          } else if (each.creditBValue === '') {
            creditActivityAddition = { ...creditActivityAddition, creditAValue: each.creditAValue, creditBValue: each.originalBValue }
          } else if (each.creditAValue !== '' && each.creditBValue !== '') {
            creditActivityAddition = { ...creditActivityAddition, creditAValue: each.creditAValue, creditBValue: each.creditBValue }
          }
          creditActivity.push(creditActivityAddition)
        }

        setNewData({ ...newData, creditActivity })
        if (status) {
          const data = {
            ...newData,
            creditActivity,
            zevSales,
            status,
            evidenceAttachments,
            deleteFiles,
            fromSupplierComment: comment
          }
          if (
            (status === 'RECOMMENDED' || status === 'DRAFT') &&
            paramNewReport
          ) {
            data.newReport = paramNewReport
          }
          if (analystAction) {
            data.analystAction = true
            data.penalty =
              supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty
            data.description =
              supplementaryAssessmentData.supplementaryAssessment.decision.id
          }
          if (data.supplierInfo.ldvSales === '') {
            data.supplierInfo.ldvSales = ldvSales
          }
          if (status === 'ASSESSED') {
            data.reassessmentReductions = reassessmentReductions
          }
          if (returnToSupplier) {
            data.returnToSupplier = true
          }
          axios
            .patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data)
            .then((response) => {
              const { id: supplementalId } = response.data
              if (status === 'DELETED' || (status === 'RETURNED' && isDirector) || (status === 'DRAFT' && returnToSupplier)) {
                history.push(ROUTES_COMPLIANCE.REPORTS)
              } else {
                const commentData = {
                  fromGovtComment: bceidComment,
                  director: false
                }
                axios
                  .post(
                    ROUTES_SUPPLEMENTARY.COMMENT_SAVE.replace(':id', id),
                    commentData
                  )
                  .then(() => {
                    history.push(ROUTES_COMPLIANCE.REPORTS)
                    history.replace(
                      ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(
                        ':id',
                        id
                      ).replace(':supplementaryId', supplementalId)
                    )
                  })
              }
            })
        }
      })
      .catch((e) => {
        setErrorMessage(e)
      })
  }

  const handleInputChange = (event, forceSetNewData = false) => {
    const { id, name, value } = event.target
    if (name === 'zevSales') {
      const rowId = id.split('-')[1]
      const type = id.split('-')[0]
      const index = salesRows.findIndex(
        (each, index) => Number(index) === Number(rowId)
      )
      if (index >= 0) {
        const newSalesData = {
          ...salesRows[index].newData,
          [type]: value
        }
        if (salesRows[index].oldData.modelYearReportVehicle) {
          newSalesData.modelYearReportVehicle =
            salesRows[index].oldData.modelYearReportVehicle
        } else if (salesRows[index].oldData.supplementalOriginZevSaleId) {
          newSalesData.supplementalOriginZevSaleId =
            salesRows[index].oldData.supplementalOriginZevSaleId
        }
        salesRows[index].newData = newSalesData
      }
      const zevSales = []
      salesRows.forEach((each) => {
        if (each.newData && Object.keys(each.newData).length > 0) {
          const dataToAdd = each.newData
          if (each.oldData) {
            dataToAdd.oldData = each.oldData
          }
          zevSales.push(dataToAdd)
        }
      })
      newData.zevSales = zevSales
      // if (forceSetNewData) {
      //   setNewData({ ...newData });
      // }
    } else {
      const dataToUpdate = {
        ...newData[name],
        [id]: value
      }
      setNewData({ ...newData, [name]: dataToUpdate })
    }
  }

  const refreshDetails = () => {
    setLoading(true)

    axios
      .all([
        axios.get(
          `${ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)}?supplemental_id=${
            supplementaryId || ''
          }`
        ),
        axios.get(
          `${ROUTES_SUPPLEMENTARY.ASSESSED_SUPPLEMENTALS.replace(':id', id)}`
        ),
        axios.get(
          `${ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)}?most_recent_ldv_sales=true`
        ),
        axios.get(ROUTES_COMPLIANCE.RATIOS),
        axios.get(
          `${ROUTES_SUPPLEMENTARY.ASSESSMENT.replace(
            ':id',
            id
          )}?supplemental_id=${supplementaryId || ''}`
        )
      ])
      .then(
        axios.spread(
          (
            response,
            assessedSupplementals,
            complianceResponse,
            ratioResponse,
            assessmentResponse
          ) => {
            if (response.data) {
              let assessedSupplementalsData = assessedSupplementals.data
              if (!props.newReport) {
                if (
                  assessedSupplementalsData &&
                  assessedSupplementalsData.length > 0
                ) {
                  const suppId = response.data.id
                  const suppIndex = assessedSupplementalsData.findIndex(
                    (element) => {
                      const reassessmentReportId =
                        response.data.reassessment &&
                        response.data.reassessment.reassessmentReportId
                          ? response.data.reassessment.reassessmentReportId
                          : undefined
                      return (
                        element.id === suppId ||
                        element.id === reassessmentReportId
                      )
                    }
                  )
                  if (suppIndex > -1) {
                    assessedSupplementalsData = assessedSupplementalsData.slice(
                      0,
                      suppIndex
                    )
                  }
                }
              }
              const {
                reconciledAssessmentData,
                reconciledLdvSales,
                reconciledComplianceObligation
              } = reconcileSupplementaries(
                response.data.assessmentData,
                assessedSupplementalsData,
                complianceResponse.data
              )
              if (reconciledAssessmentData) {
                response.data.assessmentData = reconciledAssessmentData
              }
              setDetails(response.data)
              const newSupplier = response.data.supplierInformation
              const newLegalName =
                newSupplier.find((each) => each.category === 'LEGAL_NAME') ||
                ''
              const newServiceAddress =
                newSupplier.find(
                  (each) => each.category === 'SERVICE_ADDRESS'
                ) || ''
              const newRecordsAddress =
                newSupplier.find(
                  (each) => each.category === 'RECORDS_ADDRESS'
                ) || ''
              const newMakes =
                newSupplier.find((each) => each.category === 'LDV_MAKES') || ''
              const newSupplierClass =
                newSupplier.find(
                  (each) => each.category === 'SUPPLIER_CLASS'
                ) || ''
              const idirCommentArrayResponse = []
              let bceidCommentResponse = response.data.fromSupplierComments

              const {
                assessment,
                descriptions: assessmentDescriptions,
                assessmentComment
              } = assessmentResponse.data

              let assessmentPenalty
              let decision
              let deficit
              let inCompliance

              if (assessment) {
                ({
                  penalty: assessmentPenalty,
                  decision,
                  deficit,
                  inCompliance
                } = assessment)
              }
              setRadioDescriptions(assessmentDescriptions)

              if (assessmentComment) {
                assessmentComment.forEach((item) => {
                  if (item.toDirector === true) {
                    idirCommentArrayResponse.push(item)
                  } else if (item) {
                    bceidCommentResponse = item
                  }
                })
              }
              setCommentArray({
                bceidComment: bceidCommentResponse,
                idirComment: idirCommentArrayResponse
              })

              const supplierInfo = {
                legalName: newLegalName.value,
                serviceAddress: newServiceAddress.value,
                recordsAddress: newRecordsAddress.value,
                ldvMakes: newMakes.value,
                supplierClass: newSupplierClass.value,
                ldvSales: response.data.ldvSales
              }
              const newZevSales = response.data.zevSales
              const salesData = []
              // sales from assessment
              response.data.assessmentData.zevSales.forEach((item) => {
                const oldData = {
                  make: item.make,
                  model: item.modelName,
                  modelYear: item.modelYear,
                  sales: item.salesIssued,
                  range: item.range,
                  zevClass: item.zevClass,
                  zevType: item.vehicleZevType
                }
                if (item.fromModelYearReport) {
                  oldData.modelYearReportVehicle = item.id
                } else {
                  oldData.supplementalOriginZevSaleId = item.id
                }
                salesData.push({
                  newData: {},
                  oldData
                })
              })
              // new /adjusted sales
              if ((query && query.new !== 'Y') || user.isGovernment) {
                newZevSales.forEach((item) => {
                  if (item.modelYearReportVehicle) {
                    const match = salesData.findIndex(
                      (record) =>
                        record.oldData.modelYearReportVehicle ===
                        item.modelYearReportVehicle
                    )
                    if (match >= 0) {
                      salesData[match].newData = item
                    } else {
                      salesData.push({ newData: item, oldData: {} })
                    }
                  } else if (item.supplementalOriginZevSaleId) {
                    const match = salesData.findIndex(
                      (record) =>
                        record.oldData.supplementalOriginZevSaleId ===
                        item.supplementalOriginZevSaleId
                    )
                    if (match >= 0) {
                      salesData[match].newData = item
                    } else {
                      salesData.push({ newData: item, oldData: {} })
                    }
                  } else {
                    salesData.push({ newData: item, oldData: {} })
                  }
                })
              }
              setSalesRows(salesData)

              const creditActivity = []

              response.data.creditActivity.forEach((each) => {
                creditActivity.push({
                  category: each.category,
                  creditAValue: each.creditAValue,
                  creditBValue: each.creditBValue,
                  modelYear: each.modelYear.name
                })
              })

              setSupplementaryAssessmentData({
                supplementaryAssessment: {
                  inCompliance,
                  assessmentPenalty,
                  decision,
                  deficit
                }
              })

              const zevSales = []
              salesData.forEach((each) => {
                if (each.newData && Object.keys(each.newData).length > 0) {
                  zevSales.push(each.newData)
                }
              })
              newData.zevSales = zevSales

              setNewData({
                ...newData,
                supplierInfo,
                creditActivity
              })

              if (reconciledComplianceObligation) {
                setObligationDetails(reconciledComplianceObligation)
              }

              if (reconciledLdvSales) {
                setLdvSales(reconciledLdvSales)
              }
            }

            const reportYear =
              response.data.assessmentData &&
              response.data.assessmentData.modelYear
            const filteredRatios = ratioResponse.data.find(
              (data) => Number(data.modelYear) === Number(reportYear)
            )
            setRatios(filteredRatios)

            setLoading(false)
          }
        )
      )
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated, location.pathname, location.search])

  useEffect(() => {
    calculateBalance()
  }, [newData.creditActivity, obligationDetails])

  const { reassessment } = details
  const isReassessment = reassessment?.isReassessment
  const reassessmentStatus = reassessment?.status ? reassessment.status : details.status
  // supplementaryReportId is specific to reports submitted by bceid ie its NOT a reassessment
  const supplementaryReportId = reassessment?.supplementaryReportId
    ? reassessment?.supplementaryReportId
    : (!isReassessment ? details.id : null)
  const reassessmentReportId = reassessment?.reassessmentReportId ? reassessment?.reassessmentReportId : details.id
  const supplementaryReportIsReassessment = reassessment?.supplementaryReportIsReassessment
  const detailsProps = {
    addSalesRow,
    analystAction,
    checkboxConfirmed,
    commentArray,
    deleteFiles,
    details,
    directorAction,
    errorMessage,
    files,
    handleAddIdirComment,
    handleCheckboxClick,
    handleCommentChange,
    handleCommentChangeBceid,
    handleCommentChangeIdir,
    handleDeleteIdirComment,
    handleEditIdirComment,
    handleInputChange,
    handleSubmit,
    handleSupplementalChange,
    id,
    ldvSales,
    loading,
    newBalances,
    newData,
    obligationDetails,
    query,
    radioDescriptions,
    ratios,
    salesRows,
    user,
    setDeleteFiles,
    setSupplementaryAssessmentData,
    supplementaryAssessmentData,
    setUploadFiles: setFiles,
    isReassessment,
    reassessmentStatus,
    supplementaryReportId,
    reassessmentReportId,
    supplementaryReportIsReassessment
  }

  if (props.newReport) {
    return (
      <SupplementaryCreate
        {...detailsProps}
      />
    )
  } else if (isSupplier) {
    return (
      <SupplementarySupplierDetails
        {...detailsProps}
      />)
  } else if (isDirector) {
    return (
      <SupplementaryDirectorDetails
        {...detailsProps}
        setReassessmentReductions={setReassessmentReductions}
      />)
  } else if (isAnalyst) {
    return (
      <SupplementaryAnalystDetails
        {...detailsProps}
      />)
  } else {
    return <></>
  }
}

SupplementaryContainer.defaultProps = {
  reassessment: false
}

SupplementaryContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
  reassessment: PropTypes.bool,
  newReport: PropTypes.bool
}

export default SupplementaryContainer
