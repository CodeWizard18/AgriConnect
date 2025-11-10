import React, { useEffect, useState } from 'react';
import { Cloud, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { api } from '../api/dummyApi';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  alert?: string;
}

interface WeatherCardProps {
  city?: string;
  state?: string;
  pincode?: string;
}

export function WeatherCard({ city, state, pincode }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // ✅ Pass city, state, and pincode as an object (not just string)
        const data = await api.getWeather({ city, state, pincode });
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, state, pincode]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-md p-6 border border-blue-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Cloud className="h-5 w-5 mr-2 text-blue-600" />
          Weather Alert
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">{weather.location}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Thermometer className="h-5 w-5 text-orange-500 mr-2" />
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{weather.temperature}°C</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">Temperature</p>
          </div>
        </div>

        <div className="flex items-center">
          <Droplets className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">{weather.humidity}%</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
          </div>
        </div>

        <div className="flex items-center">
          <Wind className="h-5 w-5 text-gray-500 mr-2" />
          <div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">{weather.windSpeed} km/h</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">Wind Speed</p>
          </div>
        </div>

        <div className="flex items-center">
          <Cloud className="h-5 w-5 text-gray-500 mr-2" />
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{weather.condition}</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">Condition</p>
          </div>
        </div>
      </div>

      {weather.alert && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{weather.alert}</p>
          </div>
        </div>
      )}
    </div>
  );
}
