const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User'); // get User model

// @route       POST api/users
// @decs        Register user
// @access      Public
router.post(
  '/',
  [
    //VALIDATION
    // name must not be empty
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    // email must be an email
    check('email', 'Invalid email').isEmail(),
    // password must be at least 6 chars long
    check('password', 'Password must be at least 6 chars long').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Find user in DB
      let user = await User.findOne({ email: email });

      // See if the user exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

      // Create instance of user with User model (_id is created automatically in MongoDB)
      user = new User({ name, email, avatar, password });

      // Encrypt password before saving user to DB
      const salt = await bcrypt.genSalt(10); // genSalt(number of rounds-how secured the salt is)
      user.password = bcrypt.hashSync(password, salt); // Hash the password

      // Save user to DB
      await user.save();

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
