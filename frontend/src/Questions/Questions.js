import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

var answers = 0;
class Questions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            questions: null,
            // answers: null,
        };
    }
    async componentDidMount() {
        // const { match: { params } } = this.props;
        const questions = (await axios.get('http://localhost:8081')).data;
        // const answersArr = (await axios.get(`http://localhost:8081/answer/${params.questionId}`)).data;
        // answers = answersArr.length;
        // console.log(answers);
        this.setState({
            questions,
            
            // answers,
        });
    }
    render() {
        return (
            <div className="container">
                <div className="row">
                <Link to="/new-question">
                    <div className="card text-white bg-success mb-3">
                    <div className="card-header">Need help? Ask here!</div>
                    <div className="card-body">
                        <h4 className="card-title">+ New Question</h4>
                        <p className="card-text">Don't worry. Help is on the way!</p>
                    </div>
                    </div>
          </Link>
                {this.state.questions === null && <p>Loading questions...</p>}
                {
                    this.state.questions && this.state.questions.map(question => (
                    <div key={question.id} className="col-sm-12 col-md-4 col-lg-3">
                        <Link to={`/question/${question.id}`}>
                        <div className="card text-white bg-success mb-3">
                            <div className="card-header">Answers: {answers}</div>
                            <div className="card-body">
                            <h4 className="card-title">{question.title}</h4>
                            <p className="card-text">{question.description}</p>
                            </div>
                        </div>
                        </Link>
                    </div>
                    ))
                }
            </div>
      </div>
        )
    }
}

export default Questions;