// main routers handler (requests controller)
const express = require('express');
const session = require('express-session');
const { createUser, getUserByEmail, setUserAtr, deleteUser, getShopItems, getItemByName, addToCartByName } = require('../Database/db');

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
    console.log(`${req.method} -> ${req.url} Auth:${req.session.authenticated}`);
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

apiRouter.get('/deleteuser', isAuthenticated, deleteUser);

// Need fix
apiRouter.get('/browse:name', getItemByName);

apiRouter.get('/browse', getShopItems);

apiRouter.put('/addtocart', isAuthenticated, addToCartByName)

apiRouter.put('/removefromcart', isAuthenticated)

apiRouter.post('/checkout', isAuthenticated)

apiRouter.get('/orders', isAuthenticated)


module.exports = apiRouter