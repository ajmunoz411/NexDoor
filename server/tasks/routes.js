const express = require('express');

const taskCtrl = require('./controllers');

const tasks = express.Router();

tasks
  .get('/master/:userId/:range/:quantity/:offset', taskCtrl.getTasksMasterDefaultAddress)
  .get('/altmaster/:userId/:range/:quantity/:offset', taskCtrl.getTasksMasterAltAddress)
  .get('/all/:userId/:quantity/:offset', taskCtrl.getTasks)
  .get('/req/:userId', taskCtrl.getReqTasksByUser)
  .get('/help/:userId', taskCtrl.getHelpTasksByUser)
  .get('/range/:userId/:range', taskCtrl.getTasksInRange)

  .put('/help/:taskId/:userId', taskCtrl.updateHelper)
  .put('/rmhelp/:taskId', taskCtrl.removeHelper)
  .put('/change/:status/:taskId', taskCtrl.changeTaskStatus)
  .put('/close/:taskId/:rating', taskCtrl.closeTask)
  .put('/edit', taskCtrl.editTask)

  .post('/new/:userId', taskCtrl.addTaskNewAddress)
  .post('/home/:userId', taskCtrl.addTaskHomeAddress)

  .delete('/:taskId', taskCtrl.deleteTask);

module.exports = tasks;
