import React from "react";
import { Card, CardContent, CardActions, Typography, Chip, IconButton } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const ProjectCard = ({ project, onBookmarkToggle }) => {
  return (
    <Card
      style={{
        width: "300px", // Fixed width
        height: "150px", // Fixed height
        position: "relative",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box", // Ensure padding is included in the size
      }}
    >
      {/* Bookmark Icon in top-right corner */}
      <IconButton
        onClick={onBookmarkToggle}
        color={project.liked ? "primary" : "default"}
        style={{ position: "absolute", top: "4px", right: "4px" }}
      >
        {project.liked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>

      <CardContent style={{ flexGrow: 1, padding: "8px", overflow: "hidden" }}>
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          style={{
            fontSize: "1.1rem",
            marginBottom: "4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {project.title}
        </Typography>
        <Typography
          variant="subtitle2"
          color="primary"
          gutterBottom
          style={{ fontSize: "0.9rem", marginBottom: "4px" }}
        >
          {project.category}
        </Typography>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            marginBottom: "4px",
            maxHeight: "40px",
            overflowY: "auto",
          }}
        >
          {project.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              variant="outlined"
              color="primary"
              size="small"
              style={{ fontSize: "0.7rem" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" }}>
          <Typography variant="caption" color="textSecondary" style={{ fontSize: "0.7rem" }}>
            <GroupIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
            {project.members} members
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ fontSize: "0.7rem" }}>
            <CalendarTodayIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
        </div>
      </CardContent>
      <CardActions style={{ padding: "0 8px 8px 8px" }}>
        {/* Optional: Add more actions here if needed */}
      </CardActions>
    </Card>
  );
};

export default ProjectCard;