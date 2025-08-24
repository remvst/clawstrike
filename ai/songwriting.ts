import 'dotenv/config';
import OpenAI from "openai";
import { ResponseInput } from 'openai/resources/responses/responses.mjs';
import fs from 'fs/promises';

(async function main() {
    // const songId = '2025-08-22T03-40-11-162Z';
    // const songId = '2025-08-24T15-10-22-781Z';
    const songId = new Date().toISOString().replace(/[:.]/g, '-');

    const outPath = 'ai/out/' + songId;
    await fs.mkdir(outPath, { recursive: true });

    const formats = {
        songMeta: JSON.parse(await fs.readFile('ai/formats/song-meta-format.json', 'utf-8')),
        instrument: JSON.parse(await fs.readFile('ai/formats/instrument-format.json', 'utf-8')),
        pattern: JSON.parse(await fs.readFile('ai/formats/pattern-format.json', 'utf-8')),
        song: JSON.parse(await fs.readFile('ai/formats/sample3.json', 'utf-8')),
    };
    const client = new OpenAI();
    const input: ResponseInput = [];

    let totalTokens = 0;

    input.push({
        role: "system",
        content: `
        You are a helpful assistant that can generate songs that may be used in a video game.
        Songs will then be imported into the sonantx-live tool.

        The user will ask you to define the song through a series of steps.
        `,
    });

    input.push({
        role: "system",
        content: `
        ## 1. Defining the song

        The song needs a title and a BPM. It also needs a description to explain why it fits the game.
        Define the song folling this JSON format: ${JSON.stringify(formats.songMeta)}
        `
    })

    input.push({
        role: "user",
        content: `
        The game is a 2D action platformer where you control a black cat.
        The goal is to eliminate all the enemies in each level by triple striking them with your claws.
        The game is a die and retry, meaning the player will die a lot, but will be able to restart a level very quickly.
        The game is very fast paced. I want to generate a song with a repetitive beat but with different melodies in order to not feel to repetitive.
        The song should be upbeat and energetic, with a tempo of around 120 BPM.
        `,
    });

    input.push({
        role: "user",
        content: "Let's start by defining the song.",
    });

    await getResponse('song-definition');

    input.push({
        role: "system",
        content: `
        ## 2. Defining the instruments

        Define each instrument that will be used in the song (at least 4, 5 is a good number).
        We're going to need at least a melody, a bass and a drum.
        Each instrument should be defined following this JSON format: ${JSON.stringify(formats.instrument)}
        `
    });

    input.push({
        role: "user",
        content: "Now give me the instruments for that song.",
    });

    const instrumentsResponse = await getResponse('instruments');

    input.push({
        role: "system",
        content: `
        ## 3. Define the patterns for each instrument

        You will need to define a set of patterns for each instrument. Each instrument should have 3 or 4 patterns.
        Each pattern should have a maximum of 16 notes.
        Define each instrument's patterns in JSON format: ${JSON.stringify(formats.pattern)}
        Do not use K or S, use actual notes.
        `
    });

    let i = 0;
    for (const instrument of instrumentsResponse.instruments) {
        input.push({
            role: "user",
            content: `Define the patterns for the instrument: ${instrument.name}`,
        });

        await getResponse('instrument-patterns-' + i);

        i++;
    }

    input.push({
        role: "system",
        content: `
        ## 4. Putting it all together

        Assemble the instruments and their patterns you generated into the song.
        Remember that patterns have up to 16 notes, but you'll need arrays of 32 items under the "n" key.
        Include breaks between notes to accomodate.
        When including a pattern in the final sequence (in the "p" value of each instrument), use the pattern index starting at 1 (i.e. the first pattern is 1, second pattern is 2). Do not include "0" as it would be a blank.
        Generate a final JSON object that contains everything in the sonantx-live format: ${JSON.stringify(formats.song)}
        `
    });

    // Put it all together!
    input.push({
        role: "user",
        content: `Now let's put it all together. Give me the full song's JSON.`,
    });
    await getResponse('song');

    async function getResponse(label: string) {
        console.log(`Getting response for ${label}...`);
        const filePath = `${outPath}/${label}.json`;

        let json;
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            console.log(`Found cached response`);

            json = JSON.parse(fileContent);
        } catch (err) {
            console.log(`Generating...`);
            const response = await client.responses.create({
                model: "gpt-5",
                text: { format: {type: "json_object"} },
                input,
            });
            input.push(...response.output);

            totalTokens += response.usage?.total_tokens || 0;
            console.log(`Used ${response.usage?.total_tokens || 0} tokens (total: ${totalTokens})`);

            const { output_text } = response;
            json = JSON.parse(output_text);
            await fs.writeFile(filePath, JSON.stringify(json, null, 2));
        }

        input.push({
            role: "assistant",
            content: JSON.stringify(json),
        });

        return json;
    }
})();
