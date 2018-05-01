CREATE TABLE payment_type (id BIGSERIAL, description TEXT);

CREATE TABLE payment_group(
  id BIGSERIAL PRIMARY KEY
);

CREATE TABLE payment_group_user(
  user_account_id BIGINT NOT NULL REFERENCES user_account (id),
  payment_group_id BIGINT NOT NULL REFERENCES payment_group(id),
  UNIQUE(user_account_id, payment_group_id)
);

CREATE TABLE payment (
  id UUID PRIMARY KEY,
  amount_cents BIGINT,
  payment_date DATE,
  description TEXT,
  user_account_id BIGINT NOT NULL REFERENCES user_account (id),
  payment_group_id BIGINT NOT NULL REFERENCES payment_group (id)
);
