import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Link, 
  Button,
  styled
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import DiscordIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';
import Navbar from '../components/navbar';
import styles from '../styles/team.module.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Use styled components for consistent styling
const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f8faf9',
  fontFamily: 'Arial, sans-serif'
}));

const TeamPage = () => {
  const [coreValues, setCoreValues] = useState([
    {
      title: "How do we provide safety guarantees for the CPS system?",
      description: "Ensuring robust safety measures through formal verification and monitoring."
    },
    {
      title: "Can we use the analysis results to improve the system design?",
      description: "Leveraging data-driven insights to enhance system architecture and performance."
    },
    {
      title: "How can we enable the system to understand multiple complex requirements?",
      description: "Developing advanced algorithms for multi-objective optimization and requirement satisfaction."
    },
    {
      title: "How do we find requirements that best suitable for the system and the environment?",
      description: "Implementing adaptive requirement analysis for optimal system-environment compatibility."
    }
  ]);

  const [founderInfo] = useState({
    name: "Professor Xin Qin",
    role: "Founder & Principal Investigator",
    image: "/xin.jpg",
    bio: "Previously, I completed my PhD in Computer Science at the University of Southern California, advised by Prof. Jyotirmoy Deshmukh. I received my Computer Science BS degree from ShanghaiTech Univeristy, where I was advised by Prof. Yi MA and Prof. Hao Chen. I spent my last year of undergraduate in UC Berkeley as a visiting student, working in BAIR Lab with Prof. Angjoo Kanazawa and Richard Zhang. During my visit, I also received invaluable support from Prof. Alexei Efros and Prof. Jitendra Malik.",
    education: "PhD in Computer Science, research interests are in ensuring the safety of cyber-physical systems through formal methods, predictive monitoring, verification, and machine learning.",
    linkedin: "https://www.linkedin.com/in/xin-qin-4a83b9158/",
    github: "https://github.com/xinqin23",
    website: "https://xinqin23.github.io"
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("isCPSMember", "==", true));
        const querySnapshot = await getDocs(q);
        
        const members = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          members.push({
            id: doc.id,
            ...userData,
            rank: userData.rank || 'Unranked',
            role: userData.role || userData.displayName || userData.name || '',
            status: userData.status || 'Active',
            email: userData.email || '',
            linkedinUrl: userData.linkedinUrl || userData.linkedin || '',
            githubUrl: userData.githubUrl || userData.github || '',
            websiteUrl: userData.websiteUrl || userData.website || ''
          });
        });
        
        setTeamMembers(members);
        setFilteredMembers(members);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <StyledBox>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography>Loading...</Typography>
        </Box>
      </StyledBox>
    );
  }

  return (
    <StyledBox>
      <Navbar />
      
      {/* Core Values Section */}
      <Box className={styles.coreValuesSection}>
        <Container maxWidth="lg">
          <Typography variant="h3" className={styles.pageTitle}>
            Meet Our Team
          </Typography>
          <Grid container spacing={3}>
            {coreValues.map((value, index) => (
              <Grid item xs={12} key={index}>
                <Box className={styles.coreValueCard}>
                  <Typography variant="h6">{value.title}</Typography>
                  <Typography variant="body1">{value.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

        {/* Founder Section */}
      <Box className={styles.founderSection}>
        <Container maxWidth="lg">
          <Box className={styles.sectionTitleWithIcon}>
            <Typography variant="h4" sx={{ color: '#000000' }}>
              Founder
            </Typography>
            <img 
              src="/Grandmaster.webp"
              alt="Grandmaster" 
              className={styles.rankIcon}
            />
          </Box>
          <Card className={styles.founderCard}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box className={styles.founderImageContainer}>
                  <CardMedia
                    component="img"
                    image={founderInfo.image}
                    alt={founderInfo.name}
                    className={styles.founderImage}
                    onError={(e) => {
                      e.target.src = '/images/default-avatar.png';
                    }}
                  />
                </Box>
                <Box className={styles.founderSocials}>
                  <Link href={founderInfo.linkedin} target="_blank" rel="noopener">
                    <LinkedInIcon />
                  </Link>
                  <Link href={founderInfo.github} target="_blank" rel="noopener">
                    <GitHubIcon />
                  </Link>
                  <Link href={founderInfo.website} target="_blank" rel="noopener">
                    <LanguageIcon />
                  </Link>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>{founderInfo.name}</Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {founderInfo.role}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {founderInfo.education}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {founderInfo.bio}
                  </Typography>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* Team Members Section */}
      <Box className={styles.membersSection}>
        <Container maxWidth="lg">
          <Box className={styles.sectionTitleWithIcon}>
            <Typography variant="h4" sx={{ color: '#000000' }}>
              Members
            </Typography>
            <img 
              src="/CPS.webp"
              alt="Top 500" 
                      className={styles.rankIcon}
            />
          </Box>
          <Grid container spacing={4}>
            {filteredMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  className={styles.memberCard}
                  onClick={() => router.push(`/profile/${member.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box className={styles.memberImageContainer}>
                    <CardMedia
                      component="img"
                      image={member.image}
                      alt={member.name}
                      className={styles.memberImage}
                      onError={(e) => {
                        e.target.src = '/images/default-avatar.png';
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Box className={styles.memberInfo} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}>
                      <Typography variant="h6" sx={{ mb: 0 }}>
                        {`${member.firstName || ''} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName || ''}`}
                      </Typography>
                      {member.rank && (
                        <img 
                          src={`/${member.rank}.webp`}
                          alt={member.rank} 
                          className={styles.rankIcon}
                        />
                      )}
                    </Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mb: 2,
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.5rem',
                        color: 'text.secondary',
                        transition: 'color 0.3s',
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main'
                        }
                      }
                    }}>
                      {member.email && (
                        <Link 
                          href={`mailto:${member.email}`}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          <EmailIcon />
                        </Link>
                      )}
                      {member.linkedinUrl && (
                        <Link 
                          href={member.linkedinUrl}
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          <LinkedInIcon />
                        </Link>
                      )}
                      {member.githubUrl && (
                        <Link 
                          href={member.githubUrl}
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          <GitHubIcon />
                        </Link>
                      )}
                      {member.websiteUrl && (
                        <Link 
                          href={member.websiteUrl}
                          target="_blank" 
                          rel="noopener"
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          <LanguageIcon />
                        </Link>
                      )}
                    </Box>
                    <Typography variant="body2" paragraph>
                      {member.bio || member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Join Team Section */}
      <Box className={styles.joinSection}>
        <Container maxWidth="lg">
          <Box className={styles.sectionTitleWithIcon}>
            <Typography variant="h4">
              Join Our Growing Team
            </Typography>
            <img 
              src="/cpx.png"
              alt="Join Team" 
              className={styles.rankIcon}
            />
          </Box>
          <Box className={styles.joinContent}>
            <Typography variant="body1" className={styles.joinText}>
              We're looking for passionate researchers and developers to join our team!{'\n\n'}
              Please send the following information to xin.qin (at) csulb.edu:{'\n'}
              • Your CV or a brief self-introduction{'\n'}
              • A brief description of your implementation or research interests
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
            href="https://forms.gle/6uk8q2qiLSHBRfWDA"
            target="_blank"
              className={styles.joinButton}
            >
              Apply Now
            </Button>
          </Box>
        </Container>
      </Box>
    </StyledBox>
  );
};

// Export with no SSR
export default dynamic(() => Promise.resolve(TeamPage), {
  ssr: false
});