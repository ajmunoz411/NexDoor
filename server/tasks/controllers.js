/* eslint-disable spaced-comment */
/* eslint-disable max-len */
const getCoordinates = require('./coordinates');
const tasksService = require('./service');

const taskControllers = {
// *************************************************************
  // ADD TASK WITH NEW ADDRESS (i.e not the user's home address)
  // *************************************************************
  //   Needs from Front End - userId, street address, city, state, zipcode, coordinate (from GoogleMaps API), description, car required (optional), labor required (optional), category, start date, end date, start time, duration,
  //   Returns - String confirmation
  // *************************************************************
  // POST api/task/new/:userId
  /* req.body =
  {
    "streetAddress": "111 Random Street",
    "city": "Los Angeles",
    "state": "CA",
    "zipcode": 12345,
    "neighborhood": "Hollywood",
    "description": "Hoping to borrow 2 lawnchairs",
    "carRequired": false,
    "laborRequired": false,
    "category": "borrow",
    "startDate": "08/10/2021",
    "endDate": "08/21/2021",
    "startTime": "5:08",
    "duration": 2
  }
  res = 'Added task to db'
  */
  // *************************************************************
  addTaskNewAddress: async (req, res) => {
    const { userId } = req.params;
    const {
      streetAddress,
      city,
      state,
      zipcode,
    } = req.body;

    const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
    const coordinateOrig = await getCoordinates(addressQuery);
    const coordinate = `point(${coordinateOrig.lng},${coordinateOrig.lat})`;

    const body = {
      streetAddress,
      city,
      state,
      zipcode,
      neighborhood: req.body.neighborhood,
      coordinate,
      description: req.body.description,
      carRequired: req.body.carRequired,
      laborRequired: req.body.laborRequired,
      category: req.body.category,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      duration: req.body.duration,
    };

    try {
      const insertId = await tasksService.addTaskNewAddress(userId, body);
      res.status(200).send(insertId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // ADD A TASK AT A USER'S HOME ADDRESS
  // *************************************************************
  // Needs from Front End - userId, description, car required(optional), labor required(optional), category, start date, end date, start time, duration
  // *************************************************************
  /*
    POST api/task/home/:userId
    req.body =
      {
        "description": "Can somebody help me put up a fence please",
        "carRequired": false,
        "laborRequired": true,
        "category": "labor",
        "startDate": "05/13/2021",
        "endDate": "05/13/2021",
        "startTime": "10:08",
        "duration": 1
      }
    res = 'Added task to db'
  */
  // *************************************************************
  addTaskHomeAddress: async (req, res) => {
    const { userId } = req.params;
    const body = {
      description: req.body.description,
      carRequired: req.body.carRequired,
      laborRequired: req.body.laborRequired,
      category: req.body.category,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      duration: req.body.duration,
    };

    try {
      const insertId = await tasksService.addTaskHomeAddress(userId, body);
      res.status(200).send(insertId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET X # OF TASKS
  // *************************************************************
  //   Needs from Front End - none
  //   Returns - array of task objects, ordered by start date and start time
  // *************************************************************
  /*
    GET /api/tasks/all/:userId/:quantity/:offset
    [
      {
        "task_id": 12,
        "requester": {
            "user_id": 16,
            "firstname": "Franklin",
            "lastname": "Doogan",
            "email": "fdoog@gmail.com",
            "address_id": 41,
            "karma": 5,
            "task_count": 15,
            "avg_rating": 4,
            "profile_picture_url": "https://www.indiewire.com/wp-content/uploads/2017/06/0000246240.jpg"
        },
        "helper": {
            "user_id": 17,
            "firstname": "Jenny",
            "lastname": "Cho",
            "email": "questionmaster3000@gmail.com",
            "address_id": 42,
            "karma": 64,
            "task_count": 28,
            "avg_rating": 5,
            "profile_picture_url": "https://media-exp1.licdn.com/dms/image/C5603AQEVw__BKGBOdw/profile-displayphoto-shrink_200_200/0/1551395086203?e=1631750400&v=beta&t=yMuQBb8y5FTMWUZfBUKUFvACe8Mbv5z_8aaCAQxaSH0"
        },
        "location": {
            "address_id": 43,
            "street_address": "8837 Rangely Ave",
            "city": "West Hollywood",
            "state": "CA",
            "zipcode": 90048,
            "neighborhood": "West Hollywood",
            "coordinate": "(-118.386255,34.080076)"
        },
        "description": "GIVE ME BUTTER NOW",
        "car_required": null,
        "physical_labor_required": null,
        "status": "pending",
        "category": "borrow",
        "start_date": "2021-08-13T07:00:00.000Z",
        "end_date": "2021-08-20T07:00:00.000Z",
        "start_time": "01:30:00",
        "duration": 2,
        "timestamp_requested": "2021-07-14T09:35:09.135Z"
    },
    ]
  */
  // *************************************************************
  getTasks: async (req, res) => {
    const params = {
      userId: req.params.userId,
      quantity: req.params.quantity,
      offset: req.params.offset,
    };

    try {
      const tasks = await tasksService.getTasks(params);
      res.status(200).send(tasks);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET TASKS IN RANGE
  // *************************************************************
  //   Needs from Front End - UserId(int), Range(in miles)(int or float)
  //   Return - Array of task objects, each returned task object falls within
  //     the given range in miles from the given userId's home address, array is sorted
  //     by starting date and time
  // *************************************************************
  /*
    GET /api/tasks/range/:userId/:range(in miles)
    req.body = none
    res =
      [
        {
          "task_id": 14,
          "requester": {
              "user_id": 16,
              "firstname": "Franklin",
              "lastname": "Doogan",
              "email": "fdoog@gmail.com",
              "address_id": 41,
              "karma": 5,
              "task_count": 15,
              "avg_rating": 4,
              "profile_picture_url": "https://www.indiewire.com/wp-content/uploads/2017/06/0000246240.jpg"
          },
          "helper": {
              "user_id": 17,
              "firstname": "Jenny",
              "lastname": "Cho",
              "email": "questionmaster3000@gmail.com",
              "address_id": 42,
              "karma": 64,
              "task_count": 28,
              "avg_rating": 5,
              "profile_picture_url": "https://media-exp1.licdn.com/dms/image/C5603AQEVw__BKGBOdw/profile-displayphoto-shrink_200_200/0/1551395086203?e=1631750400&v=beta&t=yMuQBb8y5FTMWUZfBUKUFvACe8Mbv5z_8aaCAQxaSH0"
          },
          "address": {
              "address_id": 41,
              "street_address": "8906 Dorrington Ave",
              "city": "Los Angeles",
              "state": "CA",
              "zipcode": 90048,
              "neighborhood": "West Hollywood",
              "coordinate": "(-118.386511,34.079391)"
          },
          "description": "help me with life",
          "car_required": false,
          "physical_labor_required": "false",
          "status": "open",
          "category": "favor",
          "start_date": "2021-07-21T07:00:00.000Z",
          "end_date": "2021-07-24T07:00:00.000Z",
          "start_time": "12:00:00",
          "duration": 4,
          "timestamp_requested": "2021-07-15T02:40:51.331Z"
      },
      .......
    ]
  */
  // *************************************************************
  getTasksInRange: async (req, res) => {
    const params = {
      userId: req.params.userId,
      range: req.params.range,
    };

    try {
      const tasks = await tasksService.getTasksInRange(params);
      res.status(200).send(tasks);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET REQUESTED TASKS BY USER ID
  // *************************************************************
  // Needs from Front End - userId
  // Returns - array of task objects where given user is the requester, ordered by date/time
  // *************************************************************
  /*
    GET /api/tasks/req/:userID
    req.body = none
    res =
      [
        {
          {
            "task_id": 10,
            "requester": {
              "user_id": 16,
              "firstname": "Franklin",
              "lastname": "Doogan",
              "email": "fdoog@gmail.com",
              "address_id": 41,
              "karma": 5,
              "task_count": 15,
              "avg_rating": 4,
              "profile_picture_url": "https://www.indiewire.com/wp-content/uploads/2017/06/0000246240.jpg"
          },
          "helper": null,
          "location": {
              "address_id": 41,
              "street_address": "8906 Dorrington Ave",
              "city": "Los Angeles",
              "state": "CA",
              "zipcode": 90048,
              "neighborhood": "West Hollywood",
              "coordinate": "(-118.386511,34.079391)"
          },
          "description": "Help me with my tiny cats",
          "car_required": null,
          "physical_labor_required": null,
          "status": "open",
          "category": "sitting",
          "start_date": "2021-06-21T07:00:00.000Z",
          "end_date": "2021-06-23T07:00:00.000Z",
          "start_time": "04:20:00",
          "duration": 4,
          "timestamp_requested": "2021-07-14T09:28:58.050Z"
          },
        },
        .....
      ]
  */
  // *************************************************************
  getReqTasksByUser: async (req, res) => {
    const { userId } = req.params;

    try {
      const tasks = await tasksService.getReqTasksByUser(userId);
      res.status(200).send(tasks);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET HELP TASKS BY USER
  // *************************************************************
  // Needs from Front End - userId
  // Returns - array of task objects where the given user is assigned to be a helper, ordered by date/time
  // *************************************************************
  /*
    GET /api/tasks/help/:userId
    req.body = none
    res =
      [
        {
          "task_id": 17,
          "requester": {
              "user_id": 16,
              "firstname": "Franklin",
              "lastname": "Doogan",
              "email": "fdoog@gmail.com",
              "address_id": 41,
              "karma": 5,
              "task_count": 15,
              "avg_rating": 4,
              "profile_picture_url": "https://www.indiewire.com/wp-content/uploads/2017/06/0000246240.jpg"
          },
          "helper": {
              "user_id": 17,
              "firstname": "Jenny",
              "lastname": "Cho",
              "email": "questionmaster3000@gmail.com",
              "address_id": 42,
              "karma": 64,
              "task_count": 28,
              "avg_rating": 5,
              "profile_picture_url": "https://media-exp1.licdn.com/dms/image/C5603AQEVw__BKGBOdw/profile-displayphoto-shrink_200_200/0/1551395086203?e=1631750400&v=beta&t=yMuQBb8y5FTMWUZfBUKUFvACe8Mbv5z_8aaCAQxaSH0"
          },
          "location": {
              "address_id": 48,
              "street_address": "85 Bronson",
              "city": "Los Angeles",
              "state": "CA",
              "zipcode": 90027,
              "neighborhood": "Glendale",
              "coordinate": null
          },
          "description": "help me with my 17 turtles",
          "car_required": false,
          "physical_labor_required": "true",
          "status": "active",
          "category": "favor",
          "start_date": "2021-04-11T07:00:00.000Z",
          "end_date": "2021-04-22T07:00:00.000Z",
          "start_time": "11:00:00",
          "duration": 3,
          "timestamp_requested": "2021-07-15T02:57:56.885Z"
        },
        ....
      ]
  */
  // *************************************************************
  getHelpTasksByUser: async (req, res) => {
    const { userId } = req.params;

    try {
      const tasks = await tasksService.getHelpTasksByUser(userId);
      res.status(200).send(tasks);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // UPDATE TASK HELPER AND STATUS
  // *************************************************************
  // Needs from Front End - userId (helper), taskId
  // Returns - String confirmation
  // *************************************************************
  /*
    PUT /task/help/:taskId/:userId
    req.body = none
    res = 'Updated helper, status pending'
  */
  // *************************************************************
  updateHelper: async (req, res) => {
    const params = {
      taskId: req.params.taskId,
      userId: req.params.userId,
    };

    try {
      const confId = await tasksService.updateHelper(params);
      res.status(200).send(confId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // REMOVE HELPER FROM PENDING TASK
  // *************************************************************
  // Needs from Front End - taskId
  // Return - string confirmation
  // *************************************************************
  /*
    PUT /task/rmhelp/:taskId
    req.body = none
    res = 'Removed helper, status open
  */
  // *************************************************************
  removeHelper: async (req, res) => {
    const { taskId } = req.params;

    try {
      const confId = await tasksService.removeHelper(taskId);
      res.status(200).send(confId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // CHANGE TASK STATUS TO ACTIVE, COMPLETED
  // *************************************************************
  // Needs from Front End - status(active, completed) taskId
  // Returns - String confirmation
  // *************************************************************
  /*
    PUT /task/change/:status/:taskId
    req.body = none
    res = 'Task 17 status set to complete'
  */
  // *************************************************************
  changeTaskStatus: async (req, res) => {
    const params = {
      status: req.params.status,
      taskId: req.params.taskId,
    };

    try {
      const confId = await tasksService.changeTaskStatus(params);
      res.status(200).send(confId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // CLOSE TASK (AND INCREMENT HELPER TASK COUNT / RATING)
  // *************************************************************
  // Needs from Front End - taskId, helper rating
  // Returns - String confirmation
  // Notes - Changes task status to 'Closed', increments helper task count by 1, increments karma by the input rating, calculates and updates new avg rating
  // *************************************************************
  /*
    PUT /task/close/:taskId/:rating
    req.body =
      {
        "review": "Best couch carrying help I have ever received in my life."
      }
    res = 'Task 17 closed'
  */
  // *************************************************************
  closeTask: async (req, res) => {
    const params = {
      taskId: req.params.taskId,
      rating: req.params.rating,
    };
    const { review } = req.body;

    try {
      const confId = await tasksService.closeTask(params, review);
      res.status(200).send(confId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },

  // *************************************************************
  // DELETE TASK FROM DB
  // *************************************************************
  // Needs from Front End - taskId
  // Returns - String confirmation
  // *************************************************************
  /*
    DELETE /task/:taskId
    req.body - none
    res - 'Deleted task 17 from db'
  */
  // *************************************************************
  deleteTask: async (req, res) => {
    const { taskId } = req.params;

    try {
      const confirmation = await tasksService.deleteTask(taskId);
      res.status(200).send(confirmation);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },

  // *************************************************************
  // GET ALL TASKS WITHIN A MILEAGE RANGE FOR A USER AT THEIR HOME ADDRESS (HELPER TASKS, REQUESTER TASKS, ALL OTHER TASKS)
  // *************************************************************
  // Needs from Front End - userId, range (in miles), quantity, offset (quantity and offset only apply to 'all other tasks')
  // Returns - gigantic tasks object with keys for requested, helper, and all other which all hold arrays of task objects
  // *************************************************************
  /*
    res =
      {
    "requested": [
        {
            "task_id": 35,
            "requester": {
                "user_id": 35,
                "firstname": "Frank",
                "lastname": "Putnam",
                "email": "fput@gmail.com",
                "address_id": 70,
                "karma": 0,
                "task_count": 0,
                "avg_rating": null,
                "profile_picture_url": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Frank_Welker_Photo_Op_GalaxyCon_Richmond_2020.jpg"
            },
            "helper": {
                "user_id": 36,
                "firstname": "Erika",
                "lastname": "Chumbles",
                "email": "echumbles@gmail.com",
                "address_id": 71,
                "karma": 0,
                "task_count": 0,
                "avg_rating": null,
                "profile_picture_url": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Erika_Eleniak_2011.jpg"
            },
            "address": {
                "address_id": 70,
                "street_address": "111 S Grand Ave",
                "city": "Los Angeles",
                "state": "CA",
                "zipcode": 90012,
                "neighborhood": "Downtown",
                "coordinate": "(-118.2494494,34.0553077)"
            },
            "description": "I need someone to come check on my dogs once a day for the next three days. They are very friendly. Two small poodles, hypoallergenic, about 20 pounds each. Just need somone to make sure their water bowls are filled. Thank you guys!",
            "car_required": true,
            "physical_labor_required": "false",
            "status": "Complete",
            "category": "Sitting",
            "start_date": "2021-05-13",
            "end_date": "2021-05-16",
            "start_time": "11:00:00",
            "duration": 24,
            "timestamp_requested": "2021-07-15T02:42:29.0272"
        },
        ......
    ],
    "helper": Same as above (array of task objects),
    "allothers": Same as above (array of task objects)
    }
  */
  getTasksMasterDefaultAddress: async (req, res) => {
    const params = {
      userId: req.params.userId,
      range: req.params.range,
      quantity: req.params.quantity,
      offset: req.params.offset,
    };

    try {
      const tasks = await tasksService.getTasksMasterDefaultAddress(params);
      res.status(200).send(tasks);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },

  // *************************************************************
  // GET ALL TASKS WITHIN A MILEAGE RANGE FOR A USER AT AN ALTERNATE ADDRESS (HELPER TASKS, REQUESTER TASKS, ALL OTHER TASKS)
  // *************************************************************
  // Needs from Front End - userId, range (in miles), quantity, offset (quantity and offset only apply to 'all other tasks'), alternate address info
  // Returns - gigantic tasks object with keys for requested, helper, and all other which all hold arrays of task objects
  // *************************************************************
  getTasksMasterAltAddress: async (req, res) => {
    const params = {
      userId: req.params.userId,
      range: req.params.range,
      quantity: req.params.quantity,
      offset: req.params.offset,
    };
    const {
      streetAddress,
      city,
      state,
      zipcode,
    } = req.body;

    const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
    const coordinateOrig = await getCoordinates(addressQuery);
    const coordinate = `point(${coordinateOrig.lng},${coordinateOrig.lat})`;

    const body = {
      coordinate,
    };

    try {
      const tasks = await tasksService.getTasksMasterAltAddress(params, body);
      res.status(200).send(tasks);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },

  // *************************************************************
  // EDIT TASK
  // *************************************************************
  // Needs from Front End - task info
  // Returns - string conf
  // *************************************************************
  /*
    // PUT /task/edit
    req.body =
    {
        "streetAddress": "180 Santa Monica Pier",
        "city": "Santa Monica",
        "state": "CA",
        "zipcode": 90401,
        "neighborhood": "Santa Monica",
        "description": "I have fallen and I cannot get up. Help please",
        "carRequired": false,
        "laborRequired": false,
        "category": "Favor",
        "startDate": "2021/05/22",
        "endDate": "2021/05/27",
        "startTime": "08:00",
        "duration": 2,
        "taskId": 41
    }
  */
  // *************************************************************
  editTask: async (req, res) => {
    const {
      streetAddress,
      city,
      state,
      zipcode,
    } = req.body;

    const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
    const coordinateOrig = await getCoordinates(addressQuery);
    const coordinate = `point(${coordinateOrig.lng},${coordinateOrig.lat})`;

    const body = {
      streetAddress,
      city,
      state,
      zipcode,
      coordinate,
      neighborhood: req.body.neighborhood,
      description: req.body.description,
      carRequired: req.body.carRequired,
      laborRequired: req.body.laborRequired,
      category: req.body.category,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      duration: req.body.duration,
      taskId: req.body.taskId,
    };

    try {
      const taskIdRet = await tasksService.editTask(body);
      res.status(200).send(taskIdRet);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
};

module.exports = taskControllers;
