import { useState, useRef, useEffect } from 'react';
import {
  LuX,
  LuUpload,
  LuLink,
  LuGithub,
  LuVideo,
  LuSparkles,
  LuCheck,
  LuTrash2,
  LuRefreshCw,
} from 'react-icons/lu';
import { storeVideoBlob, getVideoBlob } from '../utils/videoStorage';

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [github, setGithub] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [videoMode, setVideoMode] = useState('upload'); // 'upload' | 'url'
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewSrc, setVideoPreviewSrc] = useState('');
  const [existingVideoKey, setExistingVideoKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const previewBlobUrlRef = useRef(null);

  // Initialize modal state when opened or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setLink(initialData.link || '');
      setGithub(initialData.github || '');
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');

      if (initialData.video) {
        if (initialData.video.startsWith('idb:')) {
          setVideoMode('upload');
          setExistingVideoKey(initialData.video);
          // Load preview from IndexedDB
          const key = initialData.video.replace('idb:', '');
          getVideoBlob(key).then((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              previewBlobUrlRef.current = url;
              setVideoPreviewSrc(url);
            }
          });
        } else {
          setVideoMode('url');
          setVideoUrl(initialData.video);
          setVideoPreviewSrc(initialData.video);
          setExistingVideoKey('');
        }
      } else {
        setVideoMode('upload');
        setVideoUrl('');
        setVideoPreviewSrc('');
        setExistingVideoKey('');
      }
    } else {
      // New project default state
      setTitle('');
      setDescription('');
      setLink('');
      setGithub('');
      setTagsInput('');
      setVideoMode('upload');
      setVideoUrl('');
      setVideoFile(null);
      setVideoPreviewSrc('');
      setExistingVideoKey('');
    }

    return () => {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  }, [isOpen, initialData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (MP4, WebM, MOV, OGG).');
      return;
    }

    setErrorMsg('');
    setVideoFile(file);

    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
    }
    const localUrl = URL.createObjectURL(file);
    previewBlobUrlRef.current = localUrl;
    setVideoPreviewSrc(localUrl);
    setExistingVideoKey('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const clearVideo = () => {
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }
    setVideoFile(null);
    setVideoUrl('');
    setVideoPreviewSrc('');
    setExistingVideoKey('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');

      let finalVideo = '';

      if (videoFile) {
        // Save new file to IndexedDB
        const key = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await storeVideoBlob(key, videoFile);
        finalVideo = `idb:${key}`;
      } else if (existingVideoKey) {
        finalVideo = existingVideoKey;
      } else if (videoMode === 'url' && videoUrl.trim()) {
        finalVideo = videoUrl.trim();
      }

      // Parse tags
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const projectData = {
        id: initialData?.id || `proj_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        github: github.trim(),
        video: finalVideo,
        tags,
      };

      onSave(projectData);
      onClose();
    } catch (err) {
      console.error('Failed to save project:', err);
      setErrorMsg('Error saving video. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090d16] border border-blue-500/30 shadow-[0_0_50px_rgba(0,112,255,0.25)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-gradient-to-r from-blue-950/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <LuSparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {initialData ? 'Edit Project' : 'Add New Project'}
              </h3>
              <p className="text-xs text-gray-400">
                Configure project URL, live demo, and autoplay showcase video
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {errorMsg && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Project Title <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kidzofi Platform, SaaS Dashboard..."
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Project URL & GitHub URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                <LuLink className="h-3.5 w-3.5 text-sky-400" />
                <span>Project URL (Live Demo)</span>
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                <LuGithub className="h-3.5 w-3.5 text-sky-400" />
                <span>GitHub Repository (Optional)</span>
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key features, challenges solved, architecture, and results..."
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none"
            />
          </div>

          {/* Tech Stack Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Technologies / Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="React, Node.js, PostgreSQL, Tailwind CSS"
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Video Showcase Section */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                <LuVideo className="h-4 w-4" />
                <span>Autoplay Showcase Video</span>
              </label>

              {/* Toggle Upload vs URL */}
              <div className="flex items-center rounded-lg bg-black/60 p-0.5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setVideoMode('upload')}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    videoMode === 'upload'
                      ? 'bg-sky-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('url')}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    videoMode === 'url'
                      ? 'bg-sky-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Video URL
                </button>
              </div>
            </div>

            {/* Video Input Based on Mode */}
            {videoMode === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(f);
                  }}
                  className="hidden"
                />

                {!videoPreviewSrc ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-6 text-center cursor-pointer hover:border-sky-400/80 hover:bg-sky-500/[0.04] transition-all"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 mb-2">
                      <LuUpload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Click to browse or drag & drop video
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports MP4, WebM, MOV. Video will autoplay on the project card.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoPreviewSrc(e.target.value);
                    setVideoFile(null);
                    setExistingVideoKey('');
                  }}
                  placeholder="https://example.com/demo.mp4 or /videos/project.mp4"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>
            )}

            {/* Live Autoplay Video Preview */}
            {videoPreviewSrc && (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-sky-500/30 bg-black aspect-video">
                <video
                  src={videoPreviewSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-sky-300 border border-sky-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                  <span>Autoplay Live Preview</span>
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={clearVideo}
                    title="Remove Video"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                  >
                    <LuTrash2 className="h-3 w-3" />
                  </button>
                </div>

                {videoFile && (
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] text-gray-300 border border-white/10">
                    {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,112,255,0.4)] hover:from-blue-500 hover:to-sky-400 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <LuRefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <LuCheck className="h-4 w-4" />
                  <span>{initialData ? 'Update Project' : 'Save Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
