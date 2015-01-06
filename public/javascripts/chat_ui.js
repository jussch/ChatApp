$(function () {
  var $messages = $('.messages');
  var $form = $('.new-message');
  var $errors = $('.errors');
  var $info = $('.info');
  var $userList = $('.user-list');
  var $roomTitle = $('.room');
  var socket = io();
  var chat = new ChatApp.Chat({socket: socket, $messages: $messages});

  $form.on('click', '.send', function (event) {
    event.preventDefault();
    var data = $form.serializeJSON();
    chat.processCommand(data.message);
    $form.children('input').val('');
    $form.children('input')[0].focus();
  });

  socket.on('recieveMessage', function (data) {
    chat.renderMessage(data.text, data.name, data.time, data.date);
  });

  socket.on('nicknameChangeResult', function (data) {
    $errors.empty();
    $info.empty();
    if (data.success) {
      $info.append(data.message);
    } else {
      $errors.append(data.message);
    }
  });

  socket.on('displayList', function (data) {
    $userList.empty();
    $.each(data.names, function (num) {
      var $li = $('<li>');
      $li.text(data.names[num]);
      $userList.append($li)
    })
  });

  socket.on('changeRoomResponse', function (data) {
    $roomTitle.text(data.room);
    $info.text(data.message);
  });
});
