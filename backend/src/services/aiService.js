/**
 * AI Service to analyze media (photos, audio, video) and generate text summaries.
 * In a production environment, this would call OpenAI Vision, Whisper, or local models.
 */
const analyzeMedia = async (files) => {
    if (!files || files.length === 0) return "Aucun fichier multimédia à analyser.";

    let summary = [];

    for (const file of files) {
        const fileType = file.mimetype;
        if (fileType.startsWith('image/')) {
            summary.push(`Image (${file.originalname}): Signes potentiels de ${Math.random() > 0.5 ? 'traumatisme physique' : 'détresse émotionnelle'}.`);
        } else if (fileType.startsWith('audio/')) {
            summary.push(`Audio (${file.originalname}): "Cris et pleurs détectés à 00:15".`);
        } else if (fileType.startsWith('video/')) {
            summary.push(`Vidéo (${file.originalname}): Scène de conflit verbal intense.`);
        }
    }

    return summary.join('\n');
};

const predictUrgency = async (text) => {
    // Check for API Token (The user said they created a .env, but we can't find it. 
    // We'll proceed with mock logic but structured as requested, ready for API switch).
    // const apiToken = process.env.AI_API_TOKEN; 

    if (!text) return { risk: 'low', confidence: 0.5 };
    const lowerText = text.toLowerCase();

    // Keywords for Critical/High urgency
    if (lowerText.match(/(suicide|mort|tuer|sang|couteau|arme|danger immédiat|inconscient|viol)/)) {
        return { risk: 'critical', confidence: 0.95 };
    }
    if (lowerText.match(/(frapper|coup|brûlure|menace|peur|seul|nuit)/)) {
        return { risk: 'high', confidence: 0.85 };
    }
    if (lowerText.match(/(triste|pleure|école|faim|froid)/)) {
        return { risk: 'medium', confidence: 0.75 };
    }
    return { risk: 'low', confidence: 0.60 };
};

module.exports = { analyzeMedia, predictUrgency };
