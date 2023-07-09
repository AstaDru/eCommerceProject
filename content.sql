BEGIN;


CREATE TABLE IF NOT EXISTS address
(
    id integer PRIMARY KEY,
    building_number character varying(10),
    street_name character varying(50),
    post_code character varying(10)
);

CREATE TABLE IF NOT EXISTS cart
(
    id character varying(50) PRIMARY KEY,
    user_id character varying(50),
    total_items integer,
    total_amount integer
);

CREATE TABLE IF NOT EXISTS cart_item
(
    id character varying(50) PRIMARY KEY,
    cart_id character varying(50),
    item_id character varying(50),
    quantity integer
);

CREATE TABLE IF NOT EXISTS items
(
    id character varying(50) PRIMARY KEY,
    shop_id character varying(50),
    name character varying(50),
    quantity integer,
    description character varying(200)
);

CREATE TABLE IF NOT EXISTS orders
(
    id character varying(50) PRIMARY KEY,
    user_id character varying(50),
    cart_id character varying(50)
);

CREATE TABLE IF NOT EXISTS shop
(
    id character varying(50) PRIMARY KEY,
    name character varying(50) NOT NULL,
    email character varying(50),
    phone_nr integer,
    address_id integer,
    capital integer
);

CREATE TABLE IF NOT EXISTS users
(
    id character varying(50) PRIMARY KEY,
    name character varying(50) NOT NULL,
    surname character varying(50) NOT NULL,
    email character varying(50),
    password character varying(50) NOT NULL,
    address_id integer NOT NULL,
    shop_id character varying(50)
);

ALTER TABLE IF EXISTS cart
    ADD FOREIGN KEY (user_id)
    REFERENCES users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS cart_item
    ADD FOREIGN KEY (cart_id)
    REFERENCES public.cart (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS cart_item
    ADD FOREIGN KEY (item_id)
    REFERENCES public.items (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS items
    ADD FOREIGN KEY (shop_id)
    REFERENCES public.shop (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS orders
    ADD FOREIGN KEY (cart_id)
    REFERENCES public.cart (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS orders
    ADD FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS users
    ADD FOREIGN KEY (shop_id)
    REFERENCES public.shop (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;