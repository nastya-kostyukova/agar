/**
 * Created by anastasya on 15.4.16.
 */

/**
 * Created by anastasya on 15.4.16.
 */
module.exports = {
  generateMeal(width, height) {
    x = Math.random() * (width - 10) + 10;
    y = Math.random() * (height - 10) + 10;
    color = this.generateColor();
    return {x, y, color};
  },

  generateColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
