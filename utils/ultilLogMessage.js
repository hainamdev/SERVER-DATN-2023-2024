const consoleLogMessage = (mess) => {
    var odd = mess.length % 2;
    var len = 50;
    var str = mess.length ? " " + mess + " " : "**";
    for (var i = 1; i < len - mess.length / 2; i++) str = "*" + str;
    if (odd) str += " ";
    for (var i = 1; i < len - mess.length / 2; i++) str += "*";
    console.log(str);
}
const UltilLogMessage = {
    consoleLogMessage : consoleLogMessage,
    consoleLogBoxMessage : (mess) => {
        consoleLogMessage('');
        consoleLogMessage(mess);
        consoleLogMessage('');
    }
}

module.exports = UltilLogMessage;