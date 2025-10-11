-- assignment2.sql
-- Task 1: Six queries. Run top-to-bottom. Replace :tony_id after running 1.1.

-- 1.1 Insert Tony Stark. account_id and account_type use defaults.
WITH ins AS (
  INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
  VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n')
  RETURNING account_id
)
SELECT account_id FROM ins;

-- After running 1.1, copy the returned account_id and set it below:
-- Example: \set tony_id 42
-- In pgAdmin, just replace :tony_id with the integer.

-- 1.2 Promote Tony to Admin (single row via PK)
UPDATE account
SET account_type = 'Admin'
WHERE account_id = :tony_id;

-- 1.3 Delete Tony (single row via PK)
DELETE FROM account
WHERE account_id = :tony_id;

-- 1.4 Change GM Hummer description phrase using REPLACE (single query)
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = (
  SELECT i.inv_id FROM inventory i
  WHERE i.inv_make = 'GM' AND i.inv_model = 'Hummer'
  LIMIT 1
);

-- 1.5 Inner join for Sport items (expect two rows)
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 1.6 Add "/vehicles" into image paths for all rows (single query)
UPDATE inventory
SET
  inv_image     = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

-- 1.7 Copy 1.4 and 1.6 into rebuild.sql (already appended there as required)