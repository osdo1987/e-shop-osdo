import os
from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, ma, bcrypt, swagger, cors, mail, socketio
from flask_cors import CORS


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app)

    # Configure Swagger UI
    app.config['SWAGGER'] = {
        'title': 'E-Shop WhatsApp API',
        'uiversion': 3
    }

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    swagger.init_app(app)
    mail.init_app(app)
    socketio.init_app(app)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.store_routes import store_bp
    from app.routes.category_routes import category_bp
    from app.routes.product_routes import product_bp
    from app.routes.order_routes import order_bp
    from app.routes.cash_register_routes import cash_register_bp
    from app.routes.invoice_routes import invoice_bp
    from app.routes.image_routes import image_bp
    from app.routes.payment_method_routes import payment_method_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(store_bp, url_prefix='/api/stores')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(cash_register_bp, url_prefix='/api/cash-register')
    app.register_blueprint(invoice_bp, url_prefix='/api/invoices')
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(payment_method_bp, url_prefix='/api/payment-methods')

    # Seed default payment methods for stores that don't have any
    with app.app_context():
        try:
            from app.models.store import Store
            from app.services.payment_method_service import PaymentMethodService
            stores = Store.query.all()
            for store in stores:
                PaymentMethodService.seed_defaults(store.id)
        except Exception:
            # Tables may not exist yet during initial migration
            pass

    # Global Error Handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        response = {
            "error": str(e),
            "message": "An internal error occurred"
        }
        return jsonify(response), 500

    return app
