const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');


//attempting to hook up postgres backend
const Pool = require('pg').Pool;

// express app
const app = express();

// mock database
const questions = [];

// use helmet to enhance app security
app.use(helmet());

// bodyparser to parse application/json content-type
app.use(bodyParser.json());

// enable CORS req's 
app.use(cors());

// log http reqs
app.use(morgan('combined'));

// db config
const pool = new Pool({
  user: 'madi.peters',
  host: 'localhost',
  database: 'qa_backend',
  port: 5432,
})

// db setup
  // create table questions (
  //   ID SERIAL PRIMARY KEY,
  // title VARCHAR(30),
  // description VARCHAR(100),
  // answers text[]
  // );
  // create table answers (
  //   answer_id SERIAL PRIMARY KEY,
  //   ID integer references questions,
  //   answer_content text
  // );
  

// retreive questions

app.get('/', (req, res) => {
  pool.query('SELECT * FROM questions', (error, results) => {
    if(error) {
      throw error;
    }
    res.status(200).json(results.rows)
  })
});


// get single question
app.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    pool.query('SELECT * FROM questions WHERE ID = $1', [id], (error, results) => {
    if(error) {
      throw error;
    }
    console.log('results', results.rows[0]);
    res.status(200).json(results.rows[0]);
  })
});

// get answers for a specific question
app.get('/answer/:id', (req, res) => {
  const id = parseInt(req.params.id);
  // AND answer_id = $2
  pool.query('SELECT * FROM answers WHERE ID = $1', [id], (error, results) => {
    if(error) {
      throw error;
    }
    console.log('question results', results.rows);
    res.status(200).json(results.rows);
  })
});


// security through Auth0
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://dev-o9n6r6qn.auth0.com/.well-known/jwks.json`
    }),
  
    // Validate the audience and the issuer.
    audience: 'WG2mhGyFw6ahAhwnYWVVREhM47uMQMPR',
    issuer: `https://dev-o9n6r6qn.auth0.com/`,
    algorithms: ['RS256']
  });
  

// insert a new question
app.post('/', checkJwt, (req, res) => {
    const {title, description} = req.body;
    let answers = '[]';
    pool.query('INSERT INTO questions (title, description, answers) VALUES ($1, $2, $3)', [title, description, answers], (error, results) =>{
      if (error) {
        throw error;
      }
      res.status(200).send();
    })
});


// insert a new answer to a question
app.post('/answer/:id', checkJwt, (req, res) =>{
    const {answer} = req.body;
    const id = parseInt(req.params.id);
    // insert into db
    pool.query('INSERT INTO answers (id, answer_content) VALUES ($1, $2)', [id, answer], (error, results) =>{
      if (error) {
        throw error;
      }
      res.status(200).send();
    })
});

// start server
app.listen(8081, () => {
    console.log('Listening on port 8081');
});
