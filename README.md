# GitHub Script Loader for Wix 🚀

A high-performance JavaScript loader designed for Wix Custom Code. This script allows you to host your JS files on GitHub while ensuring they load instantly for users via local caching and automatic background updates.

---

## 🛠 Usage

To use this loader, add the following code to the **Head** section of your **Wix Custom Code** panel. 

Replace the values in `window.GHL_CONFIG` to point to your specific GitHub repository and file.

```html
<script>
  window.GHL_CONFIG = {
    owner: 'moranfru',      // GitHub username
    repo: 'rtl-ltr',        // Repository name
    file: 'rtl-ltr.js',     // The JavaScript file to load
    branch: 'main'          // (Optional) defaults to 'main'
  };
</script>
<script src="[https://cdn.jsdelivr.net/gh/moranfru/wix-custom-code-helper/loader.js](https://cdn.jsdelivr.net/gh/moranfru/wix-custom-code-helper/loader.js)"></script>

