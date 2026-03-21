import React from 'react'
import { Link } from 'react-router-dom'
const Home = () => {
  const handleGoogleLogin = () => {
    // redirect browser to backend OAuth route
    window.location.href = 'http://localhost:3000/api/v1/auth/google';
  };
  return (
    <div>
        <h2>This is home</h2>
        {/* <Link className="text-black" to="/dashboard">Go to Dashboard</Link>     */}
        <button onClick={handleGoogleLogin}>
          Sign in with Google
        </button>

    </div>
    
  )
}

export default Home