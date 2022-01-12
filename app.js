const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
    return {
        playerId :dbObject.player_id,
        playerName :dbObject.player_name,
        jerseyNumber :dbObject.jersey_number,
        role : dbObject.role,
    };
};

//get array of players
app.get("/players/", async (request,response) => {
    const getPlayersListQuery = `
    SELECT 
        *
        FROM 
        cricket_team;`;
    const playersList = await database.all(getPlayersListQuery);
    response.send(playersList.map(eachPlayer) =>{
        convertDbObjectToResponseObject(eachPlayer)
    })
});

//post player to table
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  const player = await database.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//get specific playerdetails
app.get("/players/:playerId/", async (request,response) => {
    const {playerId} = request.params;
    const particularPlayerQuery = `
        SELECT
            *
        FROM 
            cricket_team
        WHERE 
            player_id = ${playerId};`;
    const particularPlayer = await database.get(particularPlayerQuery);
    response.send(convertDbObjectToResponseObject(particularPlayer));
});

//update specific details
app.put("/players/:playerId/", async (request,response) => {
    const {playerId} = request.params;
    const {playerName,jerseyNumber,role} = request.body;

    const updateQuery = `
        UPDATE 
            cricket_team
        SET 
            player_name = ${playerName},
            jersey_number = ${jerseyNumber},
            role = ${role}
        WHERE 
            player_id = ${playerId};`;
    await database.run(updateQuery);
    response.send("Player Details Updated")
});

//delete specific player
app.delete("/players/:playerId/", async (request,response) => {
    const {playerId} = request.params;

    const deleteQuery = `
    DELETE 
        FROM 
    cricket_team
        WHERE 
    player_id = ${playerId};`;

    await database.run(deleteQuery);
    response.send("Player Deleted");
});
module.exports = app;



