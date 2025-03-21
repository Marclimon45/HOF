import React, { useState } from "react";
import styles from "../styles/register.module.css";
import { FaDiscord, FaTimes, FaGithub, FaLinkedin, FaUser, FaUserAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { db, auth } from "../firebase/firebaseconfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link"; // Added for linking to TOS and Privacy Policy
import { useRouter } from "next/router"; // Added for redirecting to homepage

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    discordUsername: "",
    githubUrl: "",
    linkedinUrl: "",
    skills: [],
    tools: [],
    availability: {},
    areaOfInterest: [],
    customAreaOfInterest: "",
    rank: "Unranked",
    contributions: 0,
  });

  const [isTosAccepted, setIsTosAccepted] = useState(false); // New state for checkbox
  const router = useRouter(); // Initialize router for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert("Please fill out all required fields before submitting.");
      console.log("Form Data:", formData);
      return;
    }

    if (!isTosAccepted) {
      alert("Please agree to the Terms of Service and Privacy Policy before submitting.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("This email is already registered. Please use a different email.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("User authentication failed.");
      }

      const docRef = await addDoc(collection(db, "users"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        discordUsername: formData.discordUsername,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        skills: formData.skills,
        tools: formData.tools,
        availability: formData.availability,
        areaOfInterest: [...formData.areaOfInterest, formData.customAreaOfInterest].filter(Boolean),
        rank: formData.rank,
        contributions: formData.contributions,
        userId: user.uid,
      });

      console.log("Document written with ID: ", docRef.id);
      alert("Profile completed successfully!");
      router.push("/"); // Redirect to homepage after success
    } catch (error) {
      console.error("Error: ", error);
      alert("Error submitting profile: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault(); // Prevent form submission
      const newSkill = e.target.value.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill],
        }));
      }
      e.target.value = "";
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const toggleAvailability = (day) => {
    setFormData((prev) => {
      const updatedAvailability = { ...prev.availability };
      if (updatedAvailability[day]) {
        delete updatedAvailability[day];
      } else {
        updatedAvailability[day] = [];
      }
      return { ...prev, availability: updatedAvailability };
    });
  };

  const handleTimeChange = (day, index, type, value) => {
    setFormData((prev) => {
      const updatedTimes = [...prev.availability[day]];
      updatedTimes[index] = { ...updatedTimes[index], [type]: value };
      return {
        ...prev,
        availability: { ...prev.availability, [day]: updatedTimes },
      };
    });
  };

  const addTimeSlot = (day) => {
    setFormData((prev) => {
      const updatedTimes = prev.availability[day] ? [...prev.availability[day]] : [];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: [...updatedTimes, { start: "09:00", end: "17:00" }],
        },
      };
    });
  };

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => {
      const updatedTimes = prev.availability[day].filter((_, i) => i !== index);
      return {
        ...prev,
        availability: { ...prev.availability, [day]: updatedTimes },
      };
    });
  };

  const toggleCheckbox = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const areasOfInterest = [
    "Cybersecurity",
    "Data Science",
    "Frontend Development",
    "Backend Development",
    "UI/UX Design",
    "Machine Learning",
    "AI Specialist",
    "Data Analysis",
  ];
  const toolsAndPlatforms = [
    "VS Code",
    "Git",
    "Docker",
    "Figma",
    "AWS",
    "Jira",
    "Adobe XD",
    "Slack",
    "Notion",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Join Our Collaborative Community</h2>
        <p className={styles.subtitle}>
          Our lab focuses on ensuring the safety and reliability of cyber-physical systems
        </p>

        <form onSubmit={handleSubmit}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.basicInfoContainer}>
            <div className={styles.inputWithIcon}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputWithIcon}>
              <FaUserAlt className={styles.inputIcon} />
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputWithIcon}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputWithIcon}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Social & Professional Links</h3>
          <div className={styles.formGrid}>
            <div className={styles.inputWithIcon}>
              <FaDiscord className={styles.inputIcon} />
              <input
                type="text"
                name="discordUsername"
                placeholder="Enter Discord username"
                value={formData.discordUsername}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.inputWithIcon}>
              <FaLinkedin className={styles.inputIcon} style={{ color: "#0A66C2" }} />
              <input
                type="url"
                name="linkedinUrl"
                placeholder="Enter LinkedIn profile URL"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.inputWithIcon}>
              <FaGithub className={styles.inputIcon} />
              <input
                type="url"
                name="githubUrl"
                placeholder="Enter GitHub profile URL"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Skills & Expertise</h3>
          <div className={styles.skillInputContainer}>
            {formData.skills.map((skill, index) => (
              <span key={index} className={styles.skillItem}>
                <span className={styles.skillText}>{skill}</span>
                <FaTimes className={styles.removeIcon} onClick={() => removeSkill(skill)} />
              </span>
            ))}
            <input
              type="text"
              placeholder="Type a skill and press enter..."
              onKeyDown={handleSkillInput}
              className={styles.skillInput}
            />
          </div>

          <h3 className={styles.sectionTitle}>Tools & Platforms</h3>
          <div className={styles.toolsPlatformsGrid}>
            {toolsAndPlatforms.map((tool) => (
              <label key={tool} className={styles.toolCheckboxLabel}>
                <input
                  type="checkbox"
                  value={tool}
                  checked={formData.tools.includes(tool)}
                  onChange={() => toggleCheckbox("tools", tool)}
                />
                <span>{tool}</span>
              </label>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>Availability</h3>
          <div className={styles.availabilityGrid}>
            {days.map((day) => (
              <div key={day} className={styles.availabilityRow}>
                <label className={styles.availabilityCheckbox}>
                  <input
                    type="checkbox"
                    checked={day in formData.availability}
                    onChange={() => toggleAvailability(day)}
                  />
                  <span>{day}</span>
                </label>
                {formData.availability[day] && (
                  <div className={styles.timeContainer}>
                    {formData.availability[day].map((timeRange, index) => (
                      <div key={index} className={styles.timeInputWrapper}>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={timeRange.start || "09:00"}
                          onChange={(e) => handleTimeChange(day, index, "start", e.target.value)}
                        />
                        <span className={styles.timeSeparator}>to</span>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={timeRange.end || "17:00"}
                          onChange={(e) => handleTimeChange(day, index, "end", e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.removeTimeButton}
                          onClick={() => removeTimeSlot(day, index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.addTimeButton}
                      onClick={() => addTimeSlot(day)}
                    >
                      + Add Time
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>Areas of Interest</h3>
          <div className={styles.areasOfInterestGrid}>
            {areasOfInterest.map((interest) => (
              <label key={interest} className={styles.areaCheckboxLabel}>
                <input
                  type="checkbox"
                  value={interest}
                  checked={formData.areaOfInterest.includes(interest)}
                  onChange={() => toggleCheckbox("areaOfInterest", interest)}
                />
                <span>{interest}</span>
              </label>
            ))}
            <input
              type="text"
              name="customAreaOfInterest"
              placeholder="Enter custom area..."
              value={formData.customAreaOfInterest}
              onChange={handleInputChange}
              className={styles.customAreaInput}
            />
          </div>

          {/* TOS and Privacy Policy Checkbox */}
          <div className={styles.tosContainer}>
            <label className={styles.tosLabel}>
              <input
                type="checkbox"
                checked={isTosAccepted}
                onChange={(e) => setIsTosAccepted(e.target.checked)}
                className={styles.tosCheckbox}
              />
              <span>
                I have read and agree to the{" "}
                <Link href="/terms-of-service" className={styles.tosLink}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className={styles.tosLink}>
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isTosAccepted} // Disable button if TOS not accepted
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;