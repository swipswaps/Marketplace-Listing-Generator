import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageFile } from '../types';

interface InputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  image: ImageFile | null;
  onImageChange: (image: ImageFile | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const MAX_TEXT_LENGTH = 1500;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const InputArea: React.FC<InputAreaProps> = React.memo(({
  text,
  onTextChange,
  image,
  onImageChange,
  onGenerate,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [imageSource, setImageSource] = useState<'upload' | 'camera' | null>(null);

  // Camera-related state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const startCamera = useCallback(async (deviceId: string) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: { deviceId: deviceId ? { exact: deviceId } : undefined }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera access was denied. Please grant permission in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera found. Please ensure a camera is connected and enabled.");
        } else {
          setCameraError("An error occurred while accessing the camera.");
        }
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    if (inputMode === 'camera') {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoInputs = devices.filter(device => device.kind === 'videoinput');
          setVideoDevices(videoInputs);
          const currentDeviceId = selectedDeviceId || videoInputs[0]?.deviceId;
          if (currentDeviceId) {
              setSelectedDeviceId(currentDeviceId);
              startCamera(currentDeviceId);
          } else if (videoInputs.length === 0) {
              setCameraError("No camera devices were found.");
          }
        });
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode]);

  useEffect(() => {
    if (selectedDeviceId && inputMode === 'camera') {
        startCamera(selectedDeviceId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        onImageChange({ base64, mimeType: file.type, name: file.name });
        setImageSource('upload');
      } else {
        alert("Please upload a valid image file.");
      }
    }
  }, [onImageChange]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onImageChange({
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
          name: `capture-${new Date().toISOString()}.jpg`,
        });
        setImageSource('camera');
        setInputMode('upload');
        stopCamera();
      }
    }
  }, [onImageChange, stopCamera]);
  
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    setImageSource(null);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  const isTextTooLong = text.length > MAX_TEXT_LENGTH;
  const canGenerate = (text.trim().length > 0 || image) && !isLoading && !isTextTooLong;
  
  const renderUploadView = () => (
    <>
      <div 
          className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
      >
          <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
          {image ? (
              <div className="flex flex-col items-center">
                  <img src={`data:${image.mimeType};base64,${image.base64}`} alt="preview" className="max-h-32 rounded-lg mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{image.name}</p>
                   <div className="flex space-x-4 mt-2">
                      {imageSource === 'camera' && (
                          <button onClick={(e) => { e.stopPropagation(); setInputMode('camera'); }} className="text-xs text-primary hover:text-blue-700">Retake Photo</button>
                      )}
                      <button onClick={handleRemoveImage} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300">Drag & drop an image here, or click to upload</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
          )}
      </div>
    </>
  );

  const renderCameraView = () => (
    <div className="space-y-4 flex flex-col items-center">
        {cameraError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-center text-sm">
                <p className="font-semibold">Camera Error</p>
                <p>{cameraError}</p>
            </div>
        ) : (
             <video ref={videoRef} autoPlay playsInline muted className={`w-full max-w-sm rounded-lg bg-gray-900 ${cameraStream ? 'block' : 'hidden'}`}></video>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="w-full max-w-sm space-y-4">
            {videoDevices.length > 1 && (
                <select 
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                >
                    {videoDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${videoDevices.indexOf(device) + 1}`}</option>
                    ))}
                </select>
            )}
            <button
                onClick={handleCapture}
                disabled={!cameraStream}
                className="w-full flex items-center justify-center p-3 bg-secondary text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                Capture Photo
            </button>
        </div>
    </div>
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        2. Provide Product Details
      </h2>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 text-sm font-medium ${inputMode === 'upload' ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
              Upload File
          </button>
          <button
              onClick={() => setInputMode('camera')}
              className={`px-4 py-2 text-sm font-medium ${inputMode === 'camera' ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
              Use Camera
          </button>
      </div>

      <div className="pt-4">
        {inputMode === 'upload' ? renderUploadView() : renderCameraView()}
      </div>
      
      <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-sm font-semibold">AND / OR</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      
      <div>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Describe your item... (e.g., condition, brand, model)"
          rows={4}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-colors ${
            isTextTooLong
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-secondary'
          }`}
          aria-describedby="text-feedback"
          aria-invalid={isTextTooLong}
        />
        <div id="text-feedback" className="flex justify-between items-center mt-1 text-xs">
          {isTextTooLong ? (
            <p className="text-red-500 font-medium">Description is too long.</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Provide specific details for the best results.</p>
          )}
          <span className={isTextTooLong ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>
            {text.length}/{MAX_TEXT_LENGTH}
          </span>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full mt-6 flex items-center justify-center p-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : '3. Generate Listing'}
      </button>
    </div>
  );
});