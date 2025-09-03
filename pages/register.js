import React, { useState, useEffect } from "react";
import styles from "../styles/register.module.css";
import { 
  FaDiscord, FaTimes, FaGithub, FaLinkedin, FaUser, FaUserAlt, 
  FaEnvelope, FaLock, FaCode, FaDatabase, FaPalette, FaBrain,
  FaChartLine, FaServer, FaRobot, FaLaptopCode, FaDocker,
  FaFigma, FaAws, FaJira, FaSlack, FaStickyNote, FaGlobe
} from "react-icons/fa";
import { SiGit, SiAdobexd, SiNotion, SiJenkins } from "react-icons/si";
import { db, auth } from "../firebase/firebaseconfig";
import { collection, setDoc, getDocs, query, where, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
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
    customTool: "",
    rank: "Unranked",
    contributions: 0,
    github: "",
    website: "",
  });

  const [isTosAccepted, setIsTosAccepted] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [customTool, setCustomTool] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect to home
        router.push("/home");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load saved form data when component mounts
  useEffect(() => {
    const savedFormData = localStorage.getItem('registerFormData');
    const savedTosAccepted = localStorage.getItem('registerTosAccepted');
    
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
    if (savedTosAccepted) {
      setIsTosAccepted(JSON.parse(savedTosAccepted));
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    localStorage.setItem('registerFormData', JSON.stringify(formData));
  }, [formData]);

  // Save TOS acceptance state
  useEffect(() => {
    localStorage.setItem('registerTosAccepted', JSON.stringify(isTosAccepted));
  }, [isTosAccepted]);

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
        middleName: formData.middleName,
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
        github: formData.github,
        website: formData.website,
      });

      // Clear saved form data after successful registration
      localStorage.removeItem('registerFormData');
      localStorage.removeItem('registerTosAccepted');

      console.log("User profile created successfully");
      setTimeout(() => {
        router.push("/home");
      }, 500);
    } catch (error) {
      console.error("Error: ", error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        alert("This email address is already registered. Please use a different email or try logging in instead.");
      } else if (error.code === 'auth/weak-password') {
        alert("Password is too weak. Please choose a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        alert("Please enter a valid email address.");
      } else {
        alert("Error creating account: " + error.message);
      }
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

  const handleToolInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const newTool = e.target.value.trim();
      if (!formData.tools.includes(newTool)) {
        setFormData((prev) => ({
          ...prev,
          tools: [...prev.tools, newTool],
        }));
      }
      setCustomTool('');
    }
  };

  const removeTool = (tool) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t !== tool),
    }));
  };

  const handleInterestInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const newInterest = e.target.value.trim();
      if (!formData.areaOfInterest.includes(newInterest)) {
        setFormData((prev) => ({
          ...prev,
          areaOfInterest: [...prev.areaOfInterest, newInterest],
        }));
      }
      e.target.value = "";
    }
  };

  const removeInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      areaOfInterest: prev.areaOfInterest.filter((i) => i !== interest),
    }));
  };

  const toggleTool = (tool) => {
    setFormData((prev) => {
      const updatedTools = prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool];
      return { ...prev, tools: updatedTools };
    });
  };

  const toggleInterest = (interest) => {
    if (interest === 'Others') {
      setFormData(prev => ({
        ...prev,
        customAreaOfInterest: '',
        areaOfInterest: prev.areaOfInterest.includes(interest)
          ? prev.areaOfInterest.filter(i => i !== interest)
          : [...prev.areaOfInterest, interest]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        areaOfInterest: prev.areaOfInterest.includes(interest)
          ? prev.areaOfInterest.filter(i => i !== interest)
          : [...prev.areaOfInterest, interest]
      }));
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const areasOfInterest = [
    { name: "Cybersecurity", icon: <FaLock className={styles.areaIcon} /> },
    { name: "Data Science", icon: <FaChartLine className={styles.areaIcon} /> },
    { name: "Frontend Development", icon: <FaPalette className={styles.areaIcon} /> },
    { name: "Backend Development", icon: <FaServer className={styles.areaIcon} /> },
    { name: "UI/UX Design", icon: <SiAdobexd className={styles.areaIcon} /> },
    { name: "Machine Learning", icon: <FaBrain className={styles.areaIcon} /> },
    { name: "AI Specialist", icon: <FaRobot className={styles.areaIcon} /> },
    { name: "Data Analysis", icon: <FaDatabase className={styles.areaIcon} /> },
    { name: "DevOps", icon: <SiJenkins className={styles.areaIcon} /> },
    { name: "Cloud Computing", icon: <FaGlobe className={styles.areaIcon} /> },
    { name: "Mobile Development", icon: <FaCode className={styles.areaIcon} /> },
    { name: "Game Development", icon: <FaCode className={styles.areaIcon} /> }
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
    { name: "Notion", icon: <SiNotion className={styles.toolIcon} /> },
    { name: "GitHub", icon: <FaGithub className={styles.toolIcon} /> },
    { name: "Visual Studio", icon: <FaCode className={styles.toolIcon} /> },
    { name: "IntelliJ IDEA", icon: <FaLaptopCode className={styles.toolIcon} /> }
  ];

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Loading...</h2>
        </div>
      </div>
    );
  }

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
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                name="middleName"
                placeholder="Enter middle name (optional)"
                value={formData.middleName}
                onChange={handleInputChange}
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
            <div className={styles.inputWithIcon}>
              <FaGlobe className={styles.inputIcon} />
              <input
                type="url"
                name="website"
                placeholder="Enter personal website URL"
                value={formData.website}
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
          <div className={styles.toolsGrid}>
            {toolsAndPlatforms.map((tool) => (
              <div
                key={tool.name}
                className={`${styles.toolItem} ${
                  formData.tools.includes(tool.name) ? styles.selected : ""
                }`}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    tools: prev.tools.includes(tool.name)
                      ? prev.tools.filter((t) => t !== tool.name)
                      : [...prev.tools, tool.name],
                  }));
                }}
              >
                {tool.icon}
                <span>{tool.name}</span>
              </div>
            ))}
          </div>

          {/* Custom Tool Input */}
          <div className={styles.customToolInput}>
            <input
              type="text"
              value={customTool}
              onChange={(e) => setCustomTool(e.target.value)}
              onKeyPress={handleToolInput}
              placeholder="Add your own tool..."
              className={styles.input}
            />
          </div>

          {/* Selected Tools Display */}
          <div className={styles.selectedTools}>
            {formData.tools.map((tool) => (
              <div key={tool} className={styles.selectedTool}>
                <span>{tool}</span>
                <FaTimes
                  className={styles.removeIcon}
                  onClick={() => removeTool(tool)}
                />
              </div>
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
              <div
                key={interest.name}
                className={`${styles.interestCard} ${
                  formData.areaOfInterest.includes(interest.name) ? styles.selected : ''
                }`}
                onClick={() => toggleInterest(interest.name)}
              >
                <div className={styles.areaIcon}>{interest.icon}</div>
                <span>{interest.name}</span>
              </div>
            ))}
          </div>
          <div className={styles.selectedInterests}>
            {formData.areaOfInterest.map((interest) => (
              <div key={interest} className={styles.selectedInterest}>
                {interest}
                <FaTimes
                  className={styles.removeIcon}
                  onClick={() => removeInterest(interest)}
                />
              </div>
            ))}
          </div>
          <TextField
            fullWidth
            margin="dense"
            label="Add your own area of interest..."
            value={formData.customAreaOfInterest}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              customAreaOfInterest: e.target.value
            }))}
            onKeyPress={(e) => {
              if (e.key === "Enter" && formData.customAreaOfInterest.trim()) {
                e.preventDefault();
                if (!formData.areaOfInterest.includes(formData.customAreaOfInterest.trim())) {
                  setFormData(prev => ({
                    ...prev,
                    areaOfInterest: [...prev.areaOfInterest, formData.customAreaOfInterest.trim()],
                    customAreaOfInterest: ''
                  }));
                }
              }
            }}
            variant="outlined"
            sx={{ mt: 2 }}
          />

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