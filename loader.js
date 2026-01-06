(function() {
  'use strict';

  // 1. Get configuration from the Global Object or set defaults
  const config = window.GHL_CONFIG || {};
  
  const REPO_OWNER = config.owner;
  const REPO_NAME = config.repo;
  const FILE_NAME = config.file || 'main.js';
  const BRANCH = config.branch || 'main'; // Defaulted to main if missing
  
  // Validation
  if (!REPO_OWNER || !REPO_NAME) {
    console.error('[Loader] Error: window.GHL_CONFIG.owner or .repo is missing.');
    return;
  }

  // Create unique storage keys based on repo/file
  const STORAGE_KEY = `gh-cache-${REPO_OWNER}-${REPO_NAME}-${FILE_NAME}`;
  const VERSION_KEY = `${STORAGE_KEY}-version`;
  const CDN_URL = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}/${FILE_NAME}`;

  async function getLatestVersion() {
    try {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      return data.commit.sha;
    } catch (error) {
      console.error('[Loader] Failed to fetch latest version:', error);
      return null;
    }
  }

  async function fetchScriptCode(commitSha) {
    try {
      const commitCDNUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${commitSha}/${FILE_NAME}`;
      const cacheBuster = `?v=${commitSha}&t=${Date.now()}`;
      
      let response = await fetch(commitCDNUrl + cacheBuster);
      
      if (!response.ok) {
        // Fallback to GitHub API if CDN fails
        const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_NAME}?ref=${commitSha}`;
        response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          return atob(data.content.replace(/\s/g, ''));
        }
      }
      
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error('[Loader] Fetch script error:', error);
      return null;
    }
  }

  function executeCode(code) {
    try {
      const script = document.createElement('script');
      script.textContent = code;
      document.head.appendChild(script);
      document.head.removeChild(script); // Remove tag after execution to keep DOM clean
    } catch (error) {
      console.error('[Loader] Execution failed:', error);
    }
  }

  async function load() {
    const storedCode = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    // If we have a cached version, run it immediately for speed
    if (storedCode && storedVersion) {
      executeCode(storedCode);
      
      // Then check for updates in the background
      getLatestVersion().then(async latestVersion => {
        if (latestVersion && latestVersion !== storedVersion) {
          const latestCode = await fetchScriptCode(latestVersion);
          if (latestCode) {
            localStorage.setItem(STORAGE_KEY, latestCode);
            localStorage.setItem(VERSION_KEY, latestVersion);
            console.log(`[Loader] ${FILE_NAME} updated in cache. Will apply on next reload.`);
          }
        }
      });
    } else {
      // First time loading: get latest, then execute
      const latestVersion = await getLatestVersion();
      if (latestVersion) {
        const latestCode = await fetchScriptCode(latestVersion);
        if (latestCode) {
          executeCode(latestCode);
          localStorage.setItem(STORAGE_KEY, latestCode);
          localStorage.setItem(VERSION_KEY, latestVersion);
        }
      }
    }
  }

  // Start the process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
