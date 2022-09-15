const express = require('express');
const app = express();
const { getQuestions } = require('../PostgresDB/DBLogic.js')

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/qa/questions', (req, res) => {
  getQuestions(req.query.product_id).then(data => {
    res.status(200);
    res.send(data);
  }).catch(err => {
    console.log('GET error: ', err);
    res.sendStatus(404);
  })
})


const port = 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})