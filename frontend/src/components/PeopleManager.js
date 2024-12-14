import DeleteIcon from "@mui/icons-material/Delete";
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
  Typography
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
              value={newPerson.name}
              onChange={(e) =>
                setNewPerson({ ...newPerson, name: e.target.value })
              }
              sx={{ minWidth: "300px" }}
            />
            <TextField
              label="Data urodzenia"
              type="date"
              value={newPerson.birth_date}
              onChange={(e) =>
                setNewPerson({ ...newPerson, birth_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: "400px" }}
            />
            <TextField
              label="Data śmierci"
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
              label="Płeć"
              value={newPerson.gender}
              onChange={(e) =>
                setNewPerson({ ...newPerson, gender: e.target.value })
              }
              sx={{ width: "400px" }}
            >
              <MenuItem value="M">Mężczyzna</MenuItem>
              <MenuItem value="K">Kobieta</MenuItem>
              <MenuItem value="I">Inna</MenuItem>
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
              <TableCell>Imię i nazwisko</TableCell>
              <TableCell>Data urodzenia</TableCell>
              <TableCell>Data śmierci</TableCell>
              <TableCell>Płeć</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person.name}>
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.birth_date || '-'}</TableCell>
                <TableCell>{person.death_date || '-'}</TableCell>
                <TableCell>
                  {person.gender === 'M' ? 'Mężczyzna' : 
                   person.gender === 'K' ? 'Kobieta' : 
                   person.gender === 'I' ? 'Inna' : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeletePerson(person.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default PeopleManager;
