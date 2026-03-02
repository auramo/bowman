// DB row types (camelized column names, nullability matches schema)

export interface UserAccount {
  id: number
  login: string | null
  name: string | null
}

export interface Payment {
  id: string
  amountCents: number | null
  paymentDate: Date | null
  description: string | null
  paymentTypeId: number
  userAccountId: number
  paymentGroupId: number
}

export interface PaymentType {
  id: number
  description: string | null
}

export interface PaymentGroup {
  id: number
}

export interface PaymentGroupUser {
  userAccountId: number
  paymentGroupId: number
}

// API/view types

export interface PaymentListItem {
  id: string
  amountCents: number | null
  paymentDate: Date | null
  payerName: string | null
  paymentType: string | null
  description: string | null
}

export interface PaymentDetail {
  id: string
  amount: string
  paymentDate: string
  payerId: number
  paymentTypeId: number
  description: string | null
}

export interface PaymentFormData {
  id?: string
  amount: string
  paymentDate: string
  paymentTypeId: number | string
  payerId: number | string
  description: string
}

export interface Payer {
  id: number
  name: string | null
}

export interface SummaryRow {
  sum: number
  payer: string | null
  id: number
  minPayer?: boolean
}

export interface SummaryResponse {
  summary: SummaryRow[]
  paymentCount: number
}
