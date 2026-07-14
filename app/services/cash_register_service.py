from datetime import datetime
from app.extensions import db
from app.models.cash_register import CashRegisterSession
from app.schemas.cash_register_schema import CashRegisterSessionSchema

cash_session_schema = CashRegisterSessionSchema()
cash_sessions_schema = CashRegisterSessionSchema(many=True)

class CashRegisterService:
    @staticmethod
    def get_active_session(store_id):
        """Get the current open cash register session for a store"""
        session = CashRegisterSession.query.filter_by(
            store_id=store_id, 
            status='ABIERTA'
        ).first()
        return session

    @staticmethod
    def open_session(store_id, opened_by_id, opening_balance, notes=None):
        """Open a new cash register session"""
        # Check if there is already an active session
        active = CashRegisterSession.query.filter_by(
            store_id=store_id,
            status='ABIERTA'
        ).first()
        if active:
            raise ValueError("Ya existe una sesión de caja abierta para esta tienda.")
            
        session = CashRegisterSession(
            store_id=store_id,
            opened_by_id=opened_by_id,
            opening_balance=opening_balance,
            notes=notes,
            status='ABIERTA',
            opened_at=datetime.utcnow()
        )
        
        db.session.add(session)
        db.session.commit()
        return cash_session_schema.dump(session)

    @staticmethod
    def close_session(session_id, closing_balance_real, notes=None):
        """Close/reconcile an active cash register session"""
        session = CashRegisterSession.query.get(session_id)
        if not session:
            raise ValueError("Sesión de caja no encontrada.")
        if session.status == 'CERRADA':
            raise ValueError("Esta sesión de caja ya se encuentra cerrada.")
            
        # Expected balance in cash drawer is: opening_balance + cash_sales
        session.closing_balance_expected = session.opening_balance + session.cash_sales
        session.closing_balance_real = closing_balance_real
        session.closed_at = datetime.utcnow()
        session.status = 'CERRADA'
        
        if notes:
            if session.notes:
                session.notes += f" | Cierre: {notes}"
            else:
                session.notes = notes
                
        db.session.commit()
        return cash_session_schema.dump(session)

    @staticmethod
    def get_sessions_history(store_id):
        """Get past cash sessions, newest first"""
        sessions = CashRegisterSession.query.filter_by(
            store_id=store_id
        ).order_by(CashRegisterSession.opened_at.desc()).all()
        return cash_sessions_schema.dump(sessions)
