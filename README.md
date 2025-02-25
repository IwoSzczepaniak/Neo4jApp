# FamilyTreeNeo4j

A full-stack family tree management application built with Neo4j, FastAPI, and React. Visualize and manage family relationships with an intuitive graph database backend.

```mermaid
classDiagram
    %% Frontend Components
    class App {
        -value: int
        +handleChange(event, newValue)
        +render()
    }

    class PeopleManager {
        +render()
    }

    class RelationsManager {
        +render()
    }

    class RelationFinder {
        +render()
    }

    class FamilyTree {
        +render()
    }

    %% Backend API
    class FastAPIBackend {
        +add_person(Person)
        +remove_person(fullname)
        +add_relation(Relation)
        +remove_relation(Relation)
        +get_all_people()
        +list_relations()
        +get_person_relations(fullname)
        +get_relation_between_people(person1, person2)
    }

    %% Data Models
    class DatabaseConnection {
        -driver: Neo4jDriver
        +close()
    }

    %% Frontend Component Relationships
    App *-- PeopleManager
    App *-- RelationsManager
    App *-- RelationFinder
    App *-- FamilyTree

    %% Backend Relationships
    FastAPIBackend --> DatabaseConnection : uses

    %% Frontend-Backend Communication
    PeopleManager ..> FastAPIBackend : HTTP /api/people
    RelationsManager ..> FastAPIBackend : HTTP /api/relations
    RelationFinder ..> FastAPIBackend : HTTP /api/relations/{person1}/{person2}
    FamilyTree ..> FastAPIBackend : HTTP /api/people, /api/relations

    %% Database
    DatabaseConnection --> Neo4j : connects to

    class Neo4j {
        <<external>>
    }
```

## Tech Stack
- **Frontend:** React with Material-UI
- **Backend:** FastAPI (Python)
- **Database:** Neo4j (Graph Database)
- **Containerization:** Docker

## Features
- 👨‍👩‍👧‍👦 Create and manage family members with:
  - Full name (required)
  - Birth date (required, used for unique identification)
  - Death date (optional)
  - Gender (Male/Female - optional)
- 🔗 Define relationships between uniquely identified people
- 🔄 Automatic bidirectional relationships
- 🐳 Easy deployment with Docker

# Docker Setup (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file using your preferred editor (e.g. vim)
vim .env

# Build and start all services
docker-compose up --build

# To stop all services
docker-compose down
```

After starting the services:
- Frontend: http://localhost:3000
- Backend API & Docs: http://localhost:8000/docs
- Neo4j Browser: http://localhost:7474

# Manual Setup

If you prefer to run the services individually, follow these instructions:

# Backend
## Requirements
- Python 3.8+
- Neo4j Database
- FastAPI
- Python-dotenv
- Docker (optional, for running Neo4j in container)

## Complete Setup Guide

### 1. Set up Neo4j

#### Using Docker
```bash
# Pull Neo4j image
docker pull neo4j:latest

# Run Neo4j container
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/your_password \
    -d \
    neo4j:latest
```

To clear db:
```CYPHER
MATCH (n)
DETACH DELETE n;
```

### 2. Install Python Dependencies
```bash
# Create a virtual environment
python3 -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi neo4j python-dotenv uvicorn
```

### 3. Configure Environment
Create a `.env` file in your project root:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

### 4. Start the Application
```bash
# Make sure your virtual environment is activated
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Start the FastAPI server
uvicorn main:app --reload
```

### 5. Verify Setup
1. First ensure your virtual environment is active (you should see `(venv)` in your terminal)
2. Neo4j Browser: http://localhost:7474
   - Login with neo4j/your_password
   - You can run Cypher queries here

2. FastAPI Swagger UI: http://localhost:8000/docs
   - Test API endpoints
   - View API documentation

## API Endpoints

### People
- POST `/api/people` - Add new person (requires name and birth date)
- DELETE `/api/people/{fullname}/{birth_date}` - Remove person and their relations
- GET `/api/people` - List all people
- GET `/api/people/{fullname}/relations?birth_date={birth_date}` - Get all relations for a specific person

### Example Person Object
```json
{
    "name": "John Smith",
    "birth_date": "1980-01-01",  // Required
    "death_date": "2023-12-31",  // Optional
    "gender": "M"                 // M = Male, K = Female
}
```

### Relations
- POST `/api/relations` - Add relation between people (automatically adds reverse relation)
- DELETE `/api/relations` - Remove relation between people
- GET `/api/relations` - List all relations in the family tree
- GET `/api/relations/{person1}/{birth_date1}/{person2}/{birth_date2}` - Get the direct relation between two people

### Example Relation Response
```json
{
    "relations": [
        {
            "person1": "John Smith",
            "person1_birth_date": "1980-01-01",
            "relation_type": "PARENT",
            "person2": "Mary Smith",
            "person2_birth_date": "2010-05-15"
        }
    ]
}
```

## Person Identification
The system uses a combination of full name and birth date to uniquely identify people. This allows:
- Multiple people with the same name but different birth dates
- Prevention of duplicate entries

## Data Validation
- Birth date cannot be in the future
- Death date (if provided) must be after birth date
- Cannot create relations between the same person
- Cannot create duplicate relations
- Cannot add new relation between people who are already related

## Supported Relations
All relations are automatically bi-directional. When you create one relation, its reverse is automatically created.

- child ↔ parent
- spouse ↔ spouse
- sibling ↔ sibling
- grandparent ↔ grandchild
- great_grandparent ↔ great_grandchild
- aunt_uncle ↔ niece_nephew
- cousin ↔ cousin
- parent_in_law ↔ child_in_law
- sibling_in_law ↔ sibling_in_law

## Example Usage

Adding a person:
```json
POST /api/people
{
    "fullname": "John Doe"
}
```

Examples of adding relations:

1. Parent-Child relation:
```json
POST /api/relations
{
    "person1_name": "John Doe",
    "person2_name": "Jane Doe",
    "relation_type": "parent"
}
```

2. Aunt/Uncle relation:
```json
POST /api/relations
{
    "person1_name": "Sarah Smith",
    "person2_name": "Lucy Jones",
    "relation_type": "aunt_uncle"
}
```

When you create any relation, the reverse relation is automatically created. For example:
- If A is a "parent" of B, B automatically becomes a "child" of A
- If A is an "aunt_uncle" of B, B automatically becomes a "niece_nephew" of A
- If A is a "cousin" of B, B automatically becomes a "cousin" of A


# Frontend

## Requirements
- Node.js 14+
- npm 
- React 18+

## Setup Guide

### 1. Install Dependencies
```bash
cd frontend

npm init -y

npm install --legacy-peer-deps @emotion/react @emotion/styled @mui/icons-material @mui/material axios react react-dom react-scripts

npm install
```

### 2. Start React Server
```bash
# Using npm
npm start

# Or using yarn
yarn start
```

The application will be available at http://localhost:3000

## Features

### Family Tree Visualization
- Interactive family tree diagram
- Zoom and pan controls
- Click nodes to view detailed information

### Person Management
- Add new family members with required birth dates
- View person details including birth/death dates and gender
- Remove family members
- View person's complete relation network

### Relation Management
- Create new relations between family members 
- View existing relations 
- Remove relations
- Find relations between any two family members

## Usage Examples

### Adding a New Person
```javascript
const person = {
  fullname: "John Smith",
  birthDate: "1980-01-01",
  gender: "male"
};

await api.addPerson(person);
```

### Creating a Relation
```javascript
const relation = {
  person1_name: "John Smith",
  person2_name: "Jane Smith",
  relation_type: "spouse"
};

await api.createRelation(relation);
```

### Visualizing Relations
```javascript
// Example of accessing a person's complete relation network
const relations = await api.getPersonRelations("John Smith");

// Relations will include all connection types:
{
  "SPOUSE": ["Jane Smith"],
  "CHILD": ["Tommy Smith", "Sarah Smith"],
  "SIBLING": ["Michael Smith"],
  // ... other relations
}
```

## Styling
The application uses a combination of:
- CSS Modules for component-specific styles
- Tailwind CSS for utility classes
- Custom CSS variables for theming

