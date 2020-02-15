import os
import json
import sqlalchemy
from flask import Flask
from flask import request
from dotenv import load_dotenv
from sqlalchemy.sql import text
from sqlalchemy import create_engine
from flask_cors import CORS, cross_origin
# from flask_request_params import bind_request_params

load_dotenv()
app = Flask(__name__)
CORS(app)
# app.before_request(bind_request_params)

POSTGRES_URL = os.getenv("POSTGRES_URL")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PW = os.getenv("POSTGRES_PW")
POSTGRES_DB = os.getenv("POSTGRES_DB")

app.config['DEBUG'] = True

engine = create_engine('postgres://{}:{}@{}:5432/{}'.format(
POSTGRES_USER, POSTGRES_PW, 'localhost', POSTGRES_DB
))

@app.route('/', methods = ['GET', 'POST'])
def questions():
    if request.method == 'GET':
        conn = engine.connect()
        result = conn.execute('SELECT * FROM questions')
        conn.close()
        return json.dumps([dict(r) for r in result])
    if request.method == 'POST':
        conn = engine.connect()
        data = [
            {'title': json.loads(request.data.decode('utf-8'))['title'],'description': json.loads(request.data.decode('utf-8'))['description'],'answers': 0}
        ]
        for line in data:
            result = conn.execute(text("""INSERT INTO questions(title, description, answers) VALUES(:title, :description, :answers)"""), **line)
        conn.close()
        return ('', 200)

@app.route('/<id>', methods = ['GET', 'DELETE'])
@cross_origin()
def question(id):
    if request.method == 'GET':
        conn = engine.connect()
        result = conn.execute(text("""SELECT * FROM questions WHERE ID = {}""".format(id)))
        conn.close()
        response = [dict(r) for r in result]
        return json.dumps(response)
    if request.method == 'DELETE':
        conn = engine.connect()
        result = conn.execute(text("""DELETE FROM answers WHERE ID = {}""".format(id)))
        result = conn.execute(text("""DELETE FROM questions WHERE ID = {}""".format(id)))
        conn.close()
        return ('', 200)

@app.route('/answer/<id>', methods = ['GET', 'POST', 'DELETE'])
def answer(id):
    if request.method == 'GET':
        conn = engine.connect()
        result = conn.execute(text("""SELECT * FROM answers WHERE ID = {}""".format(id)))
        conn.close()
        response = [dict(r) for r in result]
        return json.dumps(response)

    if request.method == 'POST':
        conn = engine.connect()
        data = [{
            'id': id,
            'answer_content': json.loads(request.data.decode('utf-8'))['answer']
        }]
        for line in data:
            conn.execute(text("""INSERT INTO answers(id, answer_content) VALUES(:id, :answer_content)"""), **line)
            row_count = conn.execute(text(""" SELECT COUNT(*) FROM answers WHERE id = {}""".format(id))).fetchone()[0]
            conn.execute("""UPDATE questions SET answers = {} WHERE id = {}""".format(row_count, id))
        conn.close()
        return ('', 200)
    if request.method == 'DELETE':
        conn = engine.connect()
        question_id = conn.execute(text("""SELECT id FROM answers WHERE answer_id = {}""".format(id)))
        conn.execute(text("""DELETE FROM answers WHERE answer_id = {}""".format(id)))
        row_count = conn.execute(text(""" SELECT COUNT(*) FROM answers WHERE id = {}""".format(question_id.fetchone()[0])))
        conn.execute("""UPDATE questions SET answers = {} WHERE id = {}""".format(row_count.fetchone()[0], id))
        conn.close()
        return ('', 200)

if __name__ == "__main__":
    app.run()