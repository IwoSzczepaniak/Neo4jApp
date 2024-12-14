import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { api } from "../api";

function PeopleManager() {
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: "",
    birth_date: "",
    death_date: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [relations, setRelations] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

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
      const personData = {
        ...newPerson,
        birth_date: newPerson.birth_date || null,
        death_date: newPerson.death_date || null,
        gender: newPerson.gender || null
      };
      
      await api.addPerson(personData);
      setNewPerson({
        name: "",
        birth_date: "",
        death_date: "",
        gender: "",
      });
      setError("");
      loadPeople();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add person");
      }
      console.error(err);
    }
  };

  const handleDeletePerson = async (person) => {
    try {
      await api.removePerson(person.name, person.birth_date);
      setError("");
      loadPeople();
    } catch (err) {
      setError("Failed to delete person");
    }
  };

  const handleShowRelations = async (person) => {
    try {
      const response = await api.getPersonRelations(person.name);
      setRelations(response.data.relations);
      setSelectedPerson(person);
      setOpenDialog(true);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setRelations({});
        setSelectedPerson(person);
        setOpenDialog(true);
        setError("");
      } else {
        setError("Failed to load relations");
      }
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
              value={newPerson.name}
              onChange={(e) =>
                setNewPerson({ ...newPerson, name: e.target.value })
              }
              sx={{ minWidth: "300px" }}
            />
            <TextField
              label="Birth date"
              type="date"
              value={newPerson.birth_date}
              onChange={(e) =>
                setNewPerson({ ...newPerson, birth_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: "400px" }}
            />
            <TextField
              label="Death date"
              type="date"
              value={newPerson.death_date}
              onChange={(e) =>
                setNewPerson({ ...newPerson, death_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: "400px" }}
            />
            <TextField
              select
              label="Gender"
              value={newPerson.gender}
              onChange={(e) =>
                setNewPerson({ ...newPerson, gender: e.target.value })
              }
              sx={{ width: "400px" }}
            >
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="K">Female</MenuItem>
              <MenuItem value="I">Other</MenuItem>
            </TextField>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: "200px" }}
            >
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full name</TableCell>
              <TableCell>Birth date</TableCell>
              <TableCell>Death date</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person.name}>
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.birth_date || '-'}</TableCell>
                <TableCell>{person.death_date || '-'}</TableCell>
                <TableCell>
                  {person.gender === 'M' ? 'Male' : 
                   person.gender === 'K' ? 'Female' : 
                   person.gender === 'I' ? 'Other' : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    color="error"
                    onClick={() => handleDeletePerson(person)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="show relations"
                    onClick={() => handleShowRelations(person)}
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Relations: {selectedPerson?.name}
          {selectedPerson?.birth_date && ` (b. ${selectedPerson.birth_date})`}
        </DialogTitle>
        <DialogContent>
          {Object.keys(relations).length > 0 ? (
            <List>
              {Object.entries(relations).map(([relationType, people]) => (
                <React.Fragment key={relationType}>
                  <ListItem>
                    <ListItemText
                      primary={relationType.replace('_', ' ') + ' of:'}
                      secondary={people.join(', ')}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>No relations for this person</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PeopleManager;
