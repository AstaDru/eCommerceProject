const express = require('express')
const app = express()

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// render index.html on base url visit
app.use(express.static('public'));

const apiRouter = require('./Routes/router');
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> {
  console.log(`Listening on localhost:${PORT}`)
});