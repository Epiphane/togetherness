(function() {
   function RandomColor() {
      var colors = [ '#1ABC9C',
                     '#16A085',
                     '#2ECC71',
                     '#27AE60',
                     '#3498DB',
                     '#2980B9',
                     '#9B59B6',
                     '#8E44AD',
                     '#34495E',
                     '#2C3E50',
                     '#F1C40F',
                     '#F39C12',
                     '#E67E22',
                     '#D35400',
                     '#E74C3C',
                     '#C0392B',
                     '#ECF0F1',
                     '#BDC3C7'];

      return colors[Math.floor(Math.random() * colors.length)];
   }

   // match: -1 if before, 0 if in range, 1 if after
   function binaryFirstIndex(list, match) {
      var minIndex = 0;
      var maxIndex = list.length - 1;
      var currentIndex;
      var currentElement;
      var currentMatch;

      while (minIndex <= maxIndex) {
         currentIndex = (minIndex + maxIndex) / 2 | 0;
         currentElement = list[currentIndex];
         currentMatch = match(currentElement);

         if (currentMatch < 0) {
            minIndex = currentIndex + 1;
         }
         else if (currentMatch > 0) {
            maxIndex = currentIndex - 1;
         }
         else {
            // Move linearly
            while (currentIndex-- > 0) {
               if (match(list[currentIndex]) < 0) {
                  break;
               }
            }

            return currentIndex + 1;
         }
      }

      return -1;
   }

   var GameScreen = window.GameScreen = Juicy.State.extend({
      constructor: function() {
         var self = this;

         this.background = new Juicy.Entity(this, ['Image']);
         this.background.setImage('img/background.jpg');
         this.backgroundImage = this.background.getComponent('Image');

         this.cursor = new Juicy.Entity(this, ['Image']);
         this.cursor.setImage('img/cursor.png');

         this.color = RandomColor();
         this.cursor.getComponent('Image').setTint(this.color);

         this.opacity = 0;

         Juicy.Sound.load('bgm', 'sounds/eyes.ogg', true);

         Juicy.Sound.get('bgm').volume = 0.25;
         Juicy.Sound.play('bgm');

         this.pebbles = [];
         var globalPebbles = this.globalPebbles = [];

         this.socket = io();
         this.socket.on('pebbles', function(pebbles) {
            self.globalPebbles = self.globalPebbles.concat(pebbles);
            self.sortPebbles();
         });
         this.socket.on('pebble', function(pebble) {
            self.globalPebbles.push(pebble);
            self.sortPebbles();
         });

         this.lastClockTime = 0;
      },

      sortPebbles: function() {
         this.globalPebbles.sort(function(a, b) {
            return a.clock - b.clock;
         });
      },

      createPebble: function(pos, color) {
         var pebble = new Juicy.Entity(this, ['Pebble']);
         pebble.getComponent('Pebble').setColor(color);
         pebble.position = pos;

         this.pebbles.push(pebble);
      },

      summonPebble: function(pos) {
         //this.createPebble(pos, this.color);

         pebbleInfo = {
            color: this.color, 
            clock: Juicy.Sound.get('bgm').currentTime,
            pos: pos
         };
         this.socket.emit('pebble', pebbleInfo);
         this.globalPebbles.push(pebbleInfo);
         this.sortPebbles();

         // New color!
         //this.color = RandomColor();
         //this.cursor.getComponent('Image').setTint(this.color);
      },

      click: function(pos) {
         this.summonPebble(pos);
      },

      dragend: function(pos) {
         this.summonPebble(pos);
      },

      update: function(dt, Game) {
         // Sync with world
         var currentTime = Juicy.Sound.get('bgm').currentTime;
         var lastTime = Math.max(currentTime - dt, this.lastClockTime);
         var firstPebbleMatch = binaryFirstIndex(this.globalPebbles, function(pebble) {
            if (pebble.clock <= lastTime) return -1;
            if (pebble.clock > currentTime) return 1;
            return 0;
         });

         if (firstPebbleMatch >= 0) {
            while (firstPebbleMatch < this.globalPebbles.length &&
             this.globalPebbles[firstPebbleMatch].clock <= currentTime) {
               var pebble = this.globalPebbles[firstPebbleMatch]
               this.createPebble(pebble.pos, pebble.color);

               firstPebbleMatch ++;
            }
         }

         this.lastClockTime = currentTime;

         this.opacity += dt * (1 - this.opacity) / 10;

         this.pebbles = this.pebbles.filter(function(pebble) {
            pebble.update(dt);
            return pebble.life > 0;
         });

         this.backgroundImage.opacity = this.opacity;

         this.cursor.position = Game.mouse.sub(new Juicy.Point(0, this.cursor.height / 2));
      },

      render: function(context) {
         this.background.render(context);

         this.pebbles.forEach(function(pebble) {
            pebble.render(context);
         });

         this.cursor.render(context);
      }
   })
})();