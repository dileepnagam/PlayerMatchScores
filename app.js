const express = require("express");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB:Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

///GET players API
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM player_details ORDER BY player_id;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(playersArray);
});

//GET player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//UPDATE player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const addPlayerQuery = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId};`;
  await db.run(addPlayerQuery);
  response.send("Player Details Updated");
});

//GET match API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT * FROM match_details WHERE match_id='${matchId}';`;
  const match = await db.get(getMatchQuery);
  response.send(match);
});

///GET Matches using PlayerId API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
  SELECT * FROM player_match_score 
    NATURAL JOIN match_details 
            WHERE 
            player_id='${playerId}';`;
  const playerMatches = await db.all(getPlayerMatchesQuery);
  response.send(playerMatches);
});

///GET match player API
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
      SELECT 
        player_details.player_id AS playerId,
        player_details.player_name AS playerName
    FROM player_match_score 
    NATURAL JOIN player_details 
            WHERE 
            match_id='${matchId}';`;
  const matchPlayers = await db.all(getMatchPlayersQuery);
  response.send(matchPlayers);
});

///GET player scores API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
      SELECT 
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(player_match_score.score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes FROM
     player_details  
    INNER JOIN player_match_score ON player_details.player_id =player_match_score.player_id 
            WHERE 
            player_details.player_id=${playerId};`;
  const playerScores = await db.get(getPlayerScored);
  response.send(playerScores);
});

module.exports = app;
