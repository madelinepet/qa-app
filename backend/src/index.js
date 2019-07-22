const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

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

// retreive questions

app.get('/', (req, res) => {
    console.log('retreiving questions');
    const qs = questions.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        answers: q.answers.length,
    }));
    res.send(qs);
});


// get single question
app.get('/:id', (req, res) => {
    const question = questions.filter(q => (q.id === parseInt(req.params.id)));
    if(question.length > 1) return res.status(500).send();
    if (question.length === 0) return res.status(404).send();
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
    console.log('posting question');
    const {title, description} = req.body;
    const newQuestion = {
        id: questions.length + 1,
        title,
        description,
        answers: [],
        author: req.user.name,
    };
    questions.push(newQuestion);
    res.status(200).send();
});

// insert a new answer to a question
app.post('/answer/:id', checkJwt, (req, res) => {
    const {answer} = req.body;
  
    const question = questions.filter(q => (q.id === parseInt(req.params.id)));
    if (question.length > 1) return res.status(500).send();
    if (question.length === 0) return res.status(404).send();
  
    question[0].answers.push({
      answer,
      author: req.user.name,
    });
  
    res.status(200).send();
  });

// start server
app.listen(8081, () => {
    console.log('Listening on port 8081');
});