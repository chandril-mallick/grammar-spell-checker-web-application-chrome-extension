# Chrome Extension: Grammar & Spell Checker

A powerful Chrome extension that provides real-time grammar and spell checking across any text input on the web - WhatsApp, Gmail, Google Docs, and more!

![Extension Icon](icons/icon-128.png)

## 🌟 Features

- ✅ **Spell Checking** - Automatically corrects common spelling mistakes
- ✅ **Grammar Checking** - Detects and fixes grammar errors
- ✅ **Universal Compatibility** - Works on any website with text inputs
- ✅ **Floating Check Button** - Appears when you focus on text fields
- ✅ **Visual Diff View** - See exactly what changed
- ✅ **Context Menu Integration** - Right-click to check selected text
- ✅ **Keyboard Shortcut** - Press Alt+Shift+C to check text
- ✅ **Popup Interface** - Quick text checking from the toolbar
- ✅ **Customizable Settings** - Enable/disable features as needed
- ✅ **Privacy First** - All processing happens locally in your browser

## 📦 Installation

### Install from Source (Developer Mode)

1. **Download or clone this repository**
   ```bash
   cd /Users/chandrilmallick/Desktop/speach
   ```

2. **Open Chrome and navigate to Extensions**
   - Go to `chrome://extensions/`
   - OR click the three-dot menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder: `/Users/chandrilmallick/Desktop/speach/chrome-extension`

5. **Done!** The extension icon should appear in your toolbar

## 🚀 Usage

### Method 1: Floating Check Button
1. Click on any text input field (textarea, input, contenteditable)
2. A floating "✓ Check" button will appear
3. Click the button to check your text
4. Review corrections in the popup panel
5. Click "Apply Corrections" to replace your text

### Method 2: Extension Popup
1. Click the extension icon in your toolbar
2. Type or paste text into the popup
3. Click "Correct Text"
4. Copy the corrected text or view the diff

### Method 3: Context Menu
1. Select any text on a webpage
2. Right-click and select "Check Grammar & Spelling"
3. View the corrections

### Method 4: Keyboard Shortcut
1. Focus on a text input field
2. Press `Alt+Shift+C` (Mac/Windows)
3. Review corrections in the popup

## ⚙️ Settings

Access settings by:
- Right-clicking the extension icon → Options
- OR clicking the "⚙️ Settings" link in the popup

Available settings:
- **Spell Checking** - Enable/disable spell correction
- **Grammar Checking** - Enable/disable grammar correction
- **Theme** - Choose light/dark theme (coming soon)

## 🎯 Tested Websites

The extension works perfectly on:
- ✅ WhatsApp Web
- ✅ Gmail
- ✅ Google Docs
- ✅ Twitter/X
- ✅ LinkedIn
- ✅ Facebook
- ✅ Slack
- ✅ Discord
- ✅ Notion
- ✅ And virtually any website with text inputs!

## 🛠️ Technical Details

### Architecture
- **Manifest Version**: 3 (latest Chrome standard)
- **Processing**: Client-side (no server required)
- **Privacy**: All text stays in your browser
- **Permissions**: activeTab, contextMenus, storage

### Components
- **Background Service Worker** - Manages context menus and shortcuts
- **Content Scripts** - Inject UI into web pages
- **Popup Interface** - Standalone text checker
- **Grammar Library** - Core spell/grammar checking logic
- **Options Page** - User preferences

### Files Structure
```
chrome-extension/
├── manifest.json           # Extension configuration
├── background.js          # Service worker
├── content.js             # Content script for web pages
├── content-styles.css     # Styling for injected UI
├── lib/
│   └── grammar-checker.js # Core checking logic
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.js           # Popup logic
│   └── popup.css          # Popup styling
├── options/
│   ├── options.html       # Settings page
│   └── options.js         # Settings logic
└── icons/
    ├── icon-16.png        # 16x16 icon
    ├── icon-48.png        # 48x48 icon
    └── icon-128.png       # 128x128 icon
```

## 🔧 Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## 📝 Common Corrections

The extension can fix:
- Spelling errors (e.g., "teh" → "the", "recieve" → "receive")
- Subject-verb agreement (e.g., "I has" → "I have")
- Article usage (e.g., "a apple" → "an apple")
- Common grammar mistakes

## 🐛 Troubleshooting

**Extension doesn't appear:**
- Make sure Developer Mode is enabled
- Try refreshing the extension at `chrome://extensions/`

**Check button not showing:**
- Refresh the webpage
- Make sure the extension is enabled
- Check if the text field is supported

**Corrections not accurate:**
- The extension uses basic rules (not AI)
- For complex grammar, consider professional tools
- You can disable certain checks in Settings

## 📄 License

This project is part of the Grammar & Spell Checker web application.

## 🙋 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the settings to ensure features are enabled
3. Test on a simple text input first

## 🎉 Enjoy!

Happy writing with perfect grammar and spelling! ✨
