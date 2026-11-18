# Distance Archive

A silent photographic archive in five acts, written in plain HTML, CSS and JavaScript with no build step.

```
index.html      page skeleton
style.css       look, transitions, mobile layout
script.js       ARCHIVE_DATA + all interaction
images/         web-sized photos (lowercase .jpg, max 2400 px)
images/thumbs/  480 px thumbnails (Act I field nodes + load check)
```

The `1막. …` to `5막. …` folders hold the full-resolution originals. The site never loads them. Leave them out of the GitHub repo to keep it small (≈200 MB vs ≈24 MB).

## Run locally

Geolocation only works over `https://` or `http://localhost`, so don't double-click the file. Start a server instead:

```
python -m http.server 8000
```

then open <http://localhost:8000>.

## Deploy to GitHub Pages

Push `index.html`, `style.css`, `script.js` and `images/` to a repo, then go to **Settings → Pages → Deploy from branch → main / root**. GitHub Pages is case-sensitive, so every filename in `ARCHIVE_DATA` must match the file exactly (all lowercase `.jpg` here). If a file can't be loaded, the site skips that photo and logs a warning in the browser console rather than showing a broken image.

---

## Editing metadata (dates, places, GPS)

All captions live in the `ARCHIVE_DATA` array at the top of `script.js`. The site does **not** read EXIF in the browser. The web copies were re-encoded, and reading EXIF client-side would need a library. Edit the entry instead:

```js
{ id: '2-12', file: '2-12.jpg', date: '2026-03-14', time: '11:24:33',
  location: 'Paddington, London', lat: 51.520603, lon: -0.177464 },
```

| field      | shown in DATA mode as | notes |
|------------|-----------------------|-------|
| `date`, `time` | `CAPTURED` | pre-filled from each camera's EXIF |
| `location` | `LOCATION` | `''` shows `—` |
| `lat`, `lon` | `COORD` + `DISTANCE` | decimal degrees, south/west negative; `null` shows `NO FIX` and no distance |
| `branch` | (Act III only) | `'shore'` or `'gate'` |

Only **2-12** carried GPS in its EXIF. Everything else needs coordinates added by hand if you want a distance to appear. To get decimal coordinates, right-click a spot in Google Maps and click the numbers to copy them.

**3-5** was converted from HEIC and its EXIF didn't survive, so its date and time are blank. To find them, open the original `3막. Wonder/3-5.HEIC` in Windows Photos (ⓘ info panel) and type them in.

To read EXIF from the originals yourself:

```
python -c "from PIL import Image; e=Image.open('1막. The Open Stage/1-1.JPG').getexif(); print(e.get_ifd(0x8769).get(36867), e.get_ifd(0x8825))"
```

### Adding, removing or reordering photos

1. Put the web copy in `images/` and a ≤480 px copy with the same name in `images/thumbs/`.
2. Add a line to `ARCHIVE_DATA`.

The act comes from the filename prefix (`4-9` → Act IV). Order within an act follows the number after the dash. Line order in the array doesn't matter.

---

## Adjusting the smartphone hotspot (final frame)

The final frame is **`5-4`** (the hand holding a phone up to the painting). Its invisible hotspot is set in `script.js`:

```js
const FINAL_HOTSPOT = {
  image: '5-4',
  left: 7.5,   // % from the photo's left edge
  top: 51,     // % from the photo's top edge
  width: 16,   // % of the photo's width
  height: 16,  // % of the photo's height
};
const DEBUG_HOTSPOT = false;
```

Values are percentages **of the photograph**, not of the window. The hotspot sits inside a box that hugs the image, so it stays on the phone at any screen size or orientation.

To adjust it:

1. Set `DEBUG_HOTSPOT = true`. A translucent red box appears over the hotspot.
2. Walk through to the final frame (or temporarily make `5-4` the only Act V entry).
3. Nudge `left` / `top` / `width` / `height` and reload until the box covers the phone screen.
4. Set `DEBUG_HOTSPOT = false` again.

If you crop or replace `5-4.jpg`, re-measure. Open it in any editor, divide the phone's pixel position by the image's width/height, and multiply by 100.

---

## Other things you can tune (`CONFIG` in `script.js`)

| setting | default | effect |
|---|---|---|
| `act1UnlockAfter` | 6 | nodes to approach in Act I before `→` appears |
| `dwell.act1…act5` | 1.6–3.2 s | how long a photo is held before the way forward appears |
| `focusSeconds` | 2.5 | Act IV: stillness/hold needed to clear the glass |
| `refogSeconds` | 3.8 | Act IV: time for the glass to fog again |
| `pace` | day 1 · twilight 1.25 · night 1.6 | multiplier on all fades and dwell times |

Ambient times: **night** 22:00–05:00 (darkest, slowest), **twilight** 05:00–08:00 and 18:00–22:00, **day** otherwise. Background tones are in `style.css` under `body[data-ambient=…]`.

## Notes on the sequence

- **Act III** has two spaces: *shore* (`3-1` to `3-5`, open air and the sea) and *gate* (`3-6` to `3-9`, arrivals hall 2E). On each photo, one edge continues in the same space and the other drifts to the other space. Which edge does which is reshuffled every time. `→` to Act IV appears once all nine photos have been seen. To move a photo to the other space, change its `branch`.
- **Act IV:** hold the mouse button, a finger, or Space on the photo, or rest the cursor still on it.
- **Act V** hides all interface elements. Click or tap a photo to move on. On `5-4`, only the phone screen responds.
- Keyboard: arrow keys pan the Act I field and move forward elsewhere. `Esc` steps back from an approached photo in Act I.
