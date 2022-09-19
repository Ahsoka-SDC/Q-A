const express = require('express');
const morgan = require('morgan');
const app = express();
const { getQuestions, addQuestion, helpfulQuestion, reportQuestion, getAnswers, addAnswer, helpfulAnswer, reportAnswer } = require('../PostgresDB/DBLogic.js')

app.use(express.json());
// app.use(morgan('dev'))


//get questions
app.get('/qa/questions', (req, res) => {
  getQuestions(req.query.product_id, req.query.count).then(data => {
    res.status(200);
    res.send(data);
  }).catch(err => {
    console.log('GET error: ', err);
    res.sendStatus(404);
  })
})

//add question
app.post('/qa/questions', (req, res) => {
  addQuestion(req.body).then(() => {
    res.sendStatus(201);
  }).catch(err => {
    console.log('POST error: ', err);
    res.sendStatus(404);
  })
})

//mark question as helpful
app.put('/qa/questions/:question_id/helpful', (req, res) => {
  helpfulQuestion(req.params.question_id).then(() => {
    res.sendStatus(204);
  }).catch(err => {
    console.log('PUT error: ', err);
    res.sendStatus(404);
  })
})

//report question
app.put('/qa/questions/:question_id/report', (req, res) => {
  reportQuestion(req.params.question_id).then(() => {
    res.sendStatus(204);
  }).catch(err => {
    console.log('PUT error: ', err);
    res.sendStatus(404);
  })
})

//get answers
app.get('/qa/questions/:question_id/answers', (req, res) => {
  getAnswers(req.params.question_id, req.query.count).then(data => {
    res.status(200);
    res.send(data);
  }).catch(err => {
    console.log('GET error: ', err);
    res.sendStatus(404);
  })
})

//add answer
app.post('/qa/questions/:question_id/answers', (req, res) => {
  addAnswer(req.params, req.body).then(() => {
    res.sendStatus(201);
  }).catch(err => {
    console.log('POST error: ', err);
    res.sendStatus(404);
  })
})

//mark answer as helpful
app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  helpfulAnswer(req.params.answer_id).then(() => {
    res.sendStatus(204);
  }).catch(err => {
    console.log('PUT error: ', err);
    res.sendStatus(404);
  })
})

//report answer
app.put('/qa/answers/:answer_id/report', (req, res) => {
  reportAnswer(req.params.answer_id).then(() => {
    res.sendStatus(204);
  }).catch(err => {
    console.log('PUT error: ', err);
    res.sendStatus(404);
  })
})

const port = 3000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

server.keepAliveTimeout = 10;
server.headersTimeout = 11;