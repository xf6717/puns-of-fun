const jokeText = document.getElementById("joke-text");
const newJokeBtn = document.getElementById("new-joke-btn");
const ratingBtns = document.querySelectorAll(".rate-btn");

let currentJoke = null;
let chart = null;

newJokeBtn.addEventListener("click", fetchJoke);
ratingBtns.forEach((btn) => btn.addEventListener("click", rateJoke));

async function fetchJoke() {
  try {
    jokeText.textContent = "The funniest joke is coming!!";
    console.log("Fetching new joke...");
    const response = await fetch("/api/new-joke"); // throws network error
    console.log("Response status: ", response.status);
    if (!response.ok) {
      // check HTTP error
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

async function rateJoke(event) {
  if (!currentJoke) return;
  //console.log("Event target data: ", event.target.dataset);

  const rating = Number.parseInt(event.target.dataset.rating); // Get the rating from the clicked element
  try {
    const response = await fetch("/api/rate", {
      // Send a POST request to the '/api/rate' endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set the request content type to JSON
      },
      body: JSON.stringify({
        id: currentJoke.id,
        joke: currentJoke.joke,
        rating: rating,
      }),
    });
    //console.log("this is response from flask: ", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Throw error if response status is not OK
    }

    console.log("Joke rated successfully");
    fetchJoke(); // Display a new joke automatically after rating
  } catch (error) {
    console.error("Error rating joke:", error);
  }
}
