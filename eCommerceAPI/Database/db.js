// CRUD on products db
const { Pool } = require('pg');
const uuid  = require('uuid').v4;

// Set n Get data from the .env file
require('dotenv').config(); // https://www.freecodecamp.org/news/how-to-use-node-environment-variables-with-a-dotenv-file-for-node-js-and-npm/
const pgHOST = process.env.pgHOST;
const pgUSER = process.env.pgUSER
const pgPASSWORD = process.env.pgPASSWORD;

if (!pgHOST || !pgUSER || !pgPASSWORD) {
    // Prevents connection if HOST, USER, PASSWORD are not set
    throw Error("Setup .env file or replace pg{HOST, USER, PASSWORD} values")
}

const pool = new Pool({
    host: pgHOST,
    user: pgUSER,
    password: pgPASSWORD,
    database: 'shop',
    port: 5432
});

const createUser =  (request, response) => {
    const { name, surname, email, password, address } = request.body;
    const command = 'INSERT INTO users (id, name, surname, email, password, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [uuid(), name, surname, email, password, address];
    
    pool.query(command, values, (err, results) => {
        if (!err) {
            request.session.authenticated = true;
            const { id, name, surname, email, address } = results.rows[0];
            request.session.user = {id, name, surname, email, address};

            response.json({message: "User Created", name, surname, email});
            //response.redirect('/api/browse');
        } else {
            response.status(400).json({message: err.message,  ...err})
        }
    })
};

const getUserByEmail = (request, response) => {
    // get user by email from users and compare password for auth
    const { email, password } = request.body;
    if (email && password) {
        pool.query('SELECT * FROM users WHERE email = $1', [email], (err, results) => {
            if (err) {
                response.status(400).json({message: err.message, detail: err.detail, ...err})
            }
            //user not found
            if (results.rows.length == 0) {
                return response.status(404).json({message: "User Not found"})
            }
            const dbPassword = (results.rows[0]) ? results.rows[0].password: null;
            if (dbPassword === password) {
                // send user a auth TOKEN across session
                request.session.authenticated = true;
                const { id, name, surname, email, address } = results.rows[0];
                request.session.user = {id, name, surname, email, address};
    
                response.json({message: "Login successful", name, surname, email})
            } else {
                // Wrong password
                response.status(400).json({message: 'Wrong password'})
            }
        });
    } else {
        response.status(404).json({message: "Invalid attribute on user"})
    }
};

const setUserAtr = (request, response) => {
    // Change attribute about user in db 
    const setAttribute = (request.body.attribute)? request.body.attribute.toLowerCase(): null;
    const newValue = (request.body[setAttribute])? request.body[setAttribute]: null;
    // default values matching users db column names
    const userAttributes = {
        name: 'name',
        surname: 'surname',
        email: 'email',
        password: 'password',
        address: 'address'
    }
    if (userAttributes[setAttribute] && newValue) {
        const values = [newValue, request.session.user.id];
        // I was unable to pass userAtr[setAtr] as part of the Values array, Hence string literal
        pool.query(`UPDATE users SET ${userAttributes[setAttribute]} = $1 WHERE id = $2 RETURNING *`, values, (err, results)=>{
            if (err) {
                response.status(400).json({message: err.message, detail: err.detail, ...err})
            }
            else if (results.rows.length <= 0) {
                response.status(404).json({message: "User not found"})
            }
            else {
                response.json({message: "Update successful",...results.rows[0]})
            }
        })
    } else {
        response.status(404).json({message: "Invalid attribute/value on user"})
    }
}

const deleteUser = (request, response) => {
    pool.query(`DELETE FROM users WHERE id = $1`, [request.session.user.id], (err, results)=>{
        if (err) {
            response.status(400).json({message: err.message, detail: err.detail, ...err})
        } else {
            request.session = null;
            response.status(204).json({message: "User successful deleted"});
        }
    })
}

const getShopItems = (request, response) => {
    const command = 'SELECT * FROM items';
    pool.query(command, (err, results) => {
        if (!err) {
            response.send(results.rows);
        } else {
            response.status(404).json({message: err.message,  ...err})
        }
    });
};

const getItemByName = (request, response) => {
    const { itemName } = request.params;
    pool.query('SELECT * FROM items WHERE name = $1', [itemName], (err, results) => {
        if (err) {
            response.status(400).json({message: err.message, detail: err.detail, ...err})
        }
        else if (results.rows.length <= 0) {
            response.status(404).json({message: "Item not found"})
        }
        else {
            response.json({message: "Found item ...",...results.rows[0]})
        }
    });
};


const getCartsByUser = (request, response) => {
    pool.query("SELECT item_name, quantity, total_price FROM cart_items WHERE order_id = (SELECT id FROM orders WHERE status = 'current' AND user_id = $1)",[request.session.user.id] , (err, results) => {       
        if (err) {
            response.status(400).json({message: err.message, detail: err.detail, ...err})
        }
        else if (results.rows.length == 0) {
            response.status(200).json({message: "Current cart is empty"})
        }
        else {
            response.send(results.rows)
        }
    })
}

const getCartById = (request, response) => {
    const { cartId } = request.params;
    pool.query("SELECT item_name, quantity, total_price FROM cart_items WHERE user_id = $1 AND order_id = $2",[request.session.user.id, cartId] , (err, results) => {       
        if (err) {
            response.status(400).json({message: err.message, detail: err.detail, ...err})
        }
        else if (results.rows.length == 0) {
            response.status(200).json({message: "Selected cart is empty"})
        }
        else {
            response.send(results.rows)
        }
    })
}

const addToCartByName = async (request, response) => {
    // if cart item name already exists with current order id, then update existing cart item ####
    // if cart_item.item_id Already exist increase quantity or redirect to '/cart/changeqty' 
    const { itemName, quantity } = request.body;
    if (itemName && quantity) {
        // Async check quantity
        const { rows } = await pool.query('SELECT * FROM items WHERE name = $1', [itemName]);
        if (rows[0].quantity - quantity < 0) {
            return response.status(404).json({message: `The shop doesn't have enough ${itemName}: ${rows[0].quantity} Available `})
        }  
        const command = `INSERT INTO cart_items (order_id, user_id, item_name, quantity, total_price) VALUES (
            (SELECT id FROM orders WHERE user_id = $1::text AND status = 'current')::text,
            $1::text,
            $2::text,   
            $3::integer,
            ($3::integer * (SELECT price FROM items WHERE name = $2)::integer)::integer)
             RETURNING item_name, quantity, total_price `;
        const values = [request.session.user.id, itemName, quantity];
        pool.query(command, values, (err, results) => {
            if (err) {
                response.status(400).json({message: err.message, detail: err.detail, ...err})
            } else if (results.rows.length <= 0) {
                response.status(404).json({message: "Item already exists or ..."})
            } else {
                response.json({message: "Item successful added", ...results.rows[0] })
            }
        });
    } else {
        response.status(400).json({message: "Invalid values"});
    }
};

const removeFromCartByName = (request, response) => {
    // look for cart item with given name with current order id
    const { itemName} = request.body

    if (itemName) {
            pool.query("DELETE FROM cart_items WHERE item_name = $1::text AND order_id = (SELECT id FROM orders  WHERE status = 'current' AND user_id = $2)::text RETURNING item_name", [ itemName, request.session.user.id] , (err, results) => {
            if (err) {
                response.status(400).json({message: err.message, detail: err.detail, ...err})
            } else if (results.rows.length <= 0) {
              response.status(404).json({message: "Something went wrong"})
            } else {
              response.json({message: "Item successfully removed",...results.rows[0]})
            }
        });
    } else {
        response.status(400).json({message: "Invalid values"});
    }
};
const clearCart = (request, response) => {
    // UPDATE SCHEMA add item_name to cart_item
        pool.query("DELETE FROM cart_items WHERE order_id = (SELECT id FROM orders WHERE user_id = $1 AND status ='current')::text", [request.session.user.id], (err, results)=> {
            if (err) {
                response.status(400).json({message: err.message, detail: err.detail, ...err})
            } else {
                response.status(200).json({message: "Cart item successful deleted"});
            };
        })
};

const changeCartItemQuantityByName = (request, response) => {
    // UPDATE SCHEMA cart_item.item_id Must be UINQUE
    const { itemName, quantity } = request.body;

    if (quantity == 0){
        removeFromCartByName(request, response)
    }
    if (itemName && quantity) {
        pool.query('UPDATE cart_items SET quantity = $1::int, total_price = ($1::integer * (SELECT price FROM items WHERE name = $2)::integer)::integer WHERE item_name = $2::text AND quantity <= (SELECT quantity FROM items WHERE name = $2::text)::int RETURNING item_name, quantity, total_price', [quantity, itemName], (err, results) =>{
            if (err) {
                response.status(400).json({message: err.message, detail: err.detail, ...err})
            }
            else if (results.rows.length <= 0) {
                response.status(404).json({message: "Item not found"})
            }
            else {
                response.json({message: "Quantity successful updated",...results.rows[0]})
            }
        })
    } else {
        response.status(400).json({message: "Invalid values"})
    }
};

const checkoutCart = (request, response) => {
    // calculate SUM(price), SUM(quantity)
    const command = `UPDATE orders 
        SET status = 'completed',
        total_price = (SELECT SUM(total_price) FROM cart_items WHERE order_id = (SELECT id FROM orders WHERE user_id = $1::text AND status = 'current')::text)::int,
        total_quantity = (SELECT SUM(quantity) FROM cart_items WHERE order_id = (SELECT id FROM orders WHERE user_id = $1::text AND status = 'current')::text)::int
        WHERE status = 'current' AND user_id = $1::text RETURNING status, total_quantity, total_price`;
    const values = [request.session.user.id];
    pool.query(command, values, (err, results) => {
        if (err) {
            response.status(400).json({message: err.message, detail: err.detail, ...err})
        } 
        else if (results.rows.length == 0) {
            response.json({message: 'No content found'});
        } else {
            response.json({message: `Your order will be delivered to ${request.session.user.address} on %DD:%MM:%YYYY`, ...results.rows[0]});
        }
    })
}

const getOrders = (request, response) => {
    const command = "SELECT * FROM orders WHERE user_id = $1";
    const values = [request.session.user.id];
    pool.query(command, values, (err, results) => {
        if (err) {
            response.status(400).json({message: err.message, detail: err.detail, ...err})
        } 
        else if (results.rows.length == 0) {
            response.json({message: 'No content found'});
        } else {
            response.send(results.rows);
        }
    })   
}

module.exports = {
    createUser,
    getUserByEmail,
    setUserAtr,
    deleteUser,

    getShopItems,
    getItemByName,
    
    getCartsByUser,
    getCartById,
    addToCartByName,
    removeFromCartByName,
    clearCart,
    changeCartItemQuantityByName,
    
    checkoutCart,
    getOrders,
};