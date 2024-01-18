import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostSecret = () => {
  const [userSecret, setUserSecret] = useState('');
  const [postedSecrets, setPostedSecrets] = useState([]);
  const [formEnabled, setFormEnabled] = useState(true);
  const navigate = useNavigate();

  const handleSecretChange = (e) => {
    setUserSecret(e.target.value);
  };

  const handlePostSecret = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('authToken');
      const loggedInUser = localStorage.getItem('loggedInUser');

      let username = 'Anonymous';
      if (loggedInUser) {
        username = loggedInUser;
      }

      const response = await axios.post(
        'http://localhost:3001/home',
        { secret: userSecret, username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPostedSecrets([...postedSecrets, { username, secret: response.data.secret }]);
      setUserSecret('');
      setFormEnabled(false);
    } catch (error) {
      console.error('Error posting secret:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  useEffect(() => {
    const fetchAllSecrets = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3001/home', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const allSecrets = response.data.allSecrets;
  
        setPostedSecrets(allSecrets);
      } catch (error) {
        console.error('Error fetching secrets:', error);
      }
    };
  
    fetchAllSecrets();
  }, []);
  
  return (
    <div className="container mt-4 d-flex justify-content-center align-items-center flex-column bg-secondary vh-100">
      <div className="card mb-6">
        <div className="card-body">
          <h2 className="card-title">Post Your Secret</h2>
          <form onSubmit={handlePostSecret}>
            <div className="mb-3">
              <textarea
                className="form-control"
                placeholder="Share your secret..."
                value={userSecret}
                onChange={handleSecretChange}
                disabled={!formEnabled}
              />
            </div>
            <button type="submit" className="btn btn-success w-100 mt-2 " disabled={!formEnabled}>
              Post Secret
            </button>
          </form>

          <button className="btn btn-danger w-100 mt-2 " onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <h2 className="mt-4">Posted Secrets</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 d-flex justify-content-center">
        {postedSecrets.map((post, index) => (
          <div key={index} className="col">
            <div className="card h-100" style={{ width: '200px' }}>
              <div className="card-body">
                <p className="card-text">
                  <strong>{post.username}</strong>: {post.secret}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostSecret;
