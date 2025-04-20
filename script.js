const videoElement = document.getElementById('videoElement');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const stopButton = document.getElementById('stopButton');
const controls = document.getElementById('controls');

// Get references to the new option elements
const videoOptionCheckbox = document.getElementById('videoOption');
const cursorOptionSelect = document.getElementById('cursorOption');
const audioOptionCheckbox = document.getElementById('audioOption');
// Updated references for checkboxes
const selfBrowserSurfaceCheckbox = document.getElementById('selfBrowserSurfaceOption');
const systemAudioCheckbox = document.getElementById('systemAudioOption');
const displayMediaOptionsDiv = document.getElementById('displayMediaOptions');
const overlayMenuDiv = document.getElementById('overlayMenu'); // Reference to the main overlay
const controlsDiv = document.getElementById('controls'); // Reference to controls div

let mediaStream = null;
let videoTrack = null; // Store the video track

startButton.onclick = async () => {
  // Construct the constraints object based on user selections
  const displayMediaOptions = {
    video: videoOptionCheckbox.checked ? { cursor: cursorOptionSelect.value } : false,
    audio: audioOptionCheckbox.checked,
    // Read checkbox state and map to 'include'/'exclude'
    selfBrowserSurface: selfBrowserSurfaceCheckbox.checked ? 'include' : 'exclude',
    systemAudio: systemAudioCheckbox.checked ? 'include' : 'exclude'
  };

  // Basic validation: At least video or audio must be selected
  if (!displayMediaOptions.video && !displayMediaOptions.audio) {
    alert("You must select at least Video or Audio to capture.");
    return;
  }

  console.log("Requesting display media with options:", displayMediaOptions);

  try {
    // Request permission to capture the screen with the specified options
    mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

    videoTrack = mediaStream.getVideoTracks()[0]; // Get the video track (if video was requested)
    const audioTracks = mediaStream.getAudioTracks(); // Get audio tracks (if requested)

    // Display the stream in the video element
    videoElement.srcObject = mediaStream;
    videoElement.style.display = 'block'; // Show video

    // Update button states
    startButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = !videoTrack;
    resumeButton.disabled = true;
    resumeButton.style.display = 'none';
    pauseButton.style.display = videoTrack ? 'inline-block' : 'none';
    // Hide options and add class to overlay for styling
    displayMediaOptionsDiv.style.display = 'none';
    overlayMenuDiv.classList.add('capture-active'); // Add class

    // Add event listener to stop capture when the stream ends
    if (videoTrack) {
      videoTrack.addEventListener('ended', stopCapture);
    } else if (audioTracks.length > 0) {
      // If only audio, listen on the first audio track
      audioTracks[0].addEventListener('ended', stopCapture);
    }

  } catch (err) {
    console.error("Error starting screen capture:", err);
    alert("Could not start screen capture. Please ensure you grant permission and that the selected options are supported by your browser.");
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
    // Show options and remove class from overlay
    displayMediaOptionsDiv.style.display = 'grid'; // Use grid as it was before
    overlayMenuDiv.classList.remove('capture-active'); // Remove class
}

// Initial UI state reset in case of page reload issues
resetUI();
