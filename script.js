// console.log("weather")

// created var elements for use in script file
var search = $("#search-bar");
var searchBtn = $("#search-btn");
var searchHistory = $("#search-history");
var weather = $("#weather");

var apiKey = "0d0d834e4f8487b32f678b137705007b";
var currentWeatherUrl;
var forecastUrl;
var storedSearches = [];

var tempStoredSearches = localStorage.getItem("storedSearches");
if (tempStoredSearches != null)
    storedSearches = tempStoredSearches.split(",");

var today = new Date();
var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear()


function populateCurrentWeather() {

    $.ajax({
        url: currentWeatherUrl,
        method: "GET"
    }).then(function(response) {

        var currentWeatherObj = {
            location: response.name,
            date: currentDate,
            weatherIcon: response.weather[0].icon,
            temperature: Math.round(response.main.temp),
            humidity: response.main.humidity,
            wind: response.wind.speed,
            uvIndex: 0,
            uvIntensity: ""
        }

        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var currentUvUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;
        // ajax request method to obtain data from openweather
        $.ajax({
            url: currentUvUrl,
            method: "GET"
        }).then(function(response2) {
            // puts data/content in the div and appends it to the webpage and uv backgrond color changes if uv index is low or high
            currentWeatherObj.uvIndex = response2.value;
            if (currentWeatherObj.uvIndex >= 8)
                currentWeatherObj.uvIntensity = "severe";
            else if (currentWeatherObj.uvIndex < 3)
                currentWeatherObj.uvIntensity = "favorable";
            else
                currentWeatherObj.uvIntensity = "moderate";

            var currentWeatherCard = $('<div class="card"><div class="card-body"><h5 class="card-title">' + currentWeatherObj.location + ' (' + currentWeatherObj.date + ') ' +
                '<span class="badge badge-primary"><img id="weather-icon" src="http://openweathermap.org/img/wn/' + currentWeatherObj.weatherIcon + '@2x.png"></span></h5>' +
                '<p class="card-text">Temperature: ' + currentWeatherObj.temperature + ' °F</p>' +
                '<p class="card-text">Humidity: ' + currentWeatherObj.humidity + '%</p>' +
                '<p class="card-text">Wind Speed: ' + currentWeatherObj.wind + ' MPH</p>' +
                '<p class="card-text">UV Index: <span class="badge badge-secondary ' + currentWeatherObj.uvIntensity + '">' + currentWeatherObj.uvIndex + '</span>')
            $("#weather-col").append(currentWeatherCard);
        });

        renderStoredSearches();

    });
}

function populateWeatherForecast() {

    var fiveDayForecastArray = [];

    //ajax call to request and pull data from open weather and append it to the rows for the 5 day forecast
    $.ajax({
        url: forecastUrl,
        method: "GET"
    }).then(function(response) {

        console.log(response);
        var temporaryForecastObj;
        for (var i = 4; i < response.list.length; i += 8) {
            temporaryForecastObj = {
                date: response.list[i].dt_txt.split(" ")[0],
                weatherIcon: response.list[i].weather[0].icon,
                temperature: Math.round(response.list[i].main.temp),
                humidity: response.list[i].main.humidity
            };
            fiveDayForecastArray.push(temporaryForecastObj);
        }

        for (var i = 0; i < fiveDayForecastArray.length; i++) {
            fiveDayForecastArray[i].date = formatDates(fiveDayForecastArray[i].date);
        }

        var forecastHeader = $('<h5>5-Day Weather Forecast:</h5>');
        $("#forecast-header").append(forecastHeader);

        for (var i = 0; i < fiveDayForecastArray.length; i++) {
            var forecastCard = $('<div class="col-lg-2 col-sm-3 mb-1"><span class="badge badge-primary"><h5>' + fiveDayForecastArray[i].date + '</h5>' +
                '<p><img class="w-100" src="http://openweathermap.org/img/wn/' + fiveDayForecastArray[i].weatherIcon + '@2x.png"></p>' +
                '<p>Temp: ' + fiveDayForecastArray[i].temperature + '°F</p>' +
                '<p>Humidity: ' + fiveDayForecastArray[i].humidity + '%</p>' +
                '<span></div>');
            $("#forecast-row").append(forecastCard);
        }


    });
}

// if ststament that runs to populate 5 day forecast and saves it to local storage

function renderStoredSearches() {

    $("#search-history").empty();

    if ($("#search-bar").val() != "") {
        if (storedSearches.indexOf($("#search-bar").val()) != -1) {
            storedSearches.splice(storedSearches.indexOf($("#search-bar").val()), 1)
        }
        storedSearches.unshift($("#search-bar").val());
    }

    localStorage.setItem("storedSearches", storedSearches);

    for (var i = 0; i < storedSearches.length; i++) {
        var newListItem = $('<li class="list-group-item">' + storedSearches[i] + '</li>');
        $("#search-history").append(newListItem);
    }

    $("li").on("click", function() {
        $("#search-bar").val($(target).text());
        searchBtn.click();
    });
}

function formatDates(data) {
    var dateArray = data.split("-");
    var formattedDate = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
    return formattedDate
}

searchBtn.on("click", function() {

    currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + search.val() + "&units=imperial&appid=" + apiKey;

    forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + search.val() + "&units=imperial&appid=" + apiKey;

    $("#weather-col").empty();
    $("#forecast-header").empty();
    $("#forecast-row").empty();

    populateCurrentWeather();
    populateWeatherForecast();
});