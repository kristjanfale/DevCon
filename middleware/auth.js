// Middleware is a function that has access to request and response object
// When we send a request to protected route(@access - private), we need to send the token in the header

// Use to check there is a TOKEN in the header and then validate it

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Decode token
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // Assign decoded.user to req.user (decoded has {user: {id : "sldj..."} } in the payload)
    req.user = decoded.user; // We can use req.user in any of our protected routes

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
