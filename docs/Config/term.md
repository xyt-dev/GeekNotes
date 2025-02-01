---
title: 终端相关配置
order: 2
---

# 终端相关配置

## WezTerm 配置

### ~/.config/wezterm/wezterm.lua

```lua:no-line-numbers
local wezterm = require("wezterm")
local act = wezterm.action
local config = {
  font_size = 16,
  font = wezterm.font("JetBrainsMono Nerd Font", {weight = "Regular"}),
  color_scheme = "Catppuccin Mocha",

  use_fancy_tab_bar = false,
  hide_tab_bar_if_only_one_tab = true,
  show_new_tab_button_in_tab_bar = false,
  window_background_opacity = 0.85,
  
  window_padding = {
    left = 20,
    right = 20,
    top = 5,
    bottom = 5,
  },

  keys = {
    { key = 'l', mods = 'CTRL', action = act.ActivateTabRelative(1) },
    { key = 'h', mods = 'CTRL', action = act.ActivateTabRelative(-1) },
  },
}

return config
```

## Kitty 配置

### ~/.config/kitty/kitty.conf

```shell
# BEGIN_KITTY_THEME
# Catppuccin-Mocha
include current-theme.conf
# END_KITTY_THEME

font_size 16
font_family JetBrainsMono Nerd Font
background_opacity 0.7

# # 复制
# map ctrl+c copy_to_clipboard
#
# # 粘贴
# map ctrl+v paste_from_clipboard

# 光标轨迹
cursor_trail 1
cursor_trail_decay 0.01 0.2
# 游标跟踪启动阈值
cursor_trail_start_threshold 0
```

## zsh theme (使用 [Starship](https://starship.rs))
在.zshrc中添加:
```zsh:no-line-numbers
# starship
eval "$(starship init zsh)"

```
### ~/.config/starship.toml
Catppuccin配色:
```toml:no-line-numbers
# Get editor completions based on the config schema
"$schema" = 'https://starship.rs/config-schema.json'

# Sets user-defined palette
# Palettes must be defined _after_ this line
palette = "catppuccin_macchiato"

# Starship modules
[character]
# Note the use of Catppuccin color 'peach'
success_symbol = "[[󰣇](green) ❯](rosewater)"
error_symbol = "[[󰣇](red) ❯](rosewater)"
vimcmd_symbol = "[[󰣇](red) ❮](rosewater)" # For use with zsh-vi-mode

[git_branch]
style = "bold mauve"

[directory]
truncation_length = 4
style = "bold lavender"

# Palette definitions
[palettes.catppuccin_latte]
rosewater = "#dc8a78"
flamingo = "#dd7878"
pink = "#ea76cb"
mauve = "#8839ef"
red = "#d20f39"
maroon = "#e64553"
peach = "#fe640b"
yellow = "#df8e1d"
green = "#40a02b"
teal = "#179299"
sky = "#04a5e5"
sapphire = "#209fb5"
blue = "#1e66f5"
lavender = "#7287fd"
text = "#4c4f69"
subtext1 = "#5c5f77"
subtext0 = "#6c6f85"
overlay2 = "#7c7f93"
overlay1 = "#8c8fa1"
overlay0 = "#9ca0b0"
surface2 = "#acb0be"
surface1 = "#bcc0cc"
surface0 = "#ccd0da"
base = "#eff1f5"
mantle = "#e6e9ef"
crust = "#dce0e8"

[palettes.catppuccin_frappe]
rosewater = "#f2d5cf"
flamingo = "#eebebe"
pink = "#f4b8e4"
mauve = "#ca9ee6"
red = "#e78284"
maroon = "#ea999c"
peach = "#ef9f76"
yellow = "#e5c890"
green = "#a6d189"
teal = "#81c8be"
sky = "#99d1db"
sapphire = "#85c1dc"
blue = "#8caaee"
lavender = "#babbf1"
text = "#c6d0f5"
subtext1 = "#b5bfe2"
subtext0 = "#a5adce"
overlay2 = "#949cbb"
overlay1 = "#838ba7"
overlay0 = "#737994"
surface2 = "#626880"
surface1 = "#51576d"
surface0 = "#414559"
base = "#303446"
mantle = "#292c3c"
crust = "#232634"

[palettes.catppuccin_macchiato]
rosewater = "#f4dbd6"
flamingo = "#f0c6c6"
pink = "#f5bde6"
mauve = "#c6a0f6"
red = "#ed8796"
maroon = "#ee99a0"
peach = "#f5a97f"
yellow = "#eed49f"
green = "#a6da95"
teal = "#8bd5ca"
sky = "#91d7e3"
sapphire = "#7dc4e4"
blue = "#8aadf4"
lavender = "#b7bdf8"
text = "#cad3f5"
subtext1 = "#b8c0e0"
subtext0 = "#a5adcb"
overlay2 = "#939ab7"
overlay1 = "#8087a2"
overlay0 = "#6e738d"
surface2 = "#5b6078"
surface1 = "#494d64"
surface0 = "#363a4f"
base = "#24273a"
mantle = "#1e2030"
crust = "#181926"

[palettes.catppuccin_mocha]
rosewater = "#f5e0dc"
flamingo = "#f2cdcd"
pink = "#f5c2e7"
mauve = "#cba6f7"
red = "#f38ba8"
maroon = "#eba0ac"
peach = "#fab387"
yellow = "#f9e2af"
green = "#a6e3a1"
teal = "#94e2d5"
sky = "#89dceb"
sapphire = "#74c7ec"
blue = "#89b4fa"
lavender = "#b4befe"
text = "#cdd6f4"
subtext1 = "#bac2de"
subtext0 = "#a6adc8"
overlay2 = "#9399b2"
overlay1 = "#7f849c"
overlay0 = "#6c7086"
surface2 = "#585b70"
surface1 = "#45475a"
surface0 = "#313244"
base = "#1e1e2e"
mantle = "#181825"
crust = "#11111b"
```

## 命令行环境客制化(Env.sh)

.zshrc中添加:
```shell:no-line-numbers
source ~/Env.sh

```

Env.sh:
```shell:no-line-numbers
#!zsh

alias reload="hyprctl reload"
alias vim="nvim" # yay -S neovim
alias rm="trash" # yay -S trash-cli
alias mv="mv -n" # 防止 mv 覆盖文件
alias ls="lsd" # yay -S lsd
alias find="fd" # yay -S fd
alias yt="yt-dlp" # yay -S yt-dlp

export MANPAGER="nvim +Man!" # 使用 neovim 查看 man page
```

### 使用sudo编辑文件时如何使用nvim及其用户配置

配置文件(.zshrc or Env.txt)中添加: 
```shell:no-line-numbers
export SUDO_EDITOR="nvim"
```
之后使用 `sudoedit` or `sudo -e` 编辑文件即可.