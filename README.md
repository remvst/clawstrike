<p align="center">
<img src="/assets/gameplay-screenshot.png">
</p>

# Meowssassin

**Meowssassin** is my entry for 2024's [JS13K](https://js13kgames.com/).
The theme for the competition was **Black Cat**.

## Build

- Install depencies: `make install`
- Debugging: `npm start`
- Building:
    - Debug: `make debug`
    - Preprod: `make preprod`
    - Prod: `make prod`
    - All: `make`

## Tools used

- [ZzFX](https://github.com/KilledByAPixel/ZzFX)
- [Sonant-X](https://github.com/nicolas-van/sonant-x)
- [Sonant-X Live](https://github.com/nicolas-van/sonant-x-live)

## Song generation

GPT-5 was used in order to generate the song. All the prompts and scripts can be found under `ai/`.

In order to generate a new song, you'll need an API key, and add it to your `.env`:

```
OPENAI_API_KEY=<YOUR_API_KEY>
```

Then run `npm run songwriter`. **This will cost a significant amount of tokens. Please don't burn the entire rainforest to generate songs.**

Song definition can then be found in `ai/out`, which you can then import in Sonant-X Live.

# License

Feel free to read the code but don't use it for commercial purposes. The game is the result of a lot of hard work and I wish to maintain all rights to it.

Please reach out if you wish to distribute the game on your portal.
