// Check for browser support
let supportMsg = document.getElementById('supportMsg');

if ('speechSynthesis' in window) {
    supportMsg.innerHTML = 'Your browser <strong>supports</strong> speech synthesis.';
} else {
    supportMsg.innerHTML = 'Sorry your browser <strong>does not support</strong> speech synthesis.<br>Try this in <a href="https://www.google.co.uk/intl/en/chrome/browser/canary.html">Chrome Canary</a>.';
      supportMsg.classList.add('not-supported');
}

let speakButton = document.getElementById('speak');
let decTen = document.getElementById('decTen');
let decOne = document.getElementById('decOne');
let incOne = document.getElementById('incOne');
let incTen = document.getElementById('incTen');
let playPause = document.getElementById('playPause');

let eventLogContainer = document.getElementById('eventLogContainer');

// Settings
let speechMsgInput = document.getElementById('speechMsg');
let clock = document.getElementById('clock');

let voiceSelect = document.getElementById('voice');

let volumeInput = document.getElementById('volume');
let rateInput = document.getElementById('rate');
let pitchInput = document.getElementById('pitch');


// Fetch the list of voices and populate the voice options.
function loadVoices() {
  // Fetch the available voices.
  let voices = speechSynthesis.getVoices();

  // Loop through each of the voices.
  voices.forEach(function(voice, i) {
    // Create a new option element.
    let option = document.createElement('option');

    // Set the options value and text.
    option.value = voice.name;
    option.innerHTML = voice.name;

    // Add the option to the voice selector.
    voiceSelect.appendChild(option);
  });
}

// Execute loadVoices.
loadVoices();

// Chrome loads voices asynchronously.
window.speechSynthesis.onvoiceschanged = function(e) {
  loadVoices();
};


// Create a new utterance for the specified text and add it to
// the queue.
function speak(text) {
  // Create a new instance of SpeechSynthesisUtterance.
  let msg = new SpeechSynthesisUtterance();

  // Set the text.
  msg.text = text;

  // Set the attributes.
  msg.volume = parseFloat(volumeInput.value);
  msg.rate = parseFloat(rateInput.value);
  msg.pitch = parseFloat(pitchInput.value);
  console.log(msg);

  // If a voice has been selected, find the voice and set the
  // utterance instance's voice attribute.
  if (voiceSelect.value) {
    msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceSelect.value; })[0];
  }

  // Queue this utterance.
  window.speechSynthesis.speak(msg);
}


// Set up an event listener for when the 'speak' button is clicked.
speakButton.addEventListener('click', function(e) {
  if (speechMsgInput.value.length > 0) {
    speak(speechMsgInput.value);
  }
});

voiceSelect.addEventListener("change", function(e) {
  speak("This is what I sound like.");
});

let running = false;
let gameSeconds = -45;

incOne.addEventListener('click', function(e) {
  gameSeconds++;
  clock.value = secsToTime(gameSeconds);
});

incTen.addEventListener('click', function(e) {
  gameSeconds+=10;
  clock.value = secsToTime(gameSeconds);
});

decOne.addEventListener('click', function(e) {
  gameSeconds--;
  clock.value = secsToTime(gameSeconds);
});

decTen.addEventListener('click', function(e) {
  gameSeconds-=10;
  clock.value = secsToTime(gameSeconds);
});

playPause.addEventListener('click', function(e) {
  running = !running;
  if (running)
    playPause.innerText = "❚❚";
  else
    playPause.innerText = "▶";

  console.log(playPause);
});

clock.addEventListener("change", function(e) {
  gameSeconds = timeToSeconds(clock.value);
});

function timeToSeconds(rawTime) {
  // Raw seconds
  if (!rawTime.includes(":")) {
    return rawTime;
  }

  let sign = 1;
  if (rawTime.charAt(0) === "-") {
    sign = -1;
    rawTime = rawTime.substring(1)
  }
  let times = rawTime.split(":");
  let min = parseInt(times[0]);
  let sec = parseInt(times[1]);
  return sign * (min * 60 + sec);
}

function secsToTime(seconds) {
  neg = false;
  if (seconds < 0) {
    neg = true;
    seconds *= -1;
  }
  min = ("0" + Math.floor(seconds / 60)).slice(-2);
  secs = ("0" + (seconds % 60)).slice(-2);
  return (neg ? "-" : "") + min + ":" + secs;
}

let events = [
    {
        "name": "powerRunes",
        "message": "Power runes spawning",
        "startTime": "4:00",
        "interval": 2 * 60,
        "endTime": null,
        "delay": 15
    },
    {
        "name": "bountyRunes",
        "message": "Bounty runes spawning",
        "startTime": "00:00",
        "interval": 5 * 60,
        "endTime": null,
        "delay": 15
    },
    {
        "name": "stackCamps",
        "message": "Stack neutrals",
        "startTime": "1:52",
        "interval": 60,
        "endTime": null,
        "delay": 10
    },
    {
        "name": "tome",
        "message": "Tome restocking",
        "startTime": "10:00",
        "interval": 10 * 60,
        "endTime": null,
        "delay": 5
    },
    {
        "name": "pull",
        "message": "Pull small camp",
        "startTime": "1:17",
        "interval": 60,
        "endTime": "10:00",
        "delay": 10
    },
    {
        "name": "wards",
        "message": "Check wards stock",
        "startTime": "0:135",
        "interval": 135,
        "endTime": null,
        "delay": 0
    },
    {
        "name": "siegeWave",
        "message": "Siege creep wave spawning",
        "startTime": "5:00",
        "interval": 5 * 60,
        "endTime": null,
        "delay": 0
    },
]

let eventLog = [];

function addEvent(time, event) {
  eventLog.push(event);
  let eventDiv = document.createElement("div");
  eventDiv.class = "event";
  eventDiv.innerHTML = secsToTime(time) + " " + event.message;
  eventLogContainer.prepend(eventDiv);
}

function remind() {
  let msgs = [];

  for (const event of events) {
    startSecs = timeToSeconds(event.startTime);
    if (gameSeconds >= startSecs - event.delay
        && (event.endTime === null || gameSeconds < timeToSeconds(event.endTime))
        && (gameSeconds + event.delay - startSecs) % event.interval == 0){
      console.log(gameSeconds, startSecs, event.interval);
      msgs.push(event.message);
      addEvent(gameSeconds, event);
    }
  }

  if (msgs.length > 0) {
    speak(msgs.join(", "));
  }
}

window.setInterval(function() {
  if (running) {
    gameSeconds++;
    clock.value = secsToTime(gameSeconds);

    remind();
  }
}, 1000);
