#!/usr/bin/env python3
from flask import Flask
from flask import jsonify
from flask import abort
from flask import request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder='../client', static_url_path='/')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)

    #Foreign key
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)

    def seralize_without_customer(self):
        customer = Customer.query.get(self.customer_id)

        return dict(
            id=self.id,
            make=self.make,
            model=self.model
        )


    def seralize(self):
        customer = Customer.query.get(self.customer_id)

        return dict(
            id=self.id,
            make=self.make,
            model=self.model,
            customer=customer.seralize() if customer else None
        )

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    cars = db.relationship('Car', backref='customer', lazy=True)

    # def __repr__(self):
    #     return '<Customer {}: {} {}'.format(self.id, self.name, self.email)

    def seralize(self):
        return dict(id=self.id, name=self.name, email=self.email)


@app.route('/cars', methods=['GET', 'POST'])
def cars():
    car_list = Car.query.all()
    if car_list is None:
        abort(404)

    if request.method == 'GET':
        return jsonify([car.seralize() for car in car_list]), 200

    elif request.method == 'POST':
        added_car = request.get_json(force=True)
        new_make = added_car.get('make')
        new_model = added_car.get('model')

        if added_car.get('customer') :
            new_customer = added_car.get('customer')
            new_car = Car(make=new_make, model=new_model, customer_id=new_customer)
        else:
            new_car = Car(make=new_make, model=new_model)


        db.session.add(new_car)
        db.session.commit()
        return jsonify({"message": f"New car added. Make: {new_make}, Model: {new_model}"}), 201


@app.route('/cars/<int:car_id>',methods=['GET', 'PUT', 'DELETE'])
def show_car_id(car_id):
    car = Car.query.get(car_id)

    if request.method == 'GET':
        if car:
            return jsonify([car.seralize()])
        else :
            abort(404)

    elif request.method == 'PUT':
        if not car :
            abort(404)

        data  = request.get_json(force=True)
        if "make" in data : 
            car.make = data['make']
        if "model" in data : 
            car.model = data['model']
        if "customer_id" in data : 
            customer_list = Customer.query.all()
            customer_found = False
            for customer in customer_list:
                if int(data['customer_id']) == int(customer.id):
                    car.customer_id = data['customer_id']
                    customer_found = True
            if not customer_found:
                return 'No customer found with the requested Customer ID'
        db.session.commit()

        return jsonify([car.seralize()])

    elif request.method == 'DELETE':
        if not car :
            abort(404)
        
        db.session.delete(car)
        db.session.commit()
        return '', 200



@app.route('/customers', methods=['GET', 'POST'])
def customer():
    customer_list = Customer.query.all()
    if customer_list is None:
        abort(404)

    if request.method == 'GET':
        return jsonify([customer.seralize() for customer in customer_list]), 200

    elif request.method == 'POST':
        added_customer = request.get_json(force=True)
        new_name = added_customer.get('name')
        new_email = added_customer.get('email')
        new_customer = Customer(name=new_name, email=new_email)
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({"message": f"New customer added. Name: {new_name}, Email: {new_email}"}), 201


@app.route('/customers/<int:customer_id>',methods=['GET', 'PUT', 'DELETE'])
def show_customer_id(customer_id):
    customer = Customer.query.get(customer_id)

    if request.method == 'GET':
        if customer:
            return jsonify([customer.seralize()])
        else :
            abort(404)

    elif request.method == 'PUT':
        if not customer :
            abort(404)

        data  = request.get_json(force=True)
        if "name" in data : 
            customer.name = data['name']
        if "email" in data : 
            customer.email = data['email']
        db.session.commit()

        return jsonify([customer.seralize()])

    elif request.method == 'DELETE':
        if not customer :
            abort(404)

        # Tar bort relationen till kunden från alla bilar kunden ägde
        for car in customer.cars :
            car.customer_id = None
            db.session.commit()
        
        db.session.delete(customer)
        db.session.commit()
        return '', 200


@app.route('/customers/<int:customer_id>/cars',methods=['GET'])
def show_customers_cars(customer_id):
    customer = Customer.query.get(customer_id)

    if request.method == 'GET':
        if customer:
            return jsonify([car.seralize_without_customer() for car in customer.cars])
        else :
            abort(404)

@app.route("/")
def client():
  return app.send_static_file("client.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)