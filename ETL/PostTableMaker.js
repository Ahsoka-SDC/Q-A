const { Client } = require('pg')

const client = new Client()

client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

client.query('DROP TABLE questions');
client.query('DROP TABLE answers');

client.query(`CREATE TABLE questions (
      question_id     int UNIQUE,
      product_id      int,
      body            text,
      date_written    text,
      asker_name      text,
      asker_email     text,
      reported        int,
      helpful         int
      );`).then(res => {
        console.log('Table created!')
      }).catch(err => {
        console.log('Table Creation failed: ', err)
        //client.end();
      })

client.query(`CREATE TABLE answers (
      answer_id     int,
      question_id      int,
      body            text,
      date_written    text,
      answerer_name      text,
      answerer_email     text,
      reported        int,
      helpful         int
      );`).then(res => {
        console.log('Table created!')
      }).catch(err => {
        console.log('Table Creation failed: ', err)
        //client.end();
      })
