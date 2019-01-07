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

function parseHTML(html) {
    let $ = cheerio.load(html);
    let users = [];
    $("tr").each(function(index, element) {
        if (index != 0) {
            users.push({
                rank: $(this).find(".leaderboard__table-col-rank").text().trim(),
                avatar_url: $(this).find(".leaderboard__user-avatar").attr("src"),
                nickname: $(this).find(".leaderboard__user-avatar").attr("alt"),
                full_name: $(this).find(".leaderboard__table-username").text().trim(),
                gold_medals_count: $(this).find(".leaderboard__table-col-medal--gold").text().trim(),
                silver_medals_count: $(this).find(".leaderboard__table-col-medal--silver").text().trim(),
                bronze_medals_count: $(this).find(".leaderboard__table-col-medal--bronze").text().trim(),
                points: $(this).find(".leaderboard__table-col-points").text().trim()
            });
        }
    });
    return users;
}

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