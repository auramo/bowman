CREATE TABLE user_account (
  id BIGSERIAL PRIMARY KEY,
  login text UNIQUE,
  name text
);
