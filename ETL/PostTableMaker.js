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
        client.end();
      }).catch(err => {
        console.log('Table Creation failed: ', err)
        client.end();
      })

// client.query(`CREATE TABLE answers (
//       question_id     int,
//       product_id      int,
//       body            text,
//       date_written    text,
//       asker_name      text,
//       asker_email     text,
//       reported        int,
//       helpful         int
//       );`).then(res => {
//         console.log('Table created!')
//       }).catch(err => {
//         console.log('Table Creation failed: ', err)
//       })
//id,question_id,body,date_written,answerer_name,answerer_email,reported,helpful
