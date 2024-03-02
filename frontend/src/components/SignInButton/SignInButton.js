// SignInButton.js
import React, { useEffect } from 'react';

/* global google */
function SignInButton({ onSignIn }) {
  useEffect(() => {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '378137619521-qkec6fbg3pfl5pbr0g28qhel5n2sujau.apps.googleusercontent.com',
        callback: onSignIn,
      });

      google.accounts.id.renderButton(
        document.getElementById("SignInButton"),
        { theme: "outline", size: "large", text: "continue_with", width: "long" }
      );
    }
  }, [onSignIn]);

  return <div id="SignInButton"></div>;
}

export default SignInButton;
