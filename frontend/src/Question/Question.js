import React, {Component} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import SubmitAnswer from './SubmitAnswer';
import DeleteQuestion from './DeleteQuestion'
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
    this.deleteQuestion = this.deleteQuestion.bind(this);
  }

  async componentDidMount() {
    await this.refreshQuestion();
  }

  async refreshQuestion() {
    const { match: { params } } = this.props;
    const question = (await axios.get(`http://localhost:8081/${params.questionId}`)).data;
    const answers = (await axios.get(`http://localhost:8081/answer/${params.questionId}`)).data;
    renderAnswers = [];
;    for(let attr of answers){
      renderAnswers.push(attr['answer_content']);
    }
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

  async deleteQuestion(){
    await axios.delete(`http://localhost:8081/${this.state.question.id}`);
    this.props.history.push('/');
  }

  render() {
    const {question} = this.state;
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
          <div className="delete">
          <DeleteQuestion deleteQuestion={this.deleteQuestion}/>
          </div>
          
        </div>
      </div>
    )
  }
}

export default withRouter(Question);