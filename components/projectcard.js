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
        minHeight: "280px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "var(--color-white)",
        border: "1px solid var(--color-gray-200)",
        borderRadius: "var(--space-8)",
        padding: 0,
        boxShadow: "none",
        transition: "all var(--transition-fast)",
        "&:hover": {
          transform: "translateY(-var(--space-2))",
          borderColor: "var(--color-gray-300)",
          boxShadow: "0 var(--space-5) var(--space-21) -var(--space-5) rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent sx={{ 
        flex: 1, 
        padding: "var(--space-21)",
        paddingBottom: "var(--space-13)",
        "&:last-child": {
          paddingBottom: "var(--space-13)"
        }
      }}>
        {/* Title and bookmark */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ marginBottom: "var(--space-8)" }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontSize: "var(--text-lg)",
              fontWeight: 500,
              color: "var(--color-gray-900)",
              letterSpacing: "-0.025em",
              lineHeight: "var(--leading-tight)",
              pr: "var(--space-34)", // Space for bookmark icon
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
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
              top: "var(--space-13)",
              right: "var(--space-13)",
              padding: "var(--space-5)",
              color: project?.isBookmarked ? "var(--color-gray-900)" : "var(--color-gray-500)",
              "&:hover": {
                backgroundColor: "var(--color-gray-100)",
                color: "var(--color-gray-900)",
              },
            }}
          >
            {project?.isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          </IconButton>
        </Box>

        {/* Category */}
        <Typography
          sx={{
            fontSize: "var(--text-xs)",
            color: "var(--color-gray-500)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "var(--space-13)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {project?.category || 'Uncategorized'}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: "var(--color-gray-600)",
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-relaxed)",
            marginBottom: "var(--space-21)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            minHeight: "calc(var(--text-sm) * var(--leading-relaxed) * 3)", // Fixed height for 3 lines
          }}
        >
          {project?.description || 'No description available'}
        </Typography>

        {/* Skills */}
        <Box sx={{ marginBottom: "var(--space-21)" }}>
          <Typography 
            variant="body2" 
            sx={{
              fontSize: "var(--text-xs)",
              color: "var(--color-gray-500)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "var(--space-8)"
            }}
          >
            Skills Required:
          </Typography>
          <Box 
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-5)",
              maxHeight: "calc(var(--space-21) * 2)",
              overflow: "hidden",
            }}
          >
            {tags.length > 0 ? (
              tags.slice(0, 4).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    height: "var(--space-21)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 500,
                    backgroundColor: "var(--color-gray-100)",
                    color: "var(--color-gray-700)",
                    border: "1px solid var(--color-gray-200)",
                    borderRadius: "var(--space-3)",
                    "& .MuiChip-label": {
                      padding: "0 var(--space-8)",
                    }
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ 
                color: "var(--color-gray-400)",
                fontSize: "var(--text-xs)",
                fontStyle: "italic" 
              }}>
                No skills specified
              </Typography>
            )}
          </Box>
        </Box>

        {/* Team progress */}
        <Box>
          <Typography 
            variant="body2" 
            sx={{
              fontSize: "var(--text-xs)",
              color: "var(--color-gray-500)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "var(--space-8)"
            }}
          >
            Team Progress:
          </Typography>
          <Box display="flex" alignItems="center" gap="var(--space-8)">
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flexGrow: 1,
                height: "var(--space-3)",
                borderRadius: "var(--space-2)",
                backgroundColor: "var(--color-gray-200)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--color-gray-900)",
                  borderRadius: "var(--space-2)",
                },
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: "var(--text-xs)",
                color: "var(--color-gray-600)",
                fontWeight: 500,
                minWidth: "35px",
                textAlign: "right"
              }}
            >
              {project?.members || 0}/{project?.teamSize || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Footer with dates */}
      <CardActions 
        sx={{ 
          borderTop: "1px solid var(--color-gray-200)",
          padding: "var(--space-13) var(--space-21)",
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "var(--color-gray-50)",
        }}
      >
        <Typography 
          variant="caption" 
          sx={{
            fontSize: "var(--text-xs)",
            color: "var(--color-gray-500)"
          }}
        >
          Created: {createdAt}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{
            fontSize: "var(--text-xs)",
            color: "var(--color-gray-500)"
          }}
        >
          Due: {expectedCompletionDate}
        </Typography>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;