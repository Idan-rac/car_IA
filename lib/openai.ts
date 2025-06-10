import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(messages: { role: string; content: string }[]) {
    try {
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
} 