import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import styles from "../styles/projectcard.module.css";

const ProjectCard = ({ project, onBookmarkToggle }) => {
  // Add null checks and default values
  const progress = project?.members && project?.teamSize 
    ? (project.members / project.teamSize) * 100 
    : 0;

  const tags = project?.tags || [];
  const teamMembers = project?.teamMembers || [];
  const createdAt = project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A';
  const expectedCompletionDate = project?.expectedCompletionDate 
    ? new Date(project.expectedCompletionDate).toLocaleDateString() 
    : 'N/A';

  return (
    <Card 
      sx={{
        width: "100%",
        height: "280px", // Fixed height
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "#fff",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontSize: "1.1rem",
              fontWeight: 600,
              mb: 1,
              pr: 4, // Space for bookmark icon
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {project?.title || 'Untitled Project'}
          </Typography>
          <IconButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle();
            }} 
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: project?.isBookmarked ? "#ff1744" : "#666",
              "&:hover": {
                color: project?.isBookmarked ? "#ff1744" : "#1976d2",
              },
            }}
          >
            {project?.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        <Typography
          color="primary"
          sx={{
            fontSize: "0.875rem",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {project?.category || 'Uncategorized'}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#666",
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            height: "40px", // Fixed height for 2 lines
          }}
        >
          {project?.description || 'No description available'}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Skills Required:
          </Typography>
          <Box 
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              maxHeight: "48px",
              overflow: "hidden",
            }}
          >
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    height: "20px",
                    fontSize: "0.75rem",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No skills specified
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Team Progress:
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flexGrow: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#1976d2",
                },
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: "45px" }}>
              {project?.members || 0}/{project?.teamSize || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions 
        sx={{ 
          borderTop: "1px solid #e0e0e0",
          p: 2,
          pt: 1,
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Created: {createdAt}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Due: {expectedCompletionDate}
        </Typography>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;