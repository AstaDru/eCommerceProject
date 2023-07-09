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
            // send user a oauth TOKEN? 
            response.json({message: "Login successful",...results.rows[0]})
        } else {
            // Wrong password
            response.status(400).json({message: 'Wrong password'})
        }
    });
};

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
    getShopItems,

};