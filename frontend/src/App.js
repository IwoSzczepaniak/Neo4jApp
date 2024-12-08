import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import PeopleManager from './components/PeopleManager';
import RelationsManager from './components/RelationsManager';
import FamilyTree from './components/FamilyTree';

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Family Tree Manager
        </Typography>
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            centered
          >
            <Tab label="People" />
            <Tab label="Relations" />
            <Tab label="Family Tree" />
          </Tabs>
        </Paper>

        {value === 0 && <PeopleManager />}
        {value === 1 && <RelationsManager />}
        {value === 2 && <FamilyTree />}
      </Box>
    </Container>
  );
}

export default App; 