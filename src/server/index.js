require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/rover', (req, res) => {
    const {roverName, date} = req.query;
    // Mock data
    // return import("./rover.json", {
    //   assert: {
    //     type: "json",
    //   }
    // })
    // .then(response => {
    //   console.log(response);
    //   res.send(response?.default?.rovers)
    // });
    const url = roverName
     ? `${process.env.ROVER_PHOTOS_BASE_URL}/${roverName}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`
     : `${process.env.ROVERS_BASE_URL}?api_key=${process.env.API_KEY}`
    
     return fetch(url)
        .then(result => result.json())
        .then(response => {
          return res.send(response)
        })
        .catch(err => {
          console.log('error:', err);
        })
})

app.listen(port, () => console.log(`App listening on port ${port}!`))