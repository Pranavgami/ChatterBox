import User from "../models/users.js";
import jwtServices from "../utils.js/jwt.util.js";
import ApiError from "../errors/ApiError.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtServices.verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(error.status || 401, error.message || "Unauthorized");
  }
};
