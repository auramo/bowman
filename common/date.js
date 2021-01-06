const parseDate = candidate => {
  if (candidate === null) return null
  const parts = candidate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (parts === null) return null
  return new Date(parts[3], parts[2] - 1, parts[1])
}

module.exports = { parseDate }
