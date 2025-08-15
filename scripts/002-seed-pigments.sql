-- Seed PMU Pro with professional pigment database
-- Based on popular PMU pigment brands and formulations

INSERT INTO pigments (brand, name, base_tone, hue_notes, opacity, ideal_fitz, temp_shift, use_case, hex_preview) VALUES

-- Permablend (Popular PMU Brand)
('Permablend', 'Honey Magic', 'warm', 'yellow/orange undertones, golden base', 'medium', 'I-III', 'slight warm heal, may fade to golden', 'brows', '#8B6914'),
('Permablend', 'Ash Brown', 'cool', 'ash undertones, gray base', 'medium', 'II-IV', 'may fade to gray', 'brows', '#6B5B73'),
('Permablend', 'Espresso', 'neutral', 'balanced brown, slight red undertone', 'high', 'III-V', 'stable healing, minimal shift', 'brows', '#4A3728'),
('Permablend', 'Blonde', 'warm', 'light golden base', 'low', 'I-II', 'may fade to yellow', 'brows', '#B8860B'),

-- Li Pigments (Professional Grade)
('Li Pigments', 'Gray Vanish', 'warm', 'orange corrector for gray coverage', 'high', 'II-V', 'corrects cool tones', 'brows', '#CD853F'),
('Li Pigments', 'Mocha', 'neutral', 'rich brown with slight red', 'medium', 'III-IV', 'stable, minimal shift', 'brows', '#8B4513'),
('Li Pigments', 'Taupe', 'cool', 'gray-brown, ash undertones', 'medium', 'II-IV', 'may fade to gray', 'brows', '#8B7D6B'),

-- Tina Davies (Premium Brand)
('Tina Davies', 'I Love Ink Ash Brown', 'cool', 'true ash, gray undertones', 'medium', 'II-IV', 'fades to soft gray', 'brows', '#696969'),
('Tina Davies', 'I Love Ink Warm Brown', 'warm', 'golden brown, yellow base', 'medium', 'II-IV', 'warm healing', 'brows', '#A0522D'),
('Tina Davies', 'I Love Ink Dark Brown', 'neutral', 'deep brown, balanced', 'high', 'III-VI', 'stable healing', 'brows', '#654321'),

-- Lip Pigments
('Permablend', 'Dusty Rose', 'cool', 'muted pink, blue undertones', 'medium', 'I-IV', 'may fade to pink', 'lips', '#BC8F8F'),
('Permablend', 'Coral Crush', 'warm', 'orange-pink, coral base', 'medium', 'II-V', 'warm healing', 'lips', '#FF7F50'),
('Li Pigments', 'Berry Wine', 'cool', 'deep berry, purple undertones', 'high', 'III-VI', 'may fade to purple', 'lips', '#8B008B'),
('Tina Davies', 'Lip Blush Pink', 'neutral', 'natural pink, balanced', 'low', 'I-IV', 'natural healing', 'lips', '#FFB6C1'),

-- Eyeliner Pigments
('Permablend', 'Black', 'neutral', 'true black', 'high', 'I-VI', 'stable, minimal fade', 'liner', '#000000'),
('Permablend', 'Brown Black', 'warm', 'dark brown with black', 'high', 'II-VI', 'may soften to brown', 'liner', '#2F1B14'),
('Li Pigments', 'Charcoal', 'cool', 'gray-black, soft', 'medium', 'I-V', 'fades to charcoal', 'liner', '#36454F'),

-- Specialized/Corrector Pigments
('Permablend', 'Orange Corrector', 'warm', 'pure orange for blue correction', 'medium', 'III-VI', 'corrective use only', 'brows', '#FF8C00'),
('Li Pigments', 'Yellow Corrector', 'warm', 'pure yellow for purple correction', 'low', 'I-IV', 'corrective use only', 'brows', '#FFD700'),
('Tina Davies', 'Salmon Corrector', 'warm', 'pink-orange for green correction', 'medium', 'II-V', 'corrective use only', 'brows', '#FA8072');

-- Update the created_at and updated_at to current timestamp
UPDATE pigments SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
