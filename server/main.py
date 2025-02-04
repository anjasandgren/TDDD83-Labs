#!/usr/bin/env python3
from flask import Flask, jsonify, abort, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__, static_folder='../client', static_url_path='/')

CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)

    def serialize(self):
        customer = Customer.query.get(self.customer_id)
        return dict(
            id=self.id,
            make=self.make,
            model=self.model,
            customer=customer.serialize() if customer else None
        )

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    cars = db.relationship('Car', backref='customer', lazy=True)

    def serialize(self):
        return dict(
            id=self.id,
            name=self.name,
            email=self.email
        )


def get_or_abort(model, record_id):
    record = model.query.get(record_id)
    if not record:
        abort(404, description=f"{model.__name__} with ID {record_id} not found.")
    return record


@app.route('/cars', methods=['GET', 'POST'])
def cars():
    if request.method == 'GET':
        car_list = Car.query.all()
        return jsonify([car.serialize() for car in car_list]), 200

    elif request.method == 'POST':
        added_car = request.get_json(force=True)
        new_make = added_car.get('make')
        new_model = added_car.get('model')
        new_customer_id = added_car.get('customer')

        if not new_make or not new_model:  # Ensure make and model are provided
            abort(400, description="Make and model are required fields.")
        
        new_car = Car(make=new_make, model=new_model, customer_id=new_customer_id if new_customer_id else None)
        db.session.add(new_car)
        db.session.commit()
        return jsonify({"message": f"New car added. Make: {new_make}, Model: {new_model}"}), 201


@app.route('/cars/<int:car_id>',methods=['GET', 'PUT', 'DELETE'])
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
        if "customer_id" in data : 
                customer = get_or_abort(Customer, data['customer_id'])
                car.customer_id = customer.id
        
        db.session.commit()
        return jsonify([car.serialize()])

    elif request.method == 'DELETE':
        db.session.delete(car)
        db.session.commit()
        return '', 200


@app.route('/customers', methods=['GET', 'POST'])
def customer():
    if request.method == 'GET':
        customer_list = Customer.query.all()
        return jsonify([customer.serialize() for customer in customer_list]), 200

    elif request.method == 'POST':
        added_customer = request.get_json(force=True)
        new_name = added_customer.get('name')
        new_email = added_customer.get('email')

        if not new_name or not new_email:  # Ensure name and email are provided
            abort(400, description="Name and email are required fields.")

        new_customer = Customer(name=new_name, email=new_email)
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({"message": f"New customer added. Name: {new_name}, Email: {new_email}"}), 201


@app.route('/customers/<int:customer_id>',methods=['GET', 'PUT', 'DELETE'])
def show_customer_id(customer_id):
    customer = get_or_abort(Customer, customer_id)

    if request.method == 'GET':
        return jsonify([customer.serialize()])

    elif request.method == 'PUT':
        data  = request.get_json(force=True)
        if "name" in data : 
            customer.name = data['name']
        if "email" in data : 
            customer.email = data['email']
        db.session.commit()
        return jsonify([customer.serialize()])

    elif request.method == 'DELETE':
        for car in customer.cars :
            car.customer_id = None
        
        db.session.deslete(customer)
        db.session.commit()
        return '', 200


@app.route('/customers/<int:customer_id>/cars',methods=['GET'])
def show_customers_cars(customer_id):
    customer = get_or_abort(Customer, customer_id)
    return jsonify([car.serialize() for car in customer.cars])


@app.route("/")
def client():
  return app.send_static_file("client.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)