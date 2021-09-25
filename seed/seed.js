const axios = require('axios');
const { users, tasks, messages } = require('./testdata');

users.forEach((user) => {
  const pieces = user.split(',');
  const body = {
    streetAddress: pieces[0],
    city: pieces[1],
    state: pieces[2],
    zipcode: pieces[3],
    neighborhood: pieces[4],
    firstName: pieces[5],
    lastName: pieces[6],
    password: pieces[7],
    email: pieces[8],
    imgUrl: pieces[9],
  };
  axios.post('http://localhost:3500/api/user', body)
    .catch((err) => {
      console.log('err seeding users', err.stack);
    });
});

tasks.forEach((task) => {
  const { userId, body } = task;
  axios.post(`http://localhost:3500/api/task/home/${userId}`, body)
    .catch((err) => {
      console.log('err seeding tasks', err.stack);
    });
});

messages.forEach((message) => {
  const { taskId, userId, body } = message;
  axios.post(`http://localhost:3500/api/messages/${taskId}/${userId}`, body)
    .catch((err) => {
      console.log('err seeding messages', err.stack);
    });
});
