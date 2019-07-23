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
  // answers varchar(1000)
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


// // get single question
// app.get('/:id', (req, res) => {
//     const id = parseInt(req.params.id);
//     pool.query('SELECT * FROM questions WHERE ID = $1', [id], (error, results) => {
//     if(error) {
//       throw error;
//     }
//     console.log('results', results.rows[0].title)
//     res.status(200).json(results.rows);
//   })
// });

// get single question
app.get('/:id', (req, res) => {
  const question = questions.filter(q => (q.id === parseInt(req.params.id)));
  if(question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();
  console.log(question[0]);
  res.send(question[0]);
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
    let answers = [];
    pool.query('INSERT INTO questions (title, description, answers) VALUES ($1, $2, $3)', [title, description, answers], (error, results) =>{
      if (error) {
        throw error;
      }
      res.status(200).send();
    })
});


// insert a new answer to a question
app.post('/answer/:id', checkJwt, (req, res) => {
    const {answer} = req.body;
    const id = parseInt(req.params.id);
  
    const question = pool.query('SELECT * FROM questions', (error, results) => {
      if(error) {
        throw error;
      }
    });
    console.log('question', question);
    if (question.length > 1) return res.status(500).send();
    if (question.length === 0) return res.status(404).send();

    const answers = pool.query('SELECT answers FROM questions WHERE ID = $1', [id], (error, results) => {
      if(error) {
        throw error;
      }
    });
    answers.push(answer);

    // add back to db
    pool.query('UPDATE questions SET answers = $1 WHERE id = $2', [answers, id], (error, results) =>{
      if (error) {
        throw error;
      }
      res.status(200).send();
    })
});

// // insert a new answer to a question
// app.post('/answer/:id', checkJwt, (req, res) => {
//   const {answer} = req.body;

//   const question = questions.filter(q => (q.id === parseInt(req.params.id)));
//   if (question.length > 1) return res.status(500).send();
//   if (question.length === 0) return res.status(404).send();

//   question[0].answers.push({
//     answer,
//     author: req.user.name,
//   });

//   res.status(200).send();
// });


// start server
app.listen(8081, () => {
    console.log('Listening on port 8081');
});

