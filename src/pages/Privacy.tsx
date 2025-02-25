import { useEffect, useState } from 'react';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/privacy-policy.md')
      .then((response) => response.text())
      .then((text) => {
        // Convert markdown to HTML
        const html = text
          .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
          .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
          .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
          .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
          .replace(/<\/li>\n<li>/g, '</li><li>')
          .replace(/(<li>.*<\/li>)/gm, '<ul class="list-disc mb-4">$1</ul>')
          .replace(/<\/ul>\n<ul>/g, '')
          .split('\n').join('<br />');
        setContent(html);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="prose prose-slate max-w-none bg-white p-8 rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}