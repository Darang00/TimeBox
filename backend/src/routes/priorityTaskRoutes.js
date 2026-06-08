// priorityTaskRoutes.js
// Priority Task API URL 경로 정의 (Spring @RequestMapping 역할)

const express = require('express');
const router = express.Router();
const priorityTaskController = require('../controllers/priorityTaskController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, priorityTaskController.getPriorityTasks);
router.post('/', authMiddleware, priorityTaskController.addPriorityTask);
router.delete('/dump/:dumpId', authMiddleware, priorityTaskController.deletePriorityTaskByDumpId);
router.patch('/reorder', authMiddleware, priorityTaskController.updateTaskIndex);
router.patch('/complete', authMiddleware, priorityTaskController.updateCompleted);
router.patch('/max-priority', authMiddleware, priorityTaskController.updateMaxPriority);
router.get('/max-priority', authMiddleware, priorityTaskController.getMaxPriority);

module.exports = router;