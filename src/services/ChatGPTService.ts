import OpenAI from 'openai';
import { ChatRequest, ChatResponse, Message, PersonalityTraits } from '../types';

export class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.language, request.personality);
      const messages = this.formatMessages(request.messages, systemPrompt);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const responseMessage = completion.choices[0]?.message?.content;
      
      if (!responseMessage) {
        return { message: '', error: 'No response generated' };
      }

      return { message: responseMessage };
    } catch (error: any) {
      console.error('ChatGPT API Error:', error);
      
      if (error.status === 429) {
        return { message: '', error: 'Rate limit exceeded' };
      } else if (error.status === 401) {
        return { message: '', error: 'Invalid API key' };
      } else if (error.status === 402) {
        return { message: '', error: 'Insufficient credits' };
      }
      
      return { message: '', error: 'Failed to generate response' };
    }
  }

  private buildSystemPrompt(language: string, personality: PersonalityTraits): string {
    const isHebrew = language === 'hebrew';
    const basePrompt = isHebrew 
      ? 'אתה מורה עוזר וידידותי שעוזר לתלמידים ללמוד.' 
      : 'You are a helpful and friendly teacher assistant helping students learn.';

    let personalityPrompt = '';
    
    if (personality.humor > 3) {
      personalityPrompt += isHebrew 
        ? ' השתמש בהומור כדי להפוך את הלמידה למהנה יותר.' 
        : ' Use humor to make learning more enjoyable.';
    }
    
    if (personality.seriousness > 3) {
      personalityPrompt += isHebrew 
        ? ' התמקד בתוכן הלימודי ובדיוק.' 
        : ' Focus on academic content and accuracy.';
    }
    
    if (personality.professionalism > 3) {
      personalityPrompt += isHebrew 
        ? ' שמור על טון פורמלי ומקצועי.' 
        : ' Maintain a formal and professional tone.';
    }

    return basePrompt + personalityPrompt + (isHebrew 
      ? ' תמיד ענה בעברית.' 
      : ' Always respond in English.');
  }

  private formatMessages(messages: Message[], systemPrompt: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Only include the last 10 messages to avoid token limits
    const recentMessages = messages.slice(-10);
    
    for (const message of recentMessages) {
      formattedMessages.push({
        role: message.isUser ? 'user' : 'assistant',
        content: message.content
      });
    }

    return formattedMessages;
  }
}