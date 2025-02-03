

$(document).ready(function(){
   alert("Sidan laddades");
   $(".container-fluid").html($("#view-home").html())
})

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

$(document).on("click", ".update-list", function (e) {
   loadCarList()
});

$(document).on("click", ".add-car", function (e) {
   const addModalHtml = `
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
                  <p>Fill in the fields below to add a ower to the car (optional)</p>
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
   $('.container-fluid').append(addModalHtml);
});

$(document).on("click", ".save-add-button", function (e) {
   const input_make = $("#make").val()
   const input_model = $("#model").val()
   const input_name = $("#name").val()
   const input_email = $("#email").val()

   const customer_list = serverStub.getCustomers()

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
            serverStub.addCar(input_make, input_model, customer_match.id)
         } else {
            const new_customer = serverStub.addCustomer(input_name, input_email)
            serverStub.addCar(input_make, input_model, new_customer.id)
         }
      }
   } else if (input_make && input_model) {
      serverStub.addCar(input_make, input_model)
   }
   loadCarList()
});

$(document).on("click", ".edit-button", function (e) {
   const carId = Number(this.id.slice(10))
   const car = serverStub.getCar(carId)

   var car_owner = "No customer"
   if (car.customer) {
      car_owner = car.customer.name
   }
   
   const editModalHtml = `
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
   $('.container-fluid').append(editModalHtml);
});

$(document).on("click", ".save-edit-button", function (e) {
   const carId = Number(this.id.slice(10))
   const car = serverStub.getCar(carId)

   const input_make = $("#make").val()
   const input_model = $("#model").val()
   const input_customer = $("#customer").val()

   if (input_customer) {
      var input_customer_id = NaN
      const customer_list = serverStub.getCustomers()

      customer_list.forEach(customer => {
         if (customer.name == input_customer) {
            input_customer_id = customer.id
         }
      });
   }

   if (input_make && input_model && input_customer_id) {
      serverStub.updateCar(carId, input_make, input_model, input_customer_id) //customer är en siffra. Behöver kke loopa igenom customers för att se om kunden finns/addera ny kund?
   } else if (input_model && input_customer_id) {
      serverStub.updateCar(carId, car.make, input_model,input_customer_id)
   } else if (input_make && input_customer_id) {
      serverStub.updateCar(carId, input_make, car.model, input_customer_id)
   } else if (input_make && input_model) {
      serverStub.updateCar(carId, input_make, input_model, car.customer_id)
   }  else if (input_make) {
      serverStub.updateCar(carId, input_make, car.model, car.customer_id)
   } else if (input_model) {
      serverStub.updateCar(carId, car.make, input_model, car.customer_id)
   } else if (input_customer_id) {
      serverStub.updateCar(carId, car.make, car.model, input_customer_id)
   }

   loadCarList();
});

$(document).on("click", ".delete-button", function (e) {
   var carId = Number(this.id.slice(12))
   var carDeleted = serverStub.deleteCar(carId);
   loadCarList();
});

function loadCarList(carId = 0) {
   const car_list = serverStub.getCars();
   const customer_list = serverStub.getCustomers();
   $("#show-cars").empty()

   var car_num = 1
   car_list.forEach(car => {
      var car_owner = "No customer"
      if (car.customer) {
         car_owner = car.customer.name
      }

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