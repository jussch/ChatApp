$(function () {
  var $messages = $('.messages');
  var $form = $('.new-message');
  var $errors = $('.errors');
  var $info = $('.info');
  var $userList = $('.user-list');
  var $roomTitle = $('.room');
  var $numOfUsers = $('.num-of-users')
  var socket = io();
  var chat = new ChatApp.Chat({socket: socket, $messages: $messages});

  $form.on('click', '.send', function (event) {
    event.preventDefault();
    var data = $form.serializeJSON();
    chat.processCommand(data.message);
    $form.children('input').val('');
    $form.children('input')[0].focus();
  });

  $('.user-list').on('mouseenter', '.online-user', function (event) {
    $target = $(event.currentTarget);
    var id = $target.data('id');
    $('.name[data-id="' + id + '"]').addClass('online-user-hover');
  })

  $('.user-list').on('mouseleave', '.online-user', function (event) {
    $target = $(event.currentTarget);
    var id = $target.data('id');
    $('.name[data-id="' + id + '"]').removeClass('online-user-hover');
  })

  socket.on('recieveMessage', function (data) {
    chat.renderMessage(data.text, data.name, data.time, data.date, data.id);
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
      var $li = $('<li class="online-user">');
      $li.text(data.names[num]);
      $li.data('id', num);
      $userList.append($li);
    })
  });

  socket.on('changeRoomResponse', function (data) {
    $roomTitle.text(data.room);
    $info.text(data.message);
  });

  socket.on('updateNumOfUsers', function (data) {
    $numOfUsers.html(data.num);
  })
});
