import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm"
            aria-label="Alternar tema"
        >
            {darkMode ? (
                <FiSun className="text-yellow-400" size={18} />
            ) : (
                <FiMoon className="text-gray-700" size={18} />
            )}
        </button>
    );
};

export default ThemeToggle;