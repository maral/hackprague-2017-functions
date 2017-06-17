const functions = require('firebase-functions');

const AVG = "avg";
const SUM = "sum";
const MAX = "max";
const MIN = "min";

exports.recalculateScore = functions.database.ref('/boards/{boardId}/records/{userId}')
    .onWrite(event => {
      // Grab the current value of what was written to the Realtime Database.
      const userId = event.params.userId;
      const boardRef = event.data.ref.parent.parent;
      const records = event.data.val();
      return boardRef.child("eval").once("value").then((snapshot) => { 
        const eval = snapshot.val();
        let score = 0;

        const keys = Object.keys(records);
        if (eval === "min" && keys.length > 0) {
            score = null;""
        }
        keys.forEach((i) => {
            if (records[i].is_approved) {
                let s = records[i].score;
                switch (eval) {
                    case MIN:
                        if (score === null) {
                            score = s;
                        } else {
                            score = Math.min(s, score);
                        }
                        break;
                    case MAX:
                        score = Math.max(s, score);
                        break;
                    case SUM:
                    case AVG:
                    default:
                        score += s;
                        break;
                }
            }
        });

        if (eval === AVG) {
            score = score / keys.length;
        }

        const scoreRef = boardRef.child('users').child(userId).child('score');
        return scoreRef.set(score);
      });
    });