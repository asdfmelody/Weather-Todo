async function setRenderBackground() {
  //   const result = await axios.get("https://picsum.photos/1280/720");
  //   console.log(result);
  // 무조건 axios에서 넘어오는 값들은 data안에 담긴다
  //data=result.data;
  const { data } = await axios.get("https://picsum.photos/1280/720", {
    // blob 속성은 이미지, 속성, 비디오등 멀티미디어 데이터를 다룰때 사용
    responseType: "blob",
  });
  //   console.log(data);

  //이미지를 가져왔다
  // 해당 파일을 https://picsum.photos/1280/720 를 들어가면 나오는 이미지처럼
  // 일종의 image에 대한 url 만들어줘야한다
  // url.createObjectURL

  //현재 페이지에서만 유효한 임시 url
  const imageUrl = URL.createObjectURL(data);
  //console.log(imageUrl);
  document.querySelector("body").style.backgroundImage = `url(${imageUrl})`;
}

//시계 파트
function setTime() {
  const timer = document.querySelector(".timer");
  const timerContent = document.querySelector(".timer-content");
  setInterval(() => {
    const date = new Date();
    // console.log(date);
    // console.log(date.getHours());
    // console.log(date.getMinutes());
    // console.log(date.getSeconds());
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    timer.textContent = `${hours}:${minutes}:${seconds}`;

    if ((hours > 6) & (hours < 12))
      timerContent.textContent = "Good Morning, Heesun";
    else if (hours < 18) timerContent.textContent = "Good Afternoon, Heesun";
    else if (hours < 24) timerContent.textContent = "Good Evening, Heesun";
    else timerContent.textContent = "Good Night, Heesun";
  }, 1000);
}

function setMemo() {
  const memoInput = document.querySelector(".memo-input");

  memoInput.addEventListener("keyup", function (e) {
    // console.log(e);
    // console.log(e.code);
    // console.log(e.target.value);
    if (e.code === "Enter" && e.target.value) {
      console.log("메모 작성이 가능");

      //localStorage : 나갔다 들어와도 페이지에 저장됨 (WEB 내부 저장소)
      //sessionStorage : 나갔다 들어오면 값이 사라짐
      //sessionStorage.setItem("todo", e.target.value);
      //   localStorage.setItem(키값, 저장할 값);
      localStorage.setItem("todo", e.target.value);
      //메모를 그려주는 부분
      renderingMemo();
      memoInput.value = "";
    }
  });
}

function renderingMemo() {
  const memo = document.querySelector(".memo");
  const memoValue = localStorage.getItem("todo");
  // console.log(memoValue);
  memo.textContent = memoValue;
}

function deleteMemo() {
  //이벤트 위임 활용
  document.addEventListener("click", function (e) {
    //전역 클릭
    // console.log(e.target);
    if (e.target.classList.contains("memo")) {
      //localStorage를 날려주고
      //   localStorage.removeItem(삭제할 데이터의 기캆);
      localStorage.removeItem("todo");
      //html 둘다 날려준다
      e.target.textContent = "";
    }
  });
}

//현재 위치 가져오기
function getPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

//날씨 API 호출하기 ( 핵심 : 동기화,,, )
async function getWeatherAPI(latitude, longitude) {
  //듀가지
  //latitude와 longitude에 값이 담겨있는 경우 (위치 승인)
  const API_KEY = "9d98cae3d52329f399966d4b866adbcc";
  if (latitude & longitude) {
    const result = await axios.get(
      `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    );
    //console.log(result);
    return result;
  }
  //else {
  //값이 없는 경우(위치 승인 거부)
  const result = await axios.get(`
http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${API_KEY}
`);
  //console.log(result);
  return result;
  //}
}
function matchIcon(weatherData) {
  // Clear
  if (weatherData === "Clear") return "./images/039-sun.png";
  // Clouds
  if (weatherData === "Clouds") return "./images/001-cloud.png";
  // Rain
  if (weatherData === "Rain") return "./images/003-rainy.png";
  // Snow
  if (weatherData === "Snow") return "./images/006-snowy.png";
  // Thunderstorm
  if (weatherData === "Thunderstorm") return "./images/008-storm.png";
  // Drizzle
  if (weatherData === "Drizzle") return "./images/031-snowflake.png";
  // Atmosphere
  if (weatherData === "Atmosphere") return "./images/033-hurricane.png";
}
//목표: 현재위치를 기반으로 날씨를 호출해서 가져오기

//날씨 데이터를 기반으로 HTML화 시키기
// weatherComponent

function weatherWrapperComponent(li) {
  const changeToCelsius = (temp) => (temp - 273.15).toFixed(1);

  //console.log(li);
  return `
  <div class="card shadow-sm bg-transparent m-2 flex-grow-1">
  <div class="card-header text-white text-center">
    ${li.dt_txt.split(" ")[0]}
  </div>
  <div class="card-body d-flex">
  <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <h5 class="card-title">
${li.weather[0].main}
      </h5>
      
        <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px"/>
      <p class="card-text">${changeToCelsius(li.main.temp)}˚</p>
    </div>
  </div>
</div>
  
  `;
}

//그 날씨를 rendering 시키기

async function renderWeather() {
  let latitude = "";
  let longitude = "";
  try {
    const position = await getPosition();
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    //console.log(position);
    // console.log(latitude);
    // console.log(longitude);
  } catch (error) {
    console.log(error);
  }
  //위도와 경도를 기반으로  API를 호출
  const weatherResult = await getWeatherAPI(latitude, longitude);
  //console.log(weatherResult);
  //getWeatherAPI(latitude, longitude);

  const { list } = weatherResult.data;

  //list가 40개나 되기 때문에 줄이는 작업
  //6시를 기준으로 배열을 자른다.
  const weatherList = list.reduce((acc, cur) => {
    if (cur.dt_txt.indexOf("18:00:00") > 0) {
      //너무 많아서 줄임 -> 5개로 (18시 기준만 가져옴)
      acc.push(cur);
    }
    return acc;
  }, []);

  //console.log(weatherList);
  const modalBody = document.querySelector(".modal-body");
  modalBody.innerHTML = weatherList.reduce((acc, cur) => {
    //console.log(cur);
    acc += weatherWrapperComponent(cur);
    return acc;
  }, "");

  //날씨 button 현재 날씨 기반으로
  //console.log("-----");
  //console.log(weatherList[0].weather[0].main);
  const modalButton = document.querySelector(".modal-button");
  const weatherIcon = matchIcon(weatherList[0].weather[0].main);

  modalButton.style.backgroundImage = `url(${weatherIcon})`;
  //document.querySelector("body").style.backgroundImage = `url(${imageUrl})`;
}

//날씨 API
//city를 기반으로 한 날씨 API
//http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=9d98cae3d52329f399966d4b866adbcc
//http://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key}

// 시간에 따라 오전: Good morning, 오후: Good Evening

//실행하는 부분을 묶어서 표시하기 위해 IIFE안에 넣어두었습니다~
(function () {
  setRenderBackground();

  //특정 시간마다 계속 반복하는 함수
  setInterval(function () {
    setRenderBackground();
  }, 5000);
  setTime();
  setMemo();
  renderingMemo(); //여기에도 붙여야 하는 이유 : 나갔다 들어와도 페이지에 저장되는 코드가 페이지 시작시에 바로 실행되게 하기 위해
  deleteMemo();
  renderWeather();
})();
