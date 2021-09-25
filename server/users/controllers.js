/* eslint-disable camelcase */
/* eslint-disable spaced-comment */
/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const session = require('express-session');
const getCoordinates = require('../tasks/coordinates');
const usersService = require('./service');

const userControllers = {
  // *************************************************************
  // ADD A NEW USER
  // *************************************************************
  // Needs from Front End - street address, city, state, zipcode, neighborhood (optional), coordinate (from GoogleMaps API), first name, last name, password, email, imgUrl (optional)
  // Returns - String confirmation
  // Notes
  // *************************************************************
  /*
    POST /api/user
      req.body =
      {
        "streetAddress": "450 Grundle Lane",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": 87980,
        "neighborhood": "Pasadena",
        "firstName": "George",
        "lastName": "Kentucky",
        "password": "431jkl",
        "email": "georgek@gmail.com",
        "imgUrl": "https://uknow.uky.edu/sites/default/files/styles/uknow_story_image/public/externals/e9e2133396fc318d7b991696e8404c58.jpg"
      }
    res = "User added to db"
  */
  addUser: async (req, res) => {
    const {
      streetAddress,
      city,
      state,
      zipcode,
      password,
    } = req.body;

    const hashPass = bcrypt.hashSync(password, 10);

    const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
    const coordinateOrig = await getCoordinates(addressQuery);
    const coordinate = `point(${coordinateOrig.lng},${coordinateOrig.lat})`;

    const body = {
      streetAddress,
      city,
      state,
      zipcode,
      coordinate,
      neighborhood: req.body.neighborhood || null,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      hashPass,
      email: req.body.email,
      imgUrl: req.body.imgUrl || null,
    };

    try {
      const userObj = await usersService.addUser(body);
      res.status(200).send(userObj);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET USER INFO BY USERID
  // *************************************************************
  //   Needs from Front End - userId
  //   Returns - user object for given ID
  // *************************************************************
  /*
    GET /api/user/info/${userId}
    req.body = none;
    res = {
      "firstname": "Spongebob",
      "lastname": "Squarepants",
      "email": "ss@gmail.com",
      "karma": 0,
      "task_count": 0,
      "avg_rating": 5,
      "profile_picture_url": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/SpongeBob_SquarePants_character.svg/1200px-SpongeBob_SquarePants_character.svg.png",
      "address": {
          "street_address": "538 Newcastle",
          "city": "Los Angeles",
          "state": "CA",
          "zipcode": "90028",
          "neighborhood": "Los Feliz"
      }
  */
  // *************************************************************
  getUser: async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await usersService.getUser(userId);
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET USERS ORDERED BY RATING
  // *************************************************************
  //   Needs from front end - max quantity of results, defaults to 10
  //   Returns - array of user objects, ordered by user's average rating
  // *************************************************************
  /*
    GET /users/rating/${quantity}
    req.body = none
    res =
      [
        {
          "user_id": 36,
          "firstname": "Erika",
          "lastname": "Chumbles",
          "address_id": 71,
          "karma": 58,
          "task_count": 15,
          "avg_rating": 3,
          "profile_picture_url": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Erika_Eleniak_2011.jpg",
          "reviews": [
              {
                  "review_id": 1,
                  "rating": 5,
                  "review": "Best couch carrying help I have ever received in my life.",
                  "requester_id": 35,
                  "helper_id": 36
              },
              .....
          ]
        },
        .......
      ]
  */
  // *************************************************************
  getUsersByRating: async (req, res) => {
    const { quantity } = req.params || 25;

    try {
      const users = await usersService.getUsersByRating(quantity);
      res.status(200).send(users);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET USERS IN RANGE ORDERED BY RATING
  // *************************************************************
  //   Needs from front end - max quantity of results, defaults to 10
  //   Returns - array of user objects, ordered by user's average rating
  // *************************************************************
  /*
    GET /users/rangerating/:quantity/:userId/:range
      req.body = none
      res =
        [
          {
            "user_id": 36,
            "firstname": "Erika",
            "lastname": "Chumbles",
            "address_id": 71,
            "karma": 58,
            "task_count": 15,
            "avg_rating": 3,
            "profile_picture_url": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Erika_Eleniak_2011.jpg",
            "reviews": [
                {
                    "review_id": 1,
                    "rating": 5,
                    "review": "Best couch carrying help I have ever received in my life.",
                    "requester_id": 35,
                    "helper_id": 36
                },
                .....
            ]
          },
          .......
        ]
  */
  // *************************************************************
  getUsersInRangeByRating: async (req, res) => {
    const params = {
      userId: req.params.userId,
      range: req.params.range || 1,
      quantity: req.params.quantity || 25,
    };

    try {
      const users = await usersService.getUsersInRangeByRating(params);
      res.status(200).send(users);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // CHECK FOR EMAIL IN DB
  // *************************************************************
  // Needs from Front End - email address to check
  // Returns - boolean
  // *************************************************************
  /*
    GET /api/email
    req.body = {
      "email": "ss@gmail.com"
    }
    res = true
    req.body = {
      "email": "thisemaildoesntexistindb@gmail.com"
    }
    res = false
  */
  // *************************************************************
  checkForEmail: async (req, res) => {
    const { email } = req.body;

    try {
      const result = await usersService.checkForEmail(email);
      res.status(200).send(result);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET USER CREDENTIALS
  // *************************************************************
  /*
    GET /api/credentials/:userId
    req.body = none
    res =
      {
        "email": "questionmaster3000@gmail.com",
        "password": "chobiden"
      }
  */
  // *************************************************************
  getUserCredentials: async (req, res) => {
    const { userId } = req.params;

    try {
      const credentials = await usersService.getUserCredentials(userId);
      res.status(200).send(credentials);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // AUTHENTICATE USERNAME & PASSWORD
  // *************************************************************
  /*  Takes a username and password and, if valid, returns a session

    GET /api/login
    req.body =
    {
        "email": "questionmaster3000@gmail.com",
        "password": "chobiden"
    }

    res =
      {
        user_id: 12345,
      }
  */
  // *************************************************************
  authenticateLogin: async (req, res) => {
    const body = {
      email: req.body.email,
      password: req.body.password,
    };

    try {
      const { userId, match } = await usersService.authenticateLogin(body);
      if (!match) {
        res.status(404).send('Password does not match');
      } else {
        req.session.user_id = userId;
        req.session.save();
        res.status(200).send({ userId });
      }
    } catch (err) {
      req.session.destroy();
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************
  authenticateSession: async (req, res) => {
    if (req.session.user_id) {
      const { user_id } = req.session;
      res.status(200).send({ user_id });
    } else {
      res.status(418).send('error: user is a teapot');
    }
  },
};

module.exports = userControllers;
