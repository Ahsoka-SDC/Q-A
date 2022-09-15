const { Pool, Client } = require('pg')
const pool = new Pool();
const client = new Client();

var poolOpen = false;

const getQuestions = async (prodId) => {

  if (!poolOpen) {
    pool.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
        poolOpen = true;
      }
    })
  }

  var result = await pool.query('SELECT question_id, question_body, question_date, asker_name, question_helpfulness FROM questions WHERE product_id = $1 AND reported = 0', [prodId])

  var resultPromise = await Promise.all(result.rows.map(async (item) => {
    await pool.query(`SELECT answer_id, body, date, answerer_name, helpfulness FROM answers WHERE question_id = $1 AND reported = 0`, [item.question_id]).then(async data => {
      item.answers = {};
      for (var i = 0; i < data.rows.length; i++) {
        item.answers[data.rows[i].answer_id] = data.rows[i];
        await pool.query(`SELECT id, url FROM pictures WHERE answer_id = $1`, [data.rows[i].answer_id]).then(photosData => {
          data.rows[i].photos = photosData.rows;
        })
      }
    })
    return item;
  }))

  return {product_id: prodId, results: resultPromise};
}

module.exports = { getQuestions }