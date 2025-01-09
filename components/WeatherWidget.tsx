"use client";

import React, { useEffect, useState } from "react";
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog, WiThermometer, WiStrongWind } from "react-icons/wi";

interface WeatherData {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
  };
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Conversion Functions
  const convertCtoF = (tempC: number) => (tempC * 9) / 5 + 32;
  const convertKphToMph = (kph: number) => kph * 0.621371;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/Weather?location=93555");
        if (!res.ok) {
          throw new Error("Failed to fetch weather data.");
        }
        const data = await res.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <div className="text-center">Loading weather...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md space-x-8">
      {/* Temperature */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <WiThermometer className="text-red-500 text-4xl" />
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {weather.current.temp_c}°C / {convertCtoF(weather.current.temp_c).toFixed(1)}°F
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">Temperature</p>
      </div>
      
      {/* Wind Speed */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <WiStrongWind className="text-blue-500 text-4xl" />
          <div className="text-lg text-gray-800 dark:text-gray-100">
            {weather.current.wind_kph.toFixed(1)} kph / {convertKphToMph(weather.current.wind_kph).toFixed(1)} mph
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">Wind Speed</p>
      </div>

      {/* Weather Condition */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <img
            src={`https:${weather.current.condition.icon}`}
            alt={weather.current.condition.text}
            className="w-10 h-10"
          />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {weather.current.condition.text}
          </p>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">Condition</p>
      </div>
    </div>
  );
};

export default WeatherWidget;
