// Settings
var launched = false; // Prevent double start of invaders spawn
let player;
var testInterval;
var missileLoaded = false;
var invaderWidth = 44;
var invaderHeight = 28;
var invaderSpeed = 12; // Px
var stepSpeedLevel = 2 // X2 per sec
var levelTimeChange = 10 // secs
var currentLevel = 1;
var gameActive = true; // Global flag to stop game
var playerWidth = 46;
var playerHeight = 20;
var missileSpeed = 2;
var bossCounter = 0;
var invadersReady = false; // Trigger when invaders are spawned

// Audio (not all)
var audioBoss = new Audio('../sounds/ufo_highpitch.wav');
var audio1 = new Audio('../sounds/fastinvader1.wav');
audio1.volume = 0.2;
var audio2 = new Audio('../sounds/fastinvader2.wav');
audio2.volume = 0.2;
var audio3 = new Audio('../sounds/fastinvader3.wav');
audio3.volume = 0.2;
var audio4 = new Audio('../sounds/fastinvader4.wav');
audio4.volume = 0.2;

audioBoss.volume = 0.2;
audioBoss.loop = true;

var hiScore = localStorage.getItem('space-invaders_hi-score');

//---// CONTENT //---// 

// Initial
// Main Loop
// Invaders spawn
// Invaders movement
// Invaders attack

//\\//\\ Initial //\\//\\
function clearScores() {
    localStorage.setItem('space-invaders_scores1','0000');
    localStorage.setItem('space-invaders_scores2','0000');
    localStorage.setItem('space-invaders_lives',3);
    var scoresHiGet = localStorage.getItem('space-invaders_hi-score')
    if (scoresHiGet != null || scoresHiGet != undefined) {
        var scoresHiLeadingZero = scoresHiGet.toString().padStart(4,'0');
        document.getElementById("scores_hi").innerHTML = scoresHiLeadingZero;
    }
}
setTimeout(()=>{
    clearScores();
},10);

//\\//\\ Main Loop //\\//\\

function mainLoop() {

    if (launched && gameActive) {

        // Loop player missiles
        var allMissiles = document.querySelectorAll('[data-mtype="missile"]'); // Player missiles
        var invaderMissiles = document.querySelectorAll('[data-mtype="missile-invader"]'); // Invader missiles
        let board = document.getElementById("screen_m");

        // Movement of player missile
        for(let i = 0; i < allMissiles.length; i++) {
            // Add movement from bottom to player missiles
            allMissiles[i].style.bottom = (parseInt(allMissiles[i].style.bottom) + missileSpeed ) + "px";
            

            // Check player missile is out the frame
            if (allMissiles[i].offsetTop < -50) {
                allMissiles[i].setAttribute("data-mtype", "missile-stopped");
                allMissiles[i].textContent = "Z";
                setTimeout(()=>{
                    allMissiles[i].remove();
                },400);
            }

        }

        var invMissileX;
        var invMissileY;
        var currentPlayer;

        // Movement of invader missiles
        for(let i = 0; i < invaderMissiles.length; i++) {
            invaderMissiles[i].style.top = (parseInt(invaderMissiles[i].style.top) + missileSpeed ) + "px";
            
            // Count overlaping invader missile vs player
            currentPlayer = document.getElementById('player');

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
                var audio = new Audio('../sounds/explosion.wav');
                audio.volume = 0.3;
                audio.play();

                setTimeout(()=>{
                    minusPlayer();
                },100);

                setTimeout(()=>{
                    currentPlayer.textContent = "W";
                    currentPlayer.style.bottom = "-30px";
                    currentPlayer.style.left = "0";
                },300);
                
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

        var allInvaders = document.querySelectorAll("[data-invader='true']");

        if (invadersReady == true && allInvaders.length === 0) {
            newLevel();
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
        
        for(let i = 0; i < allMissiles.length; i++) {

            missileX = allMissiles[i].offsetLeft;
            missileY = allMissiles[i].offsetTop;

            if (board.offsetHeight - missileY > 650) {
                allMissiles[i].remove();
            }

            for(let inv = 0; inv < allInvaders.length; inv++) {

                invaderX = allInvaders[inv].offsetLeft;
                invaderY = allInvaders[inv].offsetTop;

                // Check X overlap
                if ((missileX > (invaderX - 10) && missileX < (invaderX + invaderWidth - 10)) &&
                // Check Y overlap
                (missileY < invaderY && missileY > (invaderY - invaderHeight))) {

                    var rowNumber = allInvaders[inv].id.substring(0,1);
                    var newInvId = (parseInt(rowNumber) + 1) + allInvaders[inv].id.substring(1);
                    
                    if (parseInt(rowNumber) < 4 && newInvId != null) {
                        var checkInvader = document.getElementById(newInvId);
                        if (checkInvader != null) {
                            checkInvader.setAttribute('data-active', '1');
                        }
                    }

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
                            var audio = new Audio('../sounds/ufo_lowpitch.wav');
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

                    } else {
                        allInvaders[inv].textContent = "Z";
                        allMissiles[i].remove();
                        allInvaders[inv].remove();

                        // Sound effect
                        var audio = new Audio('../sounds/invaderkilled.wav');
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
        // let boss = document.getElementById("boss");
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

//\\//\\ 2. Invaders spawn //\\//\\

function spawnInvaders() {

    document.getElementById("screen_m").innerHTML = "";
    let board = document.getElementById("screen_m");

    // Settings
    let numInRow = 11;
    let rows = 5;
    let rowHeight = 44;
    let rowPadding = 40;
    let invaderPadding = 53; 

    let invaderLetter = 0; // Default letter in invader font to display icon

    // Calc
    let startPositionY = rowHeight * rows;
    let invaderSizeX = 32;

    let invanderTypeI;
    var invaderType;
    var currentRow;

    for(let i2 = 0; i2 < rows; i2++) {
        setTimeout(() => {
            for(let i = 0; i < numInRow; i++) {

                // Change icon of invader
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
    
    // Start moving
    if (gameActive){
        setTimeout(()=>{
            invaderMovement();
            invadersReady = true;
        },3000);
    }
}

//\\//\\ 3. Invaders movement //\\//\\

var  counter = 0;
function invaderMovement() {

    var allInvaders = document.querySelectorAll("[data-invader='true']");
    let board = document.getElementById("screen_m");

    // Count movements
    if (gameActive && counter !== 20) {
        counter += 1;

        if (counter == 1 || counter == 5 || counter == 9 || counter == 13 || counter == 17) {
            audio1.play();
        } else if (counter == 2 || counter == 6 || counter == 10 || counter == 14 || counter == 18){
            audio2.play();
        } else if (counter == 3 || counter == 7 || counter == 11 || counter == 15 || counter == 19){
            audio3.play();
        } else if (counter == 4 || counter ==  8 || counter ==  12 || counter == 16 || counter == 0){
            audio4.play();
        }

    } else if (counter === 20) {
        counter = 0;
        audio4.play();
    }

    if (counter > 0 && counter < 10 && gameActive) {

        // To the right
        for(let invader = 0; invader < allInvaders.length; invader++) {
            setTimeout(()=>{
                allInvaders[invader].style.left = (parseInt(allInvaders[invader].style.left) + invaderSpeed ) + "px";
                animateInvaders(allInvaders[invader]);
            },10);
        }

    } else if (counter === 10 || counter === 20 && gameActive) {
        if (counter === 20) {
            // Change level
            levelChanger();
        }
        // Down
        for(let invader = 0; invader < allInvaders.length; invader++) {
            setTimeout(()=>{
                allInvaders[invader].style.top = (parseInt(allInvaders[invader].style.top) + 16 ) + "px";
            },10);

            // Check if invaders reached bottom
            if (board.offsetHeight < allInvaders[invader].offsetTop && gameActive) {
                gameOver();
            }

        }

    } else if (counter > 10 && counter < 20 && gameActive) {
        // To the left
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

//\\//\\ Spawn Boss //\\//\\

function spawnBoss() {
    let board = document.getElementById("screen_m");
    var invanderTypeII = "<span class='invader-boss' data-invader='true' data-type='boss' data-active='1' id='boss' style='top:-20px;right:-200px;'>V</span>";
    board.insertAdjacentHTML('afterbegin', invanderTypeII);
    audioBoss.loop = true;
    // Sound effect
    audioBoss.play();
}

//\\//\\ 4. Animate Invaders //\\//\\

function animateInvaders(item) {
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

//\\//\\ 5. Invaders attack //\\//\\

function invaderAttack() {
    var invaders = document.querySelectorAll('[data-active="1"]');
    var boss = document.getElementById('boss');
    let board = document.getElementById("screen_m"); // Main screen to spawn
    var activeInvaderX;
    var activeInvaderY;

    if(invaders.length > 0 && gameActive) {
        var randomId = Math.floor(Math.random() * invaders.length);
        activeInvaderX = invaders[randomId].style.left;
        activeInvaderY = invaders[randomId].style.top;
        var missile = "<span class='missile-invader' data-mtype='missile-invader' style='top:" + parseInt(activeInvaderY) + "px;left:" + parseInt(activeInvaderX) + "px;font-size:2vw;'>Y</span>";
        board.insertAdjacentHTML('beforeend', missile);
    }

    if (boss != undefined || boss != null) {
        var missileBoss = "<span class='missile-invader' data-mtype='missile-invader' style='top:" + parseInt(parseInt(boss.style.top) + 10) + "px;right:" + parseInt(parseInt(boss.style.right) + 20) + "px;font-size:2vw;'>Y</span>";
        board.insertAdjacentHTML('beforeend', missileBoss);
    }

    if (gameActive){
        setTimeout(invaderAttack, 1000);
    }
}

//\\//\\ Level changer //\\//\\
function levelChanger() {
    currentLevel += 1;
}

//\\//\\ Player spawn //\\//\\

function playerSpawn() {
    let board = document.getElementById("screen_m"); // Main screen to spawn
    let playerPawn = "<span class='player' id='player' style='bottom:-30px;left:0;font-size:3vw;'>W</span>";
    board.insertAdjacentHTML('beforeend', playerPawn);
    setTimeout(invaderAttack(),2000);
}

//\\//\\ Text print letter by letter //\\//\\

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

//\\//\\ Controls and screens //\\//\\

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

        // Left movement
        if ((event.key === "ArrowLeft" || event.key === "a") && player !== null && player.offsetLeft > - 30) {
            goLeft();
        // Right movement
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

    if (!gameActive && launched) {
        location.reload();
    }

});

// Fire
addEventListener("keyup", (event) => {

    if (event.key === " " && gameActive && player != undefined) {
        let board = document.getElementById("screen_m");
        var missile = "<span class='missile' data-mtype='missile' style='bottom:20px;left:" + parseInt(player.style.left) + "px;font-size:2vw;'>Y</span>";
        board.insertAdjacentHTML('beforeend', missile);

        // Sound effect
        var audio = new Audio('../sounds/shoot.wav');
        audio.volume = 0.3;
        audio.play();

    }

});


//\\//\\// Statistic and scores //\\//\\//

function minusPlayer() {
    var lives = parseInt(localStorage.getItem('space-invaders_lives')) - 1;
    localStorage.setItem('space-invaders_lives',lives);
    document.getElementById('lives_number').textContent = localStorage.getItem('space-invaders_lives');
    if (lives == 0 && gameActive) {
        gameOver();
    }
}

// Game over 
function gameOver() {
    gameActive = false;
    audioBoss.loop = false;
    var textGameOver = '<span class="game_over">Game Over</span>'
    var textGameOverSpan = '<span class="game_over--span">Press ENTER to start a new game</span>'
    document.getElementById('screen_m').insertAdjacentHTML('beforeend', textGameOver);
    document.getElementById('screen_m').insertAdjacentHTML('beforeend', textGameOverSpan);
    var currentScore = localStorage.getItem('space-invaders_scores1');
    var prevHiScore = localStorage.getItem('space-invaders_hi-score');
    if (prevHiScore < currentScore) {
        localStorage.setItem('space-invaders_hi-score',currentScore);
    }
}

// Add scores to the player
var scoresCount = 0;
function plusScore(invaderType) {

    if (invaderType === 'x1') {
        scoresCount += 10;
    } else if (invaderType === 'x2') {
        scoresCount += 20;
    } else if (invaderType === 'x3') {
        scoresCount += 30;
    } else if (invaderType === 'boss') {
        scoresCount += 50;
    }
    var scoresLeadingZero = scoresCount.toString().padStart(4,'0');
    var hiScore = localStorage.getItem('space-invaders_hi-score');

    localStorage.setItem('space-invaders_scores1',scoresLeadingZero);
    document.getElementById("scores_one").textContent = localStorage.getItem('space-invaders_scores1');

    if (hiScore < parseInt(scoresLeadingZero)) {
        document.getElementById("scores_hi").textContent = scoresLeadingZero;
        localStorage.setItem('space-invaders_hi-score',scoresLeadingZero);
    }
}

// Add life and go the next level
function newLevel() {
    audioBoss.loop = false;
    var textGameOver = '<span class="game_level">Next Level</span>'
    document.getElementById('screen_m').insertAdjacentHTML('beforeend', textGameOver);
    var currentScore = localStorage.getItem('space-invaders_scores1');
    var prevHiScore = localStorage.getItem('space-invaders_hi-score');
    currentLevel = 1;
    if (prevHiScore < currentScore) {
        localStorage.setItem('space-invaders_hi-score',currentScore);
    }

    setTimeout(()=>{
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