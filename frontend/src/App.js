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

  const sendTokenToBackend = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:5100/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin':'http://127.0.0.1:3000',
          "Not-a-header":"Not a header"
        },
        mode: "cors",
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.user) {
          setUser(data.user);
        }
      } else {
        console.error("Error verifying ID token:", response.status);
      }
    } catch (error) {
      console.error("Error verifying ID token:", error);
    }
  };

  const handleSignOut = () => {
    setUser({});
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MinService</h1>
          <main className="App-main">
          {!user.name && (
            <SignInButton onSignIn={handleCallbackResponse} />
          )}
          </main>
        {user.name && (
          <div className="user-details">
            <UserProfile user={user} />
          </div>
        )}
        <div className="sign-out-container">
          {user.name && <SignOutButton onSignOut={handleSignOut} />}
        </div>
      </header>
    </div>
  );
}

export default App;




