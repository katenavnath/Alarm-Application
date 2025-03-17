const hourArrow = document.querySelector(".hours");
const minuteArrow = document.querySelector(".minutes");
const secondArrow = document.querySelector(".seconds");
const timeDisplay = document.getElementById("time-display");
const timeFormatSelect = document.getElementById("time-format");
const addAlarmBtn = document.getElementById("add-alarm-btn");
const backBtn = document.getElementById("back-btn");
const backToClockBtn = document.getElementById("back-to-clock-btn");
const backToClockBtn2 = document.getElementById("back-to-clock-btn-2");
const backToClockBtn3 = document.getElementById("back-to-clock-btn-3");
const backToClockBtn4 = document.getElementById("back-to-clock-btn-4");
const clockPage = document.getElementById("clock-page");
const setAlarmPage = document.getElementById("set-alarm-page");
const stopwatchPage = document.getElementById("stopwatch-page");
const countdownPage = document.getElementById("countdown-page");
const pomodoroPage = document.getElementById("pomodoro-page");
const worldClockPage = document.getElementById("world-clock-page");
const setAlarmListEl = document.getElementById("set-alarm-list");
const hourSelect = document.getElementById("hour-select");
const minuteSelect = document.getElementById("minute-select");
const ampmSelect = document.getElementById("ampm-select");
const footerAlarm = document.getElementById("footer-alarm");
const footerStopwatch = document.getElementById("footer-stopwatch");
const footerWorldClock = document.getElementById("footer-world-clock");
const footerPomodoro = document.getElementById("footer-pomodoro");
const footerSetAlarm = document.getElementById("footer-set-alarm");
const footerCountdown = document.getElementById("footer-countdown");
let alarms = [];
let snoozeTime = null;
let ringingInterval = null;

function updateClock() {
    const currentDate = new Date();
    setTimeout(updateClock, 1000);
    let hour = currentDate.getHours();
    let minute = currentDate.getMinutes();
    let second = currentDate.getSeconds();
    const hourDeg = (hour / 12) * 360;
    const minuteDeg = (minute / 60) * 360;
    const secondDeg = (second / 60) * 360;
    hourArrow.style.transform = `rotate(${hourDeg}deg)`;
    minuteArrow.style.transform = `rotate(${minuteDeg}deg)`;
    secondArrow.style.transform = `rotate(${secondDeg}deg)`;

    const timeFormat = timeFormatSelect.value;
    let displayHour = hour;
    let ampm = "";

    if (timeFormat === "12") {
        ampm = hour >= 12 ? "PM" : "AM";
        displayHour = hour % 12 || 12;
    }

    hour = (displayHour < 10) ? "0" + displayHour : displayHour;
    minute = (minute < 10) ? "0" + minute : minute;
    second = (second < 10) ? "0" + second : second;

    timeDisplay.innerHTML = `${hour}:${minute}:${second} <span>${ampm}</span>`;

    // Check for alarms
    alarms.forEach((alarm, index) => {
        if (alarm.time === `${hour}:${minute}:${second} ${ampm}`) {
            startRinging();
        }
    });

    // Check for snooze time
    if (snoozeTime && snoozeTime === `${hour}:${minute}:${second} ${ampm}`) {
        startRinging();
        snoozeTime = null;
    }
}

function startRinging() {
    if (ringingInterval) return; // Prevent multiple intervals
    ringingInterval = setInterval(() => {
        playAlarmSound();
    }, 5000); // Ring every 5 seconds
}

function stopRinging() {
    if (ringingInterval) {
        clearInterval(ringingInterval);
        ringingInterval = null;
    }
}

function playAlarmSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hz
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, 1000); // Stop after 1 second
}

function options() {
    hourSelect.innerHTML = '<option value="hour" selected disabled hidden>Hour</option>';
    for (let i = 1; i <= 12; i++) {
        let option = `<option value="${i < 10 ? '0' + i : i}">${i < 10 ? '0' + i : i}</option>`;
        hourSelect.insertAdjacentHTML("beforeend", option);
    }
    minuteSelect.innerHTML = '<option value="minute" selected disabled hidden>Minute</option>';
    for (let i = 0; i < 60; i++) {
        let option = `<option value="${i < 10 ? '0' + i : i}">${i < 10 ? '0' + i : i}</option>`;
        minuteSelect.insertAdjacentHTML("beforeend", option);
    }
    ampmSelect.innerHTML = '<option value="AM/PM" selected disabled hidden>AM/PM</option>';
    let ampmOptions = ["AM", "PM"];
    ampmOptions.forEach(ampm => {
        let option = `<option value="${ampm}">${ampm}</option>`;
        ampmSelect.insertAdjacentHTML("beforeend", option);
    });
}

function updateAlarmList() {
    setAlarmListEl.innerHTML = "";
    alarms.reverse().forEach((alarm, index) => {
        const alarmDiv = document.createElement("div");
        alarmDiv.innerHTML = `
            <span>Alarm: ${alarm.time} - ${alarm.note}</span>
            <span id="countdown-${index}">${calculateRemainingTime(alarm.time)}</span>
            <button onclick="stopAlarm(${index})">Stop</button>
            <button onclick="snoozeAlarm(${index})">Snooze</button>
            <button onclick="deleteAlarm(${index})">Delete</button>
        `;
        setAlarmListEl.appendChild(alarmDiv);
    });
}

function calculateRemainingTime(alarmTime) {
    const now = new Date();
    const [time, ampm] = alarmTime.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);

    if (alarmDate < now) {
        alarmDate.setDate(alarmDate.getDate() + 1); // Set for the next day
    }

    const diff = alarmDate - now;
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
}

function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmList();
}

function stopAlarm(index) {
    stopRinging();
}

function snoozeAlarm(index) {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 5); // Snooze for 5 minutes
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    snoozeTime = `${hours}:${minutes}:${seconds} ${ampm}`;
    stopRinging();
}

function setAlarm() {
    let time = `${hourSelect.value}:${minuteSelect.value}:00 ${ampmSelect.value}`;
    if (time.includes("hour") || time.includes("minute") || time.includes("AM/PM")) {
        return alert("Please select a valid time to set alarm");
    }
    const note = prompt("Enter a reminder note:");
    if (note) {
        alarms.push({ time, note });
        updateAlarmList();
    }
}

// Stopwatch JavaScript
let startTime;
let elapsedTime = 0;
let timerInterval;
const diamondCircle = document.querySelector(".diamond-circle");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const refreshBtn = document.getElementById("refreshBtn");

function displayTime() {
    const milliseconds = Math.floor(elapsedTime % 1000);
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);

    const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
    document.getElementById('display').textContent = display;
}

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        displayTime();
    }, 10);
    diamondCircle.style.borderColor = "#28a745"; // Green border for the diamond
    startBtn.style.backgroundColor = "#28a745"; // Green color for start button
    stopBtn.style.backgroundColor = "#dc3545"; // Red color for stop button
}

function stopTimer() {
    clearInterval(timerInterval);
    diamondCircle.style.borderColor = "#333"; // Reset border color
    startBtn.style.backgroundColor = "#007bff"; // Blue color for start button
    stopBtn.style.backgroundColor = "#dc3545"; // Red color for stop button
}

function refreshTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    displayTime();
    diamondCircle.style.borderColor = "#333"; // Reset border color
    startBtn.style.backgroundColor = "#007bff"; // Blue color for start button
    stopBtn.style.backgroundColor = "#dc3545"; // Red color for stop button
}

// Countdown Timer JavaScript
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const startCountdownBtn = document.getElementById("start-countdown");
const countdownDisplay = document.getElementById("countdown-display");
const endMessage = document.getElementById("end-message");
const progressCircle = document.querySelector(".progress-ring__circle");

let countdownInterval;
let totalTime = 0;

function startCountdown() {
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    totalTime = minutes * 60 + seconds;

    if (totalTime <= 0) {
        alert("Please enter a valid time.");
        return;
    }

    clearInterval(countdownInterval); // Clear any existing interval
    endMessage.style.display = "none"; // Hide end message
    countdownDisplay.classList.remove("blink"); // Remove blink animation

    // Reset progress circle
    progressCircle.style.strokeDashoffset = 565.48;
    progressCircle.style.stroke = "#2ecc71"; // Green color

    countdownInterval = setInterval(() => {
        const minutesLeft = Math.floor(totalTime / 60);
        const secondsLeft = totalTime % 60;

        countdownDisplay.textContent = `${minutesLeft < 10 ? '0' : ''}${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

        // Update progress circle
        const circumference = 565.48;
        const offset = circumference - (totalTime / (minutes * 60 + seconds)) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        // Change color to red and blink text in the last 10 seconds
        if (totalTime <= 5) {
            progressCircle.style.stroke = "#e74c3c"; // Red color
            countdownDisplay.classList.add("blink"); // Add blink animation
            playAlarmSound(); // Play alarm sound
        }

        if (totalTime <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = "00:00";
            endMessage.style.display = "block"; // Show end message
            playAlarmSound(); // Play alarm sound
        } else {
            totalTime--;
        }
    }, 1000);
}

// Pomodoro Timer JavaScript
const pomodoroDisplay = document.getElementById("pomodoro-display");
const pomodoroTimeInput = document.getElementById("pomodoro-time");
const startPomodoroButton = document.getElementById("start-pomodoro");
const stopPomodoroButton = document.getElementById("stop-pomodoro");
const resetPomodoroButton = document.getElementById("reset-pomodoro");
let pomodoroInterval;
let pomodoroTime = 25 * 60000;

function startPomodoro() {
    const userTime = parseInt(pomodoroTimeInput.value) || 25;
    pomodoroTime = userTime * 60000; // Convert minutes to milliseconds
    pomodoroInterval = setInterval(() => {
        pomodoroTime -= 1000;
        if (pomodoroTime <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroDisplay.textContent = '00:00';
            alert("Pomodoro finished! Take a break.");
            startPomodoroButton.disabled = false;
            stopPomodoroButton.disabled = true;
            resetPomodoroButton.disabled = false;
        } else {
            const minutes = Math.floor(pomodoroTime / 60000);
            const seconds = Math.floor((pomodoroTime % 60000) / 1000);
            pomodoroDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
    startPomodoroButton.disabled = true;
    stopPomodoroButton.disabled = false;
    resetPomodoroButton.disabled = true;
}

function stopPomodoro() {
    clearInterval(pomodoroInterval);
    startPomodoroButton.disabled = false;
    stopPomodoroButton.disabled = true;
    resetPomodoroButton.disabled = false;
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    const userTime = parseInt(pomodoroTimeInput.value) || 25;
    pomodoroTime = userTime * 60000; // Reset to user-defined time
    pomodoroDisplay.textContent = `${String(userTime).padStart(2, '0')}:00`;
    startPomodoroButton.disabled = false;
    stopPomodoroButton.disabled = true;
    resetPomodoroButton.disabled = true;
}

// World Clock JavaScript
const canvas = document.getElementById("analogClock");
const ctx = canvas.getContext("2d");
canvas.width = 200;
canvas.height = 200;

function drawClock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clock face
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw center dot
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(100, 100, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw hour ticks and numbers
    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    for (let i = 1; i <= 12; i++) {
        let angle = (i * 30 - 90) * (Math.PI / 180);
        let x = 100 + Math.cos(angle) * 75;
        let y = 100 + Math.sin(angle) * 75;
        if (i % 3 === 0) {
            ctx.fillText(i, x - 6, y + 6);
        }
    }

    // Draw minute ticks
    for (let i = 0; i < 60; i++) {
        let angle = (i * 6 - 90) * (Math.PI / 180);
        let x1 = 100 + Math.cos(angle) * 85;
        let y1 = 100 + Math.sin(angle) * 85;
        let x2 = 100 + Math.cos(angle) * 90;
        let y2 = 100 + Math.sin(angle) * 90;
        ctx.strokeStyle = "white";
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Draw clock hands
    let now = new Date();
    let hour = now.getHours() % 12;
    let minute = now.getMinutes();
    let second = now.getSeconds();

    drawHand((hour + minute / 60) * 30, 50, "white", 6);
    drawHand(minute * 6, 70, "white", 4);
    drawHand(second * 6, 80, "orange", 2);
}

function drawHand(angle, length, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    let radian = (Math.PI / 180) * (angle - 90);
    ctx.lineTo(100 + length * Math.cos(radian), 100 + length * Math.sin(radian));
    ctx.stroke();
}

setInterval(drawClock, 1000);

function updateWorldClock(city, offset) {
    let now = new Date();
    let cityTime = new Date(now.getTime() + offset * 3600000);
    return formatTime(cityTime);
}

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function openCitySelector() {
    document.getElementById("citySelector").style.display = "flex";
    loadCities();
}

function loadCities() {
    const cities = {
        "New York": -5, "London": 0, "Delhi": 5.5, "Tokyo": 9, "Sydney": 10, "Dubai": 4
    };

    let cityList = document.getElementById("cityList");
    cityList.innerHTML = "";

    for (let city in cities) {
        let li = document.createElement("li");
        li.textContent = city;
        li.onclick = () => addCity(city, cities[city]);
        cityList.appendChild(li);
    }
}

function addCity(city, offset) {
    let worldClockList = document.getElementById("worldClockList");
    let div = document.createElement("div");
    div.classList.add("city");
    div.innerHTML = `<div class="city-name">${city}</div><div class="time">${updateWorldClock(city, offset)}</div>`;
    worldClockList.appendChild(div);
    document.getElementById("citySelector").style.display = "none";
}

function filterCities() {
    let filter = document.getElementById("searchCity").value.toLowerCase();
    let cities = document.getElementById("cityList").getElementsByTagName("li");
    for (let i = 0; i < cities.length; i++) {
        cities[i].style.display = cities[i].textContent.toLowerCase().includes(filter) ? "" : "none";
    }
}

// Event Listeners
addAlarmBtn.addEventListener("click", setAlarm);

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
refreshBtn.addEventListener("click", refreshTimer);

startCountdownBtn.addEventListener("click", startCountdown);

startPomodoroButton.addEventListener("click", startPomodoro);
stopPomodoroButton.addEventListener("click", stopPomodoro);
resetPomodoroButton.addEventListener("click", resetPomodoro);

backBtn.addEventListener("click", () => {
    document.getElementById('clock-page').scrollIntoView({ behavior: 'smooth' });
});

backToClockBtn.addEventListener("click", () => {
    document.getElementById('clock-page').scrollIntoView({ behavior: 'smooth' });
});

backToClockBtn2.addEventListener("click", () => {
    document.getElementById('clock-page').scrollIntoView({ behavior: 'smooth' });
});

backToClockBtn3.addEventListener("click", () => {
    document.getElementById('clock-page').scrollIntoView({ behavior: 'smooth' });
});

backToClockBtn4.addEventListener("click", () => {
    document.getElementById('clock-page').scrollIntoView({ behavior: 'smooth' });
});

footerAlarm.addEventListener("click", () => {
    document.getElementById('clock-page').scrollIntoView({ behavior: 'smooth' });
});

footerStopwatch.addEventListener("click", () => {
    document.getElementById('stopwatch-page').scrollIntoView({ behavior: 'smooth' });
});

footerWorldClock.addEventListener("click", () => {
    document.getElementById('world-clock-page').scrollIntoView({ behavior: 'smooth' });
});

footerPomodoro.addEventListener("click", () => {
    document.getElementById('pomodoro-page').scrollIntoView({ behavior: 'smooth' });
});

footerSetAlarm.addEventListener("click", () => {
    document.getElementById('set-alarm-page').scrollIntoView({ behavior: 'smooth' });
});

footerCountdown.addEventListener("click", () => {
    document.getElementById('countdown-page').scrollIntoView({ behavior: 'smooth' });
});

options();
updateClock();

// Update countdown timers every second
setInterval(() => {
    alarms.forEach((alarm, index) => {
        const countdownElement = document.getElementById(`countdown-${index}`);
        if (countdownElement) {
            countdownElement.textContent = calculateRemainingTime(alarm.time);
        }
    });
}, 1000);

 // Function to toggle the navigation bar
 function toggleNav() {
    const navlist = document.getElementById("navlist");
    navlist.classList.toggle("active");
}

// Function to hide the navigation bar
function hideNav() {
    const navlist = document.getElementById("navlist");
    navlist.classList.remove("active");
}

// Add event listeners to all navbar links
const navLinks = document.querySelectorAll(".navlist a");
navLinks.forEach(link => {
    link.addEventListener("click", hideNav);
});

// Add double-click event listener to the menu icon
const menuIcon = document.getElementById("menu-icon");
menuIcon.addEventListener("dblclick", toggleNav);


