function getHost() {
   // return window.location.protocol + '//' + location.host;
   return 'http://localhost:5000';
}

let car_list = [];
let customer_list = [];

$(document).ready(function(){
   // alert("Sidan laddades");
   $(".container-fluid").html($("#view-home").html())
});

$.get(getHost() + '/cars', function(cars) {
   car_list = cars;
});

$.get(getHost() + '/customers', function(customers) {
   customer_list = customers;
});

function getCar(id, callback) {
   $.get(getHost() + `/cars/${id}`, function(car) {
      callback(car);
   });
}

function addCar(added_car) {
   $.ajax({
      url: getHost() + '/cars',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
         make: added_car.make,
         model: added_car.model,
         customer: added_car.customer.id
      }),
      success: function(response) {
         console.log('Success:', response);
         added_car.id = response.id;
         car_list.push(added_car);
         loadCarList();
      },
      error: function(xhr, status, error) {
          console.error('Error:', error);
      }
   });
}

function data(make_upd, model_upd, customer_id_upd) {
   return JSON.stringify({
      make: make_upd,
      model: model_upd,
      customer_id: customer_id_upd
   })
}

function updateCar(id_upd, make_upd, model_upd, customer_id_upd) {
   $.ajax({
      url: getHost() + `/cars/${id_upd}`,
      type: 'PUT',
      contentType: 'application/json',
      data: data(make_upd, model_upd, customer_id_upd),
      success: function(response) {
         console.log('Success:', response);
         let car_to_update = getCarFromId(id_upd);
         car_to_update.make = make_upd;
         car_to_update.model = model_upd;
         car_to_update.customer = getCustomerFromId(customer_id_upd);

         const carIndex = car_list.findIndex(car => car.id === id_upd);
         if (carIndex !== -1) {
            car_list[carIndex] = car_to_update;
         } else {
            console.log("Car not found in the list");
         }
         loadCarList();
      },
      error: function(xhr, status, error) {
         console.error('Error:', error);
      }
   });
}

$('.nav-link').click(function (e) {
   e.preventDefault();

   const view = $(this).data("view");

   if (view === "home") {
      $(".container-fluid").html($("#view-home").html())
   } else if (view === "contact") {
      $(".container-fluid").html($("#view-contact").html())
   } else if (view === "opening-hours") {
      $(".container-fluid").html($("#view-opening-hours").html())
   } else if (view === "cars") {
      $(".container-fluid").html($("#view-cars").html())
      loadCarList();
   }
});

$(document).on("click", ".send-button", function (e) {
   const name = $("#name").val()
   const email = $("#email").val()
   const message = $("#message").val()

   if (!name | !email | !message) {
      alert("Fill in all fields")
      return;
   }
   alert('Name: '+name+'\nEmail: '+email+'\nMessage: '+message);
});

$(document).on("click", ".add-car", function (e) {
   createModal('add')
});

$(document).on("click", ".save-add-button", function (e) {
   const input_make = $("#make").val()
   const input_model = $("#model").val()
   const input_name = $("#name").val()
   const input_email = $("#email").val()
   
   let added_car = {make: '', model: '', customer: {}}
   
   if (!(input_make && input_model)) {
      alert("Make and model need to be filled.")
      return;
   } else if (input_name || input_email) {
      if (!(input_name && input_email)) {
         alert("You need to write both NAME and EMAIL to add a customer")
         return;
      } else {
         var customer_match = null
         
         for (let i = 0; i < customer_list.length; i++) {
            if (customer_list[i].name == input_name && customer_list[i].email == input_email) {
               customer_match = customer_list[i]
            } else if (customer_list[i].email == input_email) {
               alert("Error. Either the email is already taker or you have spelled the name wrong.")
               return;
            }
         }
         if (customer_match) {
            added_car.make = input_make;
            added_car.model = input_model;
            added_car.customer = getCustomerFromId(customer_match.id);
         } else {
            alert("Customer doesn't exist")
            return;
         }
      }
   } else if (input_make && input_model) {
      added_car.make = input_make;
      added_car.model = input_model;
   }
   addCar(added_car);
});

// function updateCarInCarList(id, make, model, customer_id = null) {
//    let car_to_update = getCarFromId(id);
//    car_to_update.make = make;
//    car_to_update.model = model;
//    car_to_update.customer_id = customer_id || car_to_update.customer_id;

//    const carIndex = car_list.findIndex(car => car.id === id);
//    if (carIndex !== -1) {
//       car_list[carIndex] = car_to_update;
//    } else {
//       console.log("Car not found in the list");
//    }
// }

$(document).on("click", ".edit-button", function (e) {
   const carId = Number(this.id.slice(10));
   getCar(carId, function(car) {
      const car_formatted = car[0];
      createModal('edit', car_formatted);
   });
});

$(document).on("click", ".save-edit-button", function (e) {
   const carId = Number(this.id.slice(10))
   getCar(carId, function(car_not_formatted) {
      const car = car_not_formatted[0]
      const input_make = $("#make").val()
      const input_model = $("#model").val()
      const input_customer = $("#customer").val()

      if (input_customer) {
         var input_customer_id = NaN

         customer_list.forEach(customer => {
            if (customer.name == input_customer) {
               input_customer_id = customer.id
               console.log("match cust")
            }
         });

         if (!input_customer_id) {
            alert("No customer with that name exists")
         }
      }

      if (input_make && input_model && input_customer_id) {
         updateCar(carId, input_make, input_model, input_customer_id)
      } else if (input_model && input_customer_id) {
         updateCar(carId, car.make, input_model,input_customer_id)
      } else if (input_make && input_customer_id) {
         updateCar(carId, input_make, car.model, input_customer_id)
      } else if (input_make && input_model) {
         updateCar(carId, input_make, input_model, car.customer ? car.customer.id : 0)
      }  else if (input_make) {
         updateCar(carId, input_make, car.model, car.customer ? car.customer.id : 0)
      } else if (input_model) {
         updateCar(carId, car.make, input_model, car.customer ? car.customer.id : 0)
      } else if (input_customer_id) {
         updateCar(carId, car.make, car.model, input_customer_id)
      }
   })
});

$(document).on("click", ".delete-button", function (e) {
   var carId = Number(this.id.slice(12))
   var carDeleted = serverStub.deleteCar(carId);
   loadCarList();
});

function getCustomerFromId(id) {
   return customer_list.find(customer => customer.id == id);
}

function getCarFromId(id) {
   const car = car_list.find(car => car.id == id);
   return car;
}

function loadCarList(carId = 0) {
   $("#show-cars").empty()
   var car_num = 1
   car_list.forEach(car => {
      const car_owner = car.customer?.name ?? "No customer";
      const carHtml = `
         <div>
            <p><strong>Car ${car_num}</strong></p>
            <p>Make: ${car.make}</p>
            <p>Model: ${car.model}</p>
            <p>Customer: ${car_owner}</p>
            <button id="editButton${car.id}" class="edit-button" data-toggle="modal" data-target="#editModal">EDIT</button>
            <button id="deleteButton${car.id}" class="delete-button">DELETE</button>
            <br><br>
      `;
      $('#show-cars').append(carHtml);
      car_num++
   });
};

function createModal(modalType, car = {}) {
   $(".modal").modal('hide');
   $(".modal").remove();

   let modalHtml = '';

   if (modalType === "add") {
      modalHtml = `
         <div class="modal" id="addModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
               <div class="modal-content">
                  <div class="modal-header">
                     <h5 class="modal-title">Add Car</h5>
                     <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                     </button>
                  </div>
                  <div class="modal-body">
                     <div class="horisontial">
                        <p>Make: &nbsp;</p>
                        <input type="text" id="make" class="car-info-input" placeholder="Make of the car">
                     </div>
                     <div class="horisontial">
                        <p>Model: &nbsp;</p>
                        <input type="text" id="model" class="car-info-input" placeholder="Model of the car">
                     </div>
                     <p>Fill in the fields below to add a owner to the car (optional)</p>
                     <div class="horisontial">
                        <p>Name: &nbsp;</p>
                        <input type="text" id="name" class="car-info-input" placeholder="Name of the car owner">
                     </div>
                     <div class="horisontial">
                        <p>Email: &nbsp;</p>
                        <input type="text" id="email" class="car-info-input" placeholder="Email of the car owner">
                     </div>
                  </div>
                  <div class="modal-footer">
                     <button type="button" class="save-add-button" data-dismiss="modal" aria-label="Close">Save changes</button>
                  </div>
               </div>
            </div>
         </div>
      `;

   } else if (modalType === "edit" && car) {
      const car_owner = car.customer?.name ?? "No customer";
      modalHtml = `
         <div class="modal" id="editModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
               <div class="modal-content">
                  <div class="modal-header">
                     <h5 class="modal-title">Edit Car</h5>
                     <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                     </button>
                  </div>
                  <div class="modal-body">
                     <div class="horisontial">
                        <p>Make: &nbsp;</p>
                        <input type="text" id="make" class="car-info-input" placeholder="${car.make}">
                     </div>
                     <div class="horisontial">
                        <p>Model: &nbsp;</p>
                        <input type="text" id="model" class="car-info-input" placeholder="${car.model}">
                     </div>
                     <div class="horisontial">
                        <p>Customer: &nbsp;</p>
                        <input type="text" id="customer" class="car-info-input" placeholder="${car_owner}">
                     </div>
                  </div>
                  <div class="modal-footer">
                     <button type="button" id="saveButton${car.id}" class="save-edit-button" data-dismiss="modal" aria-label="Close">Save changes</button>
                  </div>
               </div>
            </div>
         </div>
      `;
   }

   $('.container-fluid').append(modalHtml);
   $('#editModal').modal('show');
}