
'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MessageSquare, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

interface ConversationProps {
  context?: string;
}

export function Conversation({ context }: ConversationProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to agent');
      toast({ title: "Connected to agent", description: "You can start speaking now" });
    },
    onDisconnect: () => {
      console.log('Disconnected from agent');
      toast({ title: "Disconnected from agent" });
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const startConversation = useCallback(async () => {
    try {
      if (!apiKey) {
        toast({
          title: "Error",
          description: "Please enter your ElevenLabs API key",
          variant: "destructive"
        });
        return;
      }

      console.log('Requesting microphone access...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Starting conversation session...');
      await conversation.startSession({
        agentId: 'kfjoekdTlZZquOK2LEot',
        apiKey: apiKey,  // Pass the API key here instead
        overrides: {
          agent: {
            prompt: {
              prompt: `You are an AI assistant helping with a book. Here's the current context from the book: ${context || 'No context provided'}. Please use this context to provide more relevant answers.`
            }
          }
        }
      });
    } catch (error) {
      console.error('Start conversation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start conversation. Please make sure you have a working microphone.",
        variant: "destructive"
      });
    }
  }, [conversation, context, toast, apiKey]);

  const stopConversation = useCallback(async () => {
    console.log('Stopping conversation session...');
    await conversation.endSession();
  }, [conversation]);

  return (
    <Card className="p-6 glass-panel">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="Enter your ElevenLabs API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-center gap-4">
            <Button
              onClick={startConversation}
              disabled={conversation.status === 'connected'}
              variant="default"
              className="w-40"
            >
              <Mic className="mr-2 h-4 w-4" />
              Start
            </Button>
            <Button
              onClick={stopConversation}
              disabled={conversation.status !== 'connected'}
              variant="destructive"
              className="w-40"
            >
              <MicOff className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              conversation.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span>Status: {conversation.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
