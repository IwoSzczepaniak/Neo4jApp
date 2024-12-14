import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Alert
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { api } from "../api";

const RELATION_TYPES = [
  "child",
  "parent",
  "spouse",
  "sibling",
  "grandparent",
  "grandchild",
  "great_grandparent",
  "great_grandchild",
  "aunt_uncle",
  "niece_nephew",
  "cousin",
  "parent_in_law",
  "child_in_law",
  "sibling_in_law",
];

function RelationsManager() {
  const [people, setPeople] = useState([]);
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [relationType, setRelationType] = useState("");
  const [relations, setRelations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPeople();
    loadRelations();
  }, []);

  const loadPeople = async () => {
    try {
      const response = await api.getAllPeople();
      setPeople(response.data.people);
    } catch (err) {
      setError("Failed to load people");
    }
  };

  const loadRelations = async () => {
    try {
      const response = await api.getAllRelations();
      setRelations(response.data.relations);
    } catch (err) {
      setError("Failed to load relations");
    }
  };

  const handleAddRelation = async (e) => {
    e.preventDefault();
    try {
      const person1Data = people.find(p => 
        `${p.name}-${p.birth_date}` === person1
      );
      const person2Data = people.find(p => 
        `${p.name}-${p.birth_date}` === person2
      );
      
      if (!person1Data || !person2Data) {
        setError("Please select both people");
        return;
      }

      await api.addRelation(
        person1Data.name,
        person1Data.birth_date,
        person2Data.name,
        person2Data.birth_date,
        relationType
      );
      setPerson1("");
      setPerson2("");
      setRelationType("");
      setError("");
      loadRelations();
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add relation");
      }
    }
  };

  const handleRemoveRelation = async (relation) => {
    try {
      await api.removeRelation(
        relation.person1,
        relation.person1_birth_date,
        relation.person2,
        relation.person2_birth_date,
        relation.relation_type
      );
      loadRelations();
    } catch (err) {
      setError("Failed to delete relation");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleAddRelation}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label="Person 1"
              value={person1}
              onChange={(e) => {
                setPerson1(e.target.value);
                if (e.target.value === person2) {
                  setPerson2("");
                }
              }}
              sx={{ minWidth: 340 }}
            >
              {people.map((person) => (
                <MenuItem
                  key={`${person.name}-${person.birth_date}`}
                  value={`${person.name}-${person.birth_date}`}
                >
                  {person.name}{" "}
                  {person.birth_date ? `(b. ${person.birth_date})` : ""}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Person 2"
              value={person2}
              onChange={(e) => setPerson2(e.target.value)}
              sx={{ minWidth: 340 }}
              disabled={!person1}
            >
              {people
                .filter(p => `${p.name}-${p.birth_date}` !== person1)
                .map((person) => (
                  <MenuItem
                    key={`${person.name}-${person.birth_date}`}
                    value={`${person.name}-${person.birth_date}`}
                  >
                    {person.name}{" "}
                    {person.birth_date ? `(b. ${person.birth_date})` : ""}
                  </MenuItem>
                ))}
            </TextField>

            <FormControl fullWidth>
              <InputLabel>Relation Type</InputLabel>
              <Select
                value={relationType}
                label="Relation Type"
                onChange={(e) => setRelationType(e.target.value)}
                disabled={!person1 || !person2}
              >
                {RELATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: "200px" }}
              disabled={!person1 || !person2 || !relationType}
            >
              Add Relation
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Person 1</TableCell>
              <TableCell>Birth Date</TableCell>
              <TableCell>Relation</TableCell>
              <TableCell>Person 2</TableCell>
              <TableCell>Birth Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relations.map((relation, index) => (
              <TableRow key={index}>
                <TableCell>{relation.person1}</TableCell>
                <TableCell>{relation.person1_birth_date || '-'}</TableCell>
                <TableCell>{relation.relation_type.replaceAll('_', ' ')}</TableCell>
                <TableCell>{relation.person2}</TableCell>
                <TableCell>{relation.person2_birth_date || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleRemoveRelation(relation)}
                    color="error"
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

export default RelationsManager;
