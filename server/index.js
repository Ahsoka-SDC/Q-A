const express = require('express');
const app = express();
const { getQuestions, getAnswers, addAnswer } = require('../PostgresDB/DBLogic.js')

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/qa/questions', (req, res) => {
  getQuestions(req.query.product_id, req.query.count).then(data => {
    res.status(200);
    res.send(data);
  }).catch(err => {
    console.log('GET error: ', err);
    res.sendStatus(404);
  })
})

app.get('/qa/questions/:question_id/answers', (req, res) => {
  getAnswers(req.params.question_id, req.query.count).then(data => {
    res.status(200);
    res.send(data);
  }).catch(err => {
    console.log('GET error: ', err);
    res.sendStatus(404);
  })
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  addAnswer(req.params, req.body).then(() => {
    res.sendStatus(201);
  }).catch(err => {
    console.log('POST error: ', err);
    res.sendStatus(404);
  })
})


const port = 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})