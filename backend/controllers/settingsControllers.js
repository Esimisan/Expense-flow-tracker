import User from "../models/user-model.js";

//Get logged-in user's settings + avatar
export const getUserSettings = async (req, res) => {
  res.json({
    avatar: req.user.avatar,
    settings: req.user.settings,
  });
};

//Update logged-in user's settings and/or avatar
export const updateSettings = async (req, res) => {
  const { currency, monthlyBudget, darkMode, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (currency !== undefined) user.settings.currency = currency;
  if (monthlyBudget !== undefined) user.settings.monthlyBudget = monthlyBudget;
  if (darkMode !== undefined) user.settings.darkMode = darkMode;
  if (avatar !== undefined) user.avatar = avatar;

  const updatedUser = await user.save();
  res.json({
    avatar: updatedUser.avatar,
    settings: updatedUser.settings,
  });
};
