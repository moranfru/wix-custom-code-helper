(function() {
  'use strict';

  // 1. Identify the script tag and its parameters
  const scriptTag = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('gh-loader.js'));
  
  if (!scriptTag) {
    console.error('[Loader] Could not find own script tag to read parameters.');
    return;
  }

  // Get parameters from data attributes
  const REPO_OWNER = scriptTag.getAttribute('data-owner');
  const REPO_NAME = scriptTag.getAttribute('data-repo');
  const FILE_NAME = scriptTag.getAttribute('data-file') || 'main.js';
  const BRANCH = scriptTag.getAttribute('data-branch') || 'main';
  
  // Create unique storage keys based on repo/file to avoid collisions
  const STORAGE_KEY = `gh-cache-${REPO_OWNER}-${REPO_NAME}-${FILE_NAME}`;
  const VERSION_KEY = `${STORAGE_KEY}-version`;
  const CDN_URL = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}/${FILE_NAME}`;

  if (!REPO_OWNER || !REPO_NAME) {
    console.error('[Loader] Missing data-owner or data-repo attributes.');
    return;
  }

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
      const cacheBuster = '?v=' + commitSha + '&t=' + Date.now();
      
      let response = await fetch(commitCDNUrl + cacheBuster);
      if (!response.ok) {
        const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_NAME}?ref=${commitSha}`;
        response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          return atob(data.content.replace(/\s/g, ''));
        }
      }
      
      if (!response.ok) throw new Error(`Failed to fetch script: ${response.status}`);
      return await response.text();
    } catch (error) {
      return null;
    }
  }

  function executeCode(code) {
    try {
      const script = document.createElement('script');
      script.textContent = code;
      document.head.appendChild(script);
      // We keep it in DOM if it contains global logic, 
      // but remove it for clean-up if it's a self-invoking script
      document.head.removeChild(script);
    } catch (error) {
      console.error('[Loader] Execution failed:', error);
    }
  }

  async function loadScript() {
    const storedCode = localStorage.getItem(STORAGE_KEY);
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedCode && storedVersion) {
      executeCode(storedCode);
      
      getLatestVersion().then(async latestVersion => {
        if (latestVersion && latestVersion !== storedVersion) {
          const latestCode = await fetchScriptCode(latestVersion);
          if (latestCode) {
            localStorage.setItem(STORAGE_KEY, latestCode);
            localStorage.setItem(VERSION_KEY, latestVersion);
            console.log(`[Loader] ${FILE_NAME} updated. Refresh to apply.`);
          }
        }
      });
    } else {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadScript);
  } else {
    loadScript();
  }
})();
