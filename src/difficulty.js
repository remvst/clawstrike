DIFFICULTY_NORMAL = {
    maxDeaths: Infinity,
    maxDamageTaken: 1,
    label: nomangle('NORMAL'),
    humanReactionTime: 0.2,
};

DIFFICULTY_EASY = {
    ...DIFFICULTY_NORMAL,
    maxDamageTaken: 3,
    label: nomangle('EASY'),
    humanReactionTime: 0.5,
};

DIFFICULTY_NINE_LIVES = {
    ...DIFFICULTY_NORMAL,
    maxDeaths: 9,
    label: nomangle('9 LIVES'),
};

DIFFICULTIES = [DIFFICULTY_NORMAL, DIFFICULTY_EASY];
