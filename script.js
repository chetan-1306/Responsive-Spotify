
let currentsong = new Audio();
let songs;
let currFolder;

// GPT function use to covert javascript time into real world time that normal people understand
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}`);
    let response = await a.text();
    let div = document.createElement('div'); // created a div element using javascript
    div.innerHTML = response; // added the response to the div element
    let as = div.getElementsByTagName("a");
    songs = [] // array to store song 

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        // this if with only push that a's which ends with .mp3 i.e songs 
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the song in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let folderName = folder.split("/").pop(); // Extract only the folder name to show the artist name in your library
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img src="./img/song.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div><strong>${folderName}</strong></div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class = "invert" src="./img/play.svg" alt="">
            </div>
        </li> `;
    }

    // attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

        })
    })
    return songs;
}

const playmusic = (track, pause = false) => {

    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = "./img/pause.svg";
    } else {
        play.src = "./img/play.svg"; // Ensure it starts with play icon
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Songs`);
    let response = await a.text();
    let div = document.createElement('div'); // created a div element using javascript
    div.innerHTML = response; // added the response to the div element 
    let anchors = div.getElementsByTagName("a");

    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) { 
            let folder = e.href.split("/").slice(-2)[0];
            console.log("Fetching from:", `http://127.0.0.1:3000/Songs/${folder}/Info.json`);

            //get metadata of folder 
            let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/Info.json`);
            let response = await a.json();
            // console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder= "${folder}" class="card">
                <div class="play"> 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50px" height="50px"
                        fill="black">
                        <circle cx="12" cy="12" r="10" fill="#1cd760" />
                        <path
                            d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                            fill="black" />
                    </svg>
                </div>
                <img src="/Songs/${folder}/cover.jpg" alt="">
                <h3>${response.title}</h3>
                <p>${response.description}</p>  
            </div>`
        }
    }
    // event listner for card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // bye using current target property it will target whole card not the individual elements of the card
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        })
    });   


}
async function main() {

    await getSongs("Songs/kendrik");
    playmusic(songs[0], true);

    //display all the albums on the page
    displayAlbums();

    // attached an event listner to play,pause,next and previous song
    play.addEventListener("click", ()=> {          /*directly used play because we have created ID on the image in html file */
        if (currentsong.paused) {
            currentsong.play()
            play.src = "./img/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "./img/play.svg"
        }
    })

    //eventlistner for time
    currentsong.addEventListener("timeupdate", () => {
        //console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        //to run he circle on seekbar
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentsong.currentTime = ((currentsong.duration) * percent) / 100
        })
    })
    //event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //event listner for cross button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //event listner for next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        //console.log(songs);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }

    })
    //event listner for previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    })

    // event listner for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //console.log(e, e.target, e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    // event listner for mute button
    document.querySelector(".volume>img").addEventListener("click", e=>{
        //console.log(e.target);
        if(e.target.src.includes("/img/volume.svg")){
            e.target.src = e.target.src.replace( "/img/volume.svg","/img/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src = e.target.src.replace( "/img/mute.svg","/img/volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 2;
        }
    })


}

main();
