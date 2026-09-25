# 🐍 MR.Nagesha

## Classic Retro Snake Game

MR.Nagesha is a classic retro Snake game inspired by old-school handheld mobile games. It combines a nostalgic LCD-style interface with modern web technologies and works on both desktop/laptop and mobile devices.

The game is also available as a Progressive Web App (PWA), allowing it to be installed and played like an application.

---


## 🎮 Features

- 🐍 Classic Snake gameplay
- 💻 Desktop and laptop support
- 📱 Mobile responsive design
- 👆 Touch and swipe controls
- ⌨️ Keyboard controls
- 🎛️ Physical-style D-pad controls
- 🔵 START, PAUSE and OK controls
- 🍎 Small food and bonus food
- ⏱️ Limited-time bonus food
- 🏆 High score system
- 🔊 Retro sound effects
- 🔇 Mute / Unmute option
- 📤 Share game option
- 📲 Installable as an app
- 📴 Offline gameplay
- 🌐 Progressive Web App (PWA)
- 💾 Local high-score storage
- 🔄 Screen wrapping gameplay

---

## 🕹️ Controls

### 💻 Desktop / Laptop

| Key | Action |
|---|---|
| ↑ | Move Up |
| ↓ | Move Down |
| ← | Move Left |
| → | Move Right |
| SPACE | Start / Pause / Resume |

### 📱 Mobile

Use the on-screen D-pad to control the Snake.

You can also swipe on the game screen:

- Swipe Up → Move Up
- Swipe Down → Move Down
- Swipe Left → Move Left
- Swipe Right → Move Right

The physical-style START, MUTE and OK buttons can also be used.

---

## 🍎 Food System

### Small Food

Eating small food increases the score and makes the Snake grow.

After collecting 5 small foods, a bonus food item can appear.

### 🔴 Bonus Food

Bonus food appears for a limited amount of time.

Collecting it provides additional points and increases the Snake's length.

The remaining time is displayed using the LCD timer.

---

## 🏆 High Score

The game automatically stores the player's high score locally in the browser.

No account or online server is required for the high-score system.

---

## 🔊 Sound Effects

The game includes retro sound effects for:

- Small food
- Bonus food
- Game over

The MUTE button can be used to enable or disable game sounds.

---

## 📲 Install as an App

MR.Nagesha supports Progressive Web App (PWA) installation.

On supported browsers, the game can be installed and opened like a normal application.

The installed application uses:

- Standalone display mode
- Custom application icons
- Offline caching
- Local game storage

---

## 📴 Offline Gameplay

MR.Nagesha uses a Service Worker to cache the game files.

The cached resources include:

- HTML
- CSS
- JavaScript
- Web App Manifest
- Application icons
- Sound effects

After the required files have been cached, the game can be played without an internet connection.

---

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- HTML Canvas
- LocalStorage
- Service Worker
- Web App Manifest
- Progressive Web App (PWA)

---

## 🎨 Design

MR.Nagesha is designed to resemble a classic handheld LCD gaming device.

The interface includes:

- Retro LCD display
- Pixel-style Snake
- Pixel-style food
- Metallic handheld-console design
- Physical-style buttons
- D-pad
- Blue OK button
- Retro typography
- Responsive mobile layout

---

## 📱 Desktop & Mobile

### Desktop / Laptop

![MR.Nagesha Desktop]()

### Mobile

![MR.Nagesha Mobile]()

---

## 📂 Project Structure

```text
MR.Nagesha/
│
├── index.html
├── style.css
├── game.js
│
├── manifest.json
├── service-worker.js
│
├── icon-192.png
├── icon-512.png
│
├── eat_small_food_.wav
├── eat_big_food.wav
├── game_over.wav
│
└── README.md
