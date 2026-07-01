// data.js

const movieList = [
    { prompt: "Orphaned siblings get passed around like bad luck trading cards.", answer: "Lemony Snicket's A Series of Unfortunate Events" },
    { prompt: "A group of friends embark on a journey to find the legendary Amulet of Zoltar.", answer: "The Goonies" }
];

// Pick a random movie
const gameData = movieList[Math.floor(Math.random() * movieList.length)];
