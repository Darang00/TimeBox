// brainDumpRoutes.js
// Brain Dump API URL 경로 정의 (Spring @RequestMapping 역할)

const express = require('express');
const router = express.Router();
const brainDumpController = require('../controllers/brainDumpController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, brainDumpController.addDump);
router.get('/', authMiddleware, brainDumpController.getDumps);
router.patch('/:dumpId/check', authMiddleware, brainDumpController.updateDumpCheck);
router.delete('/:dumpId', authMiddleware, brainDumpController.deleteDump);

module.exports = router;