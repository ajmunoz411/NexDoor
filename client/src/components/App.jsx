import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import SignUp from './SignUp';
import HelpfulFeed from './Helpful/HelpfulFeed';
import LogIn from './LogIn';
import Auth from './Auth';
import Active from './ActiveTask/Active';

const url = 'http://localhost:3500';

const App = () => {
  const dispatch = useDispatch();
  // const getTasks = async () => {
  //   const result = await axios.get(`${url}/api/tasks/15`)
  //     .then((res) => res);
  //   return result;
  // };

  const getTasks = () => {
    axios.get(`${url}/api/tasks/15`)
      .then(({ data }) => dispatch({ type: 'SET_TASKS', tasks: data }));
  };

  const getRequests = () => {
    // user id param hardcoded until session component completed
    axios.get(`${url}/api/tasks/req/37`)
      .then(({ data }) => dispatch({ type: 'SET_REQUESTS', requests: data }));
  };

  const getMyTasks = () => {
    // user id param hardcoded until session component completed
    axios.get(`${url}/api/tasks/help/35`)
      .then(({ data }) => dispatch({ type: 'SET_MY_TASKS', myTasks: data }));
  };

  useEffect(() => {
    getTasks();
    getRequests();
    getMyTasks();
  });

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/signup" component={SignUp} />
          <Route path="/helpfulfeed" component={HelpfulFeed} />
          <Route path="/active" component={Active} />
          <Route path="/login" component={LogIn} />
          <Route path="/Auth" component={Auth} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
