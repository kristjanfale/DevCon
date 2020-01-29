const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // Use middleware as 2nd parameter, to protect the routes

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route       GET api/profile/me
// @decs        Get current users profile
// @access      Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']); // Profile Model has a user field, which is ObjectId. Add 'name' and 'avatar' from User Model

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;