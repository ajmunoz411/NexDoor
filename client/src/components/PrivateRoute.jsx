import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
// import currentUser from './AppReducers/currentUserReducer';

export default function PrivateRoute({ children, ...rest }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const userData = useSelector((store) => store.currentUserReducer.userData);
  const dispatch = useDispatch();

  function checkForSession() {
    // console.log(document.cookie);
    axios.get('http://localhost:3500/api/users/session', {
      headers: { 'content-type': 'application/json' },
      withCredentials: true,
    })
      .then((response) => {
        const userId = response.data.user_id;
        axios.get(`http://localhost:3500/api/users/info/${userId}`)
          .then((response2) => {
            dispatch({ type: 'SET_USER', userData: response2.data });
            setIsLoaded(true);
          });
      })
      .catch((err) => {
        console.log(err);
        setIsLoaded(true);
      });
  }

  useEffect(() => {
    checkForSession();
  }, []);

  return (
    isLoaded ? (
      <Route
        {...rest}
        render={({ location }) =>
        (userData.user_id !== 0) ? (
          children
          ) : (
            <Redirect to='/login' />
          )
        }
      />
    ) : (
      <div>Loading ... </div>
    )
  );
}


// export default function PrivateRoute({ component: Component, ...rest }) {
//   const userData = useSelector((store) => store.currentUserReducer.userData);
//   console.log('userData: ', userData);
//   // const { currentUser } = useAuth();
//   return (
//     <Route
//       // {...rest}
//       render={props => {
//         return userData ? <Component {...props} /> : <Redirect to="/" />
//       }}
//     />
//   );
// }
