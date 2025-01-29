---
title: How to pass cookies to yt-dlp
order: 1
---

# How to pass cookies to yt-dlp

Passing cookies to yt-dlp is a good way to <EngWord word="workaround" highlight="n 0" content="workaround"/>(这里应该是名词修饰名词) login when a particular extractor does not implement it explicitly. Another use case is working around CAPTCHA(一种验证码系统) some websites require you to solve in particular cases in order to get access (e.g. YouTube, CloudFlare).

The easiest way to pass cookies is to let yt-dlp extract it from your browser (say, Chrome) using `--cookies-from-browser chrome`. In Linux, this searches for config in location ~/.config/google-chrome. In case you install Chrome using Flatpak, the config is located in ~/.var/app/com.google.Chrome. To pass the cookies from this location use `--cookies-from-browser chrome:~/.var/app/com.google.Chrome/`

If you wish to manually pass cookies, use the `--cookies` option, for example: `--cookies /path/to/cookies/file.txt.`

You can export your cookies to a text file without any third-party software by using yt-dlp's `--cookies-from-browser` option <EngWord word="in conjunction with" highlight=" 0" content="in conjunction with" /> the `--cookies` option, for example: `yt-dlp --cookies-from-browser chrome --cookies cookies.txt`. yt-dlp will extract the browser cookies and save them to the filepath specified after `--cookies`. The resulting text file can then be used with the `--cookies` option. Note though that this method exports your browser's cookies for ALL sites (even if you passed a URL to yt-dlp), so take care in not letting this text file fall into the wrong hands.

You may also use a conforming browser extension for exporting cookies, such as ["Get cookies.txt LOCALLY"](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) for Chrome or ["cookies.txt"](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/) for Firefox. As with any browser extension, be careful about what you install. If you had previously installed the "Get cookies.txt" (not "LOCALLY") Chrome extension, it's recommended to uninstall it immediately; it has been reported as malware and removed from the Chrome Web Store.

Note that the cookies file must be in Mozilla/Netscape format and the first line of the cookies file must be either `# HTTP Cookie File` or `# Netscape HTTP Cookie File`. Make sure you have correct newline format in the cookies file and convert newlines if necessary to correspond with your OS, namely CRLF (\r\n) for Windows and LF (\n) for Unix and Unix-like systems (Linux, macOS, etc.). `HTTP Error 400: Bad Request` when using `--cookies` is a good sign of invalid newline format.