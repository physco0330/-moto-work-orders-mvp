const express = require('express');
const router = express.Router();
const checklistItemController = require('../controllers/checklistItem.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', checklistItemController.getAllItems);
router.post('/', checklistItemController.createItem);
router.put('/:id', checklistItemController.updateItem);
router.delete('/:id', checklistItemController.deleteItem);

module.exports = router;