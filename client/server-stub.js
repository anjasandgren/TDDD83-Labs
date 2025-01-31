/**
 * Server stub for lab 2 of TDDD83 - <i>Kandidatprojekt datateknik</i>.
 *
 * @since  2020-01-12
 * @namespace
 */
var serverStub = {

    /**
     * Stub for GET /cars <br/>
     * Gets all [cars]{@link Car} (or empty list)
     * @return {Car[]}
     * @instance
     */
    getCars: function() {
      return this._cars;
    },
  
    /**
     * Stub for POST /cars <br/>
     * Adds a car to memory and returns it
     * @param {string} make - The manufacturer/brand of the car
     * @param {string} model - Model name of the car
     * @param {number} [customer_id=null] - Id of a Customer
     * @return {Car}
     * @instance
     */
    addCar: function(make, model, customer_id = null) {
      var newCar = {
        id: this._getNextId(this._cars),
        make,
        model,
        customer_id,
        get customer() { return serverStub._lazyLoadCustomer(this.customer_id); },
      }
      this._cars.push(newCar);
      return newCar;
    },
  
    /**
     * Stub for GET /car/<car_id> <br/>
     * Returns a Car with the given id or false if not found
     * @param {number} id - id of car to return
     * @return {(Car|boolean)}
     * @instance
     */
    getCar: function(id) {
      return this._cars.find(function(car) { return car.id === id; }) || false;
    },
  
    /**
     * Stub for PUT /cars/<car_id> <br/>
     * Updates a car with the given id and returns it. Returns false if not found.
     * @param {number} id - id of car to update
     * @param {string} make - The manufacturer/brand of the car
     * @param {string} model - Model name of the car
     * @param {number} [customer_id=null] - Id of a Customer
     * @return {(Car|boolean)}
     * @instance
     */
    updateCar: function(id, make, model, customer_id = null) {
      var car = this._cars.find(function(car) { return car.id === id; });
  
      if (!car) return false;
  
      car.make = make;
      car.model = model;
      car.customer_id = customer_id;
      return car;
    },
  
    /**
     * Stub for DELETE /car/<car_id> <br/>
     * Deletes a car from memory with the given id or returns false if not found
     * @param {number} id - id of car to delete
     * @return {boolean}
     * @instance
     */
    deleteCar: function(id) {
      if (this._cars.some(function(car) { return car.id === id; })) {
        this._cars = this._cars.filter(function(car) { return car.id !== id; });
        return true;
      }
  
      return false;
    },
  
    /**
     * Stub for GET /customers <br/>
     * Gets all customers from memory (or empty list)
     * @return {Customer[]}
     * @instance
     */
    getCustomers: function() {
      return this._customers;
    },
  
    /**
     * Stub for POST /customers <br/>
     * Adds a customer to memory and returns it
     * @param {string} name - The name of the customer
     * @param {string} email - The email address of the customer
     * @return {Customer}
     * @instance
     */
    addCustomer: function(name, email) {
      var newCustomer = {
        id: this._getNextId(this._customers),
        name,
        email,
        get cars() { return serverStub._lazyLoadCars(this.id); },
      }
      this._customers.push(newCustomer);
      return newCustomer;
    },
  
    /**
     * Stub for GET /customers/<customer_id> <br/>
     * Returns a customer with the given id or false if not found
     * @param {number} id - id of customer to return
     * @return {(Customer|boolean)}
     * @instance
     */
    getCustomer: function(id) {
      return this._customers.find(function(customer) { return customer.id === id; }) || false;
    },
  
    /**
     * Stub for PUT /customers/<customer_id> <br/>
     * Updates a customer with the given id and returns it. Returns false if not found.
     * @param {number} id - id of customer to update
     * @param {string} name - The name of the customer
     * @param {string} email - The email address of the customer
     * @return {(Customer|boolean)}
     * @instance
     */
    updateCustomer: function(id, name, email) {
      var customer = this._customers.find(function(customer) { return customer.id === id; });
  
      if (!customer) return false;
  
      customer.name = name;
      customer.email = email;
      return customer;
    },
  
    /**
     * Stub for DELETE /customers/<customer_id> <br/>
     * Deletes a customer from memory with the given id.
     * Destroys relationships between the given customer and cars.
     * @param {number} id - id of customer to delete
     * @return {boolean}
     * @instance
     */
    deleteCustomer: function(id) {
      if (this._customers.some(function(customer) { return customer.id === id; })) {
        this._customers = this._customers.filter(function(customer) { return customer.id !== id; });
        this._cars = this._unsetCarCustomer(id);
        return true;
      }
  
      return false;
    },
  
     /** @private */
    _getNextId: function(list) {
      return list.reduce(function(previousId, current) {
        return (current.id > previousId) ? current.id : previousId;
      }, 0) + 1
    },
  
    /** @private */
    _lazyLoadCustomer: function(customer_id) {
      return this._customers.find(function(customer) { 
        return customer.id === customer_id; 
      });
    },
  
    /** @private */
    _lazyLoadCars: function(customer_id) {
      return this._cars.filter(function(car) { return car.customer_id === customer_id; });
    },
  
    /** @private */
    _unsetCarCustomer: function(customer_id) {
      return this._cars.map(function(car) {
        car.customer_id = null;
        return car;
      })
    },
    
    /**
     * @private
     * @type {Customer[]}
     */
    _customers: [
      /**
       * @typedef {Object} Customer
       * @property {number} id - Unique identifier for a customer
       * @property {string} name - The name of the customer
       * @property {string} email - The email address of the customer
       * @property {Car[]} cars - Associated cars
       */
      {
        id: 1,
        name: "Test Kund",
        email: "test@kund.se",
        get cars() { return serverStub._lazyLoadCars(this.id); }
      },
      {
        id: 2,
        name: "Test Persson",
        email: "test@persson.se",
        get cars() { return serverStub._lazyLoadCars(this.id); }
      },
    ],
    /** 
     * @private
     * @type {Car[]}
     */
    _cars: [
      /**
       * @typedef {Object} Car
       * @property {number} id - Unique identifier for a car
       * @property {string} make - Manufacturer/brand of the car
       * @property {string} model - Model name of the car
       * @property {number} [customer_id] - id of associated customer
       * @property {Customer} customer - Associated customer (if customer_id is provided)
       */
      {
        id: 1,
        make: "Volvo",
        model: "V70",
        customer_id: 1,
        get customer() { return serverStub._lazyLoadCustomer(this.customer_id); },
      },
      {
        id: 2,
        make: "SAAB",
        model: "95",
        customer_id: null,
        get customer() { return serverStub._lazyLoadCustomer(this.customer_id); },
      },
    ],
  };