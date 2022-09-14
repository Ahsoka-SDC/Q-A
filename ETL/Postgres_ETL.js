const fs = require('fs');
const { Client } = require('pg')

const client = new Client()


client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

client.query(`\COPY questions(question_id, product_id, body, date_written, asker_name, asker_email, reported, helpful) FROM '/Users/banzubie/RFE2207/Q-A/ETL/questions.csv'  with (format csv, header true);`).then(() => console.log('All data added')).catch(err => console.log('Failed to add all: ', err))

client.query(`\COPY answers(answer_id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful) FROM '/Users/banzubie/RFE2207/Q-A/ETL/answers.csv'  with (format csv, header true);`).then(() => console.log('All data added')).catch(err => console.log('Failed to add all: ', err))
