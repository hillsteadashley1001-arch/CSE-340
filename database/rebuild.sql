-- rebuild.sql
-- Drop existing (adjust to your policies if you prefer transactions)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type_enum') THEN
    DROP TYPE account_type_enum;
  END IF;
END$$;

-- Type
CREATE TYPE account_type_enum AS ENUM ('Client', 'Admin');

-- Tables
CREATE TABLE account (
  account_id        SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50)  NOT NULL,
  account_lastname  VARCHAR(50)  NOT NULL,
  account_email     VARCHAR(255) UNIQUE NOT NULL,
  account_password  VARCHAR(255) NOT NULL,
  account_type      account_type_enum NOT NULL DEFAULT 'Client'
);

CREATE TABLE classification (
  classification_id   SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE inventory (
  inv_id            SERIAL PRIMARY KEY,
  inv_make          VARCHAR(50) NOT NULL,
  inv_model         VARCHAR(50) NOT NULL,
  inv_description   TEXT        NOT NULL,
  inv_image         VARCHAR(255) NOT NULL,
  inv_thumbnail     VARCHAR(255) NOT NULL,
  price             NUMERIC(12,2) NOT NULL DEFAULT 0,
  year              INTEGER,
  miles             INTEGER,
  color             VARCHAR(50),
  classification_id INTEGER NOT NULL REFERENCES classification(classification_id) ON DELETE RESTRICT
);

-- Seed data for classification
INSERT INTO classification (classification_name)
VALUES ('Sport'), ('SUV'), ('Sedan')
ON CONFLICT (classification_name) DO NOTHING;

-- Two Sport cars so Task 1.5 returns exactly two rows
WITH sport AS (
  SELECT classification_id FROM classification WHERE classification_name = 'Sport'
)
INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, price, year, miles, color, classification_id)
SELECT 'Porsche', '911', 'Iconic sport coupe with small interiors', '/images/porsche-911.jpg', '/images/porsche-911-tn.jpg', 99999.99, 2022, 5000, 'Red', classification_id FROM sport
UNION ALL
SELECT 'Chevrolet', 'Corvette', 'American sports car with small interiors', '/images/corvette.jpg', '/images/corvette-tn.jpg', 75999.00, 2021, 8000, 'Blue', classification_id FROM sport;

-- Ensure a GM Hummer exists for Task 1.4 demo
INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, price, year, miles, color, classification_id)
SELECT 'GM', 'Hummer', 'A rugged SUV with small interiors and big presence', '/images/hummer.jpg', '/images/hummer-tn.jpg', 65000.00, 2009, 120000, 'Black',
       (SELECT classification_id FROM classification WHERE classification_name = 'SUV')
WHERE NOT EXISTS (
  SELECT 1 FROM inventory WHERE inv_make = 'GM' AND inv_model = 'Hummer'
);

-- A couple of baseline accounts (Tony will be added during Task 1)
INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
VALUES
  ('Sam', 'Rogers', 'sam@example.com', 'hashed_pw_1', 'Client'),
  ('Alex', 'Kim', 'alex@example.com', 'hashed_pw_2', 'Admin')
ON CONFLICT (account_email) DO NOTHING;

-- REQUIRED: Copies of Task 1 queries 4 and 6 LAST
-- Copy of Task 1.4 — replace phrase in GM Hummer description
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = (
  SELECT i.inv_id FROM inventory i
  WHERE i.inv_make = 'GM' AND i.inv_model = 'Hummer'
  LIMIT 1
);

-- Copy of Task 1.6 — add /vehicles into image paths for all rows
UPDATE inventory
SET
  inv_image     = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');