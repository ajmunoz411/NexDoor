/* eslint-disable spaced-comment */
/* eslint-disable max-len */
const db = require('../../db/index');
// const getCoordinates = require('./coordinates');
/*________________________________________________________________
TABLE OF CONTENTS
- Add a task with a new address (not user's home): 19 - 135
- Add a task with a home address: 137 - 214
- Add a task after checking if the address already exists in db: 216 - 397
- Get x # of tasks ordered by date/time: 399 - 526
- Get tasks in mileage range from user's home address: 528 - 680
- Get requester tasks for a user: 682 - 805
- Get helper tasks for a user: 807 - 937
- Update helper on a task (and change status to pending): 939 - 968
- Remove helper from a task (and change status to open): 970 - 999
- Update a task status to active, completed, or closed: 1001 - 1028
________________________________________________________________*/
const taskModels = {
  addTaskNewAddress: async (userId, body) => {
    const {
      streetAddress,
      city,
      state,
      zipcode,
      neighborhood,
      coordinate,
      description,
      carRequired,
      laborRequired,
      category,
      startDate,
      endDate,
      startTime,
      duration,
    } = body;

    const queryStr = `
      WITH X AS (
        INSERT INTO nexdoor.address (
          street_address,
          city,
          state,
          zipcode,
          neighborhood,
          coordinate
        )
        VALUES (
          '${streetAddress}',
          '${city}',
          '${state}',
          ${zipcode},
          '${neighborhood}',
          ${coordinate}
        )
        RETURNING address_id
      )
      INSERT INTO nexdoor.tasks (
        requester_id,
        address_id,
        description,
        car_required,
        physical_labor_required,
        status,
        category,
        start_date,
        end_date,
        start_time,
        duration,
        timestamp_requested
      )
      SELECT
        ${userId},
        address_id,
        '${description}',
        ${carRequired},
        ${laborRequired},
        'Open',
        '${category}',
        '${startDate}',
        '${endDate}',
        '${startTime}',
        ${duration},
        (SELECT CURRENT_TIMESTAMP)
      FROM X
      RETURNING task_id
    `;

    const data = await db.query(queryStr);
    const insertId = data.rows[0];
    return insertId;
  },

  addTaskHomeAddress: async (userId, body) => {
    const {
      description,
      carRequired,
      laborRequired,
      category,
      startDate,
      endDate,
      startTime,
      duration,
    } = body;

    const queryStr = `
      INSERT INTO nexdoor.tasks (
        requester_id,
        address_id,
        description,
        car_required,
        physical_labor_required,
        status,
        category,
        start_date,
        end_date,
        start_time,
        duration,
        timestamp_requested
      ) VALUES (
        ${userId},
        (
          SELECT address_id
          FROM nexdoor.users
          WHERE user_id=${userId}
        ),
        '${description}',
        ${carRequired},
        ${laborRequired},
        'Open',
        '${category}',
        '${startDate}',
        '${endDate}',
        '${startTime}',
        ${duration},
        (SELECT CURRENT_TIMESTAMP)
      );
    `;

    const data = await db.query(queryStr);
    const insertId = data.rows[0];
    return insertId;
  },
  // *************************************************************

  // *************************************************************
  // ADD TASK AFTER CHECKING FOR EXISTING ADDRESS
  // *************************************************************
  //  Needs from Front End - requester user id, street address, city, state, zipcode, neighborhood (optional), description, car required (optional), labor required(optional), category, start date, end date, start time, duration
  //  Returns - Confirmation string (new address if address wasn't already in the db, old address if it was)
  // *************************************************************
  /*
    POST /api/task/check/:userID (requester)
    req.body =
    {
      "streetAddress": "85 Bronson",
      "city": "Los Angeles",
      "state": "CA",
      "zipcode": 90027,
      "neighborhood": "Glendale",
      "description": "help me with my 17 turtles",
      "carRequired": false,
      "laborRequired": true,
      "category": "favor",
      "startDate": "04/11/2021",
      "endDate": "04/22/2021",
      "startTime": "11:00",
      "duration": 3
    }
    res = 'Added task with new address to db'
  */
  // *************************************************************

  // addTaskCheckAddress: (req, res) => {
  //   const { userId } = req.params;
  //   const {
  //     streetAddress,
  //     city,
  //     state,
  //     zipcode,
  //     neighborhood,
  //     description,
  //     carRequired,
  //     laborRequired,
  //     category,
  //     startDate,
  //     endDate,
  //     startTime,
  //     duration,
  //   } = req.body;

  //   const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
  //   let coordinate;

  //   const queryStr1 = `
  //     SELECT address_id
  //     FROM nexdoor.address
  //     WHERE street_address='${streetAddress}'
  //     AND zipcode=${zipcode}
  //   `;

  //   const queryDb = () => {
  //     const queryStr3 = `
  //       WITH X AS (
  //         INSERT INTO nexdoor.address
  //         (
  //           street_address,
  //           city,
  //           state,
  //           zipcode,
  //           neighborhood,
  //           coordinate
  //         )
  //         VALUES
  //         (
  //           '${streetAddress}',
  //           '${city}',
  //           '${state}',
  //           ${zipcode},
  //           '${neighborhood}',
  //           ${coordinate}
  //         )
  //       RETURNING address_id
  //     )
  //     INSERT INTO nexdoor.tasks (
  //       requester_id,
  //       address_id,
  //       description,
  //       car_required,
  //       physical_labor_required,
  //       status,
  //       category,
  //       start_date,
  //       end_date,
  //       start_time,
  //       duration,
  //       timestamp_requested
  //     )
  //     SELECT
  //       ${userId},
  //       address_id,
  //       '${description}',
  //       ${carRequired},
  //       ${laborRequired},
  //       'Open',
  //       '${category}',
  //       '${startDate}',
  //       '${endDate}',
  //       '${startTime}',
  //       ${duration},
  //       (SELECT CURRENT_TIMESTAMP)
  //     FROM X;
  //   `;

  //     db.query(queryStr3)
  //       .then(() => {
  //         res.send('Added task with new address to db');
  //       })
  //       .catch((err) => {
  //         res.status(400).send(err.stack);
  //       });
  //   };

  //   db.query(queryStr1)
  //     .then((address) => {
  //       if (address.rows.length > 0) {
  //         const addressId = address.rows[0].address_id;
  //         const queryStr2 = `
  //         INSERT INTO nexdoor.tasks (
  //           requester_id,
  //           address_id,
  //           description,
  //           car_required,
  //           physical_labor_required,
  //           status,
  //           category,
  //           start_date,
  //           end_date,
  //           start_time,
  //           duration,
  //           timestamp_requested
  //         )
  //         VALUES (
  //           ${userId},
  //           ${addressId},
  //           '${description}',
  //           ${carRequired},
  //           ${laborRequired},
  //           'Open',
  //           '${category}',
  //           '${startDate}',
  //           '${endDate}',
  //           '${startTime}',
  //           ${duration},
  //           (SELECT CURRENT_TIMESTAMP)
  //         )
  //       `;
  //         db.query(queryStr2)
  //           .then(() => {
  //             res.status(200).send('Added task with old address to db');
  //           })
  //           .catch((err) => {
  //             res.status(400).send(err.stack);
  //           });
  //       } else {
  //         getCoordinates(addressQuery)
  //           .then((testCoord) => {
  //             coordinate = `point(${testCoord.lng},${testCoord.lat})`;
  //           })
  //           .then(() => {
  //             queryDb();
  //           })
  //           .catch((err) => {
  //             res.status(400).send('Error getting coordinates', err.stack);
  //           });
  //       }
  //     })
  //     .catch((err) => {
  //       res.status(400).send('error', err.stack);
  //     });
  // },
  // *************************************************************

  getTasks: async (params) => {
    const { userId, quantity, offset } = params;

    const queryStr = `
      SELECT ROW_TO_JSON(all)
      FROM (
        SELECT
            task_id,
            (
              SELECT ROW_TO_JSON(reqname)
              FROM (
                SELECT
                  user_id,
                  firstname,
                  lastname,
                  email,
                  address_id,
                  karma,
                  task_count,
                  avg_rating,
                  profile_picture_url
                FROM nexdoor.users
                WHERE user_id=nexdoor.tasks.requester_id
              ) reqname
            ) as requester,
            (
              SELECT ROW_TO_JSON(helpname)
              FROM (
                SELECT
                  user_id,
                  firstname,
                  lastname,
                  email,
                  address_id,
                  karma,
                  task_count,
                  avg_rating,
                  profile_picture_url
                FROM nexdoor.users
                WHERE user_id=nexdoor.tasks.helper_id
              ) helpname
            ) AS helper,
            (
              SELECT ROW_TO_JSON(loc)
              FROM (
                SELECT *
                FROM nexdoor.address
                WHERE address_id=nexdoor.tasks.address_id
              ) loc
            ) AS location,
            description,
            car_required,
            physical_labor_required,
            status,
            category,
            start_date,
            end_date,
            start_time,
            duration,
            timestamp_requested
          FROM nexdoor.tasks
          WHERE
            requester_id != ${userId} AND
            (
              helper_id != ${userId} OR
              helper_id IS NULL
            )
          ORDER BY
            start_date,
            start_time
          LIMIT ${quantity}
          OFFSET ${offset}
        ) all
      ) as all
    ;`;

    const data = await db.query(queryStr);
    const tasks = data.rows;
    return tasks;
  },

  getTasksInRange: async (params) => {
    const { userId, range } = params;

    const queryStr = `
      SELECT
        task_id,
        (
          SELECT ROW_TO_JSON(reqname)
          FROM (
            SELECT
              user_id,
              firstname,
              lastname,
              email,
              address_id,
              karma,
              task_count,
              avg_rating,
              profile_picture_url
            FROM nexdoor.users
            WHERE user_id=nexdoor.tasks.requester_id
          ) reqname
        ) as requester,
        (
          SELECT ROW_TO_JSON(helpname)
          FROM (
            SELECT
              user_id,
              firstname,
              lastname,
              email,
              address_id,
              karma,
              task_count,
              avg_rating,
              profile_picture_url
            FROM nexdoor.users
            WHERE user_id=nexdoor.tasks.helper_id
          ) helpname
        ) AS helper,
        (
          SELECT ROW_TO_JSON(loc)
          FROM (
            SELECT *
            FROM nexdoor.address
            WHERE address_id=nexdoor.tasks.address_id
          ) loc
        ) AS address,
        description,
        car_required,
        physical_labor_required,
        status,
        category,
        start_date,
        end_date,
        start_time,
        duration,
        timestamp_requested
      FROM nexdoor.tasks
      WHERE (
        (
          SELECT coordinate
          FROM nexdoor.address
          WHERE address_id=nexdoor.tasks.address_id
        )
        <@>
        (
          SELECT coordinate
          FROM nexdoor.address
          WHERE address_id=
            (
              SELECT address_id
              FROM nexdoor.users
              WHERE user_id=${userId}
            )
          ) < ${range}
        )
      ORDER BY
        start_date,
        start_time
      LIMIT 100;
    `;

    const data = await db.query(queryStr);
    const tasks = data.rows;
    return tasks;
  },
  // *************************************************************

  // *************************************************************
  // GET TASKS IN RANGE FOR INPUT ADDRESS
  // *************************************************************
  // Needs from Front End - userId, range (in miles), street address, city, state, zipcode, neighborhood (optional)
  // Return - array of tasks objects
  // Note - does not create a new entry in the address table for the input address
  // *************************************************************
  /*
    GET /api/tasks/alt/:range
    req.body =
      {
        "streetAddress": "1154 Glendale Blvd",
        "city": "Los Angeles",
        "state": "CA",
        "zipcode": 90026,
        "neighborhood": "Echo Park"
      }
    res =
      [
        {
          "task_id": 40,
          "requester": {
              "user_id": 43,
              "firstname": "Adam",
              "lastname": "Croggins",
              "email": "acroggins@gmail.com",
              "address_id": 78,
              "karma": 0,
              "task_count": 0,
              "avg_rating": null,
              "profile_picture_url": "https://yt3.ggpht.com/ytc/AKedOLS9pqgIqwr8DKFtTl2FrNxCOAa7z7pjvWcAL7Jupw=s900-c-k-c0x00ffffff-no-rj"
          },
          "helper": {
              "user_id": 41,
              "firstname": "Cheryl",
              "lastname": "Monstera",
              "email": "cmonst@gmail.com",
              "address_id": 76,
              "karma": 0,
              "task_count": 0,
              "avg_rating": null,
              "profile_picture_url": "https://upload.wikimedia.org/wikipedia/commons/0/01/Cheryl_Cole_Cannes_2014.jpg"
          },
          "address": {
              "address_id": 78,
              "street_address": "1822 Sunset Blvd",
              "city": "Los Angeles",
              "state": "CA",
              "zipcode": 90026,
              "neighborhood": "Echo Park",
              "coordinate": "(-118.260108,34.0777287)"
          },
          "description": "Looking to trade an old set of golf clubs for an equally prized heirloom",
          "car_required": true,
          "physical_labor_required": "false",
          "status": "Pending",
          "category": "Favor",
          "start_date": "2021-02-01T08:00:00.000Z",
          "end_date": "2021-02-01T08:00:00.000Z",
          "start_time": "11:00:00",
          "duration": 1,
          "timestamp_requested": "2021-07-15T09:42:29.051Z"
        },
        ....
      ]
  */
  // *************************************************************
  // getTasksInRangeAltAddress: (req, res) => {
  //   const { range } = req.params;
  //   const {
  //     streetAddress,
  //     city,
  //     state,
  //     zipcode,
  //   } = req.body;
  //   const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
  //   let coordinate;

  //   const queryDb = () => {
  //     const queryStr = `
  //       SELECT
  //         task_id,
  //         (
  //           SELECT ROW_TO_JSON(reqname)
  //           FROM (
  //             SELECT
  //               user_id,
  //               firstname,
  //               lastname,
  //               email,
  //               address_id,
  //               karma,
  //               task_count,
  //               avg_rating,
  //               profile_picture_url
  //             FROM nexdoor.users
  //             WHERE user_id=nexdoor.tasks.requester_id
  //           ) reqname
  //         ) as requester,
  //         (
  //           SELECT ROW_TO_JSON(helpname)
  //           FROM (
  //             SELECT
  //               user_id,
  //               firstname,
  //               lastname,
  //               email,
  //               address_id,
  //               karma,
  //               task_count,
  //               avg_rating,
  //               profile_picture_url
  //             FROM nexdoor.users
  //             WHERE user_id=nexdoor.tasks.helper_id
  //           ) helpname
  //         ) AS helper,
  //         (
  //           SELECT ROW_TO_JSON(loc)
  //           FROM (
  //             SELECT *
  //             FROM nexdoor.address
  //             WHERE address_id=nexdoor.tasks.address_id
  //           ) loc
  //         ) AS address,
  //         description,
  //         car_required,
  //         physical_labor_required,
  //         status,
  //         category,
  //         start_date,
  //         end_date,
  //         start_time,
  //         duration,
  //         timestamp_requested
  //       FROM nexdoor.tasks
  //       WHERE (
  //         (
  //           SELECT coordinate
  //           FROM nexdoor.address
  //           WHERE address_id=nexdoor.tasks.address_id
  //         )
  //         <@>
  //         (${coordinate})
  //       ) < ${range}
  //       ORDER BY
  //         start_date,
  //         start_time
  //       LIMIT 100;
  //     ;`;
  //     db.query(queryStr)
  //       .then((data) => {
  //         res.status(200).send(data.rows);
  //       })
  //       .catch((err) => {
  //         res.status(400).send(err.stack);
  //       });
  //   };

  //   getCoordinates(addressQuery)
  //     .then((testCoord) => {
  //       coordinate = `point(${testCoord.lng},${testCoord.lat})`;
  //     })
  //     .then(() => {
  //       queryDb();
  //     })
  //     .catch((err) => {
  //       res.status(400).send('Error getting coordinates', err.stack);
  //     });
  // },
  // *************************************************************

  getReqTasksByUser: async (userId) => {
    const queryStr = `
      SELECT
        task_id,
        (
          SELECT ROW_TO_JSON(reqname)
          FROM (
            SELECT
              user_id,
              firstname,
              lastname,
              email,
              address_id,
              karma,
              task_count,
              avg_rating,
              profile_picture_url
            FROM nexdoor.users
            WHERE user_id=${userId}
          ) reqname
        ) as requester,
        (
          SELECT ROW_TO_JSON(helpname)
          FROM (
            SELECT
              user_id,
              firstname,
              lastname,
              email,
              address_id,
              karma,
              task_count,
              avg_rating,
              profile_picture_url
            FROM nexdoor.users
            WHERE user_id=nexdoor.tasks.helper_id
          ) helpname
        ) as helper,
        (
          SELECT ROW_TO_JSON(loc)
          FROM (
            SELECT *
            FROM nexdoor.address
            WHERE address_id=nexdoor.tasks.address_id
          ) loc
        ) as location,
        description,
        car_required,
        physical_labor_required,
        status,
        category,
        start_date,
        end_date,
        start_time,
        duration,
        timestamp_requested
      FROM nexdoor.tasks
      WHERE requester_id=${userId}
      ORDER BY
        start_date,
        start_time
    ;`;

    const data = await db.query(queryStr);
    const tasks = data.rows;
    return tasks;
  },

  getHelpTasksByUser: async (userId) => {
    const queryStr = `
      SELECT
        task_id,
        (
          SELECT ROW_TO_JSON(reqname)
          FROM (
            SELECT
              user_id,
              firstname,
              lastname,
              email,
              address_id,
              karma,
              task_count,
              avg_rating,
              profile_picture_url
            FROM nexdoor.users
            WHERE user_id=nexdoor.tasks.requester_id
          ) reqname
        ) AS requester,
        (
          SELECT ROW_TO_JSON(helpname)
          FROM (
            SELECT
              user_id,
              firstname,
              lastname,
              email,
              address_id,
              karma,
              task_count,
              avg_rating,
              profile_picture_url
            FROM nexdoor.users
            WHERE user_id=nexdoor.tasks.helper_id
          ) helpname
        ) AS helper,
        (
          SELECT ROW_TO_JSON(loc)
          FROM (
            SELECT *
            FROM nexdoor.address
            WHERE address_id=nexdoor.tasks.address_id
          ) loc
        ) AS location,
        description,
        car_required,
        physical_labor_required,
        status,
        category,
        start_date,
        end_date,
        start_time,
        duration,
        timestamp_requested
      FROM nexdoor.tasks
      WHERE helper_id=${userId}
      ORDER BY
        start_date,
        start_time
      `;

    const data = await db.query(queryStr);
    const tasks = data.rows;
    return tasks;
  },

  updateHelper: async (params) => {
    const { taskId, userId } = params;
    const queryStr = `
      UPDATE nexdoor.tasks
      SET
        helper_id=${userId},
        status='Pending'
      WHERE task_id=${taskId}
      RETURNING task_id
    `;
    const data = await db.query(queryStr);
    const taskIdRet = data.rows[0];
    return taskIdRet;
  },

  removeHelper: async (taskId) => {
    const queryStr = `
      UPDATE nexdoor.tasks
      SET
        helper_id=null,
        status='Open'
      WHERE task_id=${taskId}
      RETURNING task_id
    ;`;
    const data = await db.query(queryStr);
    const taskIdRet = data.rows[0];
    return taskIdRet;
  },

  changeTaskStatus: async (params) => {
    const { status, taskId } = params;
    const queryStr = `
      UPDATE nexdoor.tasks
      SET status='${status}'
      WHERE task_id=${taskId}
      RETURNING task_id
    ;`;
    const data = await db.query(queryStr);
    const taskIdRet = data.rows[0];
    return taskIdRet;
  },

  closeTask: async (params, review) => {
    const { taskId, rating } = params;

    const queryStr1 = `
      UPDATE nexdoor.users
        SET
          task_count=task_count + 1,
          karma=karma + ${rating}
        WHERE user_id=(
          SELECT helper_id
          FROM nexdoor.tasks
          WHERE task_id=${taskId}
        )
    ;`;
    const queryStr2 = `
      UPDATE nexdoor.users
      SET avg_rating=karma / task_count
      WHERE user_id=(
        SELECT helper_id
        FROM nexdoor.tasks
        WHERE task_id=${taskId}
      )
    ;`;
    const queryStr3 = `
      UPDATE nexdoor.tasks
      SET status='Closed'
      WHERE task_id=${taskId}
    ;`;
    const queryStr4 = `
      INSERT INTO nexdoor.reviews (
        rating,
        review,
        requester_id,
        helper_id
      )
      VALUES (
        ${rating},
        '${review}',
        (
          SELECT requester_id
          FROM nexdoor.tasks
          WHERE task_id=${taskId}
        ),
        (
          SELECT helper_id
          FROM nexdoor.tasks
          WHERE task_id=${taskId}
        )
      )
    ;`;
    try {
      await db.query(queryStr1);
      await db.query(queryStr2);
      await db.query(queryStr3);
      const data = await db.query(queryStr4);
      const taskIdRet = data.rows[0];
      return taskIdRet;
    } catch (err) {
      return err;
    }
  },

  deleteTask: async (taskId) => {
    const queryStr = `
      DELETE FROM nexdoor.tasks
      WHERE task_id=${taskId}
    ;`;
    await db.query(queryStr);
    return `${taskId} deleted`;
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
  getTasksMasterDefaultAddress: (req, res) => {
    const {
      userId,
      range,
      quantity,
      offset,
    } = req.params;
    const queryStr = `
      SELECT
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(req))
          FROM (
            SELECT
              task_id,
              (
                SELECT ROW_TO_JSON(reqname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.requester_id
                ) reqname
              ) as requester,
              (
                SELECT ROW_TO_JSON(helpname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.helper_id
                ) helpname
              ) as helper,
              (
                SELECT ROW_TO_JSON(loc)
                FROM (
                  SELECT *
                  FROM nexdoor.address
                  WHERE address_id=nexdoor.tasks.address_id
                ) loc
              ) as location,
              description,
              car_required,
              physical_labor_required,
              status,
              category,
              start_date,
              end_date,
              start_time,
              duration,
              timestamp_requested
            FROM nexdoor.tasks
            WHERE requester_id=${userId}
            AND (
              (
                SELECT coordinate
                FROM nexdoor.address
                WHERE address_id=nexdoor.tasks.address_id
              )
              <@>
              (
                SELECT coordinate
                FROM nexdoor.address
                WHERE address_id=
                  (
                    SELECT address_id
                    FROM nexdoor.users
                    WHERE user_id=${userId}
                  )
                ) < ${range}
              )
            ORDER BY
              start_date,
              start_time
          ) req
        ) AS requested,
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(help))
          FROM (
            SELECT
              task_id,
              (
                SELECT ROW_TO_JSON(reqname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.requester_id
                ) reqname
              ) AS requester,
              (
                SELECT ROW_TO_JSON(helpname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.helper_id
                ) helpname
              ) AS helper,
              (
                SELECT ROW_TO_JSON(loc)
                FROM (
                  SELECT *
                  FROM nexdoor.address
                  WHERE address_id=nexdoor.tasks.address_id
                ) loc
              ) AS location,
              description,
              car_required,
              physical_labor_required,
              status,
              category,
              start_date,
              end_date,
              start_time,
              duration,
              timestamp_requested
            FROM nexdoor.tasks
            WHERE helper_id=${userId} AND (
              (
                SELECT coordinate
                FROM nexdoor.address
                WHERE address_id=nexdoor.tasks.address_id
              )
              <@>
              (
                SELECT coordinate
                FROM nexdoor.address
                WHERE address_id=
                  (
                    SELECT address_id
                    FROM nexdoor.users
                    WHERE user_id=${userId}
                  )
                ) < ${range}
              )
            ORDER BY
              start_date,
              start_time
          ) help
        ) as helper,
        (
          SELECT array_to_json(array_agg(allothers))
          FROM (
            SELECT
                task_id,
                (
                  SELECT ROW_TO_JSON(reqname)
                  FROM (
                    SELECT
                      user_id,
                      firstname,
                      lastname,
                      email,
                      address_id,
                      karma,
                      task_count,
                      avg_rating,
                      profile_picture_url
                    FROM nexdoor.users
                    WHERE user_id=nexdoor.tasks.requester_id
                  ) reqname
                ) as requester,
                (
                  SELECT ROW_TO_JSON(helpname)
                  FROM (
                    SELECT
                      user_id,
                      firstname,
                      lastname,
                      email,
                      address_id,
                      karma,
                      task_count,
                      avg_rating,
                      profile_picture_url
                    FROM nexdoor.users
                    WHERE user_id=nexdoor.tasks.helper_id
                  ) helpname
                ) AS helper,
                (
                  SELECT ROW_TO_JSON(loc)
                  FROM (
                    SELECT *
                    FROM nexdoor.address
                    WHERE address_id=nexdoor.tasks.address_id
                  ) loc
                ) AS location,
                description,
                car_required,
                physical_labor_required,
                status,
                category,
                start_date,
                end_date,
                start_time,
                duration,
                timestamp_requested
              FROM nexdoor.tasks
              WHERE
                (requester_id != ${userId} AND
                (
                  helper_id != ${userId} OR
                  helper_id IS NULL
                )) AND (
                  (
                    SELECT coordinate
                    FROM nexdoor.address
                    WHERE address_id=nexdoor.tasks.address_id
                  )
                  <@>
                  (
                    SELECT coordinate
                    FROM nexdoor.address
                    WHERE address_id=
                      (
                        SELECT address_id
                        FROM nexdoor.users
                        WHERE user_id=${userId}
                      )
                    ) < ${range}
                  )
              ORDER BY
                start_date,
                start_time
              LIMIT ${quantity}
              OFFSET ${offset}
          ) allothers
        ) as allothers
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
  // GET ALL TASKS WITHIN A MILEAGE RANGE FOR A USER AT AN ALTERNATE ADDRESS (HELPER TASKS, REQUESTER TASKS, ALL OTHER TASKS)
  // *************************************************************
  // Needs from Front End - userId, range (in miles), quantity, offset (quantity and offset only apply to 'all other tasks'), alternate address info
  // Returns - gigantic tasks object with keys for requested, helper, and all other which all hold arrays of task objects
  // *************************************************************
  getTasksMasterAltAddress: (req, res) => {
    const {
      userId,
      range,
      quantity,
      offset,
    } = req.params;
    const {
      streetAddress,
      city,
      state,
      zipcode,
    } = req.body;

    const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
    let coordinate;

    const queryDb = () => {
      const queryStr = `
      SELECT
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(req))
          FROM (
            SELECT
              task_id,
              (
                SELECT ROW_TO_JSON(reqname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.requester_id
                ) reqname
              ) as requester,
              (
                SELECT ROW_TO_JSON(helpname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.helper_id
                ) helpname
              ) as helper,
              (
                SELECT ROW_TO_JSON(loc)
                FROM (
                  SELECT *
                  FROM nexdoor.address
                  WHERE address_id=nexdoor.tasks.address_id
                ) loc
              ) as location,
              description,
              car_required,
              physical_labor_required,
              status,
              category,
              start_date,
              end_date,
              start_time,
              duration,
              timestamp_requested
            FROM nexdoor.tasks
            WHERE requester_id=${userId} AND ((
              (
                SELECT coordinate
                FROM nexdoor.address
                WHERE address_id=nexdoor.tasks.address_id
              )
              <@>
              (${coordinate})
                ) < ${range}
              )
            ORDER BY
              start_date,
              start_time
          ) req
        ) AS requested,
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(help))
          FROM (
            SELECT
              task_id,
              (
                SELECT ROW_TO_JSON(reqname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.requester_id
                ) reqname
              ) AS requester,
              (
                SELECT ROW_TO_JSON(helpname)
                FROM (
                  SELECT
                    user_id,
                    firstname,
                    lastname,
                    email,
                    address_id,
                    karma,
                    task_count,
                    avg_rating,
                    profile_picture_url
                  FROM nexdoor.users
                  WHERE user_id=nexdoor.tasks.helper_id
                ) helpname
              ) AS helper,
              (
                SELECT ROW_TO_JSON(loc)
                FROM (
                  SELECT *
                  FROM nexdoor.address
                  WHERE address_id=nexdoor.tasks.address_id
                ) loc
              ) AS location,
              description,
              car_required,
              physical_labor_required,
              status,
              category,
              start_date,
              end_date,
              start_time,
              duration,
              timestamp_requested
            FROM nexdoor.tasks
            WHERE helper_id=${userId} AND ((
              (
                SELECT coordinate
                FROM nexdoor.address
                WHERE address_id=nexdoor.tasks.address_id
              )
              <@>
              (${coordinate})
                ) < ${range}
              )
            ORDER BY
              start_date,
              start_time
          ) help
        ) as helper,
        (
          SELECT array_to_json(array_agg(allothers))
          FROM (
            SELECT
                task_id,
                (
                  SELECT ROW_TO_JSON(reqname)
                  FROM (
                    SELECT
                      user_id,
                      firstname,
                      lastname,
                      email,
                      address_id,
                      karma,
                      task_count,
                      avg_rating,
                      profile_picture_url
                    FROM nexdoor.users
                    WHERE user_id=nexdoor.tasks.requester_id
                  ) reqname
                ) as requester,
                (
                  SELECT ROW_TO_JSON(helpname)
                  FROM (
                    SELECT
                      user_id,
                      firstname,
                      lastname,
                      email,
                      address_id,
                      karma,
                      task_count,
                      avg_rating,
                      profile_picture_url
                    FROM nexdoor.users
                    WHERE user_id=nexdoor.tasks.helper_id
                  ) helpname
                ) AS helper,
                (
                  SELECT ROW_TO_JSON(loc)
                  FROM (
                    SELECT *
                    FROM nexdoor.address
                    WHERE address_id=nexdoor.tasks.address_id
                  ) loc
                ) AS location,
                description,
                car_required,
                physical_labor_required,
                status,
                category,
                start_date,
                end_date,
                start_time,
                duration,
                timestamp_requested
              FROM nexdoor.tasks
              WHERE
                (requester_id != ${userId} AND
                (
                  helper_id != ${userId} OR
                  helper_id IS NULL
                )) AND ((
                  (
                    SELECT coordinate
                    FROM nexdoor.address
                    WHERE address_id=nexdoor.tasks.address_id
                  )
                  <@>
                  (${coordinate})
                    ) < ${range}
                  )
              ORDER BY
                start_date,
                start_time
              LIMIT ${quantity}
              OFFSET ${offset}
          ) allothers
        ) as allothers
      `;
      db.query(queryStr)
        .then((data) => {
          res.status(200).send(data.rows[0]);
        })
        .catch((err) => {
          res.status(400).send(err.stack);
        });
    };

    getCoordinates(addressQuery)
      .then((testCoord) => {
        coordinate = `point(${testCoord.lng},${testCoord.lat})`;
      })
      .then(() => {
        queryDb();
      })
      .catch((err) => {
        res.status(400).send('Error getting coordinates', err.stack);
      });
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
  editTask: (req, res) => {
    const {
      streetAddress,
      city,
      state,
      zipcode,
      neighborhood,
      description,
      carRequired,
      laborRequired,
      category,
      startDate,
      endDate,
      startTime,
      duration,
      taskId,
    } = req.body;
    const addressQuery = `${streetAddress}+${city}+${state}+${zipcode}`;
    let coordinate;
    let newAddId;

    const queryStr1 = `
      SELECT address_id
      FROM nexdoor.address
      WHERE street_address='${streetAddress}'
      AND zipcode=${zipcode}
    ;`;
    const queryStr2 = `
      UPDATE nexdoor.tasks
      SET
        address_id=
        (
          SELECT address_id
          FROM nexdoor.address
          WHERE street_address='${streetAddress}'
          AND zipcode=${zipcode}
        ),
        description='${description}',
        car_required=${carRequired},
        physical_labor_required=${laborRequired},
        category='${category}',
        start_date='${startDate}',
        end_date='${endDate}',
        start_time='${startTime}',
        duration=${duration}
      WHERE task_id=${taskId}
    ;`;
    const queryDbTwo = () => {
      const queryStr4 = `
        UPDATE nexdoor.tasks
        SET
          nexdoor.tasks.address_id=${newAddId},
          description='${description}',
          car_required=${carRequired},
          physical_labor_required=${laborRequired},
          category='${category}',
          start_date='${startDate}',
          end_date='${endDate}',
          start_time='${startTime}',
          duration=${duration}
        WHERE task_id=${taskId}
      ;`;
      db.query(queryStr4)
        .then(() => {
          res.status(200).send('Task finally updated');
        })
        .catch((err) => {
          res.status(400).send(err.stack);
        });
    };
    const queryDbOne = () => {
      const queryStr3 = `
          INSERT INTO nexdoor.address
          (
            street_address,
            city,
            state,
            zipcode,
            neighborhood,
            coordinate
          )
          VALUES
          (
            '${streetAddress}',
            '${city}',
            '${state}',
            ${zipcode},
            '${neighborhood}',
            ${coordinate}
          )
          RETURNING address_id
      ;`;
      db.query(queryStr3)
        .then((data2) => {
          newAddId = data2.rows[0].address_id;
        })
        .then(() => {
          queryDbTwo();
        })
        .catch((err) => {
          res.status(400).send(err.stack);
        });
    };
    db.query(queryStr1)
      .then((data) => {
        if (data.rows.length > 0) {
          db.query(queryStr2)
            .then(() => {
              res.status(200).send(`Updated task ${taskId}`);
            })
            .catch((err) => {
              res.status(400).send(err.stack);
            });
        } else {
          getCoordinates(addressQuery)
            .then((testCoord) => {
              coordinate = `point(${testCoord.lng},${testCoord.lat})`;
            })
            .then(() => {
              queryDbOne();
            })
            .catch((err) => {
              res.status(400).send(err.stack);
            });
        }
      })
      .catch((err) => {
        res.status(400).send(err.stack);
      });
  },
};

module.exports = taskModels;
