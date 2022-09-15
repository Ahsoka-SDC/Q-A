const { Client } = require('pg')

const client = new Client()

client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

const makeTables = async () => {
  await client.query('DROP TABLE IF EXISTS questions, answers, pictures CASCADE');

  await client.query(`CREATE TABLE questions (
        question_id     SERIAL PRIMARY KEY UNIQUE,
        product_id      INT,
        question_body   text,
        question_date   text,
        asker_name      text,
        asker_email     text,
        reported        INT,
        question_helpfulness         INT
        );`).then(res => {
          console.log('Questions created!')
        }).catch(err => {
          console.log('Table Creation failed: ', err)
        })

  await client.query(`CREATE TABLE answers (
        answer_id     SERIAL PRIMARY KEY,
        question_id      INT REFERENCES questions(question_id),
        body            text,
        date    text,
        answerer_name      text,
        answerer_email     text,
        reported        int,
        helpfulness         int
        );`).then(res => {
          console.log('Answers created!')
        }).catch(err => {
          console.log('Table Creation failed: ', err)
        })

  await client.query(`CREATE TABLE pictures (
        id    SERIAL UNIQUE,
        answer_id     INT REFERENCES answers(answer_id),
        url           text
        )`).then(res => {
          console.log('Pictures created!')
        }).catch(err => {
          console.log('Table Creation failed: ', err)
        })

  await client.end();
}

makeTables();