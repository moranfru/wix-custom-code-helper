# GitHub Script Loader for Wix 🚀

A high-performance JavaScript loader designed to bypass the limitations of the Wix Custom Code interface. Instead of manually pasting code into Wix's problematic UI every time you make a change, this loader synchronizes your site with your GitHub repository automatically.

> [!IMPORTANT]
> **Development Tool:** This loader is intended for the **development and testing stage**. It eliminates the need to use the Wix dashboard for script edits. 
> 
> **Production Recommendation:** For final production, once your code is stable, it is recommended to paste the final script directly into Wix to remove the dependency on external loaders and APIs.

---

## 🛠 Why use this?

Wix's built-in "Custom Code" editor is difficult to use for active development. This loader allows you to:
1. **Bypass the Wix UI:** Stop opening the Wix dashboard to edit scripts.
2. **Real Version Control:** Use Git branches, commits, and PRs as your primary workflow.
3. **Instant Sync:** Simply `git push`, and your Wix site will receive the update automatically on the next reload.

---

## 🚀 Usage (Development Stage)

Add the following code to the **Head** section of your **Wix Custom Code** panel. Replace the values in `window.GHL_CONFIG` to match your repository.

```html
<script>
  window.GHL_CONFIG = {
    owner: 'moranfru',      // GitHub username
    repo: 'wix-custom-code-helper',        // Repository name
    file: 'test.js',     // The JavaScript file to load
    branch: 'main'          // (Optional) defaults to 'main'
  };
</script>
<script src="[https://cdn.jsdelivr.net/gh/moranfru/wix-custom-code-helper/loader.js](https://cdn.jsdelivr.net/gh/moranfru/wix-custom-code-helper/loader.js)"></script>
```
---

### Part 2: Configuration and Technical Logic

## ⚙️ Configuration Parameters

| Parameter | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `owner` | Your GitHub account/organization name. | **Yes** | - |
| `repo` | The name of the repository where the file lives. | **Yes** | - |
| `file` | The path/name of the `.js` file to be injected. | **Yes** | `main.js` |
| `branch` | The GitHub branch to pull from. | No | `main` |

---

## ⚡ How It Works (Sync & Caching)



To ensure your development process doesn't slow down the site, the loader uses a **Stale-While-Revalidate** strategy:

### 🌑 Initial Load
The first time a user (or you) visits the site, the loader fetches the latest code directly from GitHub, saves it to `localStorage`, and runs it.

### 🌕 Subsequent Loads (Speed)
The loader retrieves the script from `localStorage` **instantly**. Your code runs immediately without waiting for a network request, ensuring no "flicker" or delay on the page.

### 🔄 Background Sync (Auto-Update)
Every time the page loads, the loader silently checks the GitHub API in the background. If it detects a new commit, it downloads the update and caches it. The new version will run automatically on the **next page refresh**.

---

## 🛡️ Key Advantages
* **Developer Experience:** Write code in your favorite IDE (VS Code), push to Git, and see results on Wix.
* **No Manual Updates:** Once the loader is in Wix, you never have to touch that dashboard again during dev.
* **Safe Execution:** Uses specific commit SHAs to ensure you always get the exact version of the code you wrote.
* **Clean DOM:** The loader removes its own injected script tags after execution to keep the page clean.

---

## 📝 License
This project is open-source and available under the MIT License.
