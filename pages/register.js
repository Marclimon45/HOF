import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaDiscord, FaLinkedin, FaGithub } from 'react-icons/fa'; // Import icons
import styles from '../styles/register.module.css'; // Import local CSS

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
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Join Our Collaborative Community</h2>
        <p className={styles.subtitle}>
          Our lab focuses on ensuring the safety and reliability of cyber-physical systems
        </p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.formGrid}>
            {/* First Name */}
            <div className={styles.inputContainer}>
              <FaUser className={styles.icon} />
              <input type="text" name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleInputChange} className={styles.input} />
            </div>

            {/* Last Name */}
            <div className={styles.inputContainer}>
              <FaUser className={styles.icon} />
              <input type="text" name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleInputChange} className={styles.input} />
            </div>

            {/* Email */}
            <div className={styles.inputContainer}>
              <FaEnvelope className={styles.icon} />
              <input type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleInputChange} className={styles.input} />
            </div>

            {/* Password */}
            <div className={styles.inputContainer}>
              <FaLock className={styles.icon} />
              <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleInputChange} className={styles.input} />
            </div>
          </div>

          {/* Social & Professional Links */}
          <h3 className={styles.sectionTitle}>Social & Professional Links</h3>

          {/* Discord Username */}
          <div className={styles.inputContainer}>
            <FaDiscord className={styles.icon} />
            <input type="text" name="discordUsername" placeholder="Enter Discord username" value={formData.discordUsername} onChange={handleInputChange} className={styles.input} />
          </div>

          {/* LinkedIn Profile */}
          <div className={styles.inputContainer}>
            <FaLinkedin className={styles.icon} />
            <input type="url" name="linkedinUrl" placeholder="Enter LinkedIn profile URL" value={formData.linkedinUrl} onChange={handleInputChange} className={styles.input} />
          </div>

          {/* GitHub Profile */}
          <div className={styles.inputContainer}>
            <FaGithub className={styles.icon} />
            <input type="url" name="githubUrl" placeholder="Enter GitHub profile URL" value={formData.githubUrl} onChange={handleInputChange} className={styles.input} />
          </div>

          {/* Skills & Expertise */}
          <h3 className={styles.sectionTitle}>Skills & Expertise</h3>
          <div className={styles.checkboxContainer}>
            {skills.map((skill) => (
              <label key={skill} className={styles.checkboxLabel}>
                <input type="checkbox" value={skill} checked={formData.skills.includes(skill)} onChange={(e) => handleCheckboxChange(e, 'skills')} />
                {skill}
              </label>
            ))}
          </div>

          {/* Availability & Interests */}
          <h3 className={styles.sectionTitle}>Availability & Interests</h3>
          <div className={styles.checkboxContainer}>
            {days.map((day) => (
              <label key={day} className={styles.checkboxLabel}>
                <input type="checkbox" value={day} checked={formData.availability.includes(day)} onChange={(e) => handleCheckboxChange(e, 'availability')} />
                {day} <span className="text-xs text-gray-500">(Add Time)</span>
              </label>
            ))}
            {interests.map((interest) => (
              <label key={interest} className={styles.checkboxLabel}>
                <input type="checkbox" value={interest} checked={formData.availability.includes(interest)} onChange={(e) => handleCheckboxChange(e, 'availability')} />
                {interest}
              </label>
            ))}
          </div>

          {/* Terms & Submit */}
          <label className={styles.terms}>
            <input type="checkbox" required />
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </label>

          <button type="submit" className={styles.submitButton}>Complete Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
