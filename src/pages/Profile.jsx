import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMale, FaFemale, FaUsers } from 'react-icons/fa'; // Importing male, female, and other icons
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('profile'));

    if (savedProfile) {
      setProfile(savedProfile);
      setName(savedProfile.name || '');
      setSex(savedProfile.sex || '');
      setAddress(savedProfile.address || '');
      setBirthdate(savedProfile.birthdate || '');
      setAge(savedProfile.age || '');
    } else {
      const fetchProfile = async () => {
        try {
          const { data } = await axios.get('http://localhost:5000/api/profile', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setProfile(data);
          setName(data.name || '');
          setSex(data.sex || '');
          setAddress(data.address || '');
          setBirthdate(data.birthdate || '');
          setAge(data.age || '');
        } catch (error) {
          console.error('Error fetching profile:', error.response || error.message);
          alert('Error fetching profile');
        }
      };
      fetchProfile();
    }
  }, []);

  const calculateAge = (birthdate) => {
    const birthDateObj = new Date(birthdate);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDateObj.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleBirthdateChange = (e) => {
    const selectedDate = e.target.value;
    setBirthdate(selectedDate);
    const calculatedAge = calculateAge(selectedDate);
    setAge(calculatedAge);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const updatedData = { name, sex, address, birthdate, age };

    try {
      const response = await axios.put('http://localhost:5000/api/profile', updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const updatedProfile = { name, sex, address, birthdate, age };
      localStorage.setItem('profile', JSON.stringify(updatedProfile));

      setProfile(updatedProfile);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message || error);
      alert('Error updating profile.');
    }
  };

  // Function to render logo based on gender with distinct hair styles for male and female
  const renderProfileLogo = () => {
    if (sex === 'Male') {
      return <FaMale className="profile-logo male" size={80} color="#00ff00" />;
    } else if (sex === 'Female') {
      return <FaFemale className="profile-logo female" size={80} color="#00ff00" />;
    } else if (sex === 'Other') {
      return <FaUsers className="profile-logo other" size={80} color="#00ff00" />;
    }
    return null;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{isEditing ? 'Edit Profile' : ''}</h2>
      </div>

      {profile && !isEditing && (
        <div className="profile-info">
          <div className="info-card">
            {renderProfileLogo()} {/* Render the profile picture logo */}
            <h2 className="profile-name">{profile.name}</h2> {/* Display profile name */}
            <p><strong>Sex:</strong> {profile.sex}</p>
            <p><strong>Address:</strong> {profile.address}</p>
            <p><strong>Birthdate:</strong> {profile.birthdate}</p>
            <p><strong>Age:</strong> {profile.age}</p>
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit Profile</button>
            <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      )}

      {isEditing && profile && (
        <form onSubmit={handleProfileUpdate} className="edit-form">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Sex:</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Address:</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Birthdate:</label>
            <input type="date" value={birthdate} onChange={handleBirthdateChange} />
          </div>
          <div className="form-group">
            <label>Age:</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} disabled />
          </div>
          <button type="submit" className="update-button">Update Profile</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
