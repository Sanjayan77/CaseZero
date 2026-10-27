from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Investigation, EvidenceBoardNode, EvidenceBoardEdge
from app.schemas.schemas import BoardStateResponse, BoardSyncRequest, BoardNodeSchema, BoardEdgeSchema

router = APIRouter(prefix="/api/investigations/{id}/board", tags=["Evidence Board"])

def _get_user_investigation(id: int, user_id: int, db: Session) -> Investigation:
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if inv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return inv

@router.get("", response_model=BoardStateResponse)
def get_board(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)
    nodes = db.query(EvidenceBoardNode).filter(EvidenceBoardNode.investigation_id == inv.id).all()
    edges = db.query(EvidenceBoardEdge).filter(EvidenceBoardEdge.investigation_id == inv.id).all()

    return BoardStateResponse(
        nodes=[
            BoardNodeSchema(
                node_id=n.node_id,
                node_type=n.node_type,
                ref_code=n.ref_code,
                title=n.title,
                content=n.content,
                pos_x=n.pos_x,
                pos_y=n.pos_y,
                color=n.color
            ) for n in nodes
        ],
        edges=[
            BoardEdgeSchema(
                edge_id=e.edge_id,
                source_node_id=e.source_node_id,
                target_node_id=e.target_node_id,
                label=e.label
            ) for e in edges
        ]
    )

@router.put("", response_model=BoardStateResponse)
def update_board(
    id: int,
    sync_req: BoardSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = _get_user_investigation(id, current_user.id, db)

    # Clean existing nodes and edges for this board
    db.query(EvidenceBoardEdge).filter(EvidenceBoardEdge.investigation_id == inv.id).delete()
    db.query(EvidenceBoardNode).filter(EvidenceBoardNode.investigation_id == inv.id).delete()

    # Re-insert updated nodes
    for n in sync_req.nodes:
        db.add(EvidenceBoardNode(
            investigation_id=inv.id,
            node_id=n.node_id,
            node_type=n.node_type,
            ref_code=n.ref_code,
            title=n.title,
            content=n.content,
            pos_x=n.pos_x,
            pos_y=n.pos_y,
            color=n.color or "#D5AA63"
        ))

    # Re-insert updated edges
    for e in sync_req.edges:
        db.add(EvidenceBoardEdge(
            investigation_id=inv.id,
            edge_id=e.edge_id,
            source_node_id=e.source_node_id,
            target_node_id=e.target_node_id,
            label=e.label
        ))

    db.commit()
    return get_board(id=id, current_user=current_user, db=db)
