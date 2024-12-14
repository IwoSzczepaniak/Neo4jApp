import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    // People endpoints
    getAllPeople: () => axios.get(`${API_BASE_URL}/people`),
    addPerson: (personData) => axios.post(`${API_BASE_URL}/people`, {
        name: personData.name,
        birth_date: personData.birth_date || null,
        death_date: personData.death_date || null,
        gender: personData.gender || null
    }),
    removePerson: (name, birthDate) => 
        axios.delete(`${API_BASE_URL}/people/${encodeURIComponent(name)}/${encodeURIComponent(birthDate)}`),
    getPersonRelations: (fullname, birthDate) => 
        axios.get(`${API_BASE_URL}/people/${encodeURIComponent(fullname)}/relations?birth_date=${encodeURIComponent(birthDate)}`),

    // Relations endpoints
    getAllRelations: () => axios.get(`${API_BASE_URL}/relations`),
    addRelation: (person1_name, person1_birth_date, person2_name, person2_birth_date, relation_type) => 
        axios.post(`${API_BASE_URL}/relations`, { 
            person1_name, 
            person1_birth_date,
            person2_name, 
            person2_birth_date,
            relation_type 
        }),
    removeRelation: (person1_name, person1_birth_date, person2_name, person2_birth_date, relation_type) => 
        axios.delete(`${API_BASE_URL}/relations`, { 
            data: { 
                person1_name, 
                person1_birth_date,
                person2_name, 
                person2_birth_date,
                relation_type 
            } 
        }),
}; 

export async function findRelation(person1Info, person2Info) {
    try {
        const [person1, birth_date1] = person1Info.split('/');
        const [person2, birth_date2] = person2Info.split('/');
        
        const response = await axios.get(
            `${API_BASE_URL}/relations/${encodeURIComponent(person1)}/${encodeURIComponent(birth_date1)}/${encodeURIComponent(person2)}/${encodeURIComponent(birth_date2)}`
        );
        return response.data;
    } catch (error) {
        console.error('Error finding relation:', error);
        throw error;
    }
} 