/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    nickname: {
      type: 'string',
    },
    x:{
      type: 'integer',
    },
    y:{
      type: 'integer',
    },
    radius:{
      type: 'integer',
    },
  },

  getNickname() {
    return nickname;
  },
};

