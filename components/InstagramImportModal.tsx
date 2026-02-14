
import React, { useState } from 'react';
import { Instagram, X, Loader2, CheckCircle2, Search } from 'lucide-react';

interface InstagramImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (images: string[]) => void;
}

const MOCK_INSTA_IMAGES = [
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1513812102423-483638a17cae?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=400',
];

export const InstagramImportModal: React.FC<InstagramImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [handle, setHandle] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFetch = () => {
    if (!handle.trim()) return;
    setIsFetching(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setFetchedImages(MOCK_INSTA_IMAGES);
      setIsFetching(false);
    }, 2000);
  };

  const toggleImageSelection = (img: string) => {
    if (selectedImages.includes(img)) {
      setSelectedImages(prev => prev.filter(i => i !== img));
    } else {
      setSelectedImages(prev => [...prev, img]);
    }
  };

  const handleFinishImport = () => {
    onImport(selectedImages);
    onClose();
    // Reset state
    setHandle('');
    setFetchedImages([]);
    setSelectedImages([]);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header with IG Gradient */}
        <div className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-8 text-white text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
            <X size={18} />
          </button>
          <Instagram size={40} className="mx-auto mb-3" />
          <h2 className="text-xl font-black tracking-tight">Import from Instagram</h2>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Quick Portfolio Sync</p>
        </div>

        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          {fetchedImages.length === 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Instagram Handle</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</div>
                  <input 
                    type="text" 
                    placeholder="your_handle" 
                    className="w-full pl-10 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                  <button 
                    onClick={handleFetch}
                    disabled={isFetching || !handle.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-pink-600 text-white rounded-xl shadow-lg active:scale-90 transition-all disabled:bg-gray-200"
                  >
                    {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium px-1 text-center">We'll fetch your recent public posts so you can select your best work.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Photos ({selectedImages.length})</div>
                 <button onClick={() => setFetchedImages([])} className="text-[10px] font-black text-pink-600 uppercase">Change Account</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {fetchedImages.map((img, idx) => {
                  const isSelected = selectedImages.includes(img);
                  return (
                    <button 
                      key={idx} 
                      onClick={() => toggleImageSelection(img)}
                      className="relative aspect-square rounded-xl overflow-hidden group border-2 transition-all duration-300"
                      style={{ borderColor: isSelected ? '#db2777' : 'transparent' }}
                    >
                      <img src={img} className={`w-full h-full object-cover transition-transform ${isSelected ? 'scale-90' : 'group-hover:scale-110'}`} />
                      {isSelected && (
                        <div className="absolute inset-0 bg-pink-600/20 flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-white fill-pink-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {fetchedImages.length > 0 && (
          <div className="p-6 pt-0">
            <button 
              onClick={handleFinishImport}
              disabled={selectedImages.length === 0}
              className="w-full py-5 bg-pink-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-pink-100 active:scale-95 transition-all disabled:bg-gray-100 disabled:shadow-none"
            >
              IMPORT {selectedImages.length} {selectedImages.length === 1 ? 'PHOTO' : 'PHOTOS'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
