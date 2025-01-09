"use client";

import React, { useEffect, useState } from "react";
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog, WiThermometer } from "react-icons/wi";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/Weather?location=93555"); // Updated to match the API route casing
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

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("Sunny") || condition.includes("Clear")) {
      return <WiDaySunny className="text-yellow-500 text-4xl" />;
    }
    if (condition.includes("Cloudy")) {
      return <WiCloudy className="text-gray-400 text-4xl" />;
    }
    if (condition.includes("Rain")) {
      return <WiRain className="text-blue-500 text-4xl" />;
    }
    if (condition.includes("Snow")) {
      return <WiSnow className="text-blue-300 text-4xl" />;
    }
    if (condition.includes("Fog") || condition.includes("Mist")) {
      return <WiFog className="text-gray-300 text-4xl" />;
    }
    return <WiThermometer className="text-red-500 text-4xl" />;
  };

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
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
        {weather.location.name}, {weather.location.region}, {weather.location.country}
      </h2>
      <div className="flex items-center space-x-4">
        {/* Use the condition text to determine the icon */}
        {getWeatherIcon(weather.current.condition.text)}
        <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {weather.current.temp_c}°C
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {weather.current.condition.text}
      </p>
      {/* Use the icon field for additional customization */}
      <img
        src={`https:${weather.current.condition.icon}`}
        alt={weather.current.condition.text}
        className="w-10 h-10"
      />
    </div>
  );
};

export default WeatherWidget;
