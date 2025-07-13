import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user", 
};

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false); 
  const webcamRef = useRef(null);
  const videoRef = useRef(null); 
  const webcamIntervalRef = useRef(null); 

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setFeedback([]); 
      setError(null);  
      stopWebcamAnalysis(); 
    } else {
      setVideoFile(null);
      setVideoPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("Please select a video file to upload.");
      return;
    }

    setLoading(true);
    setFeedback([]);
    setError(null);

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const BACKEND_VIDEO_ANALYZE_URL = process.env.REACT_APP_BACKEND_VIDEO_URL;
      console.log("Uploading video to:", BACKEND_VIDEO_ANALYZE_URL);

      const res = await axios.post(BACKEND_VIDEO_ANALYZE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000,
      });

      console.log("Backend video analysis raw response.data:", res.data); 
      const receivedFeedback = res.data.per_frame_feedback || [];
      setFeedback(receivedFeedback);
      console.log("Frontend feedback state after video analysis:", receivedFeedback); 

    } catch (err) {
      console.error("Error during video upload or analysis:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Server Error: ${err.response.status} - ${err.response.data.detail || err.response.data.message || 'Unknown error'}`);
          console.error("Backend error response data:", err.response.data); 
        } else if (err.request) {
          setError("No response from backend for video analysis. Is the backend server running?");
        } else {
          setError(`Request Error for video analysis: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred during video analysis.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startWebcamAnalysis = () => {
    setError(null);
    setFeedback([]);
    setVideoFile(null); 
    setVideoPreviewUrl(null);
    setIsWebcamActive(true); 

    webcamIntervalRef.current = setInterval(async () => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          try {
            const BACKEND_FRAME_ANALYZE_URL = process.env.REACT_APP_BACKEND_FRAME_URL;
            const res = await axios.post(BACKEND_FRAME_ANALYZE_URL, {
              image: imageSrc, 
            });

            console.log("Backend frame analysis raw response.data:", res.data); 
            setFeedback((prev) => {
              const newFeedback = {
                frame: 'Live',
                timestamp: new Date().toLocaleTimeString(),
                issues: res.data.issues || [], 
              };
              const updatedFeedback = [...prev, newFeedback];
              return updatedFeedback.slice(Math.max(updatedFeedback.length - 10, 0)); 
            });

          } catch (err) {
            console.error("Webcam frame analysis error:", err);
            setError("Live analysis error. Check backend console.");
          }
        }
      }
    }, 500); 
  };

  const stopWebcamAnalysis = () => {
    if (webcamIntervalRef.current) {
      clearInterval(webcamIntervalRef.current);
      webcamIntervalRef.current = null;
    }
    setIsWebcamActive(false); 
    setLoading(false); 
    setError(null); 
  };

  useEffect(() => {
    return () => {
      stopWebcamAnalysis();
    };
  }, []);

  return (
    <div style={styles.appContainer}>
      <div style={styles.card}>
        <h1 style={styles.title}>Bad Posture Detection</h1>

        {/* Mode Selection/Description */}
        <div style={styles.descriptionSection}>
            <p style={styles.descriptionText}>
                Choose to either upload a pre-recorded video for analysis or use your live webcam for real-time posture detection.
            </p>
        </div>

        {/* Video Upload Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Analyze Video File</h2>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={styles.fileInput}
            disabled={isWebcamActive} 
          />
          <button
            onClick={handleUpload}
            style={videoFile ? styles.uploadButton : styles.disabledButton}
            disabled={loading || !videoFile || isWebcamActive}
          >
            {loading ? "Analyzing..." : "Upload & Analyze Video"}
          </button>
          {error && !isWebcamActive && <p style={styles.errorText}>{error}</p>}
        </div>

        {/* Video Preview Section */}
        {videoPreviewUrl && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Video Preview</h2>
            <video
              ref={videoRef}
              src={videoPreviewUrl}
              controls
              style={styles.videoPlayer}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Webcam Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {isWebcamActive ? "Live Webcam Stream" : "Use Live Webcam"}
          </h2>
          {isWebcamActive && (
            <Webcam
              audio={false}
              height={videoConstraints.height}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={videoConstraints.width}
              videoConstraints={videoConstraints}
              style={styles.webcam}
            />
          )}
          <div style={styles.buttonGroup}>
            {!isWebcamActive ? (
              <button
                onClick={startWebcamAnalysis}
                style={styles.captureButton}
                disabled={loading} 
              >
                Start Webcam Analysis
              </button>
            ) : (
              <button
                onClick={stopWebcamAnalysis}
                style={styles.stopButton}
                disabled={loading}
              >
                Stop Webcam Analysis
              </button>
            )}
          </div>
          {error && isWebcamActive && <p style={styles.errorText}>{error}</p>}
        </div>

        {/* Feedback Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Analysis Feedback</h2>
          {(loading || isWebcamActive) && <p style={styles.loadingText}>
            {loading ? "Analyzing video file..." : "Analyzing live webcam feed..."}
          </p>}
          {feedback.length > 0 ? (
            <ul style={styles.feedbackList}>
              {feedback.map((frame, i) => (
                <li key={i} style={styles.feedbackItem}>
                  <strong>{frame.frame === 'Live' ? `Live Frame (${frame.timestamp})` : `Frame ${frame.frame}`}</strong>:
                  {frame.issues && frame.issues.length > 0 ? (
                    <span style={styles.badPostureText}> {frame.issues.join(", ")}</span>
                  ) : (
                    <span style={styles.goodPostureText}> Good Posture</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !loading && !error && <p>Upload a video or start webcam to see feedback here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "850px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  title: {
    fontSize: "2.5em",
    color: "#333",
    textAlign: "center",
    marginBottom: "20px",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(0,0,0,0.05)",
  },
  descriptionSection: {
    backgroundColor: '#e6f7ff', 
    borderLeft: '5px solid #1890ff',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  descriptionText: {
    fontSize: '1.1em',
    color: '#333',
    lineHeight: '1.5',
  },
  section: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "25px",
    backgroundColor: "#fefefe",
  },
  sectionTitle: {
    fontSize: "1.5em",
    color: "#555",
    marginBottom: "15px",
    borderBottom: "2px solid #007bff",
    paddingBottom: "10px",
    fontWeight: "600",
  },
  fileInput: {
    display: "block",
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "calc(100% - 22px)",
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.1em",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    boxShadow: "0 4px 10px rgba(0, 123, 255, 0.2)",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    color: "#666666",
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.1em",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  videoPlayer: {
    width: "100%",
    maxHeight: "400px",
    backgroundColor: "#000",
    borderRadius: "8px",
    display: "block",
    margin: "0 auto",
  },
  videoPlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#e9ecef",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#6c757d",
    fontSize: "1.1em",
    textAlign: "center",
    border: "2px dashed #adb5bd",
  },
  webcam: {
    width: "100%", 
    maxWidth: videoConstraints.width, 
    height: "auto", 
    borderRadius: "10px",
    marginBottom: "15px",
    backgroundColor: '#000', 
    display: 'block',
    margin: '0 auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '10px',
  },
  captureButton: {
    backgroundColor: "#28a745", 
    color: "white",
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.1em",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    boxShadow: "0 4px 10px rgba(40, 167, 69, 0.2)",
  },
  stopButton: {
    backgroundColor: "#dc3545", 
    color: "white",
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.1em",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    boxShadow: "0 4px 10px rgba(220, 53, 69, 0.2)",
  },
  feedbackList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  feedbackItem: {
    backgroundColor: "#f8f9fa", 
    borderLeft: "5px solid #6c757d",
    padding: "12px 15px",
    marginBottom: "10px",
    borderRadius: "6px",
    fontSize: "1.05em",
    color: "#333",
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  goodPostureText: {
    color: '#28a745', 
    fontWeight: 'bold',
  },
  badPostureText: {
    color: '#dc3545', 
    fontWeight: 'bold',
  },
  errorText: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    padding: "10px",
    borderRadius: "5px",
    marginTop: "15px",
    fontWeight: "bold",
    textAlign: 'center',
  },
  loadingText: {
    color: "#007bff",
    fontStyle: "italic",
    textAlign: "center",
    fontSize: "1.1em",
  },
};

export default App;