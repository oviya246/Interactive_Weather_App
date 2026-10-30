const apiKey = "106e38fec2222faa265073a7d3267658";

let currentCity = "";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const refreshBtn = document.getElementById("refreshBtn");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");

const forecast = document.getElementById("forecast");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const darkModeBtn = document.getElementById("darkModeBtn");


// Search button

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    getWeather(city);

});


// Enter key search

cityInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {

        searchBtn.click();

    }

});


// Get weather

async function getWeather(city) {

    showLoading(true);

    clearError();

    try {

        const currentUrl =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const currentResponse =
            await fetch(currentUrl);

        if (!currentResponse.ok) {

            throw new Error(
                "City not found"
            );

        }

        const data =
            await currentResponse.json();

        currentCity = data.name;

        displayWeather(data);

        await getForecast(data.coord.lat, data.coord.lon);

        updateBackground(data.weather[0].main);

    }

    catch (error) {

        showError(
            "Unable to find this city. Please check the city name."
        );

        forecast.innerHTML = "";

    }

    finally {

        showLoading(false);

    }

}


// Display current weather

function displayWeather(data) {

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    description.textContent =
        data.weather[0].description;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} m/s`;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;


    // Real weather icon

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

}


// 5-day forecast

async function getForecast(lat, lon) {

    const url =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Forecast unavailable"
        );

    }

    const data =
        await response.json();

    displayForecast(data.list);

}


// Display forecast

function displayForecast(list) {

    forecast.innerHTML = "";

    // Select one forecast for each day

    const dailyForecast = [];

    list.forEach(item => {

        const date =
            new Date(item.dt * 1000);

        const day =
            date.toLocaleDateString(
                "en-US",
                { weekday: "short" }
            );

        if (
            !dailyForecast.some(
                item => item.day === day
            )
        ) {

            dailyForecast.push({

                day: day,

                temp:
                    Math.round(
                        item.main.temp
                    ),

                icon:
                    item.weather[0].icon,

                description:
                    item.weather[0].description

            });

        }

    });


    // Display only 5 days

    dailyForecast
        .slice(0, 5)
        .forEach(day => {

            const card =
                document.createElement("div");

            card.className =
                "forecast-card";

            card.innerHTML = `

                <p>${day.day}</p>

                <img
                    src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                    alt="${day.description}"
                >

                <strong>
                    ${day.temp}°C
                </strong>

            `;

            forecast.appendChild(card);

        });

}


// Current location

locationBtn.addEventListener(
    "click",
    getCurrentLocation
);


function getCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;

    }

    showLoading(true);

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            try {

                const url =
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

                const response =
                    await fetch(url);

                if (!response.ok) {

                    throw new Error();

                }

                const data =
                    await response.json();

                currentCity = data.name;

                displayWeather(data);

                await getForecast(
                    lat,
                    lon
                );

                updateBackground(
                    data.weather[0].main
                );

            }

            catch {

                showError(
                    "Unable to get weather for your location."
                );

            }

            finally {

                showLoading(false);

            }

        },

        () => {

            showLoading(false);

            showError(
                "Location permission was denied."
            );

        }

    );

}


// Refresh weather

refreshBtn.addEventListener(
    "click",
    () => {

        if (currentCity !== "") {

            getWeather(currentCity);

        }

    }
);


// Dynamic background

function updateBackground(weather) {

    if (weather === "Clear") {

        document.body.style.background =
            "linear-gradient(135deg, #f6d365, #fda085)";

    }

    else if (
        weather === "Clouds"
    ) {

        document.body.style.background =
            "linear-gradient(135deg, #bdc3c7, #2c3e50)";

    }

    else if (
        weather === "Rain" ||
        weather === "Drizzle"
    ) {

        document.body.style.background =
            "linear-gradient(135deg, #4facfe, #00f2fe)";

    }

    else if (
        weather === "Thunderstorm"
    ) {

        document.body.style.background =
            "linear-gradient(135deg, #434343, #000000)";

    }

    else if (
        weather === "Snow"
    ) {

        document.body.style.background =
            "linear-gradient(135deg, #e6e9f0, #eef1f5)";

    }

    else {

        document.body.style.background =
            "linear-gradient(135deg, #74ebd5, #9face6)";

    }

}


// Loading

function showLoading(show) {

    if (show) {

        loading.classList.remove(
            "hidden"
        );

    }

    else {

        loading.classList.add(
            "hidden"
        );

    }

}


// Error

function showError(message) {

    errorMessage.textContent =
        message;

}


function clearError() {

    errorMessage.textContent = "";

}


// Dark mode

darkModeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );

    }
);