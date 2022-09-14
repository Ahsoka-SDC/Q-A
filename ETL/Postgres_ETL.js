const fs = require('fs');
const Papa = require('papaparse');
const { Client } = require('pg')

const client = new Client()
const questionFilePath = './questions.csv'

const readCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath)
  const csvData = csvFile.toString()
  return new Promise(resolve => {
    Papa.parse(csvData, {
      header: true,
      complete: results => {
        console.log('Complete', results.data.length, 'records.');
        resolve(results.data);
      }
    });
  });
};

client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

const addQestion = async (item) => {
  return await client.query(`INSERT INTO questions VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
        Number(item.id),
        Number(item.product_id),
        item.body,
        item.date_written,
        item.asker_name,
        item.asker_email,
        Number(item.reported),
        Number(item.helpful)
      ])
}

readCSV(questionFilePath).then(res => {
  res.forEach(row => {
    addQestion(row)
    .then(res => {
        console.log('Item added!')
      }).catch(err => {
        console.log('failed to add item: ', err)
        client.end();
      })
    })
  })