import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

function parseHeadingLevels(raw) {
    if (!raw) return [2, 3];
    return String(raw)
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.element
 * @param {string} [opts.content]
 * @param {string} [opts.placeholder]
 * @param {string} [opts.toolbar] full | minimal
 * @param {string} [opts.headingLevels]
 * @param {boolean} [opts.enableTables]
 * @param {boolean} [opts.enableImages]
 * @param {boolean} [opts.enableTextAlign]
 * @param {boolean} [opts.enableHighlight]
 * @param {boolean} [opts.enableTaskLists]
 * @param {number} [opts.maxCharacters]
 * @param {function} [opts.onUpdate]
 * @param {function} [opts.onBlur]
 */
export function createEditor(opts) {
    const toolbar = opts.toolbar === 'minimal' ? 'minimal' : 'full';
    const levels = parseHeadingLevels(opts.headingLevels);
    const extensions = [
        StarterKit.configure({
            heading: { levels },
            link: {
                openOnClick: false,
                HTMLAttributes: { rel: 'noopener noreferrer' },
            },
        }),
        Placeholder.configure({
            placeholder: opts.placeholder || 'Write here…',
        }),
        CharacterCount.configure({
            limit: opts.maxCharacters > 0 ? opts.maxCharacters : null,
        }),
    ];

    if (toolbar === 'full' && opts.enableTables !== false) {
        extensions.push(TableKit);
    }
    if (toolbar === 'full' && opts.enableImages !== false) {
        extensions.push(
            Image.configure({
                inline: false,
                allowBase64: false,
            })
        );
    }
    if (toolbar === 'full' && opts.enableTextAlign !== false) {
        extensions.push(
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            })
        );
    }
    if (toolbar === 'full' && opts.enableHighlight !== false) {
        extensions.push(Highlight);
    }
    if (toolbar === 'full' && opts.enableTaskLists !== false) {
        extensions.push(
            TaskList,
            TaskItem.configure({
                nested: true,
            })
        );
    }

    return new Editor({
        element: opts.element,
        content: opts.content || '',
        extensions,
        onUpdate: opts.onUpdate,
        onBlur: opts.onBlur,
    });
}

export { Editor };
