(function () {
  if (!window.ChatApp) {
    window.ChatApp = {};
  }

  var Chat = ChatApp.Chat = function (attr) {
    this.socket = attr.socket;
    this.$messages = attr.$messages;
  };

  Chat.prototype.sendMessage = function (text) {
    this.socket.emit('message', {text: text});
  };

  Chat.prototype.renderMessage = function (text, name, time, date, id) {
    var $message = $('<li data-time="'+time+'" data-date="'+date+'">');

    id = id || "system";
    if (name === "<-SYSTEM->") {
      $message.addClass('system-message');
      name = "SYSTEM";
    }
    $message.data('name', name);
    $message.text(text);
    $name = $("<strong class='name' data-id='"+id+"'>");
    $name.text(name+": ");
    $message.prepend($name);
    this.$messages.prepend($message);
  };

  Chat.prototype.processCommand = function (text) {
    if (text.match(/^\/nick /)) {
      this.socket.emit('nicknameChangeRequest', {name: text.slice(6)});
    } else if (text.match(/^\/join/)) {
      this.socket.emit('changeRoomRequest', {room: text.slice(6)});
    } else if (text.length > 0) {
      this.sendMessage(text);
    }
  };

})();
