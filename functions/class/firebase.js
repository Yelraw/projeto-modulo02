var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projeto-academia-warley.firebaseio.com"
});

const settings = {
    timestampInSnapshots: true
}

admin.firestore().settings(settings);
const db = admin.firestore();

module.exports = db;
