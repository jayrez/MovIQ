// data.js

const movieList = [
        { prompt: "Businessman uses capitalism to outsmart genocide.", answer: "Schindler's List" },
        { prompt: "Shy woman accidentally turns her hometown into a snowglobe.", answer: "Frozen" },
        { prompt: "Neurotic dad crosses the ocean to rescue his kidnapped son, makes unlikely friends.", answer: "Finding Nemo" },
        { prompt: "Egomaniac builds fancy suit to avoid talking about his feelings.", answer: "Iron Man" },
        { prompt: "Orphan with too much money picks fights with people in makeup.", answer: "The Dark Knight" },
        { prompt: "Teen breaks every school rule, wins house points anyway.", answer: "Harry Potter series" },
        { prompt: "Girl takes a nap, lets some dude handle her problems with mouth-to-mouth.", answer: "Sleeping Beauty" },
        { prompt: "Petty genius invents website to get back at ex, accidentally changes the world.", answer: "The Social Network" },
        { prompt: "Guy trades physics for family and never looks back.", answer: "Fast & Furious series" },
        { prompt: "Teen volunteers for a murder game, gets famous, and starts a rebellion.", answer: "The Hunger Games" },
        { prompt: "Team effort fails because one guy didn’t aim for the head.", answer: "Avengers: Infinity War" },
        { prompt: "Girl joins boyfriend’s pagan family, they kill her friends, she gets a flower crown.", answer: "Midsommar" },
        { prompt: "Grumpy old man floats away from his problems, drags child with him.", answer: "Up" },
        { prompt: "Man kisses unconscious stranger in the woods, is somehow the hero.", answer: "Snow White and the Seven Dwarfs" },
        { prompt: "Teenager ditches her family and voice for a guy she hasn’t met.", answer: "The Little Mermaid" },
        { prompt: "Kid travels back in time and accidentally makes his mom thirsty.", answer: "Back to the Future" },
        { prompt: "Man gets angry, changes color, and smashes everything until he's calm again.", answer: "The Incredible Hulk" },
        { prompt: "Guy finds out his dad is space Hitler.", answer: "Star Wars: The Empire Strikes Back" },
        { prompt: "Prison inmates with superpowers are hired to clean up the government's mess.", answer: "Suicide Squad" },
        { prompt: "Man refuses to grow up and lets his stuffed bear ruin his relationship.", answer: "Ted" },
        { prompt: "Kid hides space alien from feds using candy and a blanket.", answer: "E.T. the Extra-Terrestrial" },
        { prompt: "Woman gets kidnapped by monster, falls in love, and blames it on a rose.", answer: "Beauty and the Beast" },
        { prompt: "Young prince runs away from home, gets life advice from stoners.", answer: "The Lion King" },
        { prompt: "Board game traps kids in a jungle dimension until someone rolls a 5 or 8.", answer: "Jumanji" },
        { prompt: "Guy survives a plane crash by talking to a volleyball for years.", answer: "Cast Away" },
        { prompt: "Animals solve crime while tackling racial profiling and wearing minimal clothing.", answer: "Zootopia" }
      
]
  // Pick a random movie
  const gameData = movieList[Math.floor(Math.random() * movieList.length)];
  