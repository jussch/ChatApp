(function () {
  if (!window.ChatApp) {
    window.ChatApp = {};
  }

  var Chat = ChatApp.Chat = function (attr) {
    this.socket = attr.socket;
    this.$messages = attr.$messages
  };

  Chat.prototype.sendMessage = function (text) {
    this.socket.emit('message', {text: text});
  };

  Chat.prototype.renderMessage = function (text, name, time, date) {
    var $message = $('<li data-time="'+time+'" data-date="'+date+'">');
    if (name === "<-SYSTEM->") {
      $message.addClass('system-message');
      name = "SYSTEM";
    }
    $message.data('name', name);
    $message.text(name+": "+text);
    this.$messages.prepend($message);
  };

  Chat.prototype.processCommand = function (text) {
    if (text.match(/^\/nick /)) {
      this.socket.emit('nicknameChangeRequest', {name: text.slice(6)});
    } else if (text.match(/^\/join/)) {
      this.socket.emit('changeRoomRequest', {room: text.slice(6)});
    } else {
      this.sendMessage(text)
    }
  };

})();
