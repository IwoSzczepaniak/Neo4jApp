import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    // People endpoints
    getAllPeople: () => axios.get(`${API_BASE_URL}/people`),
    addPerson: (fullname) => axios.post(`${API_BASE_URL}/people`, { fullname }),
    removePerson: (fullname) => axios.delete(`${API_BASE_URL}/people/${fullname}`),
    getPersonRelations: (fullname) => axios.get(`${API_BASE_URL}/people/${fullname}/relations`),

    // Relations endpoints
    getAllRelations: () => axios.get(`${API_BASE_URL}/relations`),
    addRelation: (person1_name, person2_name, relation_type) => 
        axios.post(`${API_BASE_URL}/relations`, { person1_name, person2_name, relation_type }),
    removeRelation: (person1_name, person2_name, relation_type) => 
        axios.delete(`${API_BASE_URL}/relations`, { 
            data: { person1_name, person2_name, relation_type } 
        }),
}; 

export async function findRelation(person1, person2) {
    try {
        const response = await fetch(`${API_BASE_URL}/relations/${person1}/${person2}`);
        if (!response.ok) {
            throw new Error('Failed to find relation');
        }
        return await response.text();
    } catch (error) {
        console.error('Error finding relation:', error);
        throw error;
    }
} 