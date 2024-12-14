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
  Typography,
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
      await api.addRelation(person1, person2, relationType);
      setPerson1("");
      setPerson2("");
      setRelationType("");
      loadRelations();
    } catch (err) {
      setError("Failed to add relation");
    }
  };

  const handleRemoveRelation = async (relation) => {
    try {
      await api.removeRelation(
        relation.person1,
        relation.person2,
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
              onChange={(e) => setPerson1(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {people.map((person) => (
                <MenuItem
                  key={`${person.name}-${person.birth_date}`}
                  value={person.name}
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
              sx={{ minWidth: 200 }}
            >
              {people.map((person) => (
                <MenuItem
                  key={`${person.name}-${person.birth_date}`}
                  value={person.name}
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
            >
              Add Relation
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
              <TableCell>Person 1</TableCell>
              <TableCell>Relation</TableCell>
              <TableCell>Person 2</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relations.map((relation, index) => (
              <TableRow key={index}>
                <TableCell>{relation.person1}</TableCell>
                <TableCell>{relation.relation_type}</TableCell>
                <TableCell>{relation.person2}</TableCell>
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
