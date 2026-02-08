# HUE 🎨

A daily color-guessing game inspired by Wordle. Guess the RGB values of the daily color in 5 tries or less.

## Play

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## How to Play

1. **Adjust the sliders** to set your RGB guess
2. **Click "Make Guess"** to submit
3. **Read the hints** - they tell you which colors to add/remove
4. **Get feedback** on your distance from the target
5. **Solve in 5 guesses or less!**

## Hard Mode

Enable "Hard mode" for a memory challenge - the target color is only visible for 3 seconds!

## Daily Color

The target color is generated deterministically from the current date, so everyone gets the same color each day. New color at midnight UTC.

## Share Your Results

When you win (or lose), click "Share Results" to copy a grid like:

```
HUE #142 3/5
⬛🟨🟨⬜⬜
```

- 🟩 = Exact match
- 🟨 = Close (< 30 delta)
- 🟧 = Getting there (< 80 delta)  
- ⬛ = Far off

## Tech Stack

- React + TypeScript
- Vite
- No backend required - runs entirely in browser

## License

MIT
