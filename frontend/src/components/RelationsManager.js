import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
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
  const [relations, setRelations] = useState([]);
  const [people, setPeople] = useState([]);
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [relationType, setRelationType] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [relationsRes, peopleRes] = await Promise.all([
        api.getAllRelations(),
        api.getAllPeople(),
      ]);
      setRelations(relationsRes.data.relations);
      setPeople(peopleRes.data.people);
    } catch (err) {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRelation = async (e) => {
    e.preventDefault();
    try {
      await api.addRelation(person1, person2, relationType);
      setPerson1("");
      setPerson2("");
      setRelationType("");
      loadData();
    } catch (err) {
      setError("Failed to add relation");
    }
  };

  const handleDeleteRelation = async (relation) => {
    try {
      await api.removeRelation(
        relation.person1,
        relation.person2,
        relation.relation_type
      );
      loadData();
    } catch (err) {
      setError("Failed to delete relation");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleAddRelation}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Person 1</InputLabel>
              <Select
                value={person1}
                label="Person 1"
                onChange={(e) => setPerson1(e.target.value)}
              >
                {people.map((person) => (
                  <MenuItem key={person} value={person}>
                    {person}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            <FormControl fullWidth>
              <InputLabel>Person 2</InputLabel>
              <Select
                value={person2}
                label="Person 2"
                onChange={(e) => setPerson2(e.target.value)}
              >
                {people.map((person) => (
                  <MenuItem key={person} value={person}>
                    {person}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button type="submit" variant="contained">
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

      <Paper>
        <List>
          {relations.map((relation, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${relation.person1} is ${relation.relation_type.replaceAll("_", " ")} of ${relation.person2}`}
              />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteRelation(relation)}
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

export default RelationsManager;
