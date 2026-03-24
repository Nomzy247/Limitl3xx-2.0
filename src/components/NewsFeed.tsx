import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper } from 'lucide-react';

export default function NewsFeed() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await res.json();
        if (data && data.Data) {
          setNews(data.Data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Newspaper size={20} className="text-[#00f0ff]"/> Crypto & Fintech News</h3>
      </div>
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-6 h-6 border-2 border-[#0052ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : news.length > 0 ? (
          news.map((item: any) => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block p-4 rounded-2xl bg-surface border border-border/50 hover:border-border hover:bg-subtle transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-primary group-hover:text-[#00f0ff] transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{item.source}</span>
                    <span>{new Date(item.published_on * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
                {item.imageurl && (
                  <img src={item.imageurl} alt={item.source} className="w-16 h-16 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                )}
              </div>
            </a>
          ))
        ) : (
          <p className="text-sm text-muted text-center py-4">No news available at the moment.</p>
        )}
      </div>
    </motion.div>
  );
}
