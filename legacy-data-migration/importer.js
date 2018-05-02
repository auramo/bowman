require("dotenv").config()

const fs = require("fs")
const db = require("../server/db/db")
const Promise = require("bluebird")
const R = require("ramda")
const assert = require("assert")

const typesFile = "payment-types.json"
const payersFile = "payers.json"
const paymentsFile = "expenses.json"
const userMappingFile = "user-mapping.json"
const importFiles = [typesFile, payersFile, paymentsFile, userMappingFile]

const checkFiles = dataDir => {
  for (const importFile of importFiles) {
    const importFilePath = `${dataDir}/${importFile}`
    if (!fs.existsSync(importFilePath))
      throw new Error(`Missing required import file ${importFilePath}`)
  }
}

const deleteAll = async () => {
  await db.query("DELETE FROM payment")
  await db.query("DELETE FROM payment_type")
}

const insertPaymentType = async ([paymentType, description]) => {
  const result = await db.one(
    `INSERT INTO payment_type (description) VALUES ($1) RETURNING id`,
    [description]
  )
  return [paymentType, { description, id: result.id }]
}

const insertPayment = async (
  payment,
  paymentTypeId,
  userId,
  paymentGroupId
) => {
  await db.query(
    `INSERT INTO payment (id, amount_cents, payment_date, payment_type_id, description, user_account_id, payment_group_id)
     VALUES
     ($1, $2, $3, $4, $5, $6, $7)`,
    [
      payment.id,
      payment.amountcents,
      new Date(payment.date),
      paymentTypeId,
      payment.description,
      userId,
      paymentGroupId
    ]
  )
}

const importPaymentTypes = async dataDir => {
  const types = JSON.parse(fs.readFileSync(`${dataDir}/${typesFile}`))
  const paymentTypePairs = R.toPairs(types)
  const mappedPaymentTypes = await Promise.mapSeries(
    paymentTypePairs,
    insertPaymentType
  )
  return R.fromPairs(mappedPaymentTypes)
}

const importPayments = async (
  paymentTypes,
  userMappings,
  dataDir,
  paymentGroupId
) => {
  const payments = JSON.parse(fs.readFileSync(`${dataDir}/${paymentsFile}`))
  for (const [uuid, payment] of R.toPairs(payments)) {
    const userId = userMappings[payment.payerid]
    assert(userId, "No userid found for payment")
    const paymentType = paymentTypes[payment.name]
    assert(paymentType, "No payment type found")
    console.log("Importing payment:")
    console.log(payment)
    await insertPayment(payment, paymentType.id, userId, Number(paymentGroupId))
    console.log("Imported!")
  }
}

const doImport = async () => {
  if (process.argv.length < 4) {
    console.log(`Usage ${process.argv[1]} <data dir> <payment group id>`)
    process.exit(1)
  }
  const dataDir = process.argv[2]
  const paymentGroupId = process.argv[3]

  console.log("Deleting existing data")
  await deleteAll()
  console.log("Starting to import JSON data...")
  checkFiles(dataDir)
  const types = await importPaymentTypes(dataDir)
  const userMappings = JSON.parse(
    fs.readFileSync(`${dataDir}/${userMappingFile}`)
  )
  await importPayments(types, userMappings, dataDir, paymentGroupId)
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
