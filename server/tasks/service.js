/* eslint-disable spaced-comment */
/* eslint-disable max-len */
const db = require('../../db/index');

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
      )
      RETURNING task_id
    `;

    const data = await db.query(queryStr);
    const insertId = data.rows[0];
    return insertId;
  },

  getTasks: async (params) => {
    const { userId, quantity, offset } = params;

    const queryStr = `
      SELECT ROW_TO_JSON(alltasks) AS all
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
        ) alltasks
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

  getTasksMasterDefaultAddress: async (params) => {
    const {
      userId,
      range,
      quantity,
      offset,
    } = params;

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

    const data = await db.query(queryStr);
    const tasks = data.rows[0];
    return tasks;
  },

  getTasksMasterAltAddress: async (params, body) => {
    const {
      userId,
      range,
      quantity,
      offset,
    } = params;

    const {
      coordinate,
    } = body;

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
    const data = await db.query(queryStr);
    const tasks = data.rows[0];
    return tasks;
  },

  editTask: async (body) => {
    const {
      streetAddress,
      city,
      state,
      zipcode,
      coordinate,
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
    } = body;

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

    const data1 = await db.query(queryStr1);
    if (data1.rows.length > 0) {
      await db.query(queryStr2);
      return `Updated task ${taskId}`;
    }

    const data2 = await db.query(queryStr3);
    const newAddressId = data2.rows[0].address_id;

    const queryStr4 = `
      UPDATE nexdoor.tasks
      SET
        nexdoor.tasks.address_id=${newAddressId},
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

    await db.query(queryStr4);
    return `Updated task ${taskId}`;
  },
};

module.exports = taskModels;
