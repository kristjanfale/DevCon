const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // Use middleware as 2nd parameter, to protect the routes

const User = require('../../models/User');

// @route       GET api/auth
// @decs        Get logged in user
// @access      Private
router.get('/', auth, async (req, res) => {
  try {
    // findById() is a mongoose method and returns all user data, including password
    const user = await User.findById(req.user.id).select('-password'); // In middleware/auth.js we set req.user to decoded.user, so we can access users id from here
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
