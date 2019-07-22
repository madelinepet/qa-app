const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

// insert a new question
app.post('/', (req, res) => {
    console.log('posting question');
    const {title, description} = req.body;
    const newQuestion = {
        id: questions.length + 1,
        title,
        description,
        answers: []
    };
    questions.push(newQuestion);
    res.status(200).send();
});

// insert a new answer to a question
app.post('/answer/:id', (req, res) => {
    const {answer} = req.body;
  
    const question = questions.filter(q => (q.id === parseInt(req.params.id)));
    if (question.length > 1) return res.status(500).send();
    if (question.length === 0) return res.status(404).send();
  
    question[0].answers.push({
      answer,
    });
  
    res.status(200).send();
  });

// start server
app.listen(8081, () => {
    console.log('Listening on port 8081');
});