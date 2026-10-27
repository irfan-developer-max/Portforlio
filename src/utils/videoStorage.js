import kidzofiVideo from '../assets/kidzofi.mp4';
import b2bVideo from '../assets/B2B.mp4';
import jewelloryVideo from '../assets/Jewellory.mp4';
import staffingVideo from '../assets/staffing-company.mp4';

// IndexedDB and LocalStorage persistence for Portfolio Projects & Uploaded Videos

const DB_NAME = 'PortfolioVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
const STORAGE_KEY = 'portfolio_custom_projects_v3';

export const DEFAULT_PROJECTS = [
  {
    id: 'kidzofi',
    title: 'Kidzofi',
    description:
      'Developed and maintained features for an educational platform with responsive UI, scalable backend integration, and user-focused functionality.',
    link: 'https://www.kidzofi.com/',
    github: '',
    video: kidzofiVideo,
    tags: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  },
  {
    id: 'b2b-ecommerce',
    title: 'B2B E-commerce Platform',
    description:
      'Worked on a production-level B2B e-commerce platform with authentication, order workflows, payment integration, and shipment tracking.',
    link: 'https://www.befach.com',
    github: '',
    video: b2bVideo,
    tags: ['Next.js', 'Express', 'MySQL', 'Stripe API'],
  },
  {
    id: 'url-shortener',
    title: 'Jewellory ERP',
    description:
      'Developed a jewelry ERP management solution with inventory tracking, order management, customer billing, and analytics.',
    link: 'https://jewellary-erp-api.vercel.app/login',
    github: 'https://github.com/123irf',
    video: jewelloryVideo,
    tags: ['Node.js', 'MySQL', 'Redis', 'REST API'],
  },
  {
    id: 'staffing-app',
    title: 'Staffing & Manpower Solutions',
    description:
      'Engineered a comprehensive staffing and manpower solutions platform featuring specialized recruitment services, industry workforce allocation, and interactive client inquiry workflows.',
    link: 'https://staffing-app-nine.vercel.app/',
    github: 'https://github.com/123irf',
    video: staffingVideo,
    tags: ['React', 'JavaScript', 'Tailwind CSS', 'Vercel'],
  },
];

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoBlob(key, blob) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve(key);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to store video in IndexedDB:', err);
    throw err;
  }
}

export async function getVideoBlob(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get video from IndexedDB:', err);
    return null;
  }
}

export async function deleteVideoBlob(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete video from IndexedDB:', err);
    return false;
  }
}

export async function clearAllStoredVideos() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear video DB:', err);
    return false;
  }
}

export function loadProjectsFromStorage() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    // Backward compatibility: load previous version if v3 is not yet initialized
    if (!saved) {
      saved = localStorage.getItem('portfolio_custom_projects_v2');
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const projects = parsed.map((project) => {
          if (
            project.id === 'url-shortener' &&
            project.title?.trim() === 'URL Shortener Application'
          ) {
            return { ...project, title: 'Jewellory ERP' };
          }
          if (
            project.id === 'food-delivery' ||
            project.title === 'Food Delivery App' ||
            project.link?.includes('food-del-rosy-five.vercel.app')
          ) {
            return {
              id: 'staffing-app',
              title: 'Staffing & Manpower Solutions',
              description:
                'Engineered a comprehensive staffing and manpower solutions platform featuring specialized recruitment services, industry workforce allocation, and interactive client inquiry workflows.',
              link: 'https://staffing-app-nine.vercel.app/',
              github: project.github || 'https://github.com/123irf',
              video: project.video === '/videos/project-food.mp4' || !project.video ? staffingVideo : project.video,
              tags: ['React', 'JavaScript', 'Tailwind CSS', 'Vercel'],
            };
          }
          return project;
        });

        saveProjectsToStorage(projects);
        return projects;
      }
    }
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
  }
  return DEFAULT_PROJECTS;
}

export function saveProjectsToStorage(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
}

export async function resetProjectsStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('portfolio_custom_projects_v2');
    await clearAllStoredVideos();
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
  return DEFAULT_PROJECTS;
}
