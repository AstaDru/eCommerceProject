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

const getShopItemsByName = (request, response) => {
    const { name } = request.body;
    pool.query('SELECT * FROM items WHERE name = $1', [name], (err, results) => {
        if (!err) {
            response.send(results.rows);
        } else {
            response.status(404).json({message: err.message,  ...err})
        }
    });
};

const addByNameToCart = (request, response) => {
    const { name, quantity } = request.body;
    const command = 'WITH alias AS (SELECT id, price FROM items WHERE name = $1) INSERT INTO cart_item (id, cart_id, item_id, quantity1) VALUES ($1, alias.id, alias.price, )';
    const values = [name];
    pool.query('', (err, results) => {
        if (!err) {
            response.send(results.rows);
        } else {
            response.status(404).json({message: err.message,  ...err})
        }
    });
};

module.exports = {
    createUser,
    getUserByEmail,
    setUserAtr,
    deleteUser,
    getShopItems,

};