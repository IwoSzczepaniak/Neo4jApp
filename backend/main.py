from fastapi import FastAPI, HTTPException
from neo4j import GraphDatabase
from pydantic import BaseModel, field_validator
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import date, datetime

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RELATION_MAPPING = {
    "child": "parent",
    "parent": "child",
    "spouse": "spouse",
    "sibling": "sibling",
    "grandparent": "grandchild",
    "grandchild": "grandparent",
    "great_grandparent": "great_grandchild",
    "great_grandchild": "great_grandparent",
    "aunt_uncle": "niece_nephew",
    "niece_nephew": "aunt_uncle",
    "cousin": "cousin",
    "parent_in_law": "child_in_law",
    "child_in_law": "parent_in_law",
    "sibling_in_law": "sibling_in_law"
}

class DatabaseConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    def close(self):
        self.driver.close()

db = DatabaseConnection()

class Person(BaseModel):
    id: Optional[int] = None
    name: str
    birth_date: str
    death_date: Optional[str] = None
    gender: Optional[str] = None

    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, v):
        if not v:
            raise HTTPException(status_code=400, detail="Birth date is required")
        birth_date = datetime.strptime(v, '%Y-%m-%d').date()
        if birth_date > date.today():
            raise HTTPException(status_code=400, detail="Birth date cannot be in the future")
        return v

    @field_validator('death_date')
    @classmethod
    def death_date_valid(cls, v, info):
        if not v:
            return None
        death_date = datetime.strptime(v, '%Y-%m-%d').date()
        
        if death_date > date.today():
            raise HTTPException(status_code=400, detail="Death date cannot be in the future")
        
        if 'birth_date' in info.data and info.data['birth_date']:
            birth_date = datetime.strptime(info.data['birth_date'], '%Y-%m-%d').date()
            if death_date < birth_date:
                raise HTTPException(status_code=400, detail="Death date cannot be earlier than birth date")
        
        return v

class Relation(BaseModel):
    person1_name: str
    person1_birth_date: str
    person2_name: str
    person2_birth_date: str
    relation_type: str

@app.post("/api/people")
def add_person(person: Person):
    if person.name == "":
        raise HTTPException(status_code=400, detail="Full name cannot be empty")
    
    with db.driver.session() as session:
        # Najpierw sprawdź czy istnieje osoba o tym samym imieniu i dacie urodzenia
        check_result = session.run(
            """
            MATCH (p:Person {fullname: $fullname, birth_date: $birth_date})
            RETURN p
            """,
            fullname=person.name,
            birth_date=person.birth_date
        )
        
        if check_result.single():
            raise HTTPException(
                status_code=400, 
                detail="Person with this name and birth date already exists"
            )
        
        # Jeśli nie istnieje, dodaj nową osobę
        result = session.run(
            """
            CREATE (p:Person {
                fullname: $fullname,
                birth_date: $birth_date,
                death_date: $death_date,
                gender: $gender
            })
            RETURN p
            """,
            fullname=person.name,
            birth_date=person.birth_date,
            death_date=person.death_date,
            gender=person.gender
        )
        
        if result.single():
            return {"message": f"Person {person.name} added successfully"}
        raise HTTPException(status_code=400, detail="Failed to add person")

@app.delete("/api/people/{fullname}/{birth_date}")
def remove_person(fullname: str, birth_date: str):
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p:Person {fullname: $fullname, birth_date: $birth_date})
            DETACH DELETE p
            RETURN count(p) as count
            """,
            fullname=fullname,
            birth_date=birth_date
        )
        if result.single()["count"] > 0:
            return {"message": f"Person {fullname} and their relations removed successfully"}
        raise HTTPException(status_code=404, detail="Person not found")

@app.post("/api/relations")
def add_relation(relation: Relation):
    if relation.relation_type not in RELATION_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid relation type")

    reverse_relation = RELATION_MAPPING[relation.relation_type]
    
    with db.driver.session() as session:
        # First check if relation already exists
        check_result = session.run(
            """
            MATCH (p1:Person {fullname: $person1_name, birth_date: $person1_birth_date})
            -[r:RELATED]->
            (p2:Person {fullname: $person2_name, birth_date: $person2_birth_date})
            RETURN r
            """,
            person1_name=relation.person1_name,
            person1_birth_date=relation.person1_birth_date,
            person2_name=relation.person2_name,
            person2_birth_date=relation.person2_birth_date
        )
        
        if check_result.single():
            raise HTTPException(
                status_code=400, 
                detail="These people are already in a relation"
            )

        # If no relation exists, create new one
        result = session.run(
            """
            MATCH (p1:Person {fullname: $person1_name, birth_date: $person1_birth_date})
            MATCH (p2:Person {fullname: $person2_name, birth_date: $person2_birth_date})
            WHERE p1 <> p2
            MERGE (p1)-[r1:RELATED {type: $relation_type}]->(p2)
            MERGE (p2)-[r2:RELATED {type: $reverse_relation}]->(p1)
            RETURN r1, r2
            """,
            person1_name=relation.person1_name,
            person1_birth_date=relation.person1_birth_date,
            person2_name=relation.person2_name,
            person2_birth_date=relation.person2_birth_date,
            relation_type=relation.relation_type,
            reverse_relation=reverse_relation
        )
        if result.single():
            return {"message": "Relation added successfully"}
        raise HTTPException(status_code=404, detail="One or both persons not found")

@app.delete("/api/relations")
def remove_relation(relation: Relation):
    if relation.relation_type not in RELATION_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid relation type")

    reverse_relation = RELATION_MAPPING[relation.relation_type]
    
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p1:Person {fullname: $person1_name, birth_date: $person1_birth_date})
            -[r1:RELATED {type: $relation_type}]->
            (p2:Person {fullname: $person2_name, birth_date: $person2_birth_date})
            MATCH (p2)
            -[r2:RELATED {type: $reverse_relation}]->
            (p1)
            DELETE r1, r2
            RETURN count(r1) as count
            """,
            person1_name=relation.person1_name,
            person1_birth_date=relation.person1_birth_date,
            person2_name=relation.person2_name,
            person2_birth_date=relation.person2_birth_date,
            relation_type=relation.relation_type,
            reverse_relation=reverse_relation
        )
        if result.single()["count"] > 0:
            return {"message": "Relation removed successfully"}
        raise HTTPException(status_code=404, detail="Relation not found")

@app.get("/api/people")
def get_all_people():
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p:Person) 
            RETURN p.fullname as fullname, 
                   p.birth_date as birth_date,
                   p.death_date as death_date,
                   p.gender as gender
            """
        )
        return {
            "people": [
                {
                    "name": record["fullname"],
                    "birth_date": record["birth_date"],
                    "death_date": record["death_date"],
                    "gender": record["gender"]
                } for record in result
            ]
        }

@app.get("/api/relations")
def list_relations():
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p1:Person)-[r:RELATED]->(p2:Person)
            RETURN p1.fullname as person1, 
                   p1.birth_date as person1_birth_date,
                   r.type as relation_type, 
                   p2.fullname as person2,
                   p2.birth_date as person2_birth_date
            ORDER BY p1.fullname, p2.fullname
            """
        )
        relations = [
            {
                "person1": record["person1"],
                "person1_birth_date": record["person1_birth_date"],
                "relation_type": record["relation_type"],
                "person2": record["person2"],
                "person2_birth_date": record["person2_birth_date"]
            }
            for record in result
        ]
        return {"relations": relations}

@app.get("/api/people/{fullname}/relations")
def get_person_relations(fullname: str, birth_date: str):
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p:Person {fullname: $fullname, birth_date: $birth_date})-[r:RELATED]->(related:Person)
            RETURN related.fullname as related_person, 
                   related.birth_date as birth_date,
                   r.type as relation_type
            ORDER BY relation_type, related_person
            """,
            fullname=fullname,
            birth_date=birth_date
        )
        
        relations = {}
        for record in result:
            relation_type = record["relation_type"]
            related_person = record["related_person"]
            birth_date = record["birth_date"]
            
            if relation_type not in relations:
                relations[relation_type] = []
            
            person_info = related_person
            if birth_date:
                person_info += f" (b. {birth_date})"
            relations[relation_type].append(person_info)
            
        if not relations:
            raise HTTPException(status_code=404, detail=f"No relations found for person: {fullname}")
            
        return {
            "person": fullname,
            "relations": relations
        }

@app.get("/api/relations/{person1}/{birth_date1}/{person2}/{birth_date2}")
def get_relation_between_people(person1: str, birth_date1: str, person2: str, birth_date2: str):
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p1:Person {fullname: $person1, birth_date: $birth_date1})
            -[r:RELATED]->(p2:Person {fullname: $person2, birth_date: $birth_date2})
            RETURN r.type as relation_type, 
                   p1.birth_date as p1_birth_date,
                   p2.birth_date as p2_birth_date
            UNION
            MATCH (p2:Person {fullname: $person2, birth_date: $birth_date2})
            -[r:RELATED]->(p1:Person {fullname: $person1, birth_date: $birth_date1})
            RETURN r.type as relation_type,
                   p2.birth_date as p1_birth_date,
                   p1.birth_date as p2_birth_date
            """,
            person1=person1,
            birth_date1=birth_date1,
            person2=person2,
            birth_date2=birth_date2
        )
        
        relations = [{
            "relation_type": record["relation_type"],
            "person1_birth": record["p1_birth_date"],
            "person2_birth": record["p2_birth_date"]
        } for record in result]
        
        if not relations:
            raise HTTPException(
                status_code=404, 
                detail=f"No relation found between {person1} (b. {birth_date1}) and {person2} (b. {birth_date2})"
            )
            
        return {
            "person1": person1,
            "person2": person2,
            "relations": relations
        }

@app.on_event("shutdown")
def shutdown_event():
    db.close() 