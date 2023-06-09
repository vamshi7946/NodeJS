const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;
const playerDetails = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("servers running at https://localhost:3001");
    });
  } catch (e) {
    console.log(`db error: ${e.message}`);
    process.exit(1);
  }
};
playerDetails();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const playersQuery = `
    select * from cricket_team`;
  const players = await db.all(playersQuery);
  response.send(
    players.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `insert into cricket_team(player_name,jersey_number,role)
     values
        ('${playerName}',
        ${jerseyNumber},
        '${role}');`;
  const addPlayer = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    select * from cricket_team where player_id=${playerId};`;
  const player = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `update cricket_team 
    set
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    where
        player_id = ${playerId};`;
  const changePlayer = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `delete from cricket_team where
    player_id=${playerId};`;
  const deletePlayer = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;

