// CRUD on products db
const { Pool } = require('pg');
const uuid  = require('uuid').v4;

// Set n Get data from the .env file
require('dotenv').config(); // https://www.freecodecamp.org/news/how-to-use-node-environment-variables-with-a-dotenv-file-for-node-js-and-npm/
const pgHOST = process.env.pgHOST;
const pgUSER = process.env.pgUSER
const pgPASSWORD = process.env.pgPASSWORD;

const pool = new Pool({
    host: pgHOST,
    user: pgUSER,
    password: pgPASSWORD,
    database: 'shop',
    port: 5432
});

const createUser =  (request, response) => {
    const {name, surname, email, password} = request.body;
    const addressId = 7176;
    const command = 'INSERT INTO users (id, name, surname, email, password, address_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [uuid(), name, surname, email, password, addressId];
    
    pool.query(command, values, (err, results) => {
        if (!err) {
            response.json({message: "User Created", ...results.rows[0]});
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
                return response.status(404).json({message: err.message,  ...err})
            }
            //user not found
            if (results.rows.length == 0) {
                return response.status(404).json({message: "User Not found"})
            }
            const dbPassword = (results.rows[0]) ? results.rows[0].password: null;
            const inputPassword = password || null;
            if (dbPassword === inputPassword) {
                // send user a auth TOKEN across session
                request.session.authenticated = true;
                const { id, name, surname, email } = results.rows[0];
                request.session.user = {id, name, surname, email};
    
                response.json({message: "Login successful",...results.rows[0]})
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
    }
    if (userAttributes[setAttribute] && newValue) {
        const values = [newValue, request.session.user.id];
        // I was unable to pass userAtr[setAtr] as part of the Values array, Hence string literal
        pool.query(`UPDATE users SET ${userAttributes[setAttribute]} = $1 WHERE id = $2 RETURNING *`, values, (err, results)=>{
            if (err) {
                response.status(400).json({message:err.message, ...err})
            }
            if (results.rows.length <= 0) {
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
            response.status(400).json({message:err.message, ...err})
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
            response.status(400).json({message:err.message, ...err})
        }
        if (results.rows.length <= 0) {
            response.status(404).json({message: "Item not found"})
        }
        else {
            response.json({message: "Found item ...",...results.rows[0]})
        }
    });
};

const getCartsByUser = (request, response) => {
    pool.query("SELECT * FROM cart_item WHERE order_id = (SELECT id FROM orders WHERE status = 'current' AND user_id = $1)",[request.session.user.id] , (err, results) => {       
        if (err) {
            response.status(400).json({message:err.message, ...err})
        }
        if (results.rows.length == 0) {
            response.status(204).json({message: "Current cart is empty"})
        }
        else {
            response.send(results.rows)
        }
    })
}

const addToCartByName = (request, response) => {
    // if cart item name already exists with current order id, then update existing cart item ####
    // if cart_item.item_id Already exist increase quantity or redirect to '/cart/changeqty' 
    const { itemName, quantity } = request.body;
  
    if (itemName && quantity) {
        const command = `INSERT INTO cart_item (id, item_id, user_id, quantity, total_price_per_item, order_id) VALUES (
            $1::text,
            (SELECT id FROM items WHERE name = $2)::text,
            $3::text,
            $4::integer,
            ($4::integer * (SELECT price FROM items WHERE name = $2)::integer)::integer,
            (SELECT id FROM orders WHERE status = 'current' AND user_id = $3)::text
        ) 
        WHERE (SELECT * FROM cart_item WHERE item_id = (SELECT id FROM items WHERE name = $2)::text ) IS NULL
        RETURNING * `;
        const values = [uuid(), itemName, request.session.user.id, quantity];
        pool.query(command, values, (err, results) => {
            if (err) {
                response.status(400).json({...err})
            }
            if (results.rows.length <= 0) {
                response.status(404).json({message: "Something went wrong"})
            }
            else {
                response.json({message: "Item successful added",...results.rows[0]})
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
        pool.query("DELETE FROM cart_item WHERE item_id = (SELECT id FROM items WHERE name = $1)::text AND order_id = (SELECT id FROM orders  WHERE status = 'current' AND user_id = $2)::text RETURNING *", [ itemName, request.session.user.id] , (err, results) => {
            if (err) {
                response.status(400).json({message:err.message, ...err})
            }
            if (results.rows.length <= 0) {
                response.status(404).json({message: "Something went wrong"})
            }
            else {
                response.json({message: "Item successfully removed",...results.rows[0]})
            }
        });
    } else {
        response.status(400).json({message: "Invalid values"});
    }
};


const clearCart = (request, response) => {
    // UPDATE SCHEMA add item_name to cart_item
    pool.query("DELETE FROM cart_item WHERE order_id = (SELECT id FROM orders WHERE user_id = $1 AND status ='current')::text  RETURNING *", [request.session.user.id], (err, results)=> {
        if (err) {
            response.status(400).json({message:err.message, ...err})
        } else {
            response.status(204).json({message: "Cart item successful deleted"});
        }
    });
};

const changeCartItemQuantityByName = (request, response) => {
    // UPDATE SCHEMA cart_item.item_id Must be UINQUE
    const { itemName, quantity } = request.body;

    if (quantity == 0){
        removeFromCartByName(request, response)
    }
    if (itemName && quantity) {
        pool.query('UPDATE cart_item SET quantity = $1 WHERE item_id = (SELECT id FROM items WHERE name = $2)::text AND quantity <= (SELECT quantity FROM items WHERE name = $3)::int RETURNING *', [quantity, itemName, itemName], (err, results) =>{
            if (err) {
                response.status(400).json({message:err.message, ...err})
            }
            if (results.rows.length <= 0) {
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
        SET status = 'processed',
        total_price = (SELECT SUM(total_price) FROM cart_items)::int,
        total_quantity = (SELECT SUM(quantity) FROM cart_items)::int
        WHERE status = 'current' AND user_id = $1::text RETURNING *`;
    const values = [request.session.user.id];
    pool.query(command, values, (err, results) => {
        if (err) {
            response.status(400).json({message: err.message, ...err});
        } 
        if (results.rows.length == 0) {
            response.json({message: 'No content found'});
        } else {
            response.send(results.rows);
        }
    })
}

const getOrders = (request, response) => {
    const command = "SELECT * FROM orders WHERE user_id = $1";
    const values = [request.session.user.id];
    pool.query(command, values, (err, results) => {
        if (err) {
            response.status(400).json({message: err.message, ...err});
        } 
        if (results.rows.length == 0) {
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
    addToCartByName,
    removeFromCartByName,
    clearCart,
    changeCartItemQuantityByName,
    
    checkoutCart,
    getOrders,
};