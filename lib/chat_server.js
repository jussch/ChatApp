var guestNumber = 0;
var nicknames = {};
var currentRooms = {};
var num_of_users = 0;

var createChat = function (server) {
  var io = require('socket.io')(server);
  io.on('connection', function (socket) {
    initializeUser(socket, io);

    socket.on('message', function (data) {
      io.to(currentRooms[socket.id]).emit('recieveMessage', {
        text: data.text,
        name: nicknames[socket.id],
        time: getTime(),
        date: (new Date()).toString(),
        id: socket.id
      });
    });

    socket.on('nicknameChangeRequest', function (data) {
      if (isValidName(data.name)) {
        io.to(currentRooms[socket.id]).emit('recieveMessage', {
          text: nicknames[socket.id] + " has changed their name to " + data.name,
          name: '<-SYSTEM->',
          time: getTime(),
          date: (new Date()).toString()
        })
        socket.emit('nicknameChangeResult', {
          success: true,
          message: "Nickname changed to "+data.name
        });
        nicknames[socket.id] = data.name;
        displayListToRoom(io, currentRooms[socket.id])
      } else {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: "Nickname failed."
        });
      }
    });

    socket.on('changeRoomRequest', function (data) {
      joinRoom(socket, data.room, io);
    })

    socket.on('disconnect', function () {
      io.to(currentRooms[socket.id]).emit('recieveMessage', {
        text: nicknames[socket.id]+" has left the chat.",
        name: "<-SYSTEM->",
        time: getTime(),
        date: (new Date()).toString()
      })
      nicknames[socket.id] = undefined;
      num_of_users -= 1;
      updateNumOfUsers(io);
      displayListToRoom(io, currentRooms[socket.id])
    })
  })
};

var isValidName = function (name) {
  for (var nick in nicknames) {
    if (name === nicknames[nick]) {return false;}
  }
  if (name.match(/^guest_\d+$/)) {return false;}
  return true;
};

var joinRoom = function (socket, room, io) {
  var oldRoom = currentRooms[socket.id]
  socket.leave(oldRoom)
  socket.join(room);
  currentRooms[socket.id] = room;
  io.to(room).emit('recieveMessage', {
    text: nicknames[socket.id]+' entered '+room,
    name: "<-SYSTEM->",
    time: getTime(),
    date: (new Date()).toString()
  });
  io.to(oldRoom).emit('recieveMessage', {
    text: nicknames[socket.id]+' left '+oldRoom,
    name: "<-SYSTEM->",
    time: getTime(),
    date: (new Date()).toString()
  });
  displayListToRoom(io, room)
  displayListToRoom(io, oldRoom)
  socket.emit('changeRoomResponse', {
    message: "You are now in room: " + room,
    room: room
  })
};

var initializeUser = function (socket, io) {
  guestNumber += 1;
  num_of_users += 1;
  updateNumOfUsers(io);
  var newName = "guest_"+guestNumber;
  nicknames[socket.id] = newName;
  socket.emit('nicknameChangeResult', {
    success: true,
    message: "Welcome "+newName+". To change your name, type /nick [name]."
  });

  joinRoom(socket, "lobby", io);

  displayListToRoom(io, "lobby")
};

var displayListToRoom = function (io, room) {
  var names = {};
  for (var key in nicknames) {
    if (currentRooms[key] === room) {
      names[key] = nicknames[key];
    }
  }
  io.to(room).emit('displayList', {names: names});
};

var updateNumOfUsers = function (io) {
  io.emit("updateNumOfUsers", {
    num: num_of_users
  })
};

var getTime = function () {
  var now = new Date();
  var hours = now.getHours().toString();
  hours = "00".slice(hours.length)+hours;
  var minutes = now.getMinutes().toString();
  minutes = "00".slice(minutes.length)+minutes;
  return hours+": "+minutes;
}

module.exports = createChat;
