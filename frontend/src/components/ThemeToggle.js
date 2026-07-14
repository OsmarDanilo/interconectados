import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-stone-100 dark:bg-stone-600 hover:bg-stone-150 dark:hover:bg-stone-500 transition-all duration-300 shadow-sm"
            aria-label="Alternar tema"
        >
            {darkMode ? (
                <FiSun className="text-yellow-400" size={18} />
            ) : (
                <FiMoon className="text-stone-600" size={18} />
            )}
        </button>
    );
};

export default ThemeToggle;