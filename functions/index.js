const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();
let settings = { timestampsInSnapshots: true };
db.settings(settings);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

async function batchInsert(objects, referenceProvider) {
    let batch = db.batch();
    for(let object of objects) {
        let docRef = referenceProvider(object);
        batch.set(docRef, object);
    }
    await batch.commit();
}

async function batchDelete(collection) {
    let batch = db.batch();
    let snapshot = await db.collection(collection).get()
    snapshot.docs.forEach(function(doc) {
        batch.delete(doc.ref);
    });
    await batch.commit();
}