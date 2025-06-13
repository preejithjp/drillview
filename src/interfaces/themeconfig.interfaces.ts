import { ColourList } from '../../server/helpers/theme.colour.config';
import { Themes } from './state.interfaces';

export type ColorSet = Record<ColourList, string>;

export const themeColors: Record<Themes, ColorSet> = {
  [Themes.LIGHT]: {
    [ColourList.C1]: '#ffffff',
    [ColourList.C2]: '#808080',
    [ColourList.C3]: '#c0c0c0',
    [ColourList.C4]: '#404040',
    [ColourList.C5]: '#efb116',
    [ColourList.C6]: '#ff0000',
    [ColourList.C7]: '#000000',
    [ColourList.C8]: '#ffff00',
    [ColourList.C9]: '#4ea64c',
    [ColourList.C10]: '#00ffff',
    [ColourList.C11]: '#0373cc', // Blue shade
    [ColourList.C12]: '#0000ff', // Pure Blue
    [ColourList.C13]: '#9900ff', // Purple
    [ColourList.C14]: 'transparent',

    // New colors c15 to c28
    [ColourList.C15]: '#ff7f50', // Coral
    [ColourList.C16]: '#6a5acd', // Slate Blue
    [ColourList.C17]: '#20b2aa', // Light Sea Green
    [ColourList.C18]: '#ff69b4', // Hot Pink
    [ColourList.C19]: '#8b4513', // Saddle Brown
    [ColourList.C20]: '#2e8b57', // Sea Green
    [ColourList.C21]: '#ffd700', // Gold
    [ColourList.C22]: '#00fa9a', // Medium Spring Green
    [ColourList.C23]: '#ff4500', // Orange Red
    [ColourList.C24]: '#4682b4', // Steel Blue
    [ColourList.C25]: '#da70d6', // Orchid
    [ColourList.C26]: '#9acd32', // Yellow Green
    [ColourList.C27]: '#40e0d0', // Turquoise
    [ColourList.C28]: '#ff6347', // Tomato
  },

  [Themes.DARKOLD]: {
    [ColourList.C1]: '#1a1a1a', // Slightly deeper matte black
    [ColourList.C2]: '#7a7a7a', // Muted gray
    [ColourList.C3]: '#b0b0b0', // Softer light gray
    [ColourList.C4]: '#999999', // Muted contrast gray
    [ColourList.C5]: '#d95c5c', // Muted red
    [ColourList.C6]: '#c44545', // Deeper muted red
    [ColourList.C7]: '#f0f0f0', // Off-white (less stark than pure white)
    [ColourList.C8]: '#d4c700', // Muted yellow (less harsh)
    [ColourList.C9]: '#339933', // Matte green
    [ColourList.C10]: '#339999', // Muted teal
    [ColourList.C11]: '#4a90e2', // Soft blue
    [ColourList.C12]: '#5c6bc0', // Muted indigo blue
    [ColourList.C13]: '#b266cc', // Muted lavender
    [ColourList.C14]: 'transparent',

    // New colors c15 to c28
    [ColourList.C15]: '#cc704b', // Muted Coral
    [ColourList.C16]: '#5a47a3', // Muted Slate Blue
    [ColourList.C17]: '#188f8b', // Muted Sea Green
    [ColourList.C18]: '#cc4c8e', // Muted Hot Pink
    [ColourList.C19]: '#65421a', // Muted Saddle Brown
    [ColourList.C20]: '#246440', // Dark Sea Green
    [ColourList.C21]: '#bba800', // Muted Gold
    [ColourList.C22]: '#009972', // Dark Spring Green
    [ColourList.C23]: '#b73500', // Muted Orange Red
    [ColourList.C24]: '#395d81', // Muted Steel Blue
    [ColourList.C25]: '#a850a8', // Muted Orchid
    [ColourList.C26]: '#7a9a20', // Muted Yellow Green
    [ColourList.C27]: '#2d8a87', // Muted Turquoise
    [ColourList.C28]: '#b94433', // Muted Tomato
  },

  [Themes.DARK]: {
    [ColourList.C1]: '#1a1a1a', // Slightly deeper matte black
    [ColourList.C2]: '#7a7a7a', // Muted gray
    [ColourList.C3]: '#b0b0b0', // Softer light gray
    [ColourList.C4]: '#999999', // Muted contrast gray
    [ColourList.C5]: '#FFD500', // Bright amber yellow
    [ColourList.C6]: '#FF0000', // Red
    [ColourList.C7]: '#FFFFFF', // Pure white
    [ColourList.C8]: '#d4c700', // Muted yellow (less harsh)
    [ColourList.C9]: '#00FF04', // Neon green
    [ColourList.C10]: '#339999', // Muted teal
    [ColourList.C11]: '#009DFF', // Vivid sky blue
    [ColourList.C12]: '#5c6bc0', // Muted indigo blue
    [ColourList.C13]: '#b266cc', // Muted lavender
    [ColourList.C14]: '#000000', // black
  },

  [Themes.DARK]: {
    [ColourList.C1]: '#1a1a1a', // Slightly deeper matte black
    [ColourList.C2]: '#7a7a7a', // Muted gray
    [ColourList.C3]: '#b0b0b0', // Softer light gray
    [ColourList.C4]: '#999999', // Muted contrast gray
    [ColourList.C5]: '#FFD500', // Bright amber yellow
    [ColourList.C6]: '#FF0000', // Red
    [ColourList.C7]: '#FFFFFF', // Pure white
    [ColourList.C8]: '#d4c700', // Muted yellow (less harsh)
    [ColourList.C9]: '#00FF04', // Neon green
    [ColourList.C10]: '#339999', // Muted teal
    [ColourList.C11]: '#009DFF', // Vivid sky blue
    [ColourList.C12]: '#5c6bc0', // Muted indigo blue
    [ColourList.C13]: '#b266cc', // Muted lavender
    [ColourList.C14]: '#000000', // black
  },

  [Themes.RED]: {
    [ColourList.C1]: '#660000', // Deep red background
    [ColourList.C2]: '#800000', // Dark maroon
    [ColourList.C3]: '#990000', // Slightly brighter red
    [ColourList.C4]: '#b30000', // Vivid red
    [ColourList.C5]: '#ff6666', // Soft red for contrast
    [ColourList.C6]: '#ff9999', // Lighter red
    [ColourList.C7]: '#ffcc66', // Warm yellow-orange
    [ColourList.C8]: '#ffff66', // Light yellow
    [ColourList.C9]: '#99ff99', // Soft green
    [ColourList.C10]: '#99ffff', // Soft cyan
    [ColourList.C11]: '#8ab6f8', // Brighter blue
    [ColourList.C12]: '#6699ff', // Medium blue
    [ColourList.C13]: '#cc99ff', // Light purple
    [ColourList.C14]: 'transparent',

    // New colors c15 to c28
    [ColourList.C15]: '#ff8f66', // Light Coral
    [ColourList.C16]: '#7f5acc', // Medium Slate Blue
    [ColourList.C17]: '#3fb2aa', // Medium Sea Green
    [ColourList.C18]: '#ff84b4', // Medium Hot Pink
    [ColourList.C19]: '#9a5f13', // Medium Saddle Brown
    [ColourList.C20]: '#3e9f57', // Medium Sea Green 2
    [ColourList.C21]: '#ffda00', // Bright Gold
    [ColourList.C22]: '#00faaa', // Bright Spring Green
    [ColourList.C23]: '#ff5a00', // Bright Orange Red
    [ColourList.C24]: '#5892d4', // Bright Steel Blue
    [ColourList.C25]: '#d170d6', // Bright Orchid
    [ColourList.C26]: '#aadd32', // Bright Yellow Green
    [ColourList.C27]: '#42f0d0', // Bright Turquoise
    [ColourList.C28]: '#ff7347', // Bright Tomato
  },
} as const;
