import time
import httpx
from typing import Dict, Any
from app.core.config import settings

class ExternalWeatherService:
    """
    Third-Party API Integration:
    Connects to Open-Meteo Weather API to supply atmospheric crime-scene & support
    site weather advisories for Blackwood Manor.
    Features:
    - Configurable timeout (WEATHER_API_TIMEOUT)
    - Full error, timeout, and response validation handling
    - Graceful offline fallback cache
    """
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    # Blackwood Manor setting (Surrey / Kent outskirts, UK)
    LATITUDE = 51.27
    LONGITUDE = 0.52

    FALLBACK_DATA = {
        "status": "fallback",
        "source": "Cached Historical Advisory (Offline Mode)",
        "location": "Blackwood Manor Estate, North Grounds",
        "temperature_c": 13.8,
        "apparent_temperature_c": 11.5,
        "condition": "Continuous Rain & Heavy Mist",
        "precipitation_mm": 4.6,
        "humidity_percent": 94,
        "wind_speed_kmh": 22.4,
        "advisory": "Wet surface conditions confirmed. Footprints on the stone terrace remain prone to erosion.",
        "latency_ms": 0,
        "is_live": False
    }

    @classmethod
    async def get_weather_advisory(cls, timeout: float = None) -> Dict[str, Any]:
        req_timeout = timeout if timeout is not None else settings.WEATHER_API_TIMEOUT
        start_time = time.time()

        params = {
            "latitude": cls.LATITUDE,
            "longitude": cls.LONGITUDE,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=req_timeout) as client:
                resp = await client.get(cls.BASE_URL, params=params)
                elapsed = int((time.time() - start_time) * 1000)

                if resp.status_code == 200:
                    data = resp.json()
                    current = data.get("current", {})
                    temp = current.get("temperature_2m", 14.0)
                    app_temp = current.get("apparent_temperature", 12.0)
                    precip = current.get("precipitation", 0.0)
                    humidity = current.get("relative_humidity_2m", 85)
                    wind = current.get("wind_speed_10m", 15.0)

                    condition = "Overcast & Drizzling" if precip > 0 else "Cloudy & Damp"
                    advisory = (
                        "Heavy rain active. Exterior terrace shoe prints match moisture readings."
                        if precip > 0.5
                        else "High humidity. Forensic preservation protocol recommended."
                    )

                    return {
                        "status": "online",
                        "source": "Open-Meteo Meteorological API",
                        "location": "Blackwood Manor Estate (Live Telemetry)",
                        "temperature_c": temp,
                        "apparent_temperature_c": app_temp,
                        "condition": condition,
                        "precipitation_mm": precip,
                        "humidity_percent": humidity,
                        "wind_speed_kmh": wind,
                        "advisory": advisory,
                        "latency_ms": elapsed,
                        "is_live": True
                    }
                else:
                    print(f"[WeatherService] Open-Meteo returned HTTP {resp.status_code}. Using fallback.")
        except httpx.TimeoutException:
            print(f"[WeatherService] Request timed out after {req_timeout}s. Using fallback.")
        except Exception as e:
            print(f"[WeatherService] Request failed ({e}). Using fallback.")

        # Graceful fallback return
        fallback = cls.FALLBACK_DATA.copy()
        fallback["latency_ms"] = int((time.time() - start_time) * 1000)
        return fallback

weather_service = ExternalWeatherService()
