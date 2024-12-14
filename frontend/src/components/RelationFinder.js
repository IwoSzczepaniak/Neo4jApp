import React, { useState, useEffect } from 'react';
import { findRelation, api } from '../api';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Chip,
    MenuItem,
} from '@mui/material';

function RelationFinder() {
    const [people, setPeople] = useState([]);
    const [person1, setPerson1] = useState('');
    const [person2, setPerson2] = useState('');
    const [relation, setRelation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        try {
            const response = await api.getAllPeople();
            setPeople(response.data.people);
        } catch (err) {
            setError("Failed to load people");
        }
    };

    const handleFind = async () => {
        try {
            if (!person1 || !person2) {
                setError('Please select both people');
                return;
            }
            const result = await findRelation(person1, person2);
            const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
            setRelation(parsedResult);
            setError(null);
        } catch (err) {
            setError('Failed to find relation');
            setRelation(null);
        }
    };

    const formatRelation = (relationData) => {
        if (!relationData || !relationData.relations) return null;
        return relationData.relations[0].replaceAll("_", " ");
    };

    return (
        <Paper sx={{ p: 2, mb: 2}}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', height: '56px' }}>
                <TextField
                    select
                    label="Person 1"
                    value={person1}
                    onChange={(e) => setPerson1(e.target.value)}
                    sx={{ width: '100%' }}
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
                    sx={{ width: '100%' }}
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

                <Button 
                    variant="contained" 
                    onClick={handleFind}
                    sx={{ minWidth: '200px', height: '56px' }}
                >
                    Find Relation
                </Button>
            </Box>
            
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
            
            {relation && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Relation Found:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={relation.person1} 
                            color="primary" 
                            variant="outlined"
                        />
                        <Typography variant="body1" sx={{ mx: 1 }}>
                            is
                        </Typography>
                        <Chip 
                            label={formatRelation(relation)} 
                            color="secondary"
                        />
                        <Typography variant="body1" sx={{ mx: 1 }}>
                            of
                        </Typography>
                        <Chip 
                            label={relation.person2} 
                            color="primary" 
                            variant="outlined"
                        />
                    </Box>
                </Box>
            )}
        </Paper>
    );
}

export default RelationFinder;
