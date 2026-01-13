const { useState, useEffect } = React;
const apikey = "PASTE_YOUR_API_KEY";

function Weather() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
        fetchWeatherData(url);
      }, (err) => {
        setLoading(false);
        setError("Location access denied. Please enter a city manually.");
      });
    }
  }, []);

  const fetchWeatherData = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
      const data = response.data;
      setWeatherData(data);
      fetchForecast(data.name);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeatherData(null);
      setError("City not found or API error. Please try again.");
      setLoading(false);
    }
  };

  const searchByCity = () => {
    if (city.trim() === "") {
      setError("Please enter a city name.");
      return;
    }
    const urlsearch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;
    fetchWeatherData(urlsearch);
    setCity("");
  };

  const fetchForecast = async (cityName) => {
    try {
      const urlcast = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apikey}`;
      const response = await axios.get(urlcast);
      setForecast(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      setForecast(null);
      setLoading(false);
    }
  };

  const getCelsius = (kelvin) => Math.floor(kelvin - 273.15);

  return (
    <div>
      <div className="header">
        <h1>SkyWatch : WEATHER Monitoring Dashboard</h1>
        <div>
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchByCity();
              }
            }}
          />
          <button onClick={searchByCity}>Search</button>
        </div>
      </div>

      <main>
        {loading && <div className="loading-message">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && weatherData && (
          <div className="weather">
            <h2>
              {weatherData.name}, {weatherData.sys.country}
            </h2>
            <div className="temp-box">
              <p>{getCelsius(weatherData.main.temp)} °C</p>
            </div>
            <span>{weatherData.weather[0].description}</span>
            <div>
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                alt="weather icon"
              />
            </div>
          </div>
        )}

        {!loading && forecast && (
          <>
            <div className="forecast">
              <p className="cast-header">Upcoming forecast</p>
              <div className="forecast-list templist">
                {forecast.list.slice(0, 5).map((f, idx) => {
                  const date = new Date(f.dt * 1000);
                  return (
                    <div key={idx} className="next">
                      <div>
                        <p className="time">
                          {date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p>
                          {getCelsius(f.main.temp_max)} °C /{" "}
                          {getCelsius(f.main.temp_min)} °C
                        </p>
                      </div>
                      <p className="desc">{f.weather[0].description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="forecast-2">
              <p className="cast-header">Next 4 days forecast</p>
              <div className="forecast-list-2 weekF">
                {forecast.list
                  .filter((_, i) => i % 8 === 0)
                  .slice(1, 5)
                  .map((f, idx) => {
                    const date = new Date(f.dt * 1000);
                    return (
                      <div key={idx} className="dayF">
                        <p className="date">{date.toDateString()}</p>
                        <p>
                          {getCelsius(f.main.temp_max)} °C /{" "}
                          {getCelsius(f.main.temp_min)} °C
                        </p>
                        <p className="desc">{f.weather[0].description}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
