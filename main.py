from fastapi import FastAPI, HTTPException
from neo4j import GraphDatabase
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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
    fullname: str

class Relation(BaseModel):
    person1_name: str
    person2_name: str
    relation_type: str

@app.post("/api/people")
def add_person(person: Person):
    with db.driver.session() as session:
        result = session.run(
            "MERGE (p:Person {fullname: $fullname}) "
            "RETURN p",
            fullname=person.fullname
        )
        if result.single():
            return {"message": f"Person {person.fullname} added successfully"}
        raise HTTPException(status_code=400, detail="Failed to add person")

@app.delete("/api/people/{fullname}")
def remove_person(fullname: str):
    with db.driver.session() as session:
        result = session.run(
            "MATCH (p:Person {fullname: $fullname}) "
            "DETACH DELETE p "
            "RETURN count(p) as count",
            fullname=fullname
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
        result = session.run(
            """
            MATCH (p1:Person {fullname: $person1_name})
            MATCH (p2:Person {fullname: $person2_name})
            MERGE (p1)-[r1:RELATED {type: $relation_type}]->(p2)
            MERGE (p2)-[r2:RELATED {type: $reverse_relation}]->(p1)
            RETURN r1, r2
            """,
            person1_name=relation.person1_name,
            person2_name=relation.person2_name,
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
            MATCH (p1:Person {fullname: $person1_name})
            -[r1:RELATED {type: $relation_type}]->
            (p2:Person {fullname: $person2_name})
            MATCH (p2)
            -[r2:RELATED {type: $reverse_relation}]->
            (p1)
            DELETE r1, r2
            RETURN count(r1) as count
            """,
            person1_name=relation.person1_name,
            person2_name=relation.person2_name,
            relation_type=relation.relation_type,
            reverse_relation=reverse_relation
        )
        if result.single()["count"] > 0:
            return {"message": "Relation removed successfully"}
        raise HTTPException(status_code=404, detail="Relation not found")

@app.get("/api/people")
def get_all_people():
    with db.driver.session() as session:
        result = session.run("MATCH (p:Person) RETURN p.fullname as fullname")
        return {"people": [record["fullname"] for record in result]}

@app.get("/api/relations")
def list_relations():
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p1:Person)-[r:RELATED]->(p2:Person)
            RETURN p1.fullname as person1, r.type as relation_type, p2.fullname as person2
            ORDER BY p1.fullname, p2.fullname
            """
        )
        relations = [
            {
                "person1": record["person1"],
                "relation_type": record["relation_type"],
                "person2": record["person2"]
            }
            for record in result
        ]
        return {"relations": relations}

@app.get("/api/people/{fullname}/relations")
def get_person_relations(fullname: str):
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p:Person {fullname: $fullname})-[r:RELATED]->(related:Person)
            RETURN related.fullname as related_person, r.type as relation_type
            ORDER BY relation_type, related_person
            """,
            fullname=fullname
        )
        
        relations = {}
        for record in result:
            relation_type = record["relation_type"]
            related_person = record["related_person"]
            
            if relation_type not in relations:
                relations[relation_type] = []
            relations[relation_type].append(related_person)
            
        if not relations:
            raise HTTPException(status_code=404, detail=f"No relations found for person: {fullname}")
            
        return {
            "person": fullname,
            "relations": relations
        }

@app.get("/api/relations/{person1}/{person2}")
def get_relation_between_people(person1: str, person2: str):
    with db.driver.session() as session:
        result = session.run(
            """
            MATCH (p1:Person {fullname: $person1})-[r:RELATED]->(p2:Person {fullname: $person2})
            RETURN r.type as relation_type
            UNION
            MATCH (p2:Person {fullname: $person2})-[r:RELATED]->(p1:Person {fullname: $person1})
            RETURN r.type as relation_type
            """,
            person1=person1,
            person2=person2
        )
        
        relations = [record["relation_type"] for record in result]
        
        if not relations:
            raise HTTPException(
                status_code=404, 
                detail=f"No relation found between {person1} and {person2}"
            )
            
        return {
            "person1": person1,
            "person2": person2,
            "relations": relations
        }

@app.on_event("shutdown")
def shutdown_event():
    db.close() 