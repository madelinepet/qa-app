import React, {Component} from 'react';
import axios from 'axios';
import SubmitAnswer from './SubmitAnswer';
import auth0Client from '../Auth';

var renderAnswers = [];
class Question extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
      answer: null,
    };

    this.submitAnswer = this.submitAnswer.bind(this);
  }

  async componentDidMount() {
    await this.refreshQuestion();
  }

  async refreshQuestion() {
    const { match: { params } } = this.props;
    const question = (await axios.get(`http://localhost:8081/${params.questionId}`)).data;
    const answers = (await axios.get(`http://localhost:8081/answer/${params.questionId}`)).data;
    console.log('!@@$%%', answers);
    renderAnswers = []
;    for(let attr of answers){
      renderAnswers.push(attr['answer_content']);
    }
    console.log(renderAnswers);
    this.setState({
      question,
      answers
    });
  }

  async submitAnswer(answer) {
    await axios.post(`http://localhost:8081/answer/${this.state.question.id}`, {
      answer,
    }, {
      headers: { 'Authorization': `Bearer ${auth0Client.getIdToken()}` }
    });
    await this.refreshQuestion();
  }
  render() {
    const {question, answers} = this.state;
    if (question === null) return <p>Loading ...</p>;
    return (
      <div className="container">
        <div className="row">
          <div className="jumbotron col-12">
            <h1 className="display-3">{question.title}</h1>
            <p className="lead">{question.description}</p>
            <hr className="my-4" />
            <SubmitAnswer questionId={question.id} submitAnswer={this.submitAnswer} />
            <p>Answers:</p>
            {
              renderAnswers.map((answer, idx) => (
                <p className="lead" key={idx}>{answer}</p>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Question;