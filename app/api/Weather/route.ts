import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json(
      { error: "Location query parameter is required." },
      { status: 400 }
    );
  }

  try {
    const API_KEY = process.env.WEATHER_API_KEY; // Ensure this is set in your Vercel environment variables

    // Determine if the location is coordinates or a city name
    const isCoordinates = location.includes(",");
    const weatherApiUrl = isCoordinates
      ? `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`
      : `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
          location
        )}`;

    const response = await fetch(weatherApiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to fetch weather data." },
        { status: response.status }
      );
    }

    const weatherData = await response.json();
    return NextResponse.json(weatherData);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}