const { Pool, Client } = require('pg')
const pool = new Pool();
const client = new Client();

var poolOpen = false;

const getQuestions = async (prodId, count = 5) => {

  if (!poolOpen) {
    await pool.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
        poolOpen = true;
      }
    })
  }

  var result = await pool.query('SELECT question_id, question_body, question_date, asker_name, question_helpfulness FROM questions WHERE product_id = $1 AND reported = 0 LIMIT $2', [prodId, count])

  var resultPromise = await Promise.all(result.rows.map(async (item) => {
    await pool.query(`SELECT answer_id, body, date, answerer_name, helpfulness FROM answers WHERE question_id = $1 AND reported = 0`, [item.question_id]).then(async data => {
      item.answers = {};
      for (var i = 0; i < data.rows.length; i++) {
        item.answers[data.rows[i].answer_id] = data.rows[i];
        await pool.query(`SELECT id, url FROM pictures WHERE answer_id = $1`, [data.rows[i].answer_id]).then(photosData => {
          data.rows[i].photos = photosData.rows;
        })
        data.rows[i].id = data.rows[i].answer_id
        data.rows[i].answer_id = undefined;
      }
    })
    return item;
  }))

  return {product_id: prodId, results: resultPromise};
}

const getAnswers = async (question_id, count = 5, page = 0) => {

  if (!poolOpen) {
    await pool.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
        poolOpen = true;
      }
    })
  }

  var results = await pool.query(`SELECT answer_id, body, date, answerer_name, helpfulness FROM answers WHERE question_id = $1 AND reported = 0 LIMIT $2`, [question_id, count]).then(async data => {
    console.log(data.rows)
    for (var i = 0; i < data.rows.length; i++) {
      await pool.query(`SELECT id, url FROM pictures WHERE answer_id = $1`, [data.rows[i].answer_id]).then(photosData => {
        console.log('photo: ', photosData.rows)
        data.rows[i].photos = photosData.rows;
      })
    }
    return data.rows
  })
  console.log(results)
  return {question: question_id, page: page, count: count, results: results};
}

const addAnswer = async ( { question_id }, {body, name, email, photos}) => {

  if (!poolOpen) {
    await pool.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
        poolOpen = true;
      }
    })
  }

  var lastId = await pool.query(`SELECT MAX(answer_id) FROM answers`)
  lastId = lastId.rows[0].max + 1;
  console.log(lastId)

  await pool.query(`INSERT INTO answers (answer_id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, 0, 0);`, [lastId, question_id, body, new Date(), name, email])

  await photos.forEach(async (url) => {
    var newId = await pool.query(`SELECT MAX(id) FROM pictures`)
    newId = newId.rows[0].max + 1;
    await pool.query(`INSERT INTO pictures (id, answer_id, url) VALUES ($1, $2, $3);`, [newId, lastId, url]).then(() => {
      console.log('pictures added')
    })
  })
}

module.exports = { getQuestions, getAnswers, addAnswer }