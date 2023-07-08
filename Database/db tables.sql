CREATE TABLE users (id varchar(50) PRIMARY KEY, name varchar(50), surname varchar(50), email varchar(50), password varchar(50), address_id integer);
ALTER TABLE users ADD UNIQUE (email);