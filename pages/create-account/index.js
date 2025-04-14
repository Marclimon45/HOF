import React, { useState } from 'react';
import styles from '../../styles/create-account.module.css';

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    discordUsername: '',
    linkedinUrl: '',
    githubUrl: '',
    technicalSkills: [],
    tools: [],
    areaOfInterest: [],
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {/* Avatar placeholder */}
            </div>
            <span className={styles.changePhotoText}>Change Profile Picture</span>
          </div>
          <div className={styles.nameFields}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="firstName"
                className={styles.input}
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="lastName"
                className={styles.input}
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Social & Professional Links</h2>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="discordUsername"
              className={styles.input}
              value={formData.discordUsername}
              onChange={handleInputChange}
              placeholder="Discord Username"
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="url"
              name="linkedinUrl"
              className={styles.input}
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="LinkedIn Profile URL"
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="url"
              name="githubUrl"
              className={styles.input}
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="GitHub Profile URL"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Skills & Expertise</h2>
          <div className={styles.formGroup}>
            <label>Technical Skills</label>
            <div className={styles.skillTags}>
              <span className={styles.skillTag}>JavaScript</span>
              <span className={styles.skillTag}>Python</span>
              <span className={styles.skillTag}>React</span>
              <span className={styles.skillTag}>Node.js</span>
              <span className={styles.skillTag}>UX/UI Design</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Tools & Platforms</label>
            <div className={styles.toolsGrid}>
              {[
                'VS Code',
                'Git',
                'Docker',
                'AWS',
                'Figma',
                'JIRA',
                'Azure',
                'NodeJS',
                'Redux'
              ].map((tool) => (
                <label key={tool} className={styles.toolCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.tools.includes(tool)}
                    onChange={(e) => {
                      const newTools = e.target.checked
                        ? [...formData.tools, tool]
                        : formData.tools.filter(t => t !== tool);
                      setFormData(prev => ({ ...prev, tools: newTools }));
                    }}
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Availability & Interests</h2>
          <div className={styles.formGroup}>
            <label>Time Availability</label>
            <div className={styles.timeGrid}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className={styles.daySection}>
                  <div className={styles.dayCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.availability[day]?.length > 0}
                      onChange={(e) => {
                        const newAvailability = { ...formData.availability };
                        if (e.target.checked) {
                          newAvailability[day] = [{ start: "09:00", end: "17:00" }];
                        } else {
                          newAvailability[day] = [];
                        }
                        setFormData(prev => ({
                          ...prev,
                          availability: newAvailability
                        }));
                      }}
                    />
                    <span className={styles.dayLabel}>{day}</span>
                  </div>
                  <button type="button" className={styles.timeAction}>
                    {formData.availability[day]?.length > 0 ? 'Change Time' : 'Add Time'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Areas of Interest</label>
            <div className={styles.interestGrid}>
              {[
                'Cybersecurity',
                'Data Science',
                'Frontend Developer',
                'Backend Developer',
                'Full Stack Developer',
                'DevOps',
                'UXUI Design',
                'Machine Learning',
                'QA Specialist',
                'Data Analyst'
              ].map((interest) => (
                <label key={interest} className={styles.interestCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.areaOfInterest.includes(interest)}
                    onChange={(e) => {
                      const newInterests = e.target.checked
                        ? [...formData.areaOfInterest, interest]
                        : formData.areaOfInterest.filter(i => i !== interest);
                      setFormData(prev => ({ ...prev, areaOfInterest: newInterests }));
                    }}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
} 