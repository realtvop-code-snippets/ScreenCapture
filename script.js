const videoElement = document.getElementById('videoElement');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton'); // Added
const resumeButton = document.getElementById('resumeButton'); // Added
const stopButton = document.getElementById('stopButton');
const controls = document.getElementById('controls');
let mediaStream = null;
let videoTrack = null; // Store the video track

startButton.onclick = async () => {
  try {
    // Request permission to capture the screen
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" }, // Capture options (e.g., show cursor)
      audio: false // You can request audio capture too if needed
    });

    videoTrack = mediaStream.getVideoTracks()[0]; // Get the video track

    // Display the stream in the video element
    videoElement.srcObject = mediaStream;
    videoElement.style.display = 'block'; // Show video

    // Update button states
    startButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false; // Enable Pause
    resumeButton.disabled = true;
    resumeButton.style.display = 'none'; // Ensure Resume is hidden
    pauseButton.style.display = 'inline-block'; // Ensure Pause is visible

    // Add event listener to stop capture when the stream ends (e.g., user clicks "Stop sharing")
    videoTrack.addEventListener('ended', stopCapture);

  } catch (err) {
    console.error("Error starting screen capture:", err);
    alert("Could not start screen capture. Please ensure you grant permission.");
    resetUI(); // Reset UI on error
  }
};

pauseButton.onclick = () => {
  if (videoTrack && videoTrack.enabled) {
    videoTrack.enabled = false; // Pause the track
    pauseButton.disabled = true;
    pauseButton.style.display = 'none'; // Hide Pause
    resumeButton.disabled = false;
    resumeButton.style.display = 'inline-block'; // Show Resume
    console.log("Capture paused");
  }
};

resumeButton.onclick = () => {
  if (videoTrack && !videoTrack.enabled) {
    videoTrack.enabled = true; // Resume the track
    resumeButton.disabled = true;
    resumeButton.style.display = 'none'; // Hide Resume
    pauseButton.disabled = false;
    pauseButton.style.display = 'inline-block'; // Show Pause
    console.log("Capture resumed");
  }
};

stopButton.onclick = () => {
  stopCapture();
};

function stopCapture() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop()); // Stop all tracks
    videoElement.srcObject = null;
    videoElement.style.display = 'none'; // Hide video
    mediaStream = null;
    videoTrack = null;
    resetUI();
    console.log("Capture stopped");
  }
}

function resetUI() {
    // Reset button states
    startButton.disabled = false;
    stopButton.disabled = true;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    resumeButton.style.display = 'none'; // Hide Resume
    pauseButton.style.display = 'inline-block'; // Show Pause (but disabled)
}

// Initial UI state reset in case of page reload issues
resetUI();
