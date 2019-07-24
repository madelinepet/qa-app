import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import auth0Client from '../Auth';

class DeleteQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      answer: '',
    };
  }

  // updateAnswer(value) {
  //   this.setState({
  //     answer: value,
  //   });
  // }

  submit() {
    this.props.deleteQuestion(this.state.answer);

    this.setState({
      answer: '',
    });
  }

  render() {
    if (!auth0Client.isAuthenticated()) return null;
    return (
      <Fragment>
        <div className="form-group text-center">
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {this.submit()}}>
          Delete Question
        </button>
        <hr className="my-4" />
      </Fragment>
    )
  }
}

export default withRouter(DeleteQuestion);