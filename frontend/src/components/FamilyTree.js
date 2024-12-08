import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function FamilyTree() {
  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Family Tree Visualization
        </Typography>
        <Typography>
          This feature is coming soon! It will provide a visual representation of the family tree.
        </Typography>
      </Paper>
    </Box>
  );
}

export default FamilyTree; 