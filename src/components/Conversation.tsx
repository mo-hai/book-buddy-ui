
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
      console.log('Connected to agent - WebSocket connection established');
      toast({ 
        title: "Connected to agent", 
        description: "You can start speaking now",
        duration: 5000
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from agent - WebSocket connection closed');
      toast({ 
        title: "Disconnected from agent",
        description: "The connection to the agent was closed. Try reconnecting.",
        variant: "destructive",
        duration: 5000
      });
    },
    onMessage: (message) => {
      console.log('Received message from agent:', message);
    },
    onError: (error) => {
      console.error('Agent error:', error);
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive",
        duration: 5000
      });
    },
    // Add reconnection settings
    reconnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  });

  const startConversation = useCallback(async () => {
    try {
      if (!apiKey || apiKey.trim().length === 0) {
        toast({
          title: "Error",
          description: "Please enter your ElevenLabs API key",
          variant: "destructive",
          duration: 5000
        });
        return;
      }

      console.log('Requesting microphone access...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Starting conversation session with agent ID: kfjoekdTlZZquOK2LEot');
      await conversation.startSession({
        agentId: 'kfjoekdTlZZquOK2LEot',
        apiKey: apiKey.trim(),
        overrides: {
          agent: {
            prompt: {
              prompt: `You are an AI assistant helping with a book. Here's the current context from the book: ${context || 'No context provided'}. Please use this context to provide more relevant answers.`
            }
          },
          // Add WebSocket configuration
          websocket: {
            keepAlive: true,
            keepAliveInterval: 30000, // 30 seconds
            reconnectOnClose: true,
          }
        }
      });

      console.log('Session started successfully');
    } catch (error) {
      console.error('Start conversation error:', error);
      let errorMessage = "Failed to start conversation.";
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = "Microphone access denied. Please allow microphone access and try again.";
        } else if (error.message.includes('API key')) {
          errorMessage = "Invalid API key. Please check your ElevenLabs API key and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    }
  }, [conversation, context, toast, apiKey]);

  const stopConversation = useCallback(async () => {
    try {
      console.log('Stopping conversation session...');
      await conversation.endSession();
      console.log('Session stopped successfully');
    } catch (error) {
      console.error('Stop conversation error:', error);
      toast({
        title: "Error",
        description: "Failed to stop conversation properly",
        variant: "destructive",
        duration: 5000
      });
    }
  }, [conversation, toast]);

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
