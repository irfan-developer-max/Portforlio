import { useState, useRef, useEffect } from 'react';
import {
  LuUpload,
  LuVideo,
  LuRefreshCw,
} from 'react-icons/lu';
import { storeVideoBlob, getVideoBlob } from '../utils/videoStorage';

export default function ProjectVideoPlayer({
  project,
  onVideoChange,
  className = '',
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeBlobUrlRef = useRef(null);

  // Resolve video source (handles direct URL, object URL, or IndexedDB key)
  useEffect(() => {
    let isCancelled = false;
    setHasError(false);

    async function resolveSource() {
      if (!project.video) {
        setVideoSrc('');
        return;
      }

      // Check if stored in IndexedDB (key format idb:...)
      if (project.video.startsWith('idb:')) {
        const key = project.video.replace('idb:', '');
        try {
          const blob = await getVideoBlob(key);
          if (blob && !isCancelled) {
            if (activeBlobUrlRef.current) {
              URL.revokeObjectURL(activeBlobUrlRef.current);
            }
            const blobUrl = URL.createObjectURL(blob);
            activeBlobUrlRef.current = blobUrl;
            setVideoSrc(blobUrl);
          } else if (!blob && !isCancelled) {
            setHasError(true);
          }
        } catch (err) {
          console.error('Error loading video from DB:', err);
          if (!isCancelled) setHasError(true);
        }
      } else {
        setVideoSrc(project.video);
      }
    }

    resolveSource();

    return () => {
      isCancelled = true;
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, [project.video]);

  // Ensure autoplay on mount and when source updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    // Browser autoplay policy requires muted property
    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .catch((err) => {
          // Autoplay blocked without user gesture or pending
          console.log('Autoplay deferred or muted required:', err.message);
        });
    }
  }, [videoSrc, isMuted]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  // Handle Video File Upload
  const handleFileProcess = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (MP4, WebM, MOV, etc.)');
      return;
    }

    try {
      setIsUploading(true);
      const storageKey = `vid_${project.id || Date.now()}_${Date.now()}`;
      await storeVideoBlob(storageKey, file);

      if (onVideoChange) {
        onVideoChange(`idb:${storageKey}`);
      }
    } catch (err) {
      console.error('Failed to upload video:', err);
      // Fallback to local Object URL in state
      const localUrl = URL.createObjectURL(file);
      if (onVideoChange) onVideoChange(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const triggerUploadClick = (e) => {
    e?.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group/video relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-950 border border-white/10 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Hidden File Input for Video Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Dragging State Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-blue-950/90 backdrop-blur-md border-2 border-dashed border-sky-400 p-4 text-center animate-fadeIn">
          <LuUpload className="h-10 w-10 text-sky-400 animate-bounce mb-2" />
          <p className="text-base font-bold text-white">Drop your video here</p>
          <p className="text-xs text-sky-200 mt-1">Supports MP4, WebM, MOV with instant autoplay</p>
        </div>
      )}

      {/* Uploading Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-center">
          <LuRefreshCw className="h-8 w-8 text-sky-400 animate-spin mb-3" />
          <p className="text-sm font-semibold text-white">Processing & Saving Video...</p>
        </div>
      )}

      {videoSrc && !hasError ? (
        <>
          {/* Autoplay Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover cursor-pointer transition-transform duration-700 group-hover/video:scale-105"
          />

          {/* Subtle Ambient Vignette Gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        </>
      ) : (
        /* Empty / Upload Prompt State or Error Fallback */
        <div
          onClick={triggerUploadClick}
          className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center transition-all hover:bg-white/[0.04]"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,112,255,0.15),transparent_70%)]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600/30 to-blue-500/20 border border-sky-400/40 text-sky-400 shadow-[0_0_20px_rgba(0,112,255,0.25)] mb-3 transition-transform group-hover/video:scale-110">
              <LuVideo className="h-7 w-7" />
            </div>

            <p className="text-base font-bold text-white mb-1">
              {hasError ? 'Video Failed to Load' : 'Upload Project Demo Video'}
            </p>
            <p className="text-xs text-gray-400 max-w-xs mb-3">
              {hasError
                ? 'Click to upload a video file or choose a different source'
                : 'Drag & drop your video here or click to browse. Autoplays seamlessly.'}
            </p>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500 hover:text-white transition-colors">
              <LuUpload className="h-3 w-3" />
              {hasError ? 'Replace Video' : 'Upload Video (MP4 / WebM)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
