import React from "react";
import { Card, CardContent, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const ProjectCard = ({ project, onLikeToggle, duration }) => {
  return (
    <Card style={{ marginBottom: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {project.title} <IconButton onClick={onLikeToggle} color={project.liked ? "error" : "default"} style={{ float: "right" }}>
            {project.liked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {project.category}
        </Typography>
        <Typography variant="body2" paragraph>
          {project.description}
        </Typography>
        {project.tags.map((tag, index) => (
          <Chip key={index} label={tag} style={{ margin: "0 5px 5px 0" }} />
        ))}
        <Typography variant="caption" color="text.secondary">
          <span role="img" aria-label="members">👥</span> {project.members} members <span role="img" aria-label="calendar">📅</span> {project.date} | Duration: {duration}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;