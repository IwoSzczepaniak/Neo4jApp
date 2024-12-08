import { Box, Container, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import PeopleManager from "./components/PeopleManager";
import RelationsManager from "./components/RelationsManager";
import RelationFinder from "./components/RelationFinder";

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

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab label="People" />
            <Tab label="Relations" />
            <Tab label="Find Relations" />
          </Tabs>
        </Paper>

        {value === 0 && <PeopleManager />}
        {value === 1 && <RelationsManager />}
        {value === 2 && <RelationFinder />}
      </Box>
    </Container>
  );
}

export default App;
