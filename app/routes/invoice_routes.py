from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.invoice import Invoice
from app.services.invoice_service import InvoiceService
from app.services.order_service import OrderService
from app.schemas.invoice_schema import InvoiceSchema
from app.schemas.order_schema import OrderSchema

invoice_bp = Blueprint('invoices', __name__)
invoice_schema = InvoiceSchema()
invoices_schema = InvoiceSchema(many=True)
order_schema = OrderSchema()

@invoice_bp.route('', methods=['GET'])
@jwt_required()
def get_invoices():
    """Get all invoices for the user's store"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    invoices = InvoiceService.get_invoices_by_store(store_id)
    return jsonify(invoices), 200

@invoice_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice_details(invoice_id):
    """Get details of a specific invoice including its order items"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({'error': 'Factura no encontrada'}), 404
        
    if current_user.role != 'SUPERADMIN' and invoice.store_id != current_user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    invoice_data = invoice_schema.dump(invoice)
    
    # Load associated order details
    order_data = None
    if invoice.order:
        order_data = order_schema.dump(invoice.order)
        
    return jsonify({
        'invoice': invoice_data,
        'order': order_data
    }), 200

@invoice_bp.route('/order/<int:order_id>', methods=['POST'])
@jwt_required()
def generate_invoice_for_order(order_id):
    """Manually generate an invoice for an existing order"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    store_id = current_user.store_id
    if not store_id:
        return jsonify({'error': 'No se encontró la tienda asociada'}), 400
        
    data = request.get_json() or {}
    customer_name = data.get('customer_name')
    customer_document = data.get('customer_document')
    
    try:
        invoice = InvoiceService.generate_invoice(
            store_id=store_id,
            order_id=order_id,
            customer_name=customer_name,
            customer_document=customer_document
        )
        return jsonify(invoice), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/order/<int:order_id>', methods=['GET'])
@jwt_required()
def get_invoice_by_order(order_id):
    """Get invoice details for a specific order"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    invoice = Invoice.query.filter_by(order_id=order_id).first()
    if not invoice:
        return jsonify({'error': 'Factura no encontrada'}), 404
        
    if current_user.role != 'SUPERADMIN' and invoice.store_id != current_user.store_id:
        return jsonify({'error': 'No autorizado'}), 403
        
    invoice_data = invoice_schema.dump(invoice)
    order_data = order_schema.dump(invoice.order) if invoice.order else None
    
    return jsonify({
        'invoice': invoice_data,
        'order': order_data
    }), 200
