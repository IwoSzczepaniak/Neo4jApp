# Family Tree Manager

A full-stack application for managing family trees with a React frontend and FastAPI backend.

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
- POST `/api/people` - Add new person
- DELETE `/api/people/{fullname}` - Remove person and their relations
- GET `/api/people` - List all people
- GET `/api/people/{fullname}/relations` - Get all relations for a specific person

### Relations
- POST `/api/relations` - Add relation between people (automatically adds reverse relation)
- DELETE `/api/relations` - Remove relation between people
- GET `/api/relations` - List all relations in the family tree
- GET `/api/relations/{person1}/{person2}` - Get the direct relation between two people

## Example Responses

### Get Person's Relations
```json
{
    "person": "John Smith",
    "relations": {
        "CHILD": ["Mary Smith", "Peter Smith"],
        "SPOUSE": ["Jane Smith"],
        "SIBLING": ["Tom Smith"],
        "GRANDCHILD": ["Lucy Jones"]
    }
}
```

### Get All Relations
```json
{
    "relations": [
        {
            "person1": "Alice Smith",
            "relation_type": "MOTHER",
            "person2": "Bob Smith"
        },
        {
            "person1": "Bob Smith",
            "relation_type": "CHILD",
            "person2": "Alice Smith"
        }
    ]
}
```

### Get Relation Between Two People
```json
{
    "person1": "John Smith",
    "person2": "Mary Smith",
    "relation": "PARENT"
}
```

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
# Navigate to frontend directory
cd frontend

# Install dependencies using npm
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
- Add new family members
- Edit existing member details
- Remove family members
- View person's complete relation network

### Relation Management
- Create new relations between family members
- View existing relations
- Remove relations
- Automatic bidirectional relation handling

## Component Structure

```
src/
├── components/
│   ├── FamilyTree/        # Main tree visualization
│   ├── PersonForm/        # Add/Edit person forms
│   ├── RelationForm/      # Manage relations
│   ├── PersonDetails/     # Person information display
│   └── Navigation/        # App navigation
├── services/
│   ├── api.js            # API communication
│   └── treeLayout.js     # Tree visualization logic
└── utils/
    └── relationTypes.js   # Relation type constants
```

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

