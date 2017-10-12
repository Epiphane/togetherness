var path = require('path');
var express = require('express');
var socketIO = require('socket.io');
var sqldb = require('./sqldb');
var app = express();

app.set('port', (process.env.PORT || 5000));

var staticPath = path.join(__dirname, '../public');
app.use(express.static(staticPath));

// Fall-through to index
app.get('*', function(req, res) {
   res.sendFile(path.join(staticPath, 'index.html'));
});

const server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

const io = socketIO(server);

var pebbles = [];

sqldb.Pebble.findAll({ where: {} }).then((result) => {
   pebbles = pebbles.concat(result.map((r) => r.info));
})

io.on('connection', (socket) => {
   socket.on('pebble', (pebble) => {
      pebbles.push(pebble);

      sqldb.Pebble.create({
         info: pebble
      });

      socket.broadcast.emit('pebble', pebble);
   });

   socket.emit('pebbles', pebbles);

   //socket.on('disconnect', () => console.log('Client disconnected'));
})