"use client";

import React, { useEffect, useState } from "react";
import { WiThermometer, WiStrongWind } from "react-icons/wi";

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
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <WiThermometer className="text-red-500 text-4xl" />
        <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {weather.current.temp_c}°C
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-2">
        <WiStrongWind className="text-blue-500 text-4xl" />
        <div className="text-lg text-gray-800 dark:text-gray-100">
          Wind Speed: {weather.current.wind_kph} kph
        </div>
      </div>
      <div className="flex items-center mt-4">
        <img
          src={`https:${weather.current.condition.icon}`}
          alt={weather.current.condition.text}
          className="w-10 h-10"
        />
        <p className="ml-2 text-lg text-gray-700 dark:text-gray-300">
          {weather.current.condition.text}
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget;
