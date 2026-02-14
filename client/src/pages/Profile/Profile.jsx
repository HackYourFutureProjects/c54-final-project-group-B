import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // التوكن بعد تسجيل الدخول
    if (!token) return;

    axios
      .get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-[#F5F5F7]">
        <p className="text-xl text-[#6A1B9A] animate-pulse">
          Loading profile...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#6A1B9A" }}
        >
          My Profile
        </h1>
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="font-semibold">Name:</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Joined:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          className="mt-6 w-full py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: "#FFCA28" }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
