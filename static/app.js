const jokeText = document.getElementById("joke-text");
const newJokeBtn = document.getElementById("new-joke-btn");

let currentJoke = null;

newJokeBtn.addEventListener("click", fetchJoke);

async function fetchJoke() {
  try {
    jokeText.textContent = "The funniest joke is coming!!";
    console.log("Fetching new joke...");
    const response = await fetch("/api/new-joke"); // throws network error

    console.log("Response status: ", response.status); // checks HTTP error
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // throws parsing error
    console.log("New joke data: ", data);
    currentJoke = data;
    jokeText.textContent = data.joke;
  } catch (error) {
    console.error("Error fetching new joke: ", error);
    jokeText.textContent = "Not your day to be punny. Try again later!";
  }
}
