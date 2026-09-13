import jwt from "jsonwebtoken";
import User from "../models/user-model.js";

const protect = async (req, res, next) => {
  let token;

  if (
    //Frontend sends JWT on every future request, in a header called Authorization: Bearer <token>
    // So we check if the authorization header exists and starts with "Bearer" before trying to use it.
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //// Split "Bearer eyJhbGciOi..." into ["Bearer", "eyJhbGciOi..."] and take the token part
      token = req.headers.authorization.split(" ")[1];

      //// jwt.verify does two things at once, Checks the token's signature against JWT_SECRET and Check it hasn't expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user no longer exists" });
      }

      next();
    } catch (error) {
      console.error("Token verification failed", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;
