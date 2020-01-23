const express = require('express');
const router = express.Router();

// @route       GET api/users
// @decs        Test route
// @access      Public
router.get('/', (req, res) => res.send('Users route'));

module.exports = router;
