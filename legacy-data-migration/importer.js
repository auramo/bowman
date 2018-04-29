require("dotenv").config()

const fs = require("fs")
const db = require("../server/db/db")
const Promise = require("bluebird")
const R = require("ramda")

const typesFile = "data-to-import/payment-types.json"
const payersFile = "data-to-import/payers.json"
const expensesFile = "data-to-import/expenses.json"
const userMappingFile = "data-to-import/user-mapping.json"
const importFiles = [typesFile, payersFile, expensesFile, userMappingFile]

const checkFiles = () => {
  for (const importFile of importFiles) {
    if (!fs.existsSync(importFile))
      throw new Error(`Missing required import file ${importFile}`)
  }
}

const deleteAll = async () => {
  await db.query("DELETE FROM payment_type")
}

const insertPaymentType = async ([paymentType, description]) => {
  const result = await db.one(
    `INSERT INTO payment_type (description) VALUES ($1) RETURNING id`,
    [description]
  )
  return [paymentType, { description, id: result.id }]
}

const importPaymentTypes = async () => {
  const types = JSON.parse(fs.readFileSync(typesFile))
  const paymentTypePairs = R.toPairs(types)
  const mappedPaymentTypes = await Promise.mapSeries(
    paymentTypePairs,
    insertPaymentType
  )
  return R.fromPairs(mappedPaymentTypes)
}

const doImport = async () => {
  console.log("Deleting existing data")
  await deleteAll()
  console.log("Starting to import JSON data...")
  checkFiles()
  const types = await importPaymentTypes()
  console.log("payment types", types)
}

doImport()
  .then(() => {
    console.log("done")
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
