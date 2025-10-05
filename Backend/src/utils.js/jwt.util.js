import jwt from "jsonwebtoken";
import ApiError from "../errors/ApiError.js";
import env from "./env.js";

const jwtServices = {
  signAccessToken: (payload) => {
    const secret = env.JWT_SECRET || "secret";
    const options = {
      expiresIn: Number(env.JWT_ACCESS_TOKEN_EXPIRES_IN) || "10h",
    };

    return jwt.sign(payload, secret, options);
  },

  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired");
      } else if (
        error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError"
      ) {
        throw new ApiError(401, "Invalid token");
      }
      throw error;
    }
  },
};

export default jwtServices;
