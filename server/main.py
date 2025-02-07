#!/usr/bin/env python3
from flask import Flask, jsonify, abort, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt, generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__, static_folder='../client', static_url_path='/')

CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'mYEM3e44ZZ58emfNwawOrf6ux0fy5o'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def serialize(self):
        if self.user_id:
            user = User.query.get(self.user_id)
            return dict(
                id=self.id,
                make=self.make,
                model=self.model,
                user=user.serialize() if user else None
            )
        else:
            return dict(
                id=self.id,
                make=self.make,
                model=self.model,
                user=None
            )


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default = False)
    cars = db.relationship('Car', backref='user', lazy=True)

    def serialize(self):
        return dict(
            id=self.id,
            name=self.name,
            email=self.email,
            is_admin=self.is_admin
        )
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf8')
    
    def checkPassword(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


with app.app_context():
    db.create_all()
    db.session.commit()

def get_or_abort(model, record_id):
    record = model.query.get(record_id)
    if not record:
        abort(404, description=f"{model.__name__} with ID {record_id} not found.")
    return record


@app.route('/cars', methods=['GET', 'POST'])
@jwt_required()
def cars():
    if request.method == 'GET':
        car_list = Car.query.all()
        return jsonify([car.serialize() for car in car_list]), 200

    elif request.method == 'POST':
        added_car = request.get_json(force=True)
        new_make = added_car.get('make')
        new_model = added_car.get('model')
        new_user_id = added_car.get('user')

        if not new_make or not new_model:
            abort(400, description="Make and model are required fields.")
        
        new_car = Car(make=new_make, model=new_model, user_id=new_user_id if new_user_id else None)
        db.session.add(new_car)
        db.session.commit()
        return jsonify(new_car.serialize()), 201


@app.route('/cars/<int:car_id>',methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def show_car_id(car_id):
    car = get_or_abort(Car, car_id)

    if request.method == 'GET':
        return jsonify([car.serialize()]), 200

    elif request.method == 'PUT':
        data  = request.get_json(force=True)
        if "make" in data :
            car.make = data['make']
        if "model" in data :
            car.model = data['model']
        if "user_id" in data and data["user_id"] != 0:
                user = get_or_abort(User, data['user_id'])
                car.user_id = user.id
        
        db.session.commit()
        return jsonify([car.serialize()])

    elif request.method == 'DELETE':
        db.session.delete(car)
        db.session.commit()
        return '', 200


@app.route('/cars/<int:car_id>/booking',methods=['POST', 'DELETE'])
@jwt_required()
def book_car(car_id):
    car = get_or_abort(Car, car_id)
    user_id = get_jwt_identity()

    if request.method == 'POST':
        if car.user_id:
            return jsonify({"success": False, "error": "Car is already booked"}), 400
        else:
            car.user_id = user_id
            db.session.commit()
            return jsonify({"success": True, "user_id": user_id}), 200

    elif request.method == 'DELETE':
        car.user_id = None
        db.session.commit()
        return jsonify({"success": True, "user_id": user_id}), 200


@app.route('/users', methods=['GET', 'POST'])
@jwt_required()
def user():
    if request.method == 'GET':
        user_list = User.query.all()
        return jsonify([user.serialize() for user in user_list]), 200

    elif request.method == 'POST':
        added_user = request.get_json(force=True)
        new_name = added_user.get('name')
        new_email = added_user.get('email')
        new_is_admin = added_user.get('is_admin', False)

        if not new_name or not new_email:
            abort(400, description="Name and email are required fields.")

        new_user = User(name=new_name, email=new_email, is_admin=new_is_admin)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"New user added. Name: {new_name}, Email: {new_email}"}), 201


@app.route('/users/<int:user_id>',methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def show_user_id(user_id):
    user = get_or_abort(User, user_id)

    if request.method == 'GET':
        return jsonify([user.serialize()])

    elif request.method == 'PUT':
        data  = request.get_json(force=True)
        if "name" in data : 
            user.name = data['name']
        if "email" in data : 
            user.email = data['email']
        db.session.commit()
        return jsonify([user.serialize()])

    elif request.method == 'DELETE':
        for car in user.cars :
            car.user_id = None
        
        db.session.deslete(user)
        db.session.commit()
        return '', 200


@app.route('/users/<int:user_id>/cars',methods=['GET'])
@jwt_required()
def show_users_cars(user_id):
    user = get_or_abort(User, user_id)
    return jsonify([car.serialize() for car in user.cars])


@app.route("/sign-up", methods=['POST'])
def sign_up():
   if request.method == 'POST':
        data = request.get_json(force=True)
        new_name = data.get('name')
        new_email = data.get('email')
        new_is_admin = data.get('is_admin', False)

        if not new_name or not new_email or not data.get('password'):
            abort(400, description="Name, email and password are required fields.")

        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "User already exists"}), 400

        new_user = User(name=new_name, email=new_email, is_admin=new_is_admin)
        new_user.set_password(data.get('password'))
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": f"New user added. Name: {new_name}, Email: {new_email}"}), 201


@app.route("/login", methods=['POST'])
def login():
   if request.method == 'POST':
        data = request.get_json(force=True)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            abort(400, description="Email and password are required fields.")

        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({"error": "User doesn't exist"}), 401
        elif not user.checkPassword(password):
            return jsonify({"error": "Invalid password"}), 401

        token = create_access_token(identity=str(user.id))
    
        return jsonify({
            "token": token,
            "user": user.serialize()
            }), 200


@app.route("/")
def client():
  return app.send_static_file("client.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)