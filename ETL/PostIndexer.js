const { Client } = require('pg')

const client = new Client()

client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

const makeIndexes = async () => {

  await (client.query(`DROP INDEX IF EXISTS find_product_id_idx, find_question_id_idx, find_answer_id_idx CASCADE;`))

  await client.query(`CREATE INDEX find_product_id_idx ON questions (product_id);`).then(() => {
    console.log('Finished questions')
  }).catch(err => console.log('Index questions failed: ', err))
  await client.query(`CREATE INDEX find_question_id_idx ON answers (question_id);`).then(() => {
    console.log('Finished answers')
  }).catch(err => console.log('Index answers failed: ', err))
  await client.query(`CREATE INDEX find_answer_id_idx ON pictures (answer_id);`).then(() => {
    console.log('Finished pictures')
  }).catch(err => console.log('Index pictures failed: ', err))

  await client.end().then(() => console.log('Connection comepleted'))

}
makeIndexes();