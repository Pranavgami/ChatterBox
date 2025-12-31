import User from "../models/users.js";
import ApiError from "../errors/ApiError.js";
import jwtServices from "../utils.js/jwt.util.js";
import cloudinary from "../lib/cloudinary.js";
import { sendResponse } from "../helpers/responseHandler.js";

const signIn = async (req, res) => {
  try {
    const { fullname, email, password, bio } = req.body;

    if (!fullname || !email || !password) {
      throw new ApiError(400, "All fields are required!");
    }

    const user = await User.findOne({ email });
    if (user) {
      throw new ApiError(400, "Email Already Exixts!");
    }

    const data = await User.create({
      fullname,
      email,
      password,
      bio,
    });

    const token = jwtServices.signAccessToken({
      id: data._id,
      email: data.email,
    });

    const userData = {
      user: data,
      token: token,
    };

    return sendResponse(res, 200, "User Registred successfully", userData);
  } catch (error) {
    throw new ApiError(
      error.status || 400,
      error.message || "Failed to Register."
    );
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await User.matchPassword(password))) {
    }

    const token = jwtServices.signAccessToken({
      id: data._id,
      email: user.email,
    });

    userData = {
      id: data._id,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      token: token,
      companyName: data.companyName || "",
      companyDescription: data.companyDescription || "",
      companyLogo: data.companyLogo || "",
      resume: data.resume || "",
    };

    return sendResponse(res, 200, "Login successfully", userData);
  } catch (error) {
    throw new ApiError(
      error.status || "500",
      error.message || "Internal Server Error"
    );
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "All fields are required!");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (!(await user.matchPassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = jwtServices.signAccessToken({
      id: user._id,
      email: user.email,
    });
    const userData = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      profilePic: user.profilePic || "",
      bio: user.bio || "",
      token: token,
    };
    return sendResponse(res, 200, "Login successful", userData, token);
  } catch (error) {
    throw new ApiError(
      error.status || 500,
      error.message || "Internal Server Error"
    );
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    return sendResponse(res, 200, "User authenticated", user);
  } catch (error) {
    throw new ApiError(
      error.status || 500,
      error.message || "Internal Server Error"
    );
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    const { fullname, bio, profilePic } = req.body;

    const updatedData = {
      fullname: fullname || user.fullname,
      bio: bio || user.bio,
    };

    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updatedData },
        { new: true }
      ).select("-password");
    } else {
      const uploadedImage = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
        width: 150,
        height: 150,
        crop: "fill",
      });

      updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { ...updatedData, profilePic: uploadedImage.secure_url } },
        { new: true },
        { new: true }
      ).select("-password");
    }

    return sendResponse(res, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    throw new ApiError(
      error.status || 500,
      error.message || "Internal Server Error"
    );
  }
};

const searchUsers = async (req, res) => {
  const keyword = req.query.q
    ? {
        $or: [
          { fullname: { $regex: req.query.q, $options: "i" } },
          { email: { $regex: req.query.q, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user.id } })
    .select("-password");

  return sendResponse(res, 200, "Users found", users);
};

export default {
  signIn,
  login,
  updateProfile,
  checkAuth,
  searchUsers,
};
