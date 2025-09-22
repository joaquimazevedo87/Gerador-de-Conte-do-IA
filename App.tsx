import React, { useState, useCallback } from 'react';
import { OutputPanel } from './components/OutputPanel';
import type { SocialContent, GenerationMode, Language } from './types';
import { generateSocialContent } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<GenerationMode>('idea');
  const [idea, setIdea] = useState<string>('');
  const [platform, setPlatform] = useState<string>('Instagram');
  const [language, setLanguage] = useState<Language>('Português (Brasil)');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [numberOfPosts, setNumberOfPosts] = useState<number>(1);

  const [generatedContent, setGeneratedContent] = useState<SocialContent[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(';')[0].split(':')[1];
        const data = result.split(',')[1];
        resolve({ mimeType, data });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) {
      setError('Por favor, insira uma ideia ou tema para continuar.');
      return;
    }
    if (mode === 'image' && !imageFile) {
      setError('Por favor, envie uma imagem de referência.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      let imagePayload;
      if (mode === 'image' && imageFile) {
        imagePayload = await fileToBase64(imageFile);
      }
      
      const content = await generateSocialContent(idea, platform, mode, numberOfPosts, language, imagePayload);
      setGeneratedContent(content);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o conteúdo. Verifique sua chave de API e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [idea, platform, mode, imageFile, numberOfPosts, language]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            mode={mode}
            setMode={setMode}
            idea={idea}
            setIdea={setIdea}
            platform={platform}
            setPlatform={setPlatform}
            language={language}
            setLanguage={setLanguage}
            imageFile={imageFile}
            setImageFile={setImageFile}
            numberOfPosts={numberOfPosts}
            setNumberOfPosts={setNumberOfPosts}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          <OutputPanel
            content={generatedContent}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
