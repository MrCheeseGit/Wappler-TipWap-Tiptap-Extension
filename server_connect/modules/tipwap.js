/**
 * tipwap.js — TipWap Server Connect (Node).
 * Pair with App Connect dmx-tipwap-editor on the form.
 */

const sanitizeHtml = require('sanitize-html');

const MODES = new Set(['standard', 'strict', 'minimal']);

function htmlInput(value) {
    if (value == null) return '';
    return String(value);
}

function plainTextFromHtml(html) {
    return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
}

function countWords(text) {
    const t = String(text || '').trim();
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
}

function extendedTags() {
    return ['mark', 'label', 'input'];
}

function alignmentStyleRules() {
    const align = [/^(left|right|center|justify)$/];
    const tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const rules = {
        mark: {
            'background-color': [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
        },
    };
    tags.forEach((tag) => {
        rules[tag] = { 'text-align': align };
    });
    return rules;
}

function extendedAttributes() {
    return {
        ul: ['data-type', 'class'],
        li: ['data-type', 'data-checked', 'class'],
        label: ['class'],
        input: ['type', 'checked', 'disabled'],
        mark: ['style', 'class', 'data-color'],
        p: ['style', 'class'],
        h1: ['style', 'class'],
        h2: ['style', 'class'],
        h3: ['style', 'class'],
        h4: ['style', 'class'],
        h5: ['style', 'class'],
        h6: ['style', 'class'],
    };
}

function sanitizeOptions(mode) {
    const base = {
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {
            img: ['http', 'https'],
        },
        disallowedTagsMode: 'discard',
    };

    if (mode === 'minimal') {
        return {
            ...base,
            allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'a'],
            allowedAttributes: {
                a: ['href', 'title', 'target', 'rel'],
            },
        };
    }

    if (mode === 'strict') {
        return {
            ...base,
            allowedTags: [
                'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'a',
                'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'hr',
                'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img',
                ...extendedTags(),
            ],
            allowedAttributes: {
                a: ['href', 'title', 'target', 'rel'],
                img: ['src', 'alt', 'title', 'width', 'height'],
                th: ['colspan', 'rowspan'],
                td: ['colspan', 'rowspan'],
                ...extendedAttributes(),
            },
            allowedStyles: alignmentStyleRules(),
        };
    }

    // standard (CMS)
    return {
        ...base,
        allowedTags: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'a',
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'hr',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img',
            ...extendedTags(),
        ],
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height'],
            th: ['colspan', 'rowspan', 'style'],
            td: ['colspan', 'rowspan', 'style'],
            '*': ['class'],
            ...extendedAttributes(),
        },
        allowedStyles: alignmentStyleRules(),
    };
}

/**
 * @param {object} options
 * @param {string} [options.html]
 * @param {string} [options.mode] standard | strict | minimal
 * @param {number|string} [options.maxLength]
 */
exports.sanitize = function (options) {
    const raw = htmlInput(this.parseOptional(options.html, '*', ''));
    const mode = MODES.has(this.parseOptional(options.mode, 'string', 'standard'))
        ? this.parseOptional(options.mode, 'string', 'standard')
        : 'standard';
    const maxLength = parseInt(this.parseOptional(options.maxLength, '*', '0'), 10);

    const beforeLen = raw.length;
    let html = sanitizeHtml(raw, sanitizeOptions(mode));
    const stripped = beforeLen > 0 && html.length < beforeLen;

    if (Number.isFinite(maxLength) && maxLength > 0 && html.length > maxLength) {
        html = html.slice(0, maxLength);
    }

    const plainText = plainTextFromHtml(html);

    return {
        html,
        plainText,
        length: html.length,
        wordCount: countWords(plainText),
        stripped,
    };
};

/**
 * @param {object} options
 * @param {string} [options.html]
 * @param {number|string} [options.maxLength]
 * @param {string} [options.ellipsis]
 */
exports.excerpt = function (options) {
    const raw = htmlInput(this.parseOptional(options.html, '*', ''));
    const maxLength = parseInt(this.parseOptional(options.maxLength, '*', '160'), 10) || 160;
    const ellipsis = this.parseOptional(options.ellipsis, 'string', '…');

    let text = plainTextFromHtml(raw);
    if (text.length > maxLength) {
        text = text.slice(0, maxLength).trim() + ellipsis;
    }

    return {
        excerpt: text,
        length: text.length,
    };
};

/**
 * @param {object} options
 * @param {string} [options.html]
 * @param {string} [options.text]
 */
exports.wordcount = function (options) {
    const textOpt = this.parseOptional(options.text, '*', '');
    const htmlOpt = this.parseOptional(options.html, '*', '');
    const text = textOpt
        ? String(textOpt)
        : plainTextFromHtml(htmlInput(htmlOpt));

    return {
        words: countWords(text),
        characters: text.length,
    };
};

exports._plainTextFromHtml = plainTextFromHtml;
exports._countWords = countWords;
