// main routers handler (requests controller)
const express = require('express');
const session = require('express-session');
const { createUser, getUserByEmail, setUserAtr, deleteUser, getShopItems, getItemByName, getCartsByUser, addToCartByName } = require('../Database/db');

const apiRouter = express.Router();

const store = new session.MemoryStore()
apiRouter.use(session({
    secret: 'secretKey',
    cookie: {
        maxAge: 24*60*60*1000/* 1day?*/,
        secure: false
    },
    saveUninitialized: false,
    resave: false,
    store
}));

apiRouter.use((req, res, next)=>{
    // Request Logger
    
    next();
})

const isAuthenticated = (req, res, next) => {
    if (req.session.authenticated) {
        return next()
    }
    res.status(403).json({message: 'Not authenticated'})
}

const endSession = (req, res) => {
    req.session = null;
    res.redirect('/api/browse');
};

apiRouter.post('/register', createUser);

apiRouter.post('/login', getUserByEmail);

apiRouter.get('/logout', endSession);

apiRouter.put('/settings', isAuthenticated, setUserAtr);

apiRouter.delete('/deleteuser', isAuthenticated, deleteUser);

apiRouter.get('/browse', getShopItems);

apiRouter.get('/browse/:itemName', getItemByName);

apiRouter.get('/cart', isAuthenticated, getCartsByUser)

apiRouter.post('/addtocart', isAuthenticated, addToCartByName)

apiRouter.delete('/removefromcart', isAuthenticated)

apiRouter.post('/checkout', isAuthenticated)

apiRouter.get('/orders', isAuthenticated)


module.exports = apiRouter