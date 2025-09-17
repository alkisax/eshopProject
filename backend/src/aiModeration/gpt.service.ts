import axios from 'axios';

export const getGPTResponse = async (
  commentToCheck: string,
  gpt_prompt: string,
  apiKey: string
): Promise<string> => {
  const fullPrompt = `${gpt_prompt} ${commentToCheck}`;

  const url = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await axios.post(
      url,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: fullPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error fetching GPT response: ${error.message}`);
    } else if (typeof error === 'string') {
      throw new Error(`Error fetching GPT response: ${error}`);
    } else {
      throw new Error('Error fetching GPT response: Unknown error');
    }
  }
};
