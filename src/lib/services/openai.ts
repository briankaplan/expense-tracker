import { OPENAI_API_KEY } from '@/lib/config';

export class OpenAI {
  private apiKey: string;
  public chat: {
    completions: {
      create: (params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        max_tokens?: number;
      }) => Promise<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>;
    };
  };

  constructor(apiKey: string = OPENAI_API_KEY) {
    this.apiKey = apiKey;
    this.chat = {
      completions: {
        create: async (params) => {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            throw new Error('Failed to generate completion');
          }

          return response.json();
        },
      },
    };
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate completion');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async analyzeText(text: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that analyzes text.' },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async analyzeReceipt(imageUrl: string): Promise<any> {
    try {
      const response = await fetch(imageUrl);
      const imageData = await response.blob();
      const formData = new FormData();
      formData.append('file', imageData);
      formData.append('model', 'gpt-4-vision-preview');

      const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!visionResponse.ok) {
        throw new Error('Failed to analyze receipt');
      }

      const result = await visionResponse.json();
      return {
        items: result.choices[0].message.content,
        total: 0, // You would parse this from the content
        date: new Date().toISOString(), // You would parse this from the content
        merchant: '', // You would parse this from the content
      };
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw error;
    }
  }
} 