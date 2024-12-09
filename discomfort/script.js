
// Temperature Conversion
function toCelsius(tValue) {
    return (tValue - 32.0) * 5.0 / 9.0
}

function toFahrenheit(tValue) {
    return tValue * 9.0 / 5.0 + 32.0;
}

function calcHI(tempInF, humValue) {
    //Heat Index Equation and constants from https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
    //  The computation of the heat index is a refinement of a result obtained by multiple regression analysis carried out by Lans P. Rothfusz and described in a 1990 National Weather Service (NWS) Technical Attachment (SR 90-23).  The regression equation of Rothfusz is
    //    HI = -42.379 + 2.04901523*T + 10.14333127*RH - .22475541*T*RH - .00683783*T*T - .05481717*RH*RH + .00122874*T*T*RH + .00085282*T*RH*RH - .00000199*T*T*RH*RH
    //  where T is temperature in degrees F and RH is relative humidity in percent.  HI is the heat index expressed as an apparent temperature in degrees F.
    //  If the RH is less than 13% and the temperature is between 80 and 112 degrees F, then the following adjustment is subtracted from HI:
    //    ADJUSTMENT = [(13-RH)/4]*SQRT{[17-ABS(T-95.)]/17}
    //  where ABS and SQRT are the absolute value and square root functions, respectively.
    //  On the other hand, if the RH is greater than 85% and the temperature is between 80 and 87 degrees F, then the following adjustment is added to HI:
    //    ADJUSTMENT = [(RH-85)/10] * [(87-T)/5]
    //  The Rothfusz regression is not appropriate when conditions of temperature and humidity warrant a heat index value below about 80 degrees F. In those cases, a simpler formula is applied to calculate values consistent with Steadman's results:
    //    HI = 0.5 * {T + 61.0 + [(T-68.0)*1.2] + (RH*0.094)}
    //  In practice, the simple formula is computed first and the result averaged with the temperature. If this heat index value is 80 degrees F or higher, the full regression equation along with any adjustment as described above is applied.
    //  The Rothfusz regression is not valid for extreme temperature and relative humidity conditions beyond the range of data considered by Steadman.

    // Compute HI using Farenheit
    const T = tempInF
    const RH = humValue
    let cHI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))
    if (cHI >= 80.0) {
        cHI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH
        if (RH < 13.0) {
            cHI = cHI - ((13.0 - RH) / 4.0) * Math.sqrt((17.0 - Math.abs(T - 95.0)) / 17.0)
        } else if (RH > 85.0 && T >= 80.0 && T <= 87.0) {
            cHI = cHI + ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
        }
    }
    return cHI
}

function calcDI(tempInC, humValue) {
    return parseFloat((tempInC - 0.55 * (1 - 0.01 * humValue) * (tempInC - 14.5)).toFixed(2))
}

const cache = {};

async function fetchWeather({latitude, longitude}) {
    const params = {
        latitude,
        longitude,
        "current": ["temperature_2m", "relative_humidity_2m"],
        "forecast_days": 1
    };
    console.log(params);
    
    const url = "https://api.open-meteo.com/v1/forecast?" + new URLSearchParams(params).toString();
    const response = await fetch(url);
    const payload = await response.json();

    return {
        temperature: payload.current.temperature_2m,
        humidity: payload.current.relative_humidity_2m
    }
}

async function render({latitude, longitude}) {
    if (!cache[JSON.stringify({latitude, longitude})]) {
        cache[JSON.stringify({latitude, longitude})] = await fetchWeather({latitude, longitude});        
    }

    const {temperature, humidity} = cache[JSON.stringify({latitude, longitude})];

    const tempSensorStatus = temperature;
    const humSensorStatus = humidity;

    document.getElementById("temp").innerText = tempSensorStatus;
    document.getElementById("humidity").innerText = humSensorStatus;

    const tempSensorUnit = "°C"
    const tempSensorUnitInF = tempSensorUnit === '°F'
    
    const tempCelsiusValue = tempSensorUnitInF ? toCelsius(tempSensorStatus) : tempSensorStatus
    const tempFarenheitValue = tempSensorUnitInF ? tempSensorStatus : toFahrenheit(tempSensorStatus)
    
    let HI = calcHI(tempFarenheitValue, humSensorStatus)
    
    // Convert HI back to original unit_of_measurement from sensor
    HI = tempSensorUnitInF ? HI : toCelsius(HI)
    HI = parseFloat(HI.toFixed(2))
    
    // Compute DI using Celsius
    const DI = calcDI(tempCelsiusValue, humSensorStatus)
    
    document.getElementById("di").innerText = DI;
    document.getElementById("hi").innerText = HI;    
}

const cities = {
    shantou: {
        "latitude": 23.3681,
        "longitude": 116.7148,
    },
    amsterdam: {
        "latitude": 52.377956,
        "longitude": 4.897070,
    }
}

render(cities.shantou);

document.getElementById("city").addEventListener("change", ev => {
        const city = ev.target.value;
        render(cities[city])
    })


function calcRange(target_start, target_end, current_start, current_end, value) {
    const value_target = Number(target_start + ((target_end - target_start) / (current_end - current_start)) * (value - current_start));
    if (value_target > 100) {
        return 100;
    } else if (value_target < 0) {
        return 0;
    } else {
        return value_target;
    }
}