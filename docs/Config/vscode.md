---
title: Vscode配置
order: 3
---

# Vscode配置

ArchLinux 下使用 yay -S visual-studio-code-bin 安装官方二进制版本 (开源版本无法访问官方插件市场)

使用的基本插件: \
Vim, Catppuccin for VSCode, Catppuccin Icons for VSCode, Git Graph, Error Lens, Better Comments, Todo Tree, Project Manager, CodeSnap \
语言插件: \
clangd, rust-analyzer, Even Better TOML, Markdown All in One, Lua, Python, Language Support for Java by Red Hat, JavaScript and TypeScript Nightly, Go, Tailwind CSS IntelliSense

## settings.json:
```json:no-line-numbers
{
  "editor.semanticTokenColorCustomizations": {
    "[Gruvbox Dark Hard]": {
        "rules": {
            "function": {
                "foreground": "#ffcc99",
                "fontStyle": "bold"
            },
            "method": {
                "foreground": "#ffcc99",
                "fontStyle": "bold"
            },
        }
    },
  },
  "workbench.colorTheme": "Catppuccin Macchiato",
  "workbench.colorCustomizations":  {
    // "editor.background": "#24273a" // catppuccin Macchiato background color
    "editor.background": "#222436", // use tokyo night moon (neovim) background color
    "editorGutter.background": "#222436",
    "tab.activeBackground": "#24273a",
  },
  "window.zoomLevel": 1.5,
  "editor.fontSize": 17,
  "editor.fontWeight": "400",
  "terminal.integrated.fontSize": 15,
  "editor.fontFamily": "'JetBrainsMono Nerd Font', 'vivo Sans'",
  "terminal.integrated.defaultProfile.linux": "zsh",
  "terminal.integrated.fontFamily": "'JetBrainsMono Nerd Font', 'vivo Sans'",
  "editor.cursorBlinking": "smooth",
  "editor.smoothScrolling": true,
  "workbench.list.smoothScrolling": true,
  "editor.cursorSmoothCaretAnimation": "on",
  "terminal.integrated.smoothScrolling": true,
  "explorer.confirmDelete": false,
  "explorer.confirmPasteNative": false,
  "explorer.confirmDragAndDrop": false,
  "editor.fontLigatures": true,
  "C_Cpp.intelliSenseEngine": "disabled",
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.autofetch": true,
  "editor.tabSize": 2,
  "git.openRepositoryInParentFolders": "always",
  "workbench.tree.indent": 23,
  "workbench.iconTheme": "catppuccin-macchiato",
  "workbench.statusBar.visible": true,
  "workbench.activityBar.location": "bottom",
  "catppuccin-icons.hidesExplorerArrows": true,
  "security.workspace.trust.untrustedFiles": "open",
  "editor.quickSuggestions": {
      "comments": "on",
      "strings": "on"
  },
  "vim.useSystemClipboard": true,
  "vim.highlightedyank.enable": true,
  "vim.highlightedyank.textColor": "#282828",  // gruvbox bg0
  "vim.highlightedyank.color": "#fbf1c7",  // gruvbox fg0
  "vim.hlsearch": true,
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": ["<Esc>"],
      "commands": [":nohlsearch"]
    }
  ],
  "http.proxy": "http://127.0.0.1:7890",
  "http.proxyStrictSSL": false,
  "files.exclude": {
    "**/.git": false
  },
  "terminal.external.linuxExec": "nautilus",
  "terminal.integrated.persistentSessionScrollback": 1000,
  "editor.linkedEditing": true,
  "window.enableMenuBarMnemonics": false,
  "window.menuBarVisibility": "hidden", // Hide native menuBar
  "window.customMenuBarAltFocus": false,
  "editor.minimap.enabled": true,
  "editor.minimap.showSlider": "always",
  "editor.scrollbar.verticalScrollbarSize": 0,
  "editor.scrollbar.horizontalScrollbarSize": 6,
  "editor.inlayHints.enabled": "offUnlessPressed",
  "cSpell.diagnosticLevel": "Hint",
  "cSpell.minWordLength": 5,
  "material-icon-theme.hidesExplorerArrows": true,
  "material-icon-theme.folders.color": "#ffaacc",
  "material-icon-theme.files.color": "#ffaacc",
  "errorLens.onSave": true,
  "errorLens.enabledDiagnosticLevels": [
      "error"
  ],
  "extensions.ignoreRecommendations": true,
  "editor.mouseWheelScrollSensitivity": 5, // 滚轮速度
  "typescript.updateImportsOnFileMove.enabled": "always",
  // projects manager
  "projectManager.git.baseFolders": [
    "$home/CodeSpace"
  ],
  "projectManager.sortList": "Recent",
  // codesnap
  "codesnap.backgroundColor": "#282828",
  "codesnap.containerPadding": "0.1em",
  "codesnap.shutterAction": "copy",
  "codesnap.boxShadow": "rgba(0, 0, 0, 0) 0px 20px 68px",
  "codesnap.showWindowControls": false,
  "codesnap.showLineNumbers": false,
  "codesnap.transparentBackground": true,
}
```

## keybindings.json:

```json:no-line-numbers
[
  {
    "key": "ctrl+t",
    "command": "workbench.action.terminal.toggleTerminal",
    "when": "terminal.active"
  },
  {
    "key": "space e",
    "command": "workbench.view.explorer",
    "when": "(vim.mode == 'Normal' && editorFocus) || !inputFocus"
  },
  {
    "key": "space shift+e",
    "command": "workbench.action.toggleSidebarVisibility",
    "when": "(vim.mode == 'Normal' && editorFocus) || !inputFocus"
  },  
  {
    "key": "space c",
    "command": "workbench.action.closeActiveEditor",
    "when": "(vim.mode == 'Normal' && editorFocus) || !inputFocus"
  },
  {
    "key": "space s",
    "command": "workbench.action.quickTextSearch",
    "when": "(vim.mode == 'Normal' && editorFocus) || !inputFocus"
  },
  {
    "key": "space f",
    "command": "workbench.action.quickOpen",
    "when": "(vim.mode == 'Normal' && editorFocus) || !inputFocus"
  },
  {
    "key": "shift+l",
    "command": "workbench.action.nextEditor",
    "when": "((vim.mode == 'Normal' && editorFocus) || !inputFocus) && !renameInputVisible"
  },
  {
    "key": "shift+h",
    "command": "workbench.action.previousEditor",
    "when": "((vim.mode == 'Normal' && editorFocus) || !inputFocus) && !renameInputVisible"
  },
  {
    "key": "ctrl+w",
    "command": "-workbench.action.closeActiveEditor"
  },
  {
    "key": "shift+a",
    "command": "explorer.newFolder",
    "when": "explorerViewletVisible && explorerViewletFocus && !inputFocus"
  },
  {
    "key": "a",
    "command": "explorer.newFile",
    "when": "explorerViewletVisible && explorerViewletFocus && !inputFocus"
  },
  {
    "key": "r",
    "command": "renameFile",
    "when": "explorerViewletVisible && explorerViewletFocus && !inputFocus"
  },
  {
    "key": "shift+k",
    "command": "editor.action.showHover",
    "when": "((vim.mode == 'Normal' && editorFocus) || !inputFocus) && !renameInputVisible"
  },
  {
    "key": "ctrl+c",
    "command": "workbench.action.closeQuickOpen",
    "when": "inQuickOpen"
  },
  {
    "key": "ctrl+e",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+p",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+n",
    "command": "-workbench.action.files.newUntitledFile"
  },
  {
    "key": "ctrl+n",
    "command": "quickInput.next",
    "when": "inQuickInput && quickInputType == 'quickPick'"
  },
  {
    "key": "ctrl+p",
    "command": "quickInput.previous",
    "when": "inQuickInput && quickInputType == 'quickPick'"
  },
  {
    "key": "ctrl+n",
    "command": "editor.action.triggerSuggest",
    "when": "(vim.mode == 'Insert' && editorFocus) && !suggestWidgetVisible"
  },
  {
    "key": "ctrl+p",
    "command": "editor.action.triggerSuggest",
    "when": "(vim.mode == 'Insert' && editorFocus) && !suggestWidgetVisible"
  },
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.toggleMaximizedPanel",
    "when": "panelAlignment == 'center' || panelPosition != 'bottom'"
  },
  {
    "key": "space b",
    "command": "workbench.action.toggleAuxiliaryBar",
    "when": "(vim.mode == 'Normal' && editorFocus) || !inputFocus",
  },
]
```