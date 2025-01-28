#!/usr/bin/env python3
from flask import Flask
from flask import jsonify
from flask import abort
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<Car {}: {} {}'.format(self.id, self.make, self.model)

    def seralize(self):
        return dict(id=self.id, make=self.make, model=self.model)

@app.route('/cars')
def cars():
    cars = Car.query.all()
    if cars is None:
        abort(404)
    return jsonify([car.seralize() for car in cars]), 200

@app.route('/cars/<int:car_id>')
def show_car_id(car_id):
    #car_list = Car.query.all()
    if car_id <= len(car_list):
        return jsonify(car_list[car_id-1])
    else :
        abort(404)

if __name__ == "__main__":
    app.run(port=5000, debug=True)