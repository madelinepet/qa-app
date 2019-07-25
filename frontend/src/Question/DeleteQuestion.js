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
          className="btn btn-secondary"
          onClick={() => {this.submit()}}>
          Delete Question
        </button>
      </Fragment>
    )
  }
}

export default withRouter(DeleteQuestion);