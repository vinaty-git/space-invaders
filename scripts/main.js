
//\\//\\ Main Loop //\\//\\

function mainLoop() {
    setTimeout(mainLoop,1000);
    console.log('test movement');
}
mainLoop();

//\\//\\ Invaders //\\//\\

function spawnInvaders() {
    document.getElementById("screen_m").innerHTML = "";
    let board = document.getElementById("screen_m");
    let numInRow = 11;
    let rows = 5;
    let startPositionY = 250;
    let startPositionX = 0;
    let invanderTypeI;
    for(let i = 0; i < rows; i++) {
        for(let i = 0; i < numInRow; i++) {
            invanderTypeI = "<span class='invader' id=" + i + " style='left:" + i*50 + "px;'>O</span>";
            board.insertAdjacentHTML('beforeend', invanderTypeI);
        }
    };
}

// function removeLetters(id, speed){
//     var i = 0;
//     var text;
//     var newText;
//     var lengthText = document.getElementById("main__info").textContent.length;

//     var removeText = setInterval(function(){
//         text = document.getElementById("main__info").textContent;
//         newText = text.slice(0, -1);
//         document.getElementById(id).innerHTML = newText;
//         i++;
//         if (i > lengthText){
//             clearInterval(removeText);
//         }
//     }, speed);
// }

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

//\\//\\ Controls //\\//\\

document.addEventListener("keydown",(event) => {
    var lives = document.getElementById('lives');
    var screen = document.getElementById('screen_m');
    var screen_text = screen.querySelector('.main__info');
    var text1 = "Play Player <1>";
    var text2 = "Play Player <2>";

    if (event.key === "1") {

        screen_text.classList.add('main__info--disabled');
        setTimeout(() => {
            screen_text.innerHTML = "";
            screen_text.classList.remove('main__info--disabled');
            printLetters("main__info",text1,10)
        }, 250);

        // Player lives
        lives.classList.add('screen__lives--enabled');

    } else if (event.key === "2") {
        
        screen_text.classList.add('main__info--disabled');
        setTimeout(() => {
            screen_text.innerHTML = "";
            screen_text.classList.remove('main__info--disabled');
            printLetters("main__info",text2,10)
        }, 250);

        // Player lives
        lives.classList.add('screen__lives--enabled');

    } else if (event.key === "Enter") {
        alert("key = enter");
    }
    setTimeout(()=>{
        spawnInvaders();
    },3000);
});