import React, { useState } from "react";
import styles from "../styles/register.module.css";
import { 
  FaDiscord, FaTimes, FaGithub, FaLinkedin, FaUser, FaUserAlt, 
  FaEnvelope, FaLock, FaCode, FaDatabase, FaPalette, FaBrain,
  FaChartLine, FaServer, FaRobot, FaLaptopCode, FaDocker,
  FaFigma, FaAws, FaJira, FaSlack, FaStickyNote
} from "react-icons/fa";
import { SiGit, SiAdobexd, SiNotion } from "react-icons/si";
import { db, auth } from "../firebase/firebaseconfig";
import { collection, setDoc, getDocs, query, where, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const [isTosAccepted, setIsTosAccepted] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert("Please fill out all required fields before submitting.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (!isTosAccepted) {
      alert("Please agree to the Terms of Service and Privacy Policy before submitting.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("User authentication failed.");
      }

      await setDoc(doc(db, "users", user.uid), {
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
        createdAt: new Date().toISOString(),
      });

      console.log("User profile created successfully");
      setTimeout(() => {
        router.push("/");
      }, 500);
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
      e.preventDefault();
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
    { name: "Cybersecurity", icon: <FaLock className={styles.areaIcon} /> },
    { name: "Data Science", icon: <FaDatabase className={styles.areaIcon} /> },
    { name: "Frontend Development", icon: <FaCode className={styles.areaIcon} /> },
    { name: "Backend Development", icon: <FaServer className={styles.areaIcon} /> },
    { name: "UI/UX Design", icon: <FaPalette className={styles.areaIcon} /> },
    { name: "Machine Learning", icon: <FaBrain className={styles.areaIcon} /> },
    { name: "AI Specialist", icon: <FaRobot className={styles.areaIcon} /> },
    { name: "Data Analysis", icon: <FaChartLine className={styles.areaIcon} /> }
  ];
  const toolsAndPlatforms = [
    { name: "VS Code", icon: <FaLaptopCode className={styles.toolIcon} /> },
    { name: "Git", icon: <SiGit className={styles.toolIcon} /> },
    { name: "Docker", icon: <FaDocker className={styles.toolIcon} /> },
    { name: "Figma", icon: <FaFigma className={styles.toolIcon} /> },
    { name: "AWS", icon: <FaAws className={styles.toolIcon} /> },
    { name: "Jira", icon: <FaJira className={styles.toolIcon} /> },
    { name: "Adobe XD", icon: <SiAdobexd className={styles.toolIcon} /> },
    { name: "Slack", icon: <FaSlack className={styles.toolIcon} /> },
    { name: "Notion", icon: <SiNotion className={styles.toolIcon} /> }
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
            <div className={styles.inputWithIcon}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
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
              <FaLinkedin className={styles.inputIcon} />
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
              <label key={tool.name} className={styles.toolCheckboxLabel}>
                <input
                  type="checkbox"
                  value={tool.name}
                  checked={formData.tools.includes(tool.name)}
                  onChange={() => toggleCheckbox("tools", tool.name)}
                />
                {tool.icon}
                <span>{tool.name}</span>
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
              <label key={interest.name} className={styles.areaCheckboxLabel}>
                <input
                  type="checkbox"
                  value={interest.name}
                  checked={formData.areaOfInterest.includes(interest.name)}
                  onChange={() => toggleCheckbox("areaOfInterest", interest.name)}
                />
                {interest.icon}
                <span>{interest.name}</span>
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
            disabled={!isTosAccepted}
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;