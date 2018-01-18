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
var player1choice = "";
var player2choice = "";
var playerChoice = "";
//Using this variable to trigger the game result
var turnCounter = 0
//win/loss variables
var player1Win = 0;
var player1Loss = 0;
var player2Win = 0;
var player2Loss = 0;

//reset timer
var reset;
function resetTimer(){
    //clear the result
    $("#results").html("");
    //add the buttons again for each player
    $(".player"+sessionStorage.getItem('currentPlayerNumber')+"buttons").html('<button class="rps" value="rock">Rock</button><button class="rps" value="paper">Paper</button><button class="rps" value="scissors">Scissors</button>');
    //clear the other players choice
    $(".pcClear").html("");
};
//player2 winner function
function player2Winner (){
    //show other players choice
    if(sessionStorage.getItem("currentPlayerNumber") === "2"){
        $("#player1Game").append('<div class="pcClear">'+player1choice+'</div>');
    };
    if(sessionStorage.getItem("currentPlayerNumber") === "1"){
        $("#player2Game").append('<div class="pcClear">'+player2choice+'</div>');
    };
    //reset the selections made to 0
    turnCounter = 0;
    //send it to the DB
    database.ref('turnCounter').set(turnCounter);
    //update wins and losses
    player2Win ++;
    player1Loss ++;
    database.ref('player/1/losses').set(player1Loss);
    database.ref('player/2/wins').set(player2Win);
    //run the reset timer
    reset = setTimeout(resetTimer,3000);
};
//function for the other player winning
function player1Winner (){
    if(sessionStorage.getItem("currentPlayerNumber") === "2"){
        $("#player1Game").append('<div class="pcClear">'+player1choice+'</div>');
    };
    if(sessionStorage.getItem("currentPlayerNumber") === "1"){
        $("#player2Game").append('<div class="pcClear">'+player2choice+'</div>');
    };
    turnCounter = 0;
    database.ref('turnCounter').set(turnCounter);
    player1Win ++;
    player2Loss ++;
    database.ref('player/2/losses').set(player2Loss);
    database.ref('player/1/wins').set(player1Win);
    reset = setTimeout(resetTimer,3000);
};
//function for a tie
function tie(){
    if(sessionStorage.getItem("currentPlayerNumber") === "2"){
        $("#player1Game").append('<div class="pcClear">'+player1choice+'</div>');
    };
    if(sessionStorage.getItem("currentPlayerNumber") === "1"){
        $("#player2Game").append('<div class="pcClear">'+player2choice+'</div>');
    };
    $("#results").html("Tie");
    turnCounter = 0;
    database.ref('turnCounter').set(turnCounter);
    reset = setTimeout(resetTimer,3000);
}

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
            "choice": playerChoice
        });
        //list the name and buttons for the joining player    
        $("#playerHeader").html("Hi " + playerName + " you are Player "+playerCount);
        $("#player"+playerCount+"Game").append('<div class="player'+playerCount+'buttons"></div>');
        $(".player"+playerCount+"buttons").append('<button class="rps btn btn-primary" value="rock">Rock</button>');
        $(".player"+playerCount+"buttons").append('<button class="rps btn btn-success" value="paper">Paper</button>');
        $(".player"+playerCount+"buttons").append('<button class="rps btn btn-danger" value="scissors">Scissors</button>');
        }
    //if there are two many players let the player know
    else {
        playerName = $("#player-name").val().trim();
        $("#playerHeader").prepend("<div>Hi " + playerName + " the game is full, please wait until a player leaves</div>");
    }
});
//assign the choice of the player
$(document).on("click", ".rps", function(){
        //setting choice playerChoice as players selection
        playerChoice = $(this).val();
        //storing selection in firebase
        database.ref('player/'+sessionStorage.getItem("currentPlayerNumber")+'/choice').set(playerChoice);
        //use turncounter to trigger result
        turnCounter ++;
        //update firebase turnCounter
        database.ref('turnCounter').set(turnCounter);
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
        player1choice = snapshot.child('player/1/choice').val();
        player2choice = snapshot.child('player/2/choice').val();
        if(snapshot.child('player/1/choice').val() === "rock"){
            if(snapshot.child('player/2/choice').val() === "rock"){
                tie();
            }
            else if (snapshot.child('player/2/choice').val() === "paper"){
                $("#results").html(snapshot.child('player/2/name').val()+" Wins!");
                player2Winner();
            }
            else if (snapshot.child('player/2/choice').val() === "scissors"){
                $("#results").html(snapshot.child('player/1/name').val()+" Wins!");
                player1Winner();
            }
        }
        else if(snapshot.child('player/1/choice').val() === "paper"){
            if(snapshot.child('player/2/choice').val() === "paper"){
                tie();
            }
            else if (snapshot.child('player/2/choice').val() === "scissors"){
                $("#results").html(snapshot.child('player/2/name').val()+" Wins!");
                player2Winner();
            }
            else if (snapshot.child('player/2/choice').val() === "rock"){
                $("#results").html(snapshot.child('player/1/name').val()+" Wins!");
                player1Winner();
            }
        }
        else if(snapshot.child('player/1/choice').val() === "scissors"){
            if(snapshot.child('player/2/choice').val() === "scissors"){
                tie();
            }
            else if (snapshot.child('player/2/choice').val() === "rock"){
                $("#results").html(snapshot.child('player/2/name').val()+" Wins!");
                player2Winner();
            }
            else if (snapshot.child('player/2/choice').val() === "paper"){
                $("#results").html(snapshot.child('player/1/name').val()+" Wins!");
                player1Winner();
            }
        }
    }
 });
//Disconnected
var connectedRef = database.ref('.info/connected');
connectedRef.on('value', function(snap) {
    if (snap.val() === true) {      
        // When I disconnect, remove me
        database.ref('player/'+sessionStorage.getItem('currentPlayerNumber')).onDisconnect().remove();
        if(sessionStorage.getItem('currentPlayerNumber') === "2"){
            database.ref('player/'+sessionStorage.getItem('currentPlayerNumber')).onDisconnect(playerCount = 1);
            database.ref('count').set(playerCount);
        }
        else if(sessionStorage.getItem('currentPlayerNumber') === "1"){
            database.ref('player/'+sessionStorage.getItem('currentPlayerNumber')).onDisconnect(playerCount = 0);
            database.ref('count').set(playerCount);
        }
    };
});

//chat app
$("#send-button").on("click", function () {
    var user = $("#user").val();
    var message = $("#message").val();
    saveMessage(user, message);
});
function saveMessage(user, message) {
    database.ref('mslist').push({
      "message": message,
      "user": user
    });
};
database.ref('mslist').on("value", function (snapshot) {
    if (snapshot.val() == null) {
      return;
    }
    $("#message-list").empty();
    var messages = snapshot.val();
    var keys = Object.keys(messages);
  
    for (var i = 0; i < keys.length; i++) {
      var aKey = keys[i];
      var messageUser = messages[aKey].user;
      var currentUser = $("#user").val();
      var color = currentUser === messageUser ? "blue": "";
      var messageHTML = "";
      messageHTML = `<div><b style="color: ${color}">${messages[aKey].user}</b>: ${snapshot.val()[aKey].message}</div>`;
      $("#message-list").append(messageHTML);
    }
});