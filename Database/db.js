// CRUD on products db
const { request, response } = require('express');
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
    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, results) => {
        // error
        if (err) {
            return response.status(404).json({message: err.message,  ...err})
        }
        //user not found
        if (results.rows.length == 0) {
            return response.status(404).json({message: "User Not found"})
        }

        const dbPassword = (results.rows[0]) ? results.rows[0].password: null;
        const inputPassword = password || null;
        if(dbPassword === inputPassword) {
            // send user a auth TOKEN across session
            request.session.authenticated = true;
            request.session.user = {...results.rows[0]};

            response.json({message: "Login successful",...results.rows[0]})
        } else {
            // Wrong password
            response.status(400).json({message: 'Wrong password'})
        }
    });
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
            response.status(404).json({message: "No cart found"})
        }
        else {
            response.send(results.rows)
        }
    })
}

const addToCartByName = (request, response) => {
    //#############    if cart item name already exists with current order id, then update existing cart item ####
    const { itemName, quantity } = request.body
    // valid values
    if (itemName && quantity) {
        pool.query("INSERT INTO cart_item (id, item_id, user_id, quantity, total_price_per_item, order_id) VALUES ($1, (SELECT id FROM items WHERE name = $2), $3, $4, ($5 * (SELECT price FROM items WHERE name = $6)),(SELECT id FROM orders WHERE status = 'current' AND user_id = $7)) RETURNING *", [uuid(),itemName, request.session.user.id,quantity ,quantity, itemName, request.session.user.id], (err, results) => {
            console.log(results)
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
/*const reduceCartItemQty = (request, response) => {
    // look for cart item with given name with current order id
    // quantity to reduce from existing cart item with current order id @  check if quantity given is not larger then existing cart item qty
    //if qty given is == qty in cart item then at the end redirect to removefromcart
    const { itemName, quantity } = request.body
    // valid values
    if (itemName && quantity) {
        pool.query("INSERT INTO cart_item (id, item_id, user_id, quantity, total_price_per_item, order_id) VALUES ($1, (SELECT id FROM items WHERE name = $2), $3, $4, ($5 * (SELECT price FROM items WHERE name = $6)),(SELECT id FROM orders WHERE status = 'current' AND user_id = $7)) RETURNING *", [uuid(),itemName, request.session.user.id,quantity ,quantity, itemName, request.session.user.id], (err, results) => {
            console.log(results)
           
};*/

const removeCartItem = (request, response) => {
    // look for cart item with given name with current order id
    const { itemName} = request.body
    console.log('item name: ' + JSON.stringify(itemName));
  
    // valid values
    if (itemName) {
            pool.query("DELETE FROM cart_item WHERE item_id = (SELECT id FROM items WHERE name = $1) AND order_id = (SELECT id FROM orders  WHERE status = 'current' AND user_id = $2)) RETURNING * ", [nm, request.session.user.id] , (err, results) => {

        
        console.log(results)
            if (err) {
                response.status(400).json({...err})
            }
           // if (results.rows.length <= 0) {
            //    response.status(404).json({message: "Something went wrong"})
            //}
            else {
                response.json({message: "Item successfully removed",...results.rows[0]})
            }
        });
    } else {
        response.status(400).json({message: "Invalid values"});
    }
};


module.exports = {
    createUser,
    getUserByEmail,
    setUserAtr,
    deleteUser,
    getShopItems,
    getItemByName,
    getCartsByUser,
    addToCartByName,
    removeCartItem

};