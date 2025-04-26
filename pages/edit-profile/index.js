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
import { SiGit, SiAdobexd, SiNotion, SiJenkins } from "react-icons/si";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/navbar';

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
  const [tempProfilePicture, setTempProfilePicture] = useState(null); // For preview
  const [newProfilePicFile, setNewProfilePicFile] = useState(null); // Store the file
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

  const [customTool, setCustomTool] = useState('');
  const [customInterest, setCustomInterest] = useState('');

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

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          }, 'image/jpeg', 0.8); // 80% quality
        };
      };
    });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file type first
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Compress the image
      const compressedFile = await compressImage(file);

      // Check size after compression
      if (compressedFile.size > 2 * 1024 * 1024) {
        toast.error('Compressed image is still larger than 2MB. Please choose a smaller image.');
        return;
      }

      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      setTempProfilePicture(previewUrl);
      setNewProfilePicFile(compressedFile);

      console.log('Prepared profile picture for upload:', {
        fileName: compressedFile.name,
        fileSize: compressedFile.size,
        fileType: compressedFile.type
      });

    } catch (error) {
      console.error('Error processing profile picture:', error);
      toast.error('Something went wrong while processing the image.');
    }
  };

  const uploadWithRetry = async (storageRef, file, maxRetries = 3) => {
    let lastError;
    
    console.log('Starting profile picture upload to Firebase Storage:', {
      bucket: 'gs://xin-s-hall-of-fame.firebasestorage.app',
      path: storageRef.fullPath,
      fileSize: file.size,
      fileType: file.type
    });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt + 1} of ${maxRetries}`);

        // Upload to Firebase Storage with metadata
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type,
          cacheControl: 'public,max-age=7200',
          customMetadata: {
            bucket: 'xin-s-hall-of-fame'
          }
        });

        console.log('Upload successful, getting Firebase Storage URL...');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.log('Firebase Storage URL obtained:', downloadUrl);
        return downloadUrl;

      } catch (error) {
        console.error(`Upload attempt ${attempt + 1} failed:`, error);
        lastError = error;

        if (error.code === 'storage/unauthorized') {
          throw new Error('Unauthorized to upload. Please check permissions.');
        }
        if (error.code === 'storage/canceled') {
          throw new Error('Upload was canceled. Please try again.');
        }

        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries - 1) {
          const delay = Math.min(2000 * Math.pow(2, attempt), 10000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Upload failed after ${maxRetries} attempts. Please try again.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No user logged in');
        setLoading(false);
        return;
      }

      let profilePictureUrl = formData.profilePicture;

      // Upload new profile picture to Firebase Storage if one was selected
      if (newProfilePicFile) {
        try {
          console.log('Starting profile picture upload to Firebase Storage...');
          
          // Create storage reference with correct bucket path
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          console.log('Firebase Storage reference created:', {
            bucket: 'gs://xin-s-hall-of-fame.firebasestorage.app',
            path: storageRef.fullPath
          });

          // Delete existing profile picture from Firebase Storage if it exists
          if (formData.profilePicture) {
            try {
              await deleteObject(ref(storage, `profile-pictures/${user.uid}`));
              console.log('Existing profile picture deleted from Firebase Storage');
            } catch (deleteError) {
              console.log('No existing profile picture in Firebase Storage');
            }
          }

          // Upload to Firebase Storage
          profilePictureUrl = await uploadWithRetry(storageRef, newProfilePicFile);
          console.log('Profile picture uploaded to Firebase Storage:', profilePictureUrl);

        } catch (uploadError) {
          console.error('Firebase Storage upload error:', uploadError);
          toast.error(uploadError.message || 'Failed to upload profile picture. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Update user document with Firebase Storage URL
      const dataToUpdate = {
        ...formData,
        profilePicture: profilePictureUrl,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', user.uid), dataToUpdate);
      
      // Clean up temporary preview
      if (tempProfilePicture) {
        URL.revokeObjectURL(tempProfilePicture);
        setTempProfilePicture(null);
      }
      setNewProfilePicFile(null);

      toast.success('Profile updated successfully');
      setLoading(false);
      router.replace('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
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
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        toast.error('User profile not found');
        return;
      }

      const userData = userDoc.data();
      if (userData.isCPSMember) {
        toast.error('You are already a CPS member');
        return;
      }
      
      if (redeemCode.trim().toUpperCase() === 'CPS') {
        // Update only the CPS-related fields while preserving all other data
        await updateDoc(userRef, {
          rank: 'CPS',
          isCPSMember: true,
          updatedAt: serverTimestamp()
        });

        // Update local state while preserving all existing data
        setFormData(prev => ({
          ...prev,
          rank: 'CPS',
          isCPSMember: true
        }));

        // Show congratulatory popup
        setShowCongrats(true);
        
        // Clear the redeem code input
        setRedeemCode('');

        toast.success('Successfully redeemed CPS membership!');

        // Scroll to bio section after a short delay
        setTimeout(() => {
          document.querySelector('#bioSection')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      } else {
        toast.error('Invalid redeem code');
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast.error('Failed to redeem code. Please try again.');
    }
  };

  const handleCongratsClose = () => {
    setShowCongrats(false);
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No user logged in');
        return;
      }

      // Clean up temporary preview
      if (tempProfilePicture) {
        URL.revokeObjectURL(tempProfilePicture);
        setTempProfilePicture(null);
      }
      setNewProfilePicFile(null);

      // If there was an existing profile picture in Firebase Storage, delete it
      if (formData.profilePicture) {
        try {
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          await deleteObject(storageRef);
          console.log('Profile picture deleted from storage');
        } catch (error) {
          console.error('Error deleting profile picture:', error);
        }
      }

      // Update the form data
      setFormData(prev => ({
        ...prev,
        profilePicture: ''
      }));

      // Update the user document
      await updateDoc(doc(db, 'users', user.uid), {
        profilePicture: '',
        updatedAt: serverTimestamp()
      });

      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
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
      setCustomInterest('');
    }
  };

  const removeInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      areaOfInterest: prev.areaOfInterest.filter((i) => i !== interest),
    }));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {newProfilePicFile ? 'Uploading profile picture...' : 'Updating profile...'}
          </Typography>
        </div>
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
    { name: "Data Science", icon: <FaChartLine className={styles.areaIcon} /> },
    { name: "Frontend Development", icon: <FaPalette className={styles.areaIcon} /> },
    { name: "Backend Development", icon: <FaServer className={styles.areaIcon} /> },
    { name: "UI/UX Design", icon: <SiAdobexd className={styles.areaIcon} /> },
    { name: "Machine Learning", icon: <FaBrain className={styles.areaIcon} /> },
    { name: "AI Specialist", icon: <FaRobot className={styles.areaIcon} /> },
    { name: "Data Analysis", icon: <FaDatabase className={styles.areaIcon} /> },
    { name: "DevOps", icon: <SiJenkins className={styles.areaIcon} /> },
    { name: "Cloud Computing", icon: <FaGlobe className={styles.areaIcon} /> },
    { name: "Mobile Development", icon: <FaUserAlt className={styles.areaIcon} /> },
    { name: "Game Development", icon: <FaCode className={styles.areaIcon} /> }
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
                  {tempProfilePicture ? (
                    <img
                      src={tempProfilePicture}
                      alt="Profile Preview"
                      className={styles.previewImage}
                    />
                  ) : formData.profilePicture ? (
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
                  {(tempProfilePicture || formData.profilePicture) && (
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
          <div className={styles.toolsGrid}>
            {areasOfInterest.map((interest) => (
              <div
                key={interest.name}
                className={`${styles.toolItem} ${
                  formData.areaOfInterest.includes(interest.name) ? styles.selected : ""
                }`}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    areaOfInterest: prev.areaOfInterest.includes(interest.name)
                      ? prev.areaOfInterest.filter((i) => i !== interest.name)
                      : [...prev.areaOfInterest, interest.name],
                  }));
                }}
              >
                {interest.icon}
                <span>{interest.name}</span>
              </div>
            ))}
          </div>

          {/* Custom Interest Input */}
          <div className={styles.customToolInput}>
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyPress={handleInterestInput}
              placeholder="Add your own area of interest..."
              className={styles.input}
            />
          </div>

          {/* Selected Interests Display */}
          <div className={styles.selectedTools}>
            {formData.areaOfInterest.map((interest) => (
              <div key={interest} className={styles.selectedTool}>
                <span>{interest}</span>
                <FaTimes
                  className={styles.removeIcon}
                  onClick={() => removeInterest(interest)}
                />
              </div>
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

const EditProfilePage = () => {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <EditProfileContent />
      </div>
    </>
  );
};

export default EditProfilePage; 