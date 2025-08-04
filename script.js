const apiKey = `f08f248d4a787d8f263ac80b1d7807c4`;

const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-text');
const tempTxt = document.querySelector('.temp-txt');
const coditionTxt = document.querySelector('.conditions-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDataTxt = document.querySelector('.current-date-txt');

const forecastItemContainer = document.querySelector('.forecast-items-container')

// Search button click
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim().toLowerCase();
    if (city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
});

// Enter key press
cityInput.addEventListener('keydown', (event) => {
    const city = cityInput.value.trim().toLowerCase();
    if (event.key === 'Enter' && city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
});

// Fetch weather data
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

// Get correct weather icon based on weather ID
function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

// Format and return current date
function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

// Update DOM with weather data
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    console.log(weatherData); // For debugging

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
        sys: { country: countryCode, sunrise, sunset },
        dt
    } = weatherData;

    // 🌞 DAY / 🌙 NIGHT DETECTION
    const isDay = dt >= sunrise && dt < sunset;
    document.body.style.backgroundImage = isDay
        ? "url('assets/bg.jpeg')"
        : "url('assets/bg2.webp')";

    countryTxt.textContent = `${country}, ${countryCode}`;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    coditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity} %`;
    windValueTxt.textContent = `${Math.round(speed * 3.6)} Km/h`; // m/s → km/h
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);

    currentDataTxt.textContent = getCurrentDate();

    showDisplaySection(weatherInfoSection);
}


async function updateForecastsInfo(city){
    const forecastData = await getFetchData('forecast', city)

    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]
    forecastItemContainer.innerHTML = ' '
    forecastData.list.forEach(forecastWeather =>{
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate))
        updateForecastItems(forecastWeather)

    })
    
    

}

function updateForecastItems(weatherData){
    console.log(weatherData)
    const{
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    }= weatherData

    const dateTaken = new Date(date)
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }

    const dateResult = dateTaken.toLocaleDateString('en-US',dateOption )

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}"  class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `

    forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem)



}

// Show one section and hide others
function showDisplaySection(sectionToShow) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(section => {
        section.style.display = 'none';
    });
    sectionToShow.style.display = 'flex';
}
