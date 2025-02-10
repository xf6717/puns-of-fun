const jokeText = document.getElementById("joke-text");
const newJokeBtn = document.getElementById("new-joke-btn");
const ratingBtns = document.querySelectorAll(".rate-btn");
const jokeList = document.getElementById("joke-list");
const ratingsChart = document.getElementById("ratings-chart");

let currentJoke = null;
let chart = null;

newJokeBtn.addEventListener("click", fetchJoke);
ratingBtns.forEach((btn) => btn.addEventListener("click", rateJoke));

async function fetchJoke() {
  try {
    jokeText.textContent = "Loading...";
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
    displayJokeList(); // update Saved Jokes automatically after rating
    displayChart(); // udate donut chart automatically after rating
  } catch (error) {
    console.error("Error rating joke:", error);
  }
}

async function displayJokeList() {
  try {
    const response = await fetch("/api/joke-list");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jokes = await response.json();

    // display all the retrieved jokes
    jokeList.innerHTML = jokes
      .reverse() // display the newest jokes first
      .map(
        (joke) => `
            <li data-colorcode="${joke.rating}">
                <p>${joke.joke}</p>
                <small>Rating: ${joke.rating}/5</small>
            </li>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error updating joke list:", error);
  }
}

async function displayChart() {
  try {
    const response = await fetch("/api/joke-list");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jokes = await response.json();
    const ratings = [0, 0, 0, 0, 0];

    jokes.forEach((joke) => {
      ratings[joke.rating - 1]++;
    });

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ratingsChart, {
      type: "doughnut",
      data: {
        labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
        datasets: [
          {
            label: "Joke Ratings",
            data: ratings,
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)", // color code each rating
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(153, 102, 255, 0.8)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 4,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "30%",
      },
    });
  } catch (error) {
    console.error("Error updating chart:", error);
  }
}

// Initial load
fetchJoke();
displayJokeList();
displayChart();
