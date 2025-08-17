const User = require('../models/user.models');

const populateUser = async (req, res, next) => {
  try {
    // αυτή η αλλαγή γίνετε για να επιτρέψει στον admin να έχει προσβαση στα queries του user
    // const userId = req.user?.id
   // if I'm an admin and the route has :userId, load *that* user
   const isAdmin = req.user?.roles?.includes('admin');
   const userId   = isAdmin && req.params.userId
                  ? req.params.userId
                  : req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID missing from token' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user.full = user; // attach full user document
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = populateUser;
