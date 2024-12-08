import React, { useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../api";

function PeopleManager() {
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState("");
  const [error, setError] = useState("");

  const loadPeople = async () => {
    try {
      const response = await api.getAllPeople();
      setPeople(response.data.people);
    } catch (err) {
      setError("Failed to load people");
    }
  };

  useEffect(() => {
    loadPeople();
  }, []);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    try {
      await api.addPerson(newPerson);
      setNewPerson("");
      loadPeople();
    } catch (err) {
      setError("Failed to add person");
    }
  };

  const handleDeletePerson = async (fullname) => {
    try {
      await api.removePerson(fullname);
      loadPeople();
    } catch (err) {
      setError("Failed to delete person");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleAddPerson}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Person's Full Name"
              value={newPerson}
              onChange={(e) => setNewPerson(e.target.value)}
            />
            <Button type="submit" variant="contained">
              Add Person
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper>
        <List>
          {people.map((person) => (
            <ListItem key={person}>
              <ListItemText primary={person} />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeletePerson(person)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default PeopleManager;
