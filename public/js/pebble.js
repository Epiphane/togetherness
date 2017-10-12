(function() {
   var PHASE_1 = 0.3;
   var RADIUS = 100;
   var TOTAL = 1;

   function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
         r: parseInt(result[1], 16),
         g: parseInt(result[2], 16),
         b: parseInt(result[3], 16)
      } : null;
   }

   Juicy.Component.create('Pebble', {
      constructor: function(entity) {
         entity.life = 1;

         this.rgb = { r: 255, g: 255, b: 255 };
      },

      setColor: function(hex) {
         this.rgb = hexToRgb(hex);
      },

      update: function(dt) {
         this.entity.life -= dt;
      },

      render: function(context) {
         var alpha = 0;
         var radius = 0;
         var life = (TOTAL - this.entity.life) / TOTAL;
         if (life < PHASE_1) {
            alpha = Math.sqrt(life / PHASE_1, 2);
            radius = RADIUS * Math.sqrt(life / PHASE_1);
         }
         else {
            var pos = (life - PHASE_1) / (1 - PHASE_1);

            alpha = 1 - Math.sqrt(pos);
            radius = RADIUS + RADIUS * pos;
         }

         context.beginPath();
         context.arc(0, 0, radius, 0, 2 * Math.PI, false);
         context.fillStyle = 'rgba(' + this.rgb.r + ', ' + this.rgb.g + ', ' + this.rgb.b + ', ' + alpha.toFixed(2) + ')';
         context.fill();
      }
   });
})();