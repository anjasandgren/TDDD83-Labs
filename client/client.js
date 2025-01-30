

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

function loadCarList() {
   const car_list = serverStub.getCars();
   const customer_list = serverStub.getCustomers();

   car_list.forEach(car => {

      var car_owner = "No customer"
      if (car.customer) {
         car_owner = car.customer.name
      }
      const carHtml = `
         <div>
            <p>Make: ${car.make}</p>
            <p>Model: ${car.model}</p>
            <p>Customer: ${car_owner}</p>
      `;
      $('#show-cars').append(carHtml);
   });
};