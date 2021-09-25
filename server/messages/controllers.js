const messagesService = require('./service');

const messagesControllers = {
  // *************************************************************
  // ADD A MESSAGE
  // *************************************************************
  //   Needs from Front End - taskId, userId, messageBody
  //   Returns - String confirmation
  // *************************************************************
  /*
    POST /api/messages/:taskId/:userId
    req.body = {
      "messageBody": "I\u0027m going out of town",
      "date": "06/13/2021",
      "time": "04:21"
    }
    res = 'Added message to db'
  */
  // *************************************************************
  addMessage: async (req, res) => {
    const params = {
      taskId: req.params.taskId,
      userId: req.params.userId,
    };

    const body = {
      messageBody: req.body.messageBody,
      date: req.body.date,
      time: req.body.time,
      imgUrl: req.body.imgUrl || null,
    };

    try {
      const insertId = await messagesService.addMessage(params, body);
      res.status(200).send(insertId);
    } catch (err) {
      console.log('err adding message', err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET MESSAGES BY TASKID
  // *************************************************************
  /*
    GET /api/messages/${taskId}
    req.body = none
    res = [
      {
        "firstname": "andrew",
        "lastname": "munoz",
        "message_body": "where are you",
        "date": "2021-06-13T07:00:00.000Z",
        "time": "04:51:00"
    },
    {
        "firstname": "Spongebob",
        "lastname": "Squarepants",
        "message_body": "i have no idea where i am",
        "date": "2021-04-13T07:00:00.000Z",
        "time": "06:21:00"
      },
    ]
  */
  // *************************************************************
  getMessagesByTask: async (req, res) => {
    const { taskId } = req.params;

    try {
      const messages = await messagesService.getMessagesByTask(taskId);
      res.status(200).send(messages);
    } catch (err) {
      console.log('err getting messages', err.stack);
    }
  },
  // *************************************************************
};

module.exports = messagesControllers;
