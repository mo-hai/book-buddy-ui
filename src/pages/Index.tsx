
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Reader } from '@/components/Reader';

const Index = () => {
  const [bookText, setBookText] = useState<string>('');

  const handleFileAccepted = (text: string) => {
    setBookText(text);
  };

  const handleAskQuestion = (context: string) => {
    // Will implement AI Q&A functionality later
    console.log('Question about context:', context);
  };

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">AudioReader</h1>
      
      {!bookText ? (
        <FileUpload onFileAccepted={handleFileAccepted} />
      ) : (
        <div className="h-[calc(100vh-12rem)]">
          <Reader text={bookText} onAskQuestion={handleAskQuestion} />
        </div>
      )}
    </div>
  );
};

export default Index;
