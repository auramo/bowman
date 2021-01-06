const parseDate = candidate => {
  if (candidate === null) return null
  const parts = candidate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (parts === null) return null
  const year = parts[3]
  const month = parts[2]
  const day = parts[1]
  // Just some rough, stupid sanity checks:
  if (day < 1 || day > 31) return null
  if (month < 1 || month > 12) return null
  if (year < 1970 || year > 2100) return null
  return new Date(day, month - 1, year)
}

module.exports = { parseDate }
