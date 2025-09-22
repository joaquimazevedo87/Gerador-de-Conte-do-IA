import React, { useState, useCallback } from 'react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Gerador de Conteúdo para Redes Sociais</h1>

        {/* Painel de Entrada */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Configurações</h2>

          <div className="mb-4">
            <label className="block mb-2">Modo:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as GenerationMode)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="idea">Gerar a partir de ideia</option>
              <option value="image">Gerar a partir de imagem</option>
            </select>
          </div>

          {mode === 'image' && (
            <div className="mb-4">
              <label className="block mb-2">Enviar Imagem:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2">Ideia ou Tema:</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ex: Promoção de verão, dicas de produtividade..."
              className="w-full p-2 border rounded dark:bg-gray-700 h-24"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Plataforma:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Twitter</option>
              <option>LinkedIn</option>
              <option>TikTok</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Idioma:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option>Português (Brasil)</option>
              <option>Inglês</option>
              <option>Espanhol</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Número de posts:</label>
            <input
              type="number"
              min="1"
              max="5"
              value={numberOfPosts}
              onChange={(e) => setNumberOfPosts(Number(e.target.value))}
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Gerando...' : 'Gerar Conteúdo'}
          </button>
        </div>

        {/* Painel de Saída */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Conteúdo Gerado</h2>
            <div className="space-y-6">
              {generatedContent.map((item, index) => (
                <div key={index} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                  <h3 className="font-bold">Post {index + 1}</h3>
                  <p className="mt-2 whitespace-pre-line">{item.text}</p>
                  {item.imagePrompt && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Prompt para imagem:</strong> {item.imagePrompt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
  );
};

export default App;
