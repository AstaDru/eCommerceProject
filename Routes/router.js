// main routers handler (requests controller)
const express = require('express');
const { createUser, getUserByEmail, getShopItems } = require('../Database/db');

// adding express-session?

const apiRouter = express.Router();
apiRouter.use((req, res, next)=>{
    console.log(`${req.method} -> ${req.url}`);
    next();
})

const isAuthenticated = (req, res, next) => {
    next()
}

apiRouter.get('/browse', getShopItems);

apiRouter.post('/register', createUser);

apiRouter.post('/login', getUserByEmail);

apiRouter.put('/addtocart', isAuthenticated)
apiRouter.put('/removefromcart', isAuthenticated)
apiRouter.post('/checkout', isAuthenticated)
apiRouter.get('/orders', isAuthenticated)
apiRouter.put('/settings', isAuthenticated)


module.exports = apiRouter