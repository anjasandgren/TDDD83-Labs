

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

$(document).on("click", ".edit-button", function (e) {
   const carId = Number(this.id.slice(10))
   loadCarList(carId);
});

$(document).on("click", ".save-button", function (e) {
   const carId = Number(this.id.slice(10))
   const car = serverStub.getCar(carId)

   const make = $("#make").val()
   const model = $("#model").val()
   const customer = $("#customer").val()



   if (make && model && customer) {
      serverStub.updateCar(carId, make, model, customer) //customer är en siffra. Behöver kke loopa igenom customers för att se om kunden finns/addera ny kund?
   } else if (model && customer) {
      serverStub.updateCar(carId, car.make, model,customer)
   } else if (make && customer) {
      serverStub.updateCar(carId, make, car.model, customer)
   } else if (make && model) {
      serverStub.updateCar(carId, make, model)
   }  else if (make) {
      serverStub.updateCar(carId, make, car.model)
   } else if (model) {
      serverStub.updateCar(carId, car.make, model)
   } else if (customer) {
      serverStub.updateCar(carId, car.make, car.model, customer)
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

      // Edit mode
      if (car.id == carId) {
         console.log("inne i rätt ")
         var carHtml = `
            <div>
               <p><strong>Car ${car_num}</strong></p>
               <div class="horisontial">
                  <p>Make: </p>
                  <input type="text" id="make" class="car-info-input" placeholder=${car.make}>
               </div>
               <div class="horisontial">
                  <p>Model: </p>
                  <input type="text" id="model" class="car-info-input" placeholder=${car.model}>
               </div>
               <div class="horisontial">
                  <p>Customer: </p>
                  <input type="text" id="customer" class="car-info-input" placeholder=${car_owner}>
               </div>
               <button id="saveButton${car.id}" class="save-button">SAVE</button>
               <br><br>
         `;

      // Vanligt mode
      } else {
         var carHtml = `
            <div>
               <p><strong>Car ${car_num}</strong></p>
               <p>Make: ${car.make}</p>
               <p>Model: ${car.model}</p>
               <p>Customer: ${car_owner}</p>
               <button id="editButton${car.id}" class="edit-button">EDIT</button>
               <button id="deleteButton${car.id}" class="delete-button">DELETE</button>
               <br><br>
         `;
      }
      $('#show-cars').append(carHtml);
      car_num++
   });
};