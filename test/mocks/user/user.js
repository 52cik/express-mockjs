/**
 * user page - user info
 *
 * @url user?uid=233
 *
 * Here you can write a detailed description
 * of the parameters of the information.
 */

module.exports = function (req) {
  var uid = req.query.uid;

  if (!uid) {
    return {
      code: -1,
      msg: 'no uid',
    }
  }

  return {
    code: 0,
    data: {
      "uid": +uid,
      "name": "@name",
      "age|20-30": 1,
      "email": "@email",
      "date": "@date",
    },
  };
};

