INSERT INTO items VALUES ('uuidaxs', 'Apple', 20, 'Fell on newton', 3, 'Fresh');
INSERT INTO items VALUES ('uuidaxa', 'Banana', 16, 'Yellow tick', 2, 'Love em');
INSERT INTO items VALUES ('uuidaxb', 'Cherry', 12, 'Fruits', 5, 'Fruit');
INSERT INTO items VALUES ('uuidaxc', 'Donut', 8, 'Circle with a hole', 6, 'Cops Love then ????');

INSERT INTO cart_item (id, item_id, user_id, quantity, total_price_per_item, order_id) VALUES (
    $1,
    (SELECT id FROM items WHERE name = $2), 
    $3,
    $4,
    (SELECT price FROM items WHERE name = $2),
    (SELECT id FROM orders WHERE user_id = $5 AND status = 'current' )
)

INSERT INTO cart_item (id, item_id, user_id, quantity, total_price_per_item, order_id) VALUES (
    $1,
    (SELECT id FROM items WHERE name = $2), 
    $3,
    $4,
    (SELECT price FROM items WHERE name = $2),
    (SELECT id FROM orders WHERE user_id = $3 AND status = 'current' )
)
