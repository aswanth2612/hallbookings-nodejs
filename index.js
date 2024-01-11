// Import required modules and create an Express app
const express=require('express');
const bodyParser=require('body-parser');
const app=express();

// Set the port for the server
const PORT=3000;

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Arrays to store rooms and bookings
const rooms=[];
const bookings=[];

// Function to generate a unique booking ID
function generateBookingId(){
  return bookings.length+1;
}

// Handle GET request to retrieve the list of rooms
app.get('/rooms',(req,res)=>{
  res.json(rooms);
});

// Handle POST request to create a new room
app.post('/create-room',(req,res)=>{
  // Extract room details from the request body
  const{ roomNumber,seatsAvailable,amenities,pricePerHour}=req.body;
  
  // Check for missing room information
  if(!roomNumber||!seatsAvailable||!pricePerHour){
    return res.status(400).json({message:'Room number,seats Available,pricePer hour are required'})
  }

  // Check if the room already exists
  const isRoomExist=rooms.some((room)=>room.roomNumber===roomNumber);
  if(isRoomExist){
    return res.status(409).json({message:'Room number already exists'});
  }
  
  // Add the new room to the array
  rooms.push({
    roomNumber,
    seatsAvailable,
    amenities,
    pricePerHour,
  });
  res.json({message:'Room created successfully'});
});

// Handle POST request to book a room
app.post('/book-room',(req,res)=>{
  // Extract booking details from the request body
  const{roomId,customerName,date,startTime,endTime}=req.body;

  // Check for missing booking information
  if (!roomId || !customerName ||!date||!startTime ||!endTime ) {
    return  res.status(400).json({ message:"RoomId,customerName,date,startTime,endTime are required" }) ;
  }

  // Find the room associated with the provided room number
  const room=rooms.find((room)=>room.roomNumber===roomId);
  if(!room){
    return res.status(404).json({message:'Room not Found'})
  }

  // Check if the room is available for the specified time
  const isRoomAvailable=true; // You may need to implement this check.

  if(!isRoomAvailable){
    return res.status(409).json({message:'Room is not available for specified time'});
  }

// Generate a unique booking ID
const bookingId=generateBookingId();

  // Add the new booking to the array
  bookings.push({
    bookingId,
    roomId,
    customerName,
    date,
    startTime,
    endTime,
    bookingDate:new Date(),
    bookingStatus:'Confirmed',
  });
  res.json({message:'Room booked successfully'});
});

// Handle GET request to retrieve rooms with their associated bookings
app.get('/rooms-with-bookings',(req,res)=>{

  // Map rooms to include their associated bookings
  const roomsWithBookings=rooms.map((room)=>{
  const roomBookings=bookings.filter((booking)=>booking.roomId===room.roomNumber);
    return{
      roomNumber:room.roomNumber,
      bookings:roomBookings.map((booking)=>({
        customerName:booking.customerName,
        date:booking.date,
        startTime:booking.startTime,
        endTime:booking.endTime,
        bookingStatus:booking.bookingStatus,
      })),
    };
  });
  res.json(roomsWithBookings);
});

// Handle GET request to retrieve customers with their bookings
app.get('/customers-with-bookings',(req,res)=>{

  // Map bookings to include customer details
  const customersWithBookings= bookings.map((booking)=>({
    customerName:booking.customerName,
    roomId:booking.roomId,
    date:booking.date,
    startTime:booking.startTime,
    endTime:booking.endTime,
    bookingStatus:booking.bookingStatus,
  }));
  res.json(customersWithBookings);
});

// Handle GET request to retrieve a customer's booking history
app.get('/customer-booking-history/:customerName',(req,res)=>{

  // Filter bookings based on customer name
  const customerName=req.params.customerName;
  const customerBookingHistory=
    bookings.filter((booking)=>booking.customerName===customerName );
    res.json(customerBookingHistory);
});

// Handle DELETE request to remove a room
app.delete('/delete-room/:roomNumber', (req, res) => {

    // Get the room number to delete from the URL
    const roomNumberToDelete = req.params.roomNumber;
  
    // Find the index of the room to delete
    const roomIndex = rooms.findIndex((room) => room.roomNumber === roomNumberToDelete);
  
    // Check if the room exists
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Room not found' });
    }
  
    // Remove the room from the array
    rooms.splice(roomIndex, 1);
  
    res.json({ message: 'Room deleted successfully' });
});

//start the server to the port

app.listen(PORT, ()=> {
    console.log(`Hall Booking Api listening to http://localhost:${PORT}`);
});