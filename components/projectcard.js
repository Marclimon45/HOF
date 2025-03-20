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
    width: "350px", // Keep consistent width
    height: "250px", // Use `minHeight` instead of `height`
    // maxHeight: "250px", // Limit height to prevent excessive stretching
    position: "relative",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
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
    flexWrap: "wrap",  // ✅ Allow tags to wrap naturally
    gap: "6px",
    overflow: "visible",  // ✅ Ensure no cut-off
    marginBottom: "8px",
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
        {/* 🔹 Project Description (Limited to 3 lines) */}
        <Typography
  variant="body2"
  color="textSecondary"
  style={{
    fontSize: "0.85rem",
    marginBottom: "10px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2, // ✅ Limits to 2 lines
    WebkitBoxOrient: "vertical",
    textOverflow: "ellipsis",
  }}
>
  {project.description}
</Typography>

<CardActions style={{ 
  padding: "0 8px 8px 8px", 
  display: "flex", 
  justifyContent: "space-between" // ✅ Ensures spacing between left & right
}}></CardActions>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <Typography variant="caption" color="textSecondary" style={{ fontSize: "0.75rem" }}>
    <GroupIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
    {project.members} members
  </Typography>
  <Typography variant="caption" color="textSecondary" style={{ fontSize: "0.75rem" }}>
    <CalendarTodayIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
  </Typography>
</div>
      </CardContent>
      {/* <CardActions style={{ padding: "0 8px 8px 8px" }}> */}
        {/* Optional: Add more actions here if needed */}
      {/* </CardActions> */}
    </Card>
  );
};

export default ProjectCard;