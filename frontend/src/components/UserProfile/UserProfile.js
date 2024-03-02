// UserProfile.js

import React from 'react';

function UserProfile({ user, onSignOut }) {
      return (
        <div>
          <img src={user.picture} alt={`${user.name}'s profile`} />
          <h3>{user.name}</h3>
        </div>
      );
    }
    
    export default UserProfile;
    