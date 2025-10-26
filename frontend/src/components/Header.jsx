import React from "react";

export default function Header() {
  // Future: agar login system add karna ho to yahan se user info aayegi
  const user = null; // abhi static rakha hai

  const handleLogout = () => {
    // Future: logout API call yahan karein
    console.log("Logout clicked");
  };

  return (
    <div className="bg-green-500 text-white px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold flex items-center gap-2">
        Rooted
      </h1>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm">{user.email}</span>}
        {user && (
          <button
            className="bg-white text-green-600 px-3 py-1 rounded text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}