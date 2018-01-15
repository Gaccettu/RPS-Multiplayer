// Initialize Firebase
var config = {
apiKey: "AIzaSyAUexeo-Lb1zJPa17GD5FNjpDAdHEIhEX8",
authDomain: "rps-multiplayer-14378.firebaseapp.com",
databaseURL: "https://rps-multiplayer-14378.firebaseio.com",
projectId: "rps-multiplayer-14378",
storageBucket: "",
messagingSenderId: "458335555318"
};
firebase.initializeApp(config);

//set global var
var database = firebase.database();  
var playerCount = 0;
var playerName = "";
var playerData = database.ref('player/'+playerCount);
//Using this variable to trigger the game result
var turnCounter = 0
//win/loss variables
var player1Win = 0;
var player1Loss = 0;
var player2Win = 0;
var player2Loss = 0;

//take the player name and log it in firebase
$(".startButton").on("click", function(){
    //limit our game to two players
    if(playerCount < 2){
        //let the game know the number of players
        playerCount ++;
        //session storage our player number (will use this later for making selections)
        sessionStorage.setItem("currentPlayerNumber", playerCount)
        //set a count to keep track
        database.ref('count').set(playerCount);
        //set our playerName variable
        playerName = $("#player-name").val().trim();
        //create a player in the database
        playerData = database.ref('player/'+playerCount);
        //assign our player object it's attributes
        playerData.set({
            "name": playerName,
            "wins": 0,
            "losses": 0,
        });
        //list the name and buttons for the joining player    
        $("#playerHeader").html("Hi " + playerName + " you are Player "+playerCount);
        $("#player"+playerCount+"Name").html(playerName);
        $("#player"+playerCount+"Game").append('<div class="player'+playerCount+'buttons"></div>');
        $(".player"+playerCount+"buttons").append('<button class="rps" value="rock">Rock</button>');
        $(".player"+playerCount+"buttons").append('<button class="rps" value="paper">Paper</button>');
        $(".player"+playerCount+"buttons").append('<button class="rps" value="scissors">Scissors</button>');
        }
    //if there are two many players let the player know
    else {
        playerName = $("#player-name").val().trim();
        $("#playerHeader").prepend("<div>Hi " + playerName + " the game is full, please wait until a player leaves</div>");
    }
});
//assign the choice of the player
$(document).on("click", ".rps", function(){
    //use turncounter to trigger result
        turnCounter ++;
        database.ref('turnCounter').set(turnCounter);
        playerData.set({
            "name": playerName,
            "wins": 0,
            "losses": 0,
            "choice": $(this).val(),
        })
        //assign the pick and override the buttons (use session storage so that both players can pick independently)
        $(".player"+sessionStorage.getItem("currentPlayerNumber")+"buttons").html($(this).val());
});


//snapshot to pull data stored in the db
database.ref().on("value", function(snapshot) {
    //make sure turncounter is up to date
    turnCounter = snapshot.child('turnCounter').val();
    //if player1 is in the game input their info
    if (snapshot.child("player/1").exists()){
        $("#player1Name").html('<div>'+snapshot.child("player/1/name").val()+'</div><div>Wins: '+snapshot.child("player/1/wins").val()+'</div><div>Losses: '+snapshot.child("player/1/losses").val()+'</div>');
        playerCount = snapshot.child('count').val();
    }
    //if player2 is in the game input their info
    if (snapshot.child("player/2").exists()){
        $("#player2Name").html('<div>'+snapshot.child("player/2/name").val()+'</div><div>Wins: '+snapshot.child("player/2/wins").val()+'</div><div>Losses: '+snapshot.child("player/2/losses").val()+'</div>');
        playerCount = snapshot.child('count').val();
    }
    if (snapshot.child('turnCounter').val() === 2){
        //show both picks to players
        if(sessionStorage.getItem("currentPlayerNumber") === "2"){
            $("#player1Name").append('<div>'+snapshot.child("player/1/choice").val()+'</div>');
        }
        if(sessionStorage.getItem("currentPlayerNumber") === "1"){
        $("#player2Name").append('<div>'+snapshot.child("player/2/choice").val()+'</div>');
        }
        if(snapshot.child('player/1/choice').val() === "rock"){
            if(snapshot.child('player/2/choice').val() === "rock"){
                $("#results").html("Tie");
            }
            else if (snapshot.child('player/2/choice').val() === "paper"){
                $("#results").html(snapshot.child('player/2/name').val()+" Wins!");
                player2Win ++;
                player1Loss ++;
                database.ref('player/1/losses').set(player1Loss);
                database.ref('player/2/wins').set(player2Win);
            }
            else if (snapshot.child('player/2/choice').val() === "scissors"){
                $("#results").html(snapshot.child('player/1/name').val()+" Wins!");
                player1Win ++;
                Player2Loss ++;
                database.ref('player/2/losses').set(player2Loss);
                database.ref('player/1/wins').set(player1Win);
            }
        }
        else if(snapshot.child('player/1/choice').val() === "paper"){
            if(snapshot.child('player/2/choice').val() === "paper"){
                $("#results").html("Tie");
            }
            else if (snapshot.child('player/2/choice').val() === "scissors"){
                $("#results").html(snapshot.child('player/2/name').val()+" Wins!");
                player2Win ++;
                player1Loss ++;
                database.ref('player/1/losses').set(player1Loss);
                database.ref('player/2/wins').set(player2Win);
            }
            else if (snapshot.child('player/2/choice').val() === "rock"){
                $("#results").html(snapshot.child('player/1/name').val()+" Wins!");
                player1Win ++;
                Player2Loss ++;
                database.ref('player/2/losses').set(player2Loss);
                database.ref('player/1/wins').set(player1Win);
            }
        }
        else if(snapshot.child('player/1/choice').val() === "scissors"){
            if(snapshot.child('player/2/choice').val() === "scissors"){
                $("#results").html("Tie");
            }
            else if (snapshot.child('player/2/choice').val() === "rock"){
                $("#results").html(snapshot.child('player/2/name').val()+" Wins!");
                player2Win ++;
                player1Loss ++;
                database.ref('player/1/losses').set(player1Loss);
                database.ref('player/2/wins').set(player2Win);
            }
            else if (snapshot.child('player/2/choice').val() === "paper"){
                $("#results").html(snapshot.child('player/1/name').val()+" Wins!");
                player1Win ++;
                Player2Loss ++;
                database.ref('player/2/losses').set(player2Loss);
                database.ref('player/1/wins').set(player1Win);
            }
        }
    }
 });
