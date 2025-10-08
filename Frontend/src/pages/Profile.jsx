import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuth();

  const [selectedImg, setSelectedImg] = useState(null);
  const [bio, setBio] = useState(authUser.bio);
  const [name, setName] = useState(authUser.fullname);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      setLoading(true);
      const isSuccess = await updateProfile({ fullname: name, bio });
      if (isSuccess) {
        navigate("/");
      }
      setLoading(false);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onloadend = async () => {
      setLoading(true);
      await updateProfile({ fullname: name, bio, profilePic: reader.result });
      setLoading(false);
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => {
                setSelectedImg(e.target.files[0]);
              }}
              type="file"
              id="avatar"
              accept="image/png, image/jpeg , image/jpg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
            />
            Upload a profile picture
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            value={name}
            required
            placeholder="Enter your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Enter your Bio..."
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-md text-lg cursor-pointer"
          >
            {loading ? "Updating..." : "Save"}
          </button>
        </form>
        <img
          src={authUser?.profilePic || assets.logo_icon}
          className={`max-w-44 aspect-square ${
            authUser?.profilePic && "rounded-full"
          } m-10 max-sm:mb-10`}
          alt="logo"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
