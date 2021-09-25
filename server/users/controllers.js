/* eslint-disable spaced-comment */
/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const session = require('express-session');
const db = require('../../db/index');
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
  getUser: (req, res) => {
    const { userId } = req.params;

    const queryStr = `
      SELECT
        user_id,
        firstname,
        lastname,
        email,
        karma,
        task_count,
        avg_rating,
        profile_picture_url, (
          SELECT ROW_TO_JSON(add)
          FROM (
            SELECT
              street_address,
              city,
              state,
              zipcode,
              neighborhood
            FROM nexdoor.address
            WHERE address_id=nexdoor.users.address_id
          ) add
        ) as address
      FROM nexdoor.users
      WHERE user_id=${userId};
    `;

    db.query(queryStr)
      .then((data) => {
        res.status(200).send(data.rows[0]);
      })
      .catch((err) => {
        res.status(400).send(err.stack);
      });
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
  getUsersByRating: (req, res) => {
    const { quantity } = req.params || 25;
    const queryStr = `
      SELECT
        user_id,
        firstname,
        lastname,
        address_id,
        karma,
        task_count,
        avg_rating,
        profile_picture_url,
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(reviews))
          FROM (
            SELECT *
            FROM nexdoor.reviews
            WHERE helper_id=nexdoor.users.user_id
          ) reviews
        ) as reviews
      FROM nexdoor.users
      ORDER BY avg_rating
      LIMIT ${quantity}
    `;
    db.query(queryStr)
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(400).send(err.stack);
      });
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
  getUsersInRangeByRating: (req, res) => {
    const { userId } = req.params;
    const { range } = req.params || 1;
    const { quantity } = req.params || 25;
    const queryStr = `
      SELECT
        user_id,
        firstname,
        lastname,
        address_id,
        karma,
        task_count,
        avg_rating,
        profile_picture_url,
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(reviews))
          FROM (
            SELECT *
            FROM nexdoor.reviews
            WHERE helper_id=nexdoor.users.user_id
          ) reviews
        ) as reviews
      FROM nexdoor.users
      WHERE
        (
          (
            SELECT coordinate
            FROM nexdoor.address
            WHERE address_id=
            (
              SELECT address_id
              FROM nexdoor.users
              WHERE user_id=${userId}
            )
          )
          <@>
          (
            SELECT coordinate
            FROM nexdoor.address
            WHERE address_id=nexdoor.users.address_id
          ) < ${range}
        )
      ORDER BY avg_rating
      LIMIT ${quantity}
    `;
    db.query(queryStr)
      .then((data) => {
        res.status(200).send(data.rows);
      })
      .catch((err) => {
        res.status(400).send(err.stack);
      });
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
  checkForEmail: (req, res) => {
    const { email } = req.body;
    const queryStr = `
      SELECT EXISTS (
        SELECT true FROM nexdoor.users
        WHERE email='${email}'
        LIMIT 1
      )
    `;
    db.query(queryStr)
      .then((data) => {
        res.status(200).send(data.rows[0].exists);
      })
      .catch((err) => {
        res.status(400).send(err.stack);
      });
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
  getUserCredentials: (req, res) => {
    const { userId } = req.params;
    const queryStr = `
      SELECT email, password
      FROM nexdoor.users
      WHERE user_id=${userId}
    ;`;
    db.query(queryStr)
      .then((data) => {
        res.status(200).send(data.rows[0]);
      })
      .catch((err) => {
        res.status(400).send(err.stack);
      });
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
  authenticateLogin: (req, res, next) => {
    const { email, password } = req.body;
    const queryStr = `
      SELECT user_id, password
      FROM nexdoor.users
      WHERE email='${email}'
    ;`;
    db.query(queryStr)
      .then((data) => {
        const user_id = data.rows[0].user_id;
        //compare passwords
        if (!bcrypt.compareSync(password, data.rows[0].password)) {
          res.status(404).send('error: password does not match');
        } else {
          //return session
          req.session.user_id = user_id;
          req.session.save();
          // res.session.user_Id = user_id;
          res.status(200).send({user_id});
        }
      })
      .catch((err) => {
        console.log(err);
        req.session.destroy();
        res.status(400).send(err.stack);
      });
  },
  // *************************************************************
  authenticateSession: (req, res) => {
    if(req.session.user_id) {
      const user_id = req.session.user_id;
      res.status(200).send({ user_id });
    } else {
      res.status(418).send("error: user is a teapot");
    }
  },
  // SEssion as cookie gets stored on local computer
  // a version gets stored in REdis as well
  // Authenticate checks whether the cookie on your request matches the one stored in Redis

};

module.exports = userControllers;