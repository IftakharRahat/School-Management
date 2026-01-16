'use client';

import { useLanguage } from '@/lib/language-context';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            title={language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
        >
            <Languages size={18} />
            <span className={language === 'bn' ? 'font-bengali' : ''}>
                {language === 'en' ? 'বাংলা' : 'English'}
            </span>
        </button>
    );
}
