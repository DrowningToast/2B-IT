const User = require("../schema/User");

/**
 * @param {Promise<DecodedIdToken>} user
 * @param {["DEFAULT" | "ADMIN"]} requiredRoles
 * @returns
 */
const validateRole = async (user, requiredRoles) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userData = await User.findById(user?.uid);
      if (!user || !userData) {
        reject({ code: 400, message: "Not Authorized" });
      } else if (
        requiredRoles?.length &&
        !requiredRoles?.includes(userData?.role)
      ) {
        reject({ code: 403, message: "Insufficient Permission" });
      } else {
        resolve({ ...user, ...userData.toObject() });
      }
    } catch (e) {
      console.log(e);
      reject({ code: 500, message: "Unknown validation error" });
    }
  });
};

module.exports = validateRole;
