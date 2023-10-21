//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
var recorder; //WebAudioRecorder object
var input; //MediaStreamAudioSourceNode  we'll be recording
var encodingType; //holds selected encoding for resulting audio (file)
var encodeAfterRecord = true; // when to encode

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
  console.log("startRecording() called");

  /*
		Simple constraints object, for more advanced features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/

  var constraints = { audio: true, video: false };

  /*
    	We're using the standard promise based getUserMedia()
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      __log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

      /*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
      audioContext = new AudioContext();

      //assign to gumStream for later use
      gumStream = stream;

      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);

      //stop the input from playing back through the speakers
      //input.connect(audioContext.destination)

      //get the encoding
      encodingType = "wav";

      recorder = new WebAudioRecorder(input, {
        workerDir: "/", // must end with slash
        encoding: encodingType,
        numChannels: 2, //2 is the default, mp3 encoding supports only 2
        onEncoderLoading: function (recorder, encoding) {
          // show "loading encoder..." display
          __log("Loading " + encoding + " encoder...");
        },
        onEncoderLoaded: function (recorder, encoding) {
          // hide "loading encoder..." display
          __log(encoding + " encoder loaded");
        },
      });

      recorder.onComplete = function (recorder, blob) {
        __log("Encoding complete");
        createDownloadLink(blob, recorder.encoding);
      };

      recorder.setOptions({
        timeLimit: 120,
        encodeAfterRecord: encodeAfterRecord,
        ogg: { quality: 0.5 },
        mp3: { bitRate: 160 },
      });

      //start the recording process
      recorder.startRecording();

      __log("Recording started");
    })
    .catch(function (err) {
      //enable the record button if getUSerMedia() fails
      console.error(err);
      recordButton.disabled = false;
      stopButton.disabled = true;
    });

  //disable the record button
  recordButton.disabled = true;
  stopButton.disabled = false;
}

function stopRecording() {
  console.log("stopRecording() called");

  //stop microphone access
  gumStream.getAudioTracks()[0].stop();

  //disable the stop button
  stopButton.disabled = true;
  recordButton.disabled = false;

  let statusEl = document.createElement('span');
  statusEl.id = 'status';
  statusEl.innerHTML = 'Sending...';

  recordButton.after(statusEl)

  stopButton.remove()
  recordButton.remove()


  //tell the recorder to finish the recording (stop recording + encode the recorded audio)
  recorder.finishRecording();

  __log("Recording stopped");
}

async function createDownloadLink(blob, encoding) {
  console.log(blob);

  let response = await fetch(`${window.location.origin}/upload`, {
    method: "POST",
    body: blob,
    headers: { "Content-Type": "audio/wav" },
  });

  if (response.ok) {
    document.getElementById('status').innerHTML = 'Sent!';
    const json = await response.json();
    alert(json.message);
    return;
  } else throw Error(`Server returned ${response.status}: ${response.statusText}`);
}

//helper function
function __log(e, data) {
  console.log(e + " " + (data || ""));
}
