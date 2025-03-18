import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import styles from "../styles/projectcard.module.css";

const ProjectCard = ({ project }) => {
  return (
    <Card elevation={2} className={styles.card}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{project.title}</Typography>
          <BookmarkBorderIcon className={styles.icon} />
        </Box>
        <Typography variant="body2" color="primary" className={styles.category}>{project.category}</Typography>
        <Typography variant="body2" className={styles.description}>{project.description}</Typography>

        <Box display="flex" gap={1} flexWrap="wrap" className={styles.tags}>
          {project.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>

        <Typography variant="caption" color="textSecondary">👥 {project.members} members</Typography>
        <Typography variant="caption" color="textSecondary" className={styles.date}>📅 {project.date}</Typography>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;