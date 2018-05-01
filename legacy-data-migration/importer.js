require("dotenv").config()

const fs = require("fs")
const db = require("../server/db/db")
const Promise = require("bluebird")
const R = require("ramda")
const assert = require("assert")

const typesFile = "data-to-import/payment-types.json"
const payersFile = "data-to-import/payers.json"
const paymentsFile = "data-to-import/expenses.json"
const userMappingFile = "data-to-import/user-mapping.json"
const importFiles = [typesFile, payersFile, paymentsFile, userMappingFile]

const checkFiles = () => {
  for (const importFile of importFiles) {
    if (!fs.existsSync(importFile))
      throw new Error(`Missing required import file ${importFile}`)
  }
}

const deleteAll = async () => {
  await db.query("DELETE FROM payment_type")
  await db.query("DELETE FROM payment")
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

const importPaymentTypes = async () => {
  const types = JSON.parse(fs.readFileSync(typesFile))
  const paymentTypePairs = R.toPairs(types)
  const mappedPaymentTypes = await Promise.mapSeries(
    paymentTypePairs,
    insertPaymentType
  )
  return R.fromPairs(mappedPaymentTypes)
}

const importPayments = async (paymentTypes, userMappings, paymentGroupId) => {
  const payments = JSON.parse(fs.readFileSync(paymentsFile))
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
  if (process.argv.length < 3) {
    console.log(`Usage ${process.argv[1]} <payment group id>`)
    process.exit(1)
  }
  console.log("Deleting existing data")
  await deleteAll()
  console.log("Starting to import JSON data...")
  checkFiles()
  const types = await importPaymentTypes()
  const userMappings = JSON.parse(fs.readFileSync(userMappingFile))
  await importPayments(types, userMappings, process.argv[2])
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
