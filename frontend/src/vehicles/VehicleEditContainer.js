/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import CustomPropTypes from '../app/utilities/props'
import ROUTES_VEHICLES from '../app/routes/Vehicles'
import history from '../app/History'
import parseErrorResponse from '../app/utilities/parseErrorResponse'
import VehicleForm from './components/VehicleForm'

const VehicleEditContainer = (props) => {
  const [classes, setClasses] = useState([])
  const [deleteFiles, setDeleteFiles] = useState([])
  const [errorFields, setErrorFields] = useState({})
  const [fields, setFields] = useState({})
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [progressBars, setProgressBars] = useState({})
  const [showProgressBars, setShowProgressBars] = useState(false)
  const [status, setStatus] = useState('DRAFT')
  const [types, setTypes] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vehicleComment, setVehicleComment] = useState({})
  const [years, setYears] = useState([])
  const [uploadRangeResults, setUploadRangeResults] = useState(false)

  const { id } = useParams()
  const { keycloak, newVehicle } = props
  const handleInputChange = (event) => {
    const { checked, name, type, value } = event.target

    let input = value

    if (name === 'make') {
      input = input.toUpperCase()
    }

    if (type === 'checkbox') {
      fields[name] = checked
    } else {
      fields[name] = input
    }

    if (name === 'vehicleZevType' && ['EREV', 'PHEV'].indexOf(value) < 0) {
      fields.hasPassedUs06Test = false
    }

    setFields({
      ...fields
    })
  }
  const requestStateChange = (newState) => {
    setLoading(true)
    axios
      .patch(`vehicles/${id}/state_change`, { validationStatus: newState })
      .then(() => {
        history.push(ROUTES_VEHICLES.LIST)

        if (newState === 'SUBMITTED') {
          history.replace(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id))
        }

        setLoading(false)
      })
  }
  const resetForm = () => {
    setFields({
      hasPassedUs06Test: false,
      make: '',
      modelName: '',
      vehicleZevType: { vehicleZevCode: '--' },
      range: '',
      modelYear: { name: '--' },
      vehicleClassCode: { vehicleClassCode: '--' },
      weightKg: ''
    })
    setFiles([])
    setProgressBars({})
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

  const handleUpload = (paramId) => {
    const promises = []
    setShowProgressBars(true)

    files.forEach((file, index) => {
      promises.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const blob = reader.result

            axios
              .get(ROUTES_VEHICLES.MINIO_URL.replace(/:id/gi, paramId))
              .then((response) => {
                const { url: uploadUrl, minioObjectName } = response.data

                axios
                  .put(uploadUrl, blob, {
                    headers: {
                      Authorization: null
                    },
                    onUploadProgress: (progressEvent) => {
                      updateProgressBars(progressEvent, index)

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

  const saveVehicle = (data) => {
    if (!newVehicle && id) {
      return axios.patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), {
        ...data,
        deleteFiles
      })
    }

    return axios.post(ROUTES_VEHICLES.LIST, data)
  }

  const handleSubmit = (event, validationStatus = null) => {
    const data = fields

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim()
      }
    })

    saveVehicle(data)
      .then((response) => {
        const { id: vehicleId } = response.data

        const uploadPromises = handleUpload(vehicleId)

        Promise.all(uploadPromises).then((attachments) => {
          const patchData = {}

          if (attachments.length > 0) {
            patchData.vehicleAttachments = attachments
          }

          if (validationStatus) {
            patchData.validationStatus = validationStatus
          }

          axios
            .patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, vehicleId), {
              ...patchData,
              deleteFiles
            })
            .then(() => {
              history.push(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, vehicleId))
            })
        })
      })
      .catch((errors) => {
        if (!errors.response) {
          return
        }

        const { data: errorData } = errors.response
        const err = {}

        parseErrorResponse(err, errorData)
        setErrorFields(err)
      })
  }

  const loadVehicle = (data) => {
    setFields({
      attachments: data.attachments,
      hasPassedUs06Test: data.hasPassedUs06Test,
      make: data.make,
      modelName: data.modelName,
      modelYear: data.modelYear.name,
      range: data.range,
      vehicleClassCode: data.vehicleClassCode.vehicleClassCode,
      vehicleZevType: data.vehicleZevType.vehicleZevCode,
      weightKg: data.weightKg,
      updateTimestamp: data.updateTimestamp,
      user: data.updateUser.displayName
    })

    setStatus(data.validationStatus)

    setVehicleComment(data.vehicleComment)
  }

  const orgMakes = [
    ...new Set(vehicles.map((vehicle) => vehicle.make.toUpperCase()))
  ]
  const refreshList = () => {
    setLoading(true)

    const promises = [
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.ZEV_TYPES),
      axios.get(ROUTES_VEHICLES.CLASSES),
      axios.get(ROUTES_VEHICLES.LIST)
    ]

    if (id) {
      promises.push(axios.get(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id)))
    }

    axios
      .all(promises)
      .then(
        axios.spread(
          (yearsRes, typesRes, classesRes, orgVehiclesRes, vehicleRes) => [
            vehicleRes ? loadVehicle(vehicleRes.data) : resetForm(),
            setClasses(classesRes.data),
            setTypes(typesRes.data),
            setVehicles(orgVehiclesRes.data),
            setYears(yearsRes.data),
            setLoading(false)
          ]
        )
      )
  }

  useEffect(() => {
    refreshList()
  }, [keycloak.authenticated])

  return (
    <VehicleForm
      deleteFiles={deleteFiles}
      errorFields={errorFields}
      fields={fields}
      files={files}
      formTitle="Enter Zero-Emission Vehicle"
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      makes={orgMakes}
      progressBars={progressBars}
      setDeleteFiles={setDeleteFiles}
      setFields={setFields}
      setUploadFiles={setFiles}
      setUploadRangeResults={setUploadRangeResults}
      showProgressBars={showProgressBars}
      status={status}
      vehicleClasses={classes}
      vehicleComment={vehicleComment}
      vehicleTypes={types}
      vehicleYears={years}
      newVehicle={newVehicle}
      requestStateChange={requestStateChange}
      uploadRangeResults={uploadRangeResults}
    />
  )
}

VehicleEditContainer.defaultProps = {
  newVehicle: false
}

VehicleEditContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  newVehicle: PropTypes.bool
}

export default VehicleEditContainer
