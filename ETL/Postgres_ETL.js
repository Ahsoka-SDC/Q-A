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

const fillDB = async () => {
  await client.query(`\COPY questions(question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness) FROM '/Users/banzubie/RFE2207/Q-A/ETL/questions.csv'  with (format csv, header true);`).then(() => console.log('All questions data added')).catch(err => console.log('Failed to add questions: ', err))

  await client.query(`\COPY answers(answer_id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness) FROM '/Users/banzubie/RFE2207/Q-A/ETL/answers.csv'  with (format csv, header true);`).then(() => console.log('All answers data added')).catch(err => console.log('Failed to add answers: ', err))

  await client.query(`\COPY pictures(id, answer_id, url) FROM '/Users/banzubie/RFE2207/Q-A/ETL/answers_photos.csv'  with (format csv, header true);`).then(() => console.log('All pictures data added')).catch(err => console.log('Failed to add pictures: ', err))

  await client.end();
}
fillDB();