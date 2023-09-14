import axios from 'axios'
import ROUTES_COMPLIANCE from '../routes/Compliance'
import history from '../History'

const deleteModelYearReport = (id, setLoading, redirectTo) => {
  if (setLoading) {
    setLoading(true)
  }
  let promise = Promise.resolve()
  if (!isNaN(id) && id > 0) {
    promise = axios.delete(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id))
  }
  promise.then(() => {
    if (redirectTo) {
      history.push(redirectTo)
    } else {
      history.push(ROUTES_COMPLIANCE.REPORTS)
    }
  })
}

export default deleteModelYearReport
