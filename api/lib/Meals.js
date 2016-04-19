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
    return {x, y};
    //return {x: 5, y: 10};
  }
}
