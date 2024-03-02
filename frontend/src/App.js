import React, { useState } from 'react';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import SignInButton from './components/SignInButton/SignInButton';
import UserProfile from './components/UserProfile/UserProfile';
import SignOutButton from './components/SignOutButton/SignOutButton';

function App() {
  const [user, setUser] = useState({});

  const handleCallbackResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    setUser(userObject);
    sendTokenToBackend(response.credential);
  };

  const sendTokenToBackend = (token) => {
    fetch('http://localhost:5000/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      // Handle the response from your backend
      // For example, set the user state with the returned user information
      console.log(data);
      if (data.user) {
        setUser(data.user);
      }
    })
    .catch(error => {
      console.error("Error verifying ID token:", error);
    });
  };

  const handleSignOut = () => {
    setUser({});
  };

  return (
    <div className="App">
      {!user.name && <SignInButton onSignIn={handleCallbackResponse} />}
      {user.name && (
        <div>
          {/* User Profile Display */}
          <UserProfile user={user} />
          
          {/* Independent Sign Out Button */}
          <SignOutButton onSignOut={handleSignOut} />
        </div>
      )}
    </div>
  );
}

export default App;
