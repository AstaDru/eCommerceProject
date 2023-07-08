BEGIN;


CREATE TABLE IF NOT EXISTS address
(
    id integer NOT NULL DEFAULT nextval('address_id_seq'::regclass),
    owner_id character varying(50) COLLATE pg_catalog."default",
    building_number character varying(10) COLLATE pg_catalog."default",
    street_name character varying(50) COLLATE pg_catalog."default",
    post_code character varying(10) COLLATE pg_catalog."default",
    CONSTRAINT address_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.cart
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    user_id character varying(50) COLLATE pg_catalog."default",
    total_items integer,
    total_amount integer,
    CONSTRAINT cart_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cart_item
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    cart_id character varying(50) COLLATE pg_catalog."default",
    item_id character varying(50) COLLATE pg_catalog."default",
    quantity integer,
    CONSTRAINT cart_item_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.items
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    shop_id character varying(50) COLLATE pg_catalog."default",
    name character varying(50) COLLATE pg_catalog."default",
    quantity integer,
    description character varying(200) COLLATE pg_catalog."default",
    CONSTRAINT items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.orders
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    user_id character varying(50) COLLATE pg_catalog."default",
    cart_id character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT orders_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS shop
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default",
    phone_nr integer,
    address_id integer,
    capital integer,
    CONSTRAINT shop_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default",
    surname character varying(50) COLLATE pg_catalog."default",
    email character varying(50) COLLATE pg_catalog."default",
    password character varying(50) COLLATE pg_catalog."default",
    address_id integer,
    shop_id character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS cart_item
    ADD CONSTRAINT cart_item_cart_id_fkey FOREIGN KEY (cart_id)
    REFERENCES public.cart (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS cart_item
    ADD CONSTRAINT cart_item_item_id_fkey FOREIGN KEY (item_id)
    REFERENCES public.items (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS items
    ADD CONSTRAINT items_shop_id_fkey FOREIGN KEY (shop_id)
    REFERENCES public.shop (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS orders
    ADD CONSTRAINT orders_cart_id_fkey FOREIGN KEY (cart_id)
    REFERENCES public.cart (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS users
    ADD CONSTRAINT users_shop_id_fkey FOREIGN KEY (shop_id)
    REFERENCES public.shop (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;