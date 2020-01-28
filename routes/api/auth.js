const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // Use middleware as 2nd parameter, to protect the routes
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

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

// @route       POST api/auth
// @decs        Authenticate user & get token
// @access      Public
router.post(
  '/',
  [
    //VALIDATION
    // email must be an email
    check('email', 'Invalid email').isEmail(),
    // password must exists
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user in DB
      let user = await User.findOne({ email: email });

      // If the user does NOT exist
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // If there is user, check the password (email has already been checked)
      const isMatch = await bcrypt.compare(password, user.password); // Compare password from req.body to the hash password of user stored in DB

      // If passwords dont match
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id // Get user.id from DB (_id field is created automatically in DB)
        }
      };

      // To generate and return token, we need to sign it (payload, secret, object of options, callback(err, token))
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
