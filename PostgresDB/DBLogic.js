const { Pool, Client } = require('pg')
const pool = new Pool();

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

  var result = await pool.query('SELECT question_id, question_body, question_date, asker_name, question_helpfulness FROM questions WHERE product_id = $1 AND reported = 0 LIMIT $2', [prodId, count])

  var resultPromise = await Promise.all(result.rows.map(async (item) => {
    await pool.query(`SELECT answer_id, body, date, answerer_name, helpfulness FROM answers WHERE question_id = $1 AND reported = 0`, [item.question_id]).then(async data => {
      item.answers = {};
      for (var i = 0; i < data.rows.length; i++) {
        data.rows[i].date = new Date(parseInt(data.rows[i].date)).toLocaleDateString('sv').replace(/\//g, '-');
        item.answers[data.rows[i].answer_id] = data.rows[i];
        await pool.query(`SELECT id, url FROM pictures WHERE answer_id = $1`, [data.rows[i].answer_id]).then(photosData => {
          data.rows[i].photos = photosData.rows;
        })
        data.rows[i].id = data.rows[i].answer_id
        data.rows[i].answer_id = undefined;
      }
    })

    item.question_date = new Date(parseInt(item.question_date)).toLocaleDateString('sv').replace(/\//g, '-');
    return item;
  }))

  return {product_id: prodId, results: resultPromise};
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

  var results = await pool.query(`SELECT answer_id, body, date, answerer_name, helpfulness FROM answers WHERE question_id = $1 AND reported = 0 LIMIT $2`, [question_id, count]).then(async data => {
    for (var i = 0; i < data.rows.length; i++) {
      await pool.query(`SELECT id, url FROM pictures WHERE answer_id = $1`, [data.rows[i].answer_id]).then(photosData => {
        data.rows[i].photos = photosData.rows;
      })
    }
    return data.rows
  })
  for (var i = 0; i < results.length; i++) {
    results[i].date = new Date(parseInt(results[i].date)).toLocaleDateString('sv').replace(/\//g, '-');
  }
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