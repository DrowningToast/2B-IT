const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key
      ? Buffer.from(process.env.private_key).toString()
      : undefined,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
  }),
});

/**
 *
 * @description Resolve with currentuser field in req object if the bearer is valid, reject if not.
 */
const decodeIDToken = async (req, res, next) => {
  const header = req.headers?.authorization;
  if (
    header !== "Bearer null" &&
    req.headers?.authorization?.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodeToken = await admin.auth().verifyIdToken(idToken);
      req["currentUser"] = decodeToken;
    } catch (err) {
      console.log(err);
    }
  }
  next();
};

module.exports = decodeIDToken;
