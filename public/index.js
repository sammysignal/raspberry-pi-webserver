console.log("worked!");

// const recordButton = document.getElementById("record");

// let audioContext;
// let micStreamAudioSourceNode;
// let audioWorkletNode;

// let RECORDER;

// async function record() {
//   console.log("recording...");
//   let recordButton = document.querySelector("#record");
//   if (!recordButton.hasAttribute("data-recording")) {
//     recordButton.setAttribute("data-recording", "");
//     recordButton.innerHTML = "Done";

//     // RECORDER.startRecording()
//     // Check if the browser supports the required APIs
//     if (!window.AudioContext || !window.MediaStreamAudioSourceNode || !window.AudioWorkletNode) {
//       alert("Your browser does not support the required APIs");
//       return;
//     }

//     // Request access to the user's microphone
//     const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

//     // Create the microphone stream
//     audioContext = new AudioContext();
//     micStreamAudioSourceNode = audioContext.createMediaStreamSource(micStream);

//     // Create and connect AudioWorkletNode
//     // for processing the audio stream
//     await audioContext.audioWorklet.addModule("my-audio-processor.js");
//     audioWorkletNode = new AudioWorkletNode(audioContext, "my-audio-processor");

//     RECORDER = new WebAudioRecorder(audioWorkletNode, {
//         encoding: "mp3",
//         workerDir: "/"
//     });

//     RECORDER.setOptions({
//         timeLimit: 30
//     });

//     RECORDER.onError = function(recorder, message) {
//         console.log("error: " + message);
//     }

//     RECORDER.onComplete = function (recorder, blob) {
//       console.log("done! blob:");
//       console.log(blob);
//     };

//     micStreamAudioSourceNode.connect(audioWorkletNode);
//   } else {
//     recordButton.removeAttribute("data-recording");
//     recordButton.innerHTML = "Record a message for me!";

//     // Close audio stream
//     micStreamAudioSourceNode.disconnect();
//     audioContext.close();
//     RECORDER.finishRecording();
//   }
// }
