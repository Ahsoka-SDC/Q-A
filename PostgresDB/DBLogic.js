require('dotenv').config()
const { Pool, Client } = require('pg')
const pool = new Pool({
  host: 'ec2-52-35-215-145.us-west-2.compute.amazonaws.com',
  port: '5432',
  user: 'ubuntu',
  password: 'password',
  database: 'banzubie'
});

pool.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('Pool open')
    poolOpen = true;
  }
})

// <--------------- QUESTION LOGIC ----------------->
const getQuestions = async (prodId, count = 5) => {

  var prodQuestions = await pool.query('SELECT q.question_id, q.question_body, q.question_date, q.asker_name, q.question_helpfulness, a.answer_id, a.body, a.date, a.answerer_name, a.helpfulness, p.id, p.url FROM questions q JOIN answers a ON q.question_id = a.question_id JOIN pictures p ON a.answer_id = p.answer_id WHERE q.product_id = $1 AND a.reported = 0 AND q.reported = 0 LIMIT $2;', [prodId, count])

  var results = [];
  var obj = { reported: false, answers: {} };
  prodQuestions.rows.forEach(row => {
    if (obj.question_id && row.question_id !== obj.question_id) {
      results.push(obj);
      obj = { reported: false, answers: {} };
    }
    obj.question_id = row.question_id;
    obj.question_body = row.question_body;
    obj.question_date = new Date(parseInt(row.question_date)).toLocaleDateString('sv').replace(/\//g, '-');
    obj.asker_name = row.asker_name;
    obj.question_helpfulness = row.question_helpfulness;
    obj.answers[row.answer_id] = {
      id: row.answer_id,
      body: row.body,
      date: new Date(parseInt(row.date)).toLocaleDateString('sv').replace(/\//g, '-'),
      answerer_name: row.answerer_name,
      helpfulness: row.helpfulness,
      photos: []
    }
    if (row.url) {
      obj.answers[row.answer_id].photos.push({id: row.id, url: row.url});
    }
  })

  return {product_id: prodId, results: results};
}

const addQuestion = async ({ body, name, email, product_id }) => {
  await pool.query(`INSERT INTO questions (product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness) VALUES ( $1, $2, $3, $4, $5, 0, 0);`, [product_id, body, new Date().getTime(), name, email])
}

const helpfulQuestion = async (question_id) => {
  return await pool.query(`UPDATE questions SET question_helpfulness = question_helpfulness + 1 WHERE question_id = $1;`, [question_id])
}

const reportQuestion = async (question_id) => {
  return await pool.query(`UPDATE questions SET reported = 1 WHERE question_id = $1;`, [question_id])
}
// <--------------- ANSWERS LOGIC ----------------->

const getAnswers = async (question_id, count = 5, page = 0) => {

  var questionAnswers = await pool.query(`SELECT a.answer_id, a.body, a.date, a.answerer_name, a.helpfulness, p.id, p.url FROM answers a JOIN pictures p ON a.answer_id = p.answer_id WHERE question_id = $1 AND reported = 0 LIMIT $2`, [question_id, count])
  var results = [];
  var obj = { photos: [] };
  questionAnswers.rows.forEach(row => {
    if (obj.answer_id && obj.answer_id !== row.answer_id) {
      results.push(obj);
      obj = { photos: [] }
    }
    obj.answer_id = row.answer_id;
    obj.body = row.body;
    obj.date = new Date(parseInt(row.date)).toLocaleDateString('sv').replace(/\//g, '-');
    obj.answerer_name = row.answerer_name;
    obj.helpfulness = row.helpfulness;
    if (row.url) {
      obj.photos.push({id: row.id, url: row.url});
    }
  })

  return {question: question_id, page: page, count: count, results: results};
}

const addAnswer = async ( { question_id }, {body, name, email, photos}) => {

  var lastId = await pool.query(`INSERT INTO answers (question_id, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES ( $1, $2, $3, $4, $5, 0, 0) RETURNING answer_id;`, [question_id, body, new Date().getTime(), name, email])
  lastId = lastId.rows[0].answer_id;

  await photos.forEach(async (url) => {
    await pool.query(`INSERT INTO pictures (answer_id, url) VALUES ($1, $2);`, [lastId, url])
  })
}

const helpfulAnswer = async (answer_id) => {
  return await pool.query(`UPDATE answers SET helpfulness = helpfulness + 1 WHERE answer_id = $1;`, [answer_id])
}

const reportAnswer = async (answer_id) => {
  return await pool.query(`UPDATE answers SET reported = 1 WHERE answer_id = $1;`, [answer_id])
}

module.exports = { getQuestions, addQuestion, helpfulQuestion, reportQuestion, getAnswers, addAnswer, helpfulAnswer, reportAnswer}