#QA APP
#### A React app created from https://auth0.com/blog/react-tutorial-building-and-securing-your-first-app/ with an added Postgres backend.


## Getting Started
### Start the server by running `node src` from the backend folder.

### Run `npm start` from the frontend folder to start the react app. If it doesn't open automatically, go to localhost:3000.
### Change user in backend/src/index.js/pool to match your postgres username.

Create two tables in your local Postgres database:

`questions`:
``` create table questions (
     ID SERIAL PRIMARY KEY,
   title VARCHAR(30),
   description VARCHAR(100),
   answers text[]
   );
```
`answers`:   
  ``` create table answers (
     answer_id SERIAL PRIMARY KEY,
     ID integer references questions,
     answer_content text
   );
   ```