const isLegacySubmission = (submission) => {
    let result = false
    const thresholdDate = new Date('2024-10-21')
    const submissionDate = submission.submissionDate
    const createdDate = submission.createTimestamp
    const dateToConsider = submissionDate ? submissionDate : createdDate
    if (dateToConsider && (Date.parse(dateToConsider) < thresholdDate)) {
        result = true
    }
    return result
}

export default isLegacySubmission