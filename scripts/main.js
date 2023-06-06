// Vars
var launched = false; // Prevent double start of invaders spawn
let player; // Player pawn
var gameActive = true; // Global flag to stop game
var hiScore = localStorage.getItem('space-invaders_hi-score');

// Settings
var invaderWidth = 44; // px
var invaderHeight = 28; // px
var invaderSpeed = 12; // px
var stepSpeedLevel = 2 // x2 per sec
var levelTimeChange = 10 // sec
var currentLevel = 1; // 
var playerWidth = 46; // px
var playerHeight = 20; // px
var missileSpeed = 2; // px per loop
var bossCounter = 0; // initial counter to spawn a boss
var invadersReady = false; // trigger - invaders are already spawned true/false

// Audio
var audioBoss = new Audio('https://kirilab.ru/sounds/ufo_highpitch.wav');
var audio1 = new Audio('https://kirilab.ru/sounds/fastinvader1.wav');
audio1.volume = 0.2;
var audio2 = new Audio('https://kirilab.ru/sounds/fastinvader2.wav');
audio2.volume = 0.2;
var audio3 = new Audio('https://kirilab.ru/sounds/fastinvader3.wav');
audio3.volume = 0.2;
var audio4 = new Audio('https://kirilab.ru/sounds/fastinvader4.wav');
audio4.volume = 0.2;

audioBoss.volume = 0.2;
audioBoss.loop = true;

//---// CONTENT //---// 

// 1. Initial load
// 2. Main Loop
// 3. Invaders spawn
// 4. Invaders movement
// 5. Spawn Boss
// 6. Animate Invaders 
// 7. Invaders attack
// 8. Level changer
// 9. Player spawn
// 10. Text print letter by letter
// 11. Controls and screens
// 12. Player Fire
// 13. Statistic and scores
// 14. Game over
// 15. Add scores to the player
// 16. Add life and go the next level


//\\//\\ 1. Initial load //\\//\\

function clearScores() {
    localStorage.setItem('space-invaders_scores1','0000'); // Clear scores of Player 1
    localStorage.setItem('space-invaders_scores2','0000'); // Clear scores of Player 2
    localStorage.setItem('space-invaders_lives',3); // Set lives of the player
    var scoresHiGet = localStorage.getItem('space-invaders_hi-score') // Get Hi record scores from local storage
    
    if (scoresHiGet != null || scoresHiGet != undefined) {
        var scoresHiLeadingZero = scoresHiGet.toString().padStart(4,'0'); // Stylize hi score to 4 digits format with leading zero
        document.getElementById("scores_hi").innerHTML = scoresHiLeadingZero; // Insert Hi scores record to DOM
    }

}
setTimeout(()=>{
    clearScores(); 
},10); // Prevent error when DOM is not ready


//\\//\\ 2. Main Loop //\\//\\

function mainLoop() {

    if (launched && gameActive) { // Loop works only when the game was launched by the player and wasn't stopped 

        // Loop player missiles
        var allMissiles = document.querySelectorAll('[data-mtype="missile"]'); // Player missiles array
        var invaderMissiles = document.querySelectorAll('[data-mtype="missile-invader"]'); // Invader missiles array
        let board = document.getElementById("screen_m"); // Parent element of the game

        // Movement of player missiles
        for(let i = 0; i < allMissiles.length; i++) {
            // Add movement from bottom to top (player missiles)
            allMissiles[i].style.bottom = (parseInt(allMissiles[i].style.bottom) + missileSpeed ) + "px";
            
            // Check player missiles are out the game frame
            if (allMissiles[i].offsetTop < -50) {
                allMissiles[i].setAttribute("data-mtype", "missile-stopped"); // Stop movement
                allMissiles[i].textContent = "Z"; // Change icon
                setTimeout(()=>{
                    allMissiles[i].remove(); // Remove missile from DOM 
                },400);
            }

        }

        var invMissileX; // Current invader missile - Offset Left
        var invMissileY; // Current invader missile - Offset Top
        var currentPlayer;

        // Movement of invader missiles
        for(let i = 0; i < invaderMissiles.length; i++) {
            invaderMissiles[i].style.top = (parseInt(invaderMissiles[i].style.top) + missileSpeed ) + "px";
            
            // Count overlaping invader missile vs player
            currentPlayer = document.getElementById('player'); // Get current data of the element "player"

            invMissileX = invaderMissiles[i].offsetLeft;
            invMissileY = invaderMissiles[i].offsetTop;

            // Player overlap invader missile
            // Check X overlap
            if ((invMissileX > (currentPlayer.offsetLeft - 10) && invMissileX < (currentPlayer.offsetLeft + playerWidth - 10)) &&
            // Check Y overlap
            (invMissileY < currentPlayer.offsetTop && invMissileY > (currentPlayer.offsetTop - playerHeight))) {

                invaderMissiles[i].textContent = "Z";
                invaderMissiles[i].remove();

                currentPlayer.textContent = "X";

                // Sound effect
                var audio = new Audio('https://kirilab.ru/sounds/explosion.wav');
                audio.volume = 0.3;
                audio.play();

                // Subtract the player's life in case of a hit
                setTimeout(()=>{
                    minusPlayer();
                },100);

                //Player respawn after being hit
                setTimeout(()=>{
                    currentPlayer.textContent = "W";
                    currentPlayer.style.bottom = "-30px";
                    currentPlayer.style.left = "0";
                },400);
                
                break;
            }

            // Check invader missile is not out the frame
            if ((board.offsetHeight + 50) < invaderMissiles[i].offsetTop) {
                invaderMissiles[i].setAttribute("data-mtype", "missile-stopped");
                invaderMissiles[i].textContent = "Z";
                setTimeout(()=>{
                    invaderMissiles[i].remove();
                },400);
            }
        }

        var allInvaders = document.querySelectorAll("[data-invader='true']"); // All invaders array

        if (invadersReady == true && allInvaders.length === 0) { // Invaders were spawned but currently there are no invaders
            newLevel(); // Reload level to spawn new invaders

            // Prevent actions and sounds after the game was stopped
            invadersReady = false; 
            gameActive = false;
            audioBoss.loop = false;
        }

        var invaderX;
        var invaderY;
        var missileX;
        var missileY;
        var invaderType;

        // Overlapping player missiles vs invaders
        // Loop all player missiles 
        for(let i = 0; i < allMissiles.length; i++) {

            missileX = allMissiles[i].offsetLeft; // Position X of the current player missile
            missileY = allMissiles[i].offsetTop; // Position Y of the current player missile

            // If missile out of the game frame - remove missile
            if (board.offsetHeight - missileY > 650) {
                allMissiles[i].remove();
            }

            // Loop each invaders per each player missile
            for(let inv = 0; inv < allInvaders.length; inv++) {

                invaderX = allInvaders[inv].offsetLeft; // Position X of the current invader
                invaderY = allInvaders[inv].offsetTop; // Position Y of the current invader

                // Check X overlap
                if ((missileX > (invaderX - 10) && missileX < (invaderX + invaderWidth - 10)) &&
                // Check Y overlap
                (missileY < invaderY && missileY > (invaderY - invaderHeight))) {

                    // Get ID of the invader which was hit and take it first number which shows the row of the invader
                    var rowNumber = allInvaders[inv].id.substring(0,1);

                    // Detect which ID is above the invader which was hit
                    var newInvId = (parseInt(rowNumber) + 1) + allInvaders[inv].id.substring(1);
                    
                    // Change data-active attribute to 1, after which he can shoot
                    if (parseInt(rowNumber) < 4 && newInvId != null) {
                        var checkInvader = document.getElementById(newInvId);
                        if (checkInvader != null) {
                            checkInvader.setAttribute('data-active', '1');
                        }
                    }

                    // Player hit Boss
                    if (allInvaders[inv].getAttribute("data-type") === 'boss') {

                        var thisBoss = allInvaders[inv];

                        setTimeout(()=>{
                            invaderType = allInvaders[inv].getAttribute('data-type');
                            plusScore(invaderType);
                            thisBoss.setAttribute("data-type","stopped");
                            thisBoss.textContent = "Z";
                            allMissiles[i].remove();

                            // Sound effect
                            audioBoss.loop = false;
                            var audio = new Audio('https://kirilab.ru/sounds/ufo_lowpitch.wav');
                            audio.volume = 0.2;
                            audio.play();
                        },50);

                        setTimeout(()=>{
                            thisBoss.style.fontFamily = "Invaders";
                            thisBoss.textContent = "50";
                        },350);

                        setTimeout(()=>{
                            allInvaders[inv].remove();
                        },2000);

                    // If player hit invader
                    } else {
                        allInvaders[inv].textContent = "Z";
                        allMissiles[i].remove();
                        allInvaders[inv].remove();

                        // Sound effect
                        var audio = new Audio('https://kirilab.ru/sounds/invaderkilled.wav');
                        audio.volume = 0.3;
                        audio.play();

                        setTimeout(()=>{
                            invaderType = allInvaders[inv].getAttribute('data-type');
                            plusScore(invaderType);
                        },100);

                    }
                    break;
                }

            }
        }
    }

    // Boss Spawn
    if (launched && gameActive) {

        bossCounter += 1;
        if (bossCounter % 6000 == 0){
            spawnBoss();
        }

        let boss = document.querySelector("[data-type='boss']");
        if (boss != null || boss != undefined) {
            boss.style.right = (parseInt(boss.style.right) + 1) + 'px';
            if (parseInt(boss.style.right) > 670) {
                boss.remove();
                audioBoss.loop = false;
            }
        }
    }

    // Repeat self
    if (gameActive){
        setTimeout(mainLoop,5);
    }

}
mainLoop();

//\\//\\ 3. Invaders spawn //\\//\\

function spawnInvaders() {

    // Clear game board / screen
    document.getElementById("screen_m").innerHTML = "";
    let board = document.getElementById("screen_m");

    // Settings
    let numInRow = 11; // Number of invaders in one row
    let rows = 5; // Number of rows
    let rowHeight = 44; // Height of the row in px
    let rowPadding = 40; // Padding between rows
    let invaderPadding = 53;  // Horizontal padding between invaders
    let invaderLetter = 0; // Default letter in invader font to display icon
    let invaderSizeX = 32;
    let startPositionY = rowHeight * rows;

    // Vars
    let invanderTypeI;
    var invaderType;
    var currentRow;

    // Each row and each column
    for(let i2 = 0; i2 < rows; i2++) {

        setTimeout(() => {
            for(let i = 0; i < numInRow; i++) {

                // Change icon of invader depends on its position in row/column
                currentRow = i2 % numInRow + 1;
                switch(currentRow) {
                    case 1 || 2:
                        invaderLetter = 'G';
                        invaderType = 'x1'
                        break;
                    case 3 || 4:
                        invaderLetter = 'C';
                        invaderType = 'x2'
                        break;
                    case 5:
                        invaderLetter = 'D';
                        invaderType = 'x3'
                        break;
                }

                // Insert invader
                setTimeout(() => {
                invanderTypeI = "<span class='invader' data-invader='true' data-type='" + invaderType + "' data-active='" + ((i2 === 0) ? 1 : 0) + "' id=" + i2 + i + " style='top:" + startPositionY + "px;left:" + i*invaderPadding + "px;font-size:" + invaderSizeX + "px;'>" + invaderLetter + "</span>";
                board.insertAdjacentHTML('beforeend', invanderTypeI);
                }, 20 * i);
            }
        startPositionY = startPositionY - rowPadding;
        }, 300 * i2);
    };
    
    // Start moving after all invaders were spawned
    if (gameActive){
        setTimeout(()=>{
            invaderMovement();
            invadersReady = true;
        },3000);
    }
}

//\\//\\ 4. Invaders movement //\\//\\

var  counter = 0;

function invaderMovement() {

    var allInvaders = document.querySelectorAll("[data-invader='true']"); // All invaders array
    let board = document.getElementById("screen_m"); // Game board /screen

    // Count movements 
    if (gameActive && counter !== 20) {

        counter += 1; // Each step of movement

        // Sounds 
        if (counter == 1 || counter == 5 || counter == 9 || counter == 13 || counter == 17) {
            audio1.play();
        } else if (counter == 2 || counter == 6 || counter == 10 || counter == 14 || counter == 18){
            audio2.play();
        } else if (counter == 3 || counter == 7 || counter == 11 || counter == 15 || counter == 19){
            audio3.play();
        } else if (counter == 4 || counter ==  8 || counter ==  12 || counter == 16 || counter == 0){
            audio4.play();
        }

    // Last step in circle
    } else if (counter === 20) {
        counter = 0;
        audio4.play();
    }

    // To the right
    if (counter > 0 && counter < 10 && gameActive) {
        for(let invader = 0; invader < allInvaders.length; invader++) {
            setTimeout(()=>{
                allInvaders[invader].style.left = (parseInt(allInvaders[invader].style.left) + invaderSpeed ) + "px";
                animateInvaders(allInvaders[invader]);
            },10);
        }

    } else if (counter === 10 || counter === 20 && gameActive) {
        
        // Change level, speed
        if (counter === 20) {
            levelChanger();
        }

        // Put every invader Down
        for(let invader = 0; invader < allInvaders.length; invader++) {
            setTimeout(()=>{
                allInvaders[invader].style.top = (parseInt(allInvaders[invader].style.top) + 16 ) + "px";
            },10);

            // Check if invaders reached bottom, if yes finish the game
            if (board.offsetHeight < allInvaders[invader].offsetTop && gameActive) {
                gameOver();
            }

        }

    // To the left
    } else if (counter > 10 && counter < 20 && gameActive) {
        for(let invader = 0; invader < allInvaders.length; invader++) {
            setTimeout(()=>{
                allInvaders[invader].style.left = (parseInt(allInvaders[invader].style.left) - invaderSpeed ) + "px";
                animateInvaders(allInvaders[invader]);
            },10);
        }
    }

    if (gameActive){
        setTimeout(invaderMovement, 1000/currentLevel);
    }

}

//\\//\\ 5. Spawn Boss //\\//\\

function spawnBoss() {
    let board = document.getElementById("screen_m");
    var invanderTypeII = "<span class='invader-boss' data-invader='true' data-type='boss' data-active='1' id='boss' style='top:-20px;right:-200px;'>V</span>";
    board.insertAdjacentHTML('afterbegin', invanderTypeII);
    
    // Sound effect
    audioBoss.loop = true;
    audioBoss.play();

}

//\\//\\ 6. Animate Invaders //\\//\\

function animateInvaders(item) {

    // Change icon of the invader depends on its previous icon
    if (item.textContent === "G") {
        item.textContent = "F"
    } else if (item.textContent === "C") {
        item.textContent = "B"
    } else if (item.textContent === "D") {
        item.textContent = "E"
    } else if (item.textContent === "F") {
        item.textContent = "G"
    } else if (item.textContent === "B") {
        item.textContent = "C"
    } else if (item.textContent === "E") {
        item.textContent = "D"
    }

}

//\\//\\ 7. Invaders attack //\\//\\

function invaderAttack() {
    var invaders = document.querySelectorAll('[data-active="1"]'); // First bottom row of invaders in array
    var boss = document.getElementById('boss'); // Boss as an element
    let board = document.getElementById("screen_m"); // Main screen/board to spawn
    var activeInvaderX;
    var activeInvaderY;

    if(invaders.length > 0 && gameActive) { // If there are 1+ invanders
        var randomId = Math.floor(Math.random() * invaders.length); // Get random id of invaders from the bottom row
        activeInvaderX = invaders[randomId].style.left; // Position X of chosen invander
        activeInvaderY = invaders[randomId].style.top; // Position Y of chosen invander
        var missile = "<span class='missile-invader' data-mtype='missile-invader' style='top:" + parseInt(activeInvaderY) + "px;left:" + parseInt(activeInvaderX) + "px;font-size:2vw;'>Y</span>";
        board.insertAdjacentHTML('beforeend', missile);
    }

    // If boss exist launch additional missile
    if (boss != undefined || boss != null) {
        var missileBoss = "<span class='missile-invader' data-mtype='missile-invader' style='top:" + parseInt(parseInt(boss.style.top) + 10) + "px;right:" + parseInt(parseInt(boss.style.right) + 20) + "px;font-size:2vw;'>Y</span>";
        board.insertAdjacentHTML('beforeend', missileBoss);
    }

    if (gameActive){
        setTimeout(invaderAttack, 1000);
    }
}

//\\//\\ 8. Level changer //\\//\\
function levelChanger() {
    currentLevel += 1;
}

//\\//\\ 9. Player spawn //\\//\\

function playerSpawn() {
    let board = document.getElementById("screen_m"); // Main screen to spawn
    let playerPawn = "<span class='player' id='player' style='bottom:-30px;left:0;font-size:3vw;'>W</span>";
    board.insertAdjacentHTML('beforeend', playerPawn);
    setTimeout(invaderAttack(),2000);
}

//\\//\\ 10. Text print letter by letter //\\//\\

function printLetters(id, text, speed){
    var i = 0;
    var addText = setInterval(function(){
        document.getElementById(id).innerHTML += text.charAt(i);
        i++;
        if (i > text.length){
            clearInterval(addText);
        }
    }, speed);
}

//\\//\\ 11. Controls and screens //\\//\\

document.addEventListener("keydown",(event) => {

    var lives = document.getElementById('lives');
    var screen = document.getElementById('screen_m');
    var screen_text = screen.querySelector('.main__info');
    var firstscreen = screen.querySelector('.main__info--first');
    var secondscreen = screen.querySelector('.main__info--second');

    var text1 = "Play";
    var text2 = "Space invaders";
    var text3 = " =? Mystery";
    var text4 = "=30 Points";
    var text5 = "=20 Points";
    var text6 = "=10 Points";

    // Launch game controls 
    if (!launched) {
        if (event.key === "Enter") {

            screen_text.classList.add('main__info--disabled');

            firstscreen.style.visibility = "hidden";
            firstscreen.style.display = "none";
            secondscreen.style.visibility = "visible";
            secondscreen.style.display = "flex";

            // Add the second screen with points reward
            setTimeout(() => {
                screen_text.innerHTML = "";
                screen_text.classList.remove('main__info--disabled');
                setTimeout(() => {
                    printLetters("fst-line",text1,60);
                },100);
                setTimeout(() => {
                    printLetters("snd-line",text2,60);
                },800);
                setTimeout(() => {
                    document.getElementById('trd-line').style.opacity = "100";
                },2000);
                setTimeout(() => {
                    printLetters("trd-line--1",text3,60);
                },2000);
                setTimeout(() => {
                    printLetters("trd-line--2",text4,60);
                },2700);
                setTimeout(() => {
                    printLetters("trd-line--3",text5,60);
                },3400);
                setTimeout(() => {
                    printLetters("trd-line--4",text6,60);
                },4100);
                
            }, 200);
    
            // Player lives
            lives.classList.add('screen__lives--enabled');

            // Prevent double start
            launched = true;
            setTimeout(()=>{
                spawnInvaders();
            },6000);

            setTimeout(()=>{
                playerSpawn();
            },8000);
    
        } 
    }

    // In game control Player  
    
    if (launched && gameActive) {
        
        player = document.getElementById('player');
        var screenWidth = document.getElementById('screen_m').getBoundingClientRect().width;

        // Left movement of  the player
        if ((event.key === "ArrowLeft" || event.key === "a") && player !== null && player.offsetLeft > - 30) {
            goLeft();
        // Right movement of  the player
        } else if ((event.key === "ArrowRight" || event.key === "d") && player !== null && player.offsetLeft < screenWidth + 50) {
            goRight();
        }

        function goLeft() {
            player.style.left = (parseInt(player.style.left) - 10) + 'px';
        }
        function goRight() {
            player.style.left = (parseInt(player.style.left) + 10) + 'px';
        }
    }

    // Func to reload the page when game is over
    if (!gameActive && launched) {
        if (event.key === "Enter") {
            location.reload();
        }
    }

});

//\\//\\// 12. Player Fire //\\//\\//
addEventListener("keyup", (event) => {

    // Launch player's missile when Space in pressed
    if (event.key === " " && gameActive && player != undefined) {
        let board = document.getElementById("screen_m");
        var missile = "<span class='missile' data-mtype='missile' style='bottom:20px;left:" + parseInt(player.style.left) + "px;font-size:2vw;'>Y</span>";
        board.insertAdjacentHTML('beforeend', missile);

        // Sound effect
        var audio = new Audio('https://kirilab.ru/sounds/shoot.wav');
        audio.volume = 0.3;
        audio.play();

    }

});


//\\//\\// 13. Statistic and scores //\\//\\//

function minusPlayer() {
    var lives = parseInt(localStorage.getItem('space-invaders_lives')) - 1; // Get the current num of life from storage - 1
    localStorage.setItem('space-invaders_lives',lives); // Update storage
    document.getElementById('lives_number').textContent = localStorage.getItem('space-invaders_lives'); // Update DOM

    // Stop the game when the player has zero lifes
    if (lives == 0 && gameActive) {
        gameOver();
    }
}


//\\//\\// 14. Game over //\\//\\//

function gameOver() {
    gameActive = false; // Stop all loops
    audioBoss.loop = false; // Stop audio of the Boss
    var textGameOver = '<span class="game_over">Game Over</span>'
    var textGameOverSpan = '<span class="game_over--span">Press ENTER to start a new game</span>'
    document.getElementById('screen_m').insertAdjacentHTML('beforeend', textGameOver);
    document.getElementById('screen_m').insertAdjacentHTML('beforeend', textGameOverSpan);
    var currentScore = localStorage.getItem('space-invaders_scores1');
    var prevHiScore = localStorage.getItem('space-invaders_hi-score');
    if (prevHiScore < currentScore) { // If current score higher than previous record
        localStorage.setItem('space-invaders_hi-score',currentScore); // Update hi score record
    }
}


//\\//\\// 15. Add scores to the player //\\//\\//

var scoresCount = 0;
function plusScore(invaderType) {

    if (invaderType === 'x1') {
        scoresCount += 10; // Add scores if type of invader x1, first two rows
    } else if (invaderType === 'x2') {
        scoresCount += 20; // Add scores if type of invader x2, 3rd and 4th rows rows
    } else if (invaderType === 'x3') {
        scoresCount += 30; // Add scores if type of invader x3, 5th row
    } else if (invaderType === 'boss') {
        scoresCount += 50; // Add scores if boss +++ need to be updated. In original game score number depends on the number of launched missile
    }
    var scoresLeadingZero = scoresCount.toString().padStart(4,'0');
    var hiScore = localStorage.getItem('space-invaders_hi-score'); 

    // Update hi score record in storage
    localStorage.setItem('space-invaders_scores1',scoresLeadingZero); 
    document.getElementById("scores_one").textContent = localStorage.getItem('space-invaders_scores1');
    if (hiScore < parseInt(scoresLeadingZero)) {
        document.getElementById("scores_hi").textContent = scoresLeadingZero;
        localStorage.setItem('space-invaders_hi-score',scoresLeadingZero);
    }
}


//\\//\\// 16. Add life and go the next level //\\//\\//

function newLevel() {
    // Reload level +++ need to be updated -> increase speed with every iteration
    audioBoss.loop = false;
    var textGameOver = '<span class="game_level">Next Level</span>'
    document.getElementById('screen_m').insertAdjacentHTML('beforeend', textGameOver);
    var currentScore = localStorage.getItem('space-invaders_scores1');
    var prevHiScore = localStorage.getItem('space-invaders_hi-score');
    currentLevel = 1;

    // Update hi score +++ could be removed
    if (prevHiScore < currentScore) {
        localStorage.setItem('space-invaders_hi-score',currentScore);
    }

    setTimeout(()=>{
        // Update lives of the player
        var currentLives =  localStorage.getItem('space-invaders_lives');
        localStorage.setItem('space-invaders_lives',parseInt(parseInt(currentLives) + 1));
        document.getElementById('lives_number').textContent = localStorage.getItem('space-invaders_lives');
        
        gameActive = true;
        launched = true;
        mainLoop();
        setTimeout(()=>{
            spawnInvaders();
        },6000);
    
        setTimeout(()=>{
            playerSpawn();
        },8000);
    },1000);
}