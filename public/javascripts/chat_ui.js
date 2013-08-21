function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

/* process raw input */
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;
    
    console.log('Processing user input' + message);
    if(message.charAt(0) == '/') {
	console.log('Executing command');
	systemMessage = chatApp.processCommand(message);
	if(systemMessage) {
	    $('#messages').append(divSystemContentElement(systemMessage));
	}
    } else {
	console.log('Sending the message to window');
	chatApp.sendMessage($('#room').text(), message);
	$('#messages').append(divEscapedContent(message));
	$('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function(){
    // creating new Chat Object
    var chatApp = new Chat(socket);
    
    socket.on('nameResult', function(result){
	var message;
	if(result.success) {
	    message = 'You are now known as ' + result.name + '.';
	} else {
	    message = result.message;
	}
	$('#messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result) {
	$('#room').text(result.room);
	$('#messages').append(divSystemContentElement('Room changed.'));
    });

    socket.on('message', function (message) {
	var newElement = $('<div></div>').text(message.text);
	$('#messages').append(newElement);
    });

    socket.on('rooms', function(rooms) {
	$('#room-list').empty();
	for(var room in rooms) {
	    room = room.substring(1, room.length);
	    if (room != '') {
		$('#room-list').append(divEscapedContentElement(room));
	    }
	}
	$('#room-list div').click(function() {
	    chatApp.processCommand('/join ' + $(this).text());
	    $('#send-message').focus();
	});
    });

    setInterval(function() {
	socket.emit('rooms');
    }, 1000);
    
    $('#send-message').focus();
    
    $('#send-form').submit(function() {
	console.log('Submitting the form');
	processUserInput(chatApp, socket);
	return false;
    });

});
