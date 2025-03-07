import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    discordUsername: '',
    githubUrl: '',
    linkedinUrl: '',
    skills: [],
    availability: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted! Check the console for data.');
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const skills = ['JavaScript', 'Python', 'Java', 'Rust', 'Go', 'UI/UX Design'];
  const interests = ['Cybersecurity', 'Data Science', 'Machine Learning', 'Frontend Development', 'Backend Development', 'Data Analysis'];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-xl font-bold text-gray-700 text-center mb-2">Xin | Kit of Fame</h1>
        <h2 className="text-3xl font-extrabold text-blue-600 text-center mb-2">Join Our Collaborative Community</h2>
        <p className="text-center text-gray-500 mb-6">
          Our lab focuses on ensuring the safety and reliability of cyber-physical systems
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input-style" />
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input-style" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="input-style col-span-2" />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="input-style col-span-2" />
            </div>
          </div>

          {/* Social & Professional Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social & Professional Links</h3>
            <input type="text" name="discordUsername" placeholder="Discord Username" value={formData.discordUsername} onChange={handleInputChange} className="input-style" />
            <input type="url" name="githubUrl" placeholder="GitHub Profile URL" value={formData.githubUrl} onChange={handleInputChange} className="input-style" />
            <input type="url" name="linkedinUrl" placeholder="LinkedIn Profile URL" value={formData.linkedinUrl} onChange={handleInputChange} className="input-style" />
          </div>

          {/* Skills & Expertise */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            <div className="grid grid-cols-3 gap-2">
              {skills.map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input type="checkbox" value={skill} checked={formData.skills.includes(skill)} onChange={(e) => handleCheckboxChange(e, 'skills')} />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability & Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Availability & Interests</h3>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input type="checkbox" value={day} checked={formData.availability.includes(day)} onChange={(e) => handleCheckboxChange(e, 'availability')} />
                  <span>{day} <span className="text-xs text-gray-500">(Add Time)</span></span>
                </label>
              ))}
              {interests.map((interest) => (
                <label key={interest} className="flex items-center space-x-2">
                  <input type="checkbox" value={interest} checked={formData.availability.includes(interest)} onChange={(e) => handleCheckboxChange(e, 'availability')} />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" required />
            <span className="text-sm">I agree to the <a href="#" className="text-blue-600">Terms of Service</a> and <a href="#" className="text-blue-600">Privacy Policy</a></span>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Complete Profile
          </button>
        </form>
      </div>

      {/* Add styles directly or in a global CSS file */}
      <style jsx>{`
        .input-style {
          @apply w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
        }
      `}</style>
    </div>
  );
};

export default Register;
``
