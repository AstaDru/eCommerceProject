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
    database: 'lorem',
    port: 5432
});


const createUser =  (request, response) => {
    const {name, surname, email, password, postCode, building, street} = request.body;
    const addressId = 7176;
    const command = 'INSERT INTO users (id, name, surname, email, password, address_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [uuid(), name, surname, email, password, addressId];

    pool.query(command, values, (err, results) => {
        if (!err) {
            response.json({...results.rows[0]});
        } else {
            response.status(400).json({message: err.message,  ...err})
        }
    })
};

const getUserByEmail = (request, response) => {
    // get user by email from users and compare password for auth
    const { email, password } = request.body;
    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, results) => {
        const dbPassword = results.rows[0].password || false;
        if (err) {
            response.status(404).json({message: err.message,  ...err})
        }
        else if(dbPassword === password) {
            // send user a oauth TOKEN? 
            response.json({...results.rows[0]})
        } else {
            response.status(400).json({message: 'Wrong password'})
        }
    });
};

const getShopItems = (request, response) => {
    pool.query('SELECT * FROM items', (err, results) => {
        if (!err) {
            response.json({data: results.rows[0]});
        } else {
            response.status(400).send(err)
        }
    });
};

module.exports = {
    createUser,
    getUserByEmail,
    getShopItems,

};