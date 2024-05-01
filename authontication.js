export function authRole(role) {
    return (req, res, next) => {
      console.log('Checking role:', role);
      console.log('User role:', req.user.ROLE); // Ensure this matches the format of ROLE in your database
  
      if (req.user.ROLE === role) {
        next(); // Role matches, proceed to the next middleware or route handler
      } else {
        res.status(401).send('Not allowed'); // Role does not match, send 401 Unauthorized
      }
    };
  }