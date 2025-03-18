import React, { useState } from "react";
import { Container, Grid, Button, Pagination, IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Navbar from "../components/navbar";
import ProjectCard from "../components/projectcard";
import styles from "../styles/homepage.module.css"; // Import module CSS

const projectsData = [
  {
    title: "AI-Powered Learning Platform",
    category: "Development",
    description: "Building an adaptive learning system using machine learning algorithms...",
    tags: ["Machine Learning", "Education", "Python"],
    members: 7,
    date: "Dec 15, 2024",
  },
  {
    title: "Sustainable Campus Initiative",
    category: "Research",
    description: "Research project focused on implementing sustainable practices...",
    tags: ["Sustainability", "Research", "Environmental"],
    members: 7,
    date: "Jan 30, 2024",
  },
  {
    title: "Student Wellness App",
    category: "Design",
    description: "Designing a mobile application to help students manage stress...",
    tags: ["UI/UX", "Mental Health", "Mobile"],
    members: 7,
    date: "Nov 28, 2024",
  },
  {
    title: "Market Research Analysis",
    category: "Business",
    description: "Conducting comprehensive market research for a new startup...",
    tags: ["Market Research", "Analytics", "Business"],
    members: 7,
    date: "Feb 15, 2024",
  },
  {
    title: "Academic Journal Platform",
    category: "Writing",
    description: "Creating a platform for peer-reviewed academic journal publications...",
    tags: ["Publishing", "Academic", "Writing"],
    members: 7,
    date: "Mar 1, 2024",
  },
  {
    title: "Virtual Lab Simulator",
    category: "Development",
    description: "Developing a virtual laboratory simulation system for remote science...",
    tags: ["VR", "Education", "Science"],
    members: 7,
    date: "Apr 10, 2024",
  },
];

const HomePage = () => {
  const [page, setPage] = useState(1);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageBackground}>
        <Container maxWidth="lg">
          <div className={styles.header}>
            <h2>Projects</h2>
            <div>
              <Button variant="contained" color="primary" className={styles.newProjectButton}>
                + New Project
              </Button>
              <IconButton className={styles.filterButton}>
                <FilterListIcon />
              </IconButton>
            </div>
          </div>

          <Grid container spacing={3}>
            {projectsData.map((project, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>

          <div className={styles.pagination}>
            <Button variant="outlined">Previous</Button>
            <Pagination count={8} page={page} onChange={handlePageChange} color="primary" />
            <Button variant="outlined">Next</Button>
          </div>
        </Container>
      </div>
    </>
  );
};

export default HomePage;