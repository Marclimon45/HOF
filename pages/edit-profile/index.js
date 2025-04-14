import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase/firebaseconfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import styles from '../../styles/edit-profile.module.css';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { 
  FaDiscord, FaTimes, FaGithub, FaLinkedin, FaUser, FaUserAlt, 
  FaEnvelope, FaLock, FaCode, FaDatabase, FaPalette, FaBrain,
  FaChartLine, FaServer, FaRobot, FaLaptopCode, FaDocker,
  FaFigma, FaAws, FaJira, FaSlack, FaGlobe
} from "react-icons/fa";
import { SiGit, SiAdobexd, SiNotion } from "react-icons/si";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { toast } from 'react-hot-toast';

// Time slot definitions
const TIME_SLOTS = [
  { start: "09:00", end: "17:00", label: "9:00 AM - 5:00 PM" },
  { start: "17:00", end: "21:00", label: "5:00 PM - 9:00 PM" },
  { start: "21:00", end: "24:00", label: "9:00 PM - 12:00 AM" }
];

// Helper function to check if two time slots overlap
const doTimeSlotsOverlap = (slot1, slot2) => {
  const start1 = parseInt(slot1.start.replace(':', ''));
  const end1 = parseInt(slot1.end.replace(':', ''));
  const start2 = parseInt(slot2.start.replace(':', ''));
  const end2 = parseInt(slot2.end.replace(':', ''));
  
  return (start1 < end2 && end1 > start2);
};

// Helper function to check if adding a time slot would create an overlap
const wouldCreateOverlap = (existingSlots, newSlot) => {
  return existingSlots.some(existingSlot => doTimeSlotsOverlap(existingSlot, newSlot));
};

// Helper function to determine rank based on contributions
const getRankFromContributions = (contributions) => {
  if (contributions >= 15) return 'Master';
  if (contributions >= 10) return 'Diamond';
  if (contributions >= 5) return 'Platinum';
  if (contributions >= 3) return 'Gold';
  if (contributions >= 2) return 'Silver';
  if (contributions >= 1) return 'Bronze';
  return 'Unranked';
};

const EditProfileContent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    discordUsername: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    bio: '',
    skills: [],
    tools: [],
    areaOfInterest: [],
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    },
    isCPSMember: false,
    profilePicture: '',
    contributions: 0,
    rank: 'Unranked'
  });
  const [redeemCode, setRedeemCode] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Please log in to edit your profile');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setError('User profile not found');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        
        // Check and update rank based on contributions
        const currentContributions = userData.contributions || 0;
        const newRank = getRankFromContributions(currentContributions);
        
        // Update rank in Firebase if it's different
        if (userData.rank !== newRank && !userData.isCPSMember) {
          await updateDoc(doc(db, 'users', user.uid), {
            rank: newRank,
            updatedAt: serverTimestamp()
          });
          userData.rank = newRank;
        }

        setFormData({
          firstName: userData.firstName || '',
          middleName: userData.middleName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          discordUsername: userData.discordUsername || '',
          linkedinUrl: userData.linkedinUrl || '',
          githubUrl: userData.githubUrl || '',
          websiteUrl: userData.websiteUrl || '',
          bio: userData.bio || '',
          skills: userData.skills || [],
          tools: userData.tools || [],
          areaOfInterest: userData.areaOfInterest || [],
          availability: userData.availability || {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
          },
          isCPSMember: userData.isCPSMember || false,
          profilePicture: userData.profilePicture || '',
          contributions: currentContributions,
          rank: userData.rank
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const updateUserContributions = async (userId, newContributionCount) => {
    try {
      const newRank = getRankFromContributions(newContributionCount);
      await updateDoc(doc(db, 'users', userId), {
        contributions: newContributionCount,
        rank: newRank,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        contributions: newContributionCount,
        rank: newRank
      }));

      toast.success(`Rank updated to ${newRank}!`);
    } catch (error) {
      console.error('Error updating contributions:', error);
      toast.error('Failed to update contributions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const dataToUpdate = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        discordUsername: formData.discordUsername,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        websiteUrl: formData.websiteUrl,
        bio: formData.bio,
        skills: formData.skills,
        tools: formData.tools,
        areaOfInterest: formData.areaOfInterest,
        availability: formData.availability,
        isCPSMember: formData.isCPSMember,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', user.uid), dataToUpdate);
      toast.success('Profile updated successfully');
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };

  const handleRedeemCode = async () => {
    try {
      if (!redeemCode) {
        toast.error('Please enter a redeem code');
        return;
      }

      if (!auth.currentUser) {
        toast.error('Please log in to redeem code');
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      if (redeemCode.toLowerCase() === 'CPS') {
        await updateDoc(userRef, {
          rank: 'CPS',
          isCPSMember: true,
          updatedAt: serverTimestamp()
        });

        // Update local state
        setFormData(prev => ({
          ...prev,
          isCPSMember: true
        }));

        // Show congratulatory popup
        setShowCongrats(true);
        
        // Clear the redeem code input
        setRedeemCode('');

        // Scroll to bio section after a short delay
        setTimeout(() => {
          document.querySelector('#bioSection')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      } else {
        toast.error('Invalid redeem code');
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast.error('Failed to redeem code');
    }
  };

  const handleCongratsClose = () => {
    setShowCongrats(false);
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update formData with the new profile picture URL
      setFormData(prev => ({
        ...prev,
        profilePicture: downloadURL
      }));

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);

      // Delete the file from storage
      await deleteObject(storageRef);

      // Update formData to remove the profile picture URL
      setFormData(prev => ({
        ...prev,
        profilePicture: ''
      }));

      toast.success('Profile picture removed successfully');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  if (typeof window === 'undefined') {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

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
        <h2 className={styles.title}>Edit Your Profile</h2>
        <p className={styles.subtitle}>
          Update your information to better connect with the community
        </p>

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Section - Only show if CPS member */}
          {formData.isCPSMember && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Profile Picture</h3>
              <div className={styles.profilePictureContainer}>
                <div className={styles.picturePreview}>
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile"
                      className={styles.previewImage}
                    />
                  ) : (
                    <FaUser className={styles.defaultProfileIcon} />
                  )}
                </div>
                <div className={styles.pictureUploadSection}>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className={styles.fileInput}
                  />
                  <label htmlFor="profilePicture" className={styles.uploadButton}>
                    Choose Image
                  </label>
                  {formData.profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className={styles.removeButton}
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                <Typography variant="caption" color="textSecondary">
                  Recommended size: 400x400 pixels. Maximum file size: 2MB
                </Typography>
              </div>
            </div>
          )}

          {/* Bio Section - Only show if CPS member */}
          {formData.isCPSMember && (
            <div id="bioSection" className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Bio</h3>
              <div className={styles.bioContainer}>
                <FaUser className={styles.bioIcon} />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className={styles.bioInput}
                />
              </div>
              <Typography variant="caption" color="textSecondary">
                Your bio will be displayed on the team page.
              </Typography>
            </div>
          )}

          {/* Redeem code section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Redeem Code</h3>
            <div className={styles.redeemContainer}>
              <div className={styles.redeemInputContainer}>
                <FaLock className={styles.redeemIcon} />
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  placeholder="Enter redeem code"
                  className={styles.redeemInput}
                />
              </div>
              <button
                type="button"
                onClick={handleRedeemCode}
                className={styles.redeemButton}
                disabled={!auth.currentUser}
              >
                Redeem
              </button>
            </div>
          </div>

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
                disabled
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
                name="websiteUrl"
                placeholder="Enter personal website URL"
                value={formData.websiteUrl}
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
            </div>
            <input
              type="text"
            placeholder="Type a skill and press enter..."
            onKeyDown={handleSkillInput}
            className={styles.skillInput}
          />

          <h3 className={styles.sectionTitle}>Tools & Platforms</h3>
          <div className={styles.toolsPlatformsGrid}>
            {toolsAndPlatforms.map((tool) => (
              <label key={tool.name} className={styles.toolCheckboxLabel}>
                    <input
                      type="checkbox"
                  checked={formData.tools.includes(tool.name)}
                  onChange={() => {
                    const newTools = formData.tools.includes(tool.name)
                      ? formData.tools.filter(t => t !== tool.name)
                      : [...formData.tools, tool.name];
                        setFormData(prev => ({ ...prev, tools: newTools }));
                      }}
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
                  checked={formData.areaOfInterest.includes(interest.name)}
                  onChange={() => {
                    const newInterests = formData.areaOfInterest.includes(interest.name)
                      ? formData.areaOfInterest.filter(i => i !== interest.name)
                      : [...formData.areaOfInterest, interest.name];
                    setFormData(prev => ({ ...prev, areaOfInterest: newInterests }));
                  }}
                />
                {interest.icon}
                <span>{interest.name}</span>
                </label>
              ))}
          </div>

        <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.push('/profile')}
            >
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
              Save Changes
          </button>
        </div>
      </form>
      </div>

      {/* Congratulations Dialog */}
      <Dialog
        open={showCongrats}
        onClose={handleCongratsClose}
        aria-labelledby="congrats-dialog-title"
      >
        <DialogTitle id="congrats-dialog-title">
          Congratulations! 🎉
        </DialogTitle>
        <DialogContent>
          <Typography>
            Welcome to CPS! You are now a member of our team. Please add your bio for the team page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCongratsClose} color="primary">
            Continue to Profile
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Create a wrapper component that handles the client-side only logic
const EditProfile = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Edit Your Profile</h2>
          <div className={styles.loadingState}>Loading...</div>
        </div>
      </div>
    );
  }

  return <EditProfileContent />;
};

// Export the component without dynamic import
export default EditProfile; 