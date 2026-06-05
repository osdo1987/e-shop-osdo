from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, ma, bcrypt, swagger, cors, mail
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for all domains on all routes
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

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.store_routes import store_bp
    from app.routes.category_routes import category_bp
    from app.routes.product_routes import product_bp
    from app.routes.order_routes import order_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(store_bp, url_prefix='/api/stores')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(order_bp, url_prefix='/api/orders')

    # Global Error Handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        response = {
            "error": str(e),
            "message": "An internal error occurred"
        }
        return jsonify(response), 500

    return app