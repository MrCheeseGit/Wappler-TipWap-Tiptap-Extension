/* TipWap Editor — App Connect (dmx.Component + MIT TipTap bundle) */
(function () {
    'use strict';

    const PLACEHOLDER_CLASS = 'dmx-tipwap-design-placeholder';

    function isDesignView() {
        if (typeof document === 'undefined') return false;

        const body = document.body;
        const html = document.documentElement;

        if (body) {
            if (
                body.classList.contains('design-mode') ||
                body.classList.contains('wappler-design-mode')
            ) {
                return true;
            }
        }
        if (html) {
            if (
                html.classList.contains('design-mode') ||
                html.classList.contains('wappler-design-mode')
            ) {
                return true;
            }
        }

        // Wappler design canvas opens raw .ejs sources (routed preview does not).
        const path = window.location.pathname || '';
        if (/\.ejs(\?|#|$)/i.test(path)) return true;

        // Wappler embeds the target URL in an iframe; parent is the IDE shell (other port/origin).
        try {
            if (window.self !== window.top) {
                const topLoc = window.top.location;
                const here = window.location;
                if (topLoc.hostname === here.hostname && topLoc.port !== here.port) {
                    return true;
                }
            }
        } catch (e) {
            if (window.self !== window.top) return true;
        }

        return false;
    }

    function bundleScriptUrl() {
        const cur =
            document.currentScript ||
            document.querySelector('script[src*="dmx-tipwap-editor.js"]');
        if (cur && cur.src) {
            return cur.src.replace(
                /dmx-tipwap-editor\.js(\?.*)?$/,
                'dmx-tipwap-editor.bundle.js$1'
            );
        }
        return '/js/dmx-tipwap-editor.bundle.js';
    }

    let bundleLoadPromise = null;

    function loadTipWapBundle() {
        if (typeof TipWapBundle !== 'undefined' && TipWapBundle.createEditor) {
            return Promise.resolve();
        }
        if (bundleLoadPromise) return bundleLoadPromise;

        const src = bundleScriptUrl();
        bundleLoadPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[src*="dmx-tipwap-editor.bundle.js"]');
            if (existing) {
                const done = () => {
                    if (typeof TipWapBundle !== 'undefined' && TipWapBundle.createEditor) {
                        resolve();
                    } else {
                        reject(new Error('TipWap bundle loaded without TipWapBundle'));
                    }
                };
                if (existing.getAttribute('data-tipwap-loaded') === '1') {
                    done();
                    return;
                }
                existing.addEventListener('load', () => {
                    existing.setAttribute('data-tipwap-loaded', '1');
                    done();
                });
                existing.addEventListener('error', () =>
                    reject(new Error('TipWap: failed to load bundle'))
                );
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => {
                script.setAttribute('data-tipwap-loaded', '1');
                done();
            };
            script.onerror = () => reject(new Error('TipWap: failed to load bundle'));
            document.head.appendChild(script);

            function done() {
                if (typeof TipWapBundle !== 'undefined' && TipWapBundle.createEditor) {
                    resolve();
                } else {
                    reject(new Error('TipWap bundle loaded without TipWapBundle'));
                }
            }
        });

        return bundleLoadPromise;
    }

    function isPlaceholder(value) {
        return typeof value === 'string' && value.indexOf('@@') !== -1;
    }

    function propString(value, fallback) {
        if (value == null || value === '') return fallback;
        if (isPlaceholder(value)) return fallback;
        return String(value).trim();
    }

    function propInt(value, fallback) {
        const n = parseInt(propString(value, String(fallback)), 10);
        return Number.isFinite(n) ? n : fallback;
    }

    function propBool(value, fallback) {
        if (value === true || value === 'true') return true;
        if (value === false || value === 'false') return false;
        return fallback;
    }

    function slugId(id) {
        return String(id || 'editor')
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .replace(/^_+|_+$/g, '') || 'editor';
    }

  const FULL_BUTTONS = [
        { cmd: 'toggleBold', icon: 'B', title: 'Bold', label: 'bold' },
        { cmd: 'toggleItalic', icon: 'I', title: 'Italic', label: 'italic' },
        { cmd: 'toggleUnderline', icon: 'U', title: 'Underline', label: 'underline' },
        { cmd: 'toggleStrike', icon: 'S', title: 'Strike', label: 'strike' },
        { cmd: 'toggleCode', icon: '<>', title: 'Code', label: 'code' },
        { cmd: 'toggleHighlight', icon: 'Hi', title: 'Highlight', needsHighlight: true },
        { sep: true },
        { cmd: 'toggleHeading', level: 2, icon: 'H2', title: 'Heading 2' },
        { cmd: 'toggleHeading', level: 3, icon: 'H3', title: 'Heading 3' },
        { cmd: 'toggleBulletList', icon: '•', title: 'Bullet list' },
        { cmd: 'toggleOrderedList', icon: '1.', title: 'Ordered list' },
        { cmd: 'toggleTaskList', icon: '☑', title: 'Task list', needsTaskLists: true },
        { cmd: 'toggleBlockquote', icon: '❝', title: 'Quote' },
        { cmd: 'toggleCodeBlock', icon: '{ }', title: 'Code block' },
        { cmd: 'setHorizontalRule', icon: 'HR', title: 'Horizontal rule' },
        { sep: true, needsTextAlign: true },
        { cmd: 'setTextAlign', align: 'left', icon: '⫷', title: 'Align left', needsTextAlign: true },
        { cmd: 'setTextAlign', align: 'center', icon: '≡', title: 'Align center', needsTextAlign: true },
        { cmd: 'setTextAlign', align: 'right', icon: '⫸', title: 'Align right', needsTextAlign: true },
        { cmd: 'setTextAlign', align: 'justify', icon: '☰', title: 'Justify', needsTextAlign: true },
        { sep: true },
        { cmd: 'setLink', icon: '🔗', title: 'Link' },
        { cmd: 'insertImage', icon: '🖼', title: 'Image URL' },
        { cmd: 'insertTable', icon: '▦', title: 'Insert table' },
        { sep: true },
        { cmd: 'undo', icon: '↶', title: 'Undo' },
        { cmd: 'redo', icon: '↷', title: 'Redo' },
    ];

    const TABLE_TOOL_BUTTONS = [
        { cmd: 'addRowBefore', icon: 'R↑', title: 'Add row before' },
        { cmd: 'addRowAfter', icon: 'R↓', title: 'Add row after' },
        { cmd: 'deleteRow', icon: 'R×', title: 'Delete row' },
        { cmd: 'addColumnBefore', icon: 'C←', title: 'Add column before' },
        { cmd: 'addColumnAfter', icon: 'C→', title: 'Add column after' },
        { cmd: 'deleteColumn', icon: 'C×', title: 'Delete column' },
        { cmd: 'deleteTable', icon: 'T×', title: 'Delete table' },
    ];

    const MINIMAL_BUTTONS = [
        { cmd: 'toggleBold', icon: 'B', title: 'Bold' },
        { cmd: 'toggleItalic', icon: 'I', title: 'Italic' },
        { cmd: 'toggleBulletList', icon: '•', title: 'Bullet list' },
        { cmd: 'toggleOrderedList', icon: '1.', title: 'Ordered list' },
        { cmd: 'undo', icon: '↶', title: 'Undo' },
        { cmd: 'redo', icon: '↷', title: 'Redo' },
    ];

    function runCommand(editor, spec) {
        if (!editor || !editor.chain) return;
        const chain = editor.chain().focus();
        switch (spec.cmd) {
            case 'toggleBold':
                chain.toggleBold().run();
                break;
            case 'toggleItalic':
                chain.toggleItalic().run();
                break;
            case 'toggleUnderline':
                chain.toggleUnderline().run();
                break;
            case 'toggleStrike':
                chain.toggleStrike().run();
                break;
            case 'toggleCode':
                chain.toggleCode().run();
                break;
            case 'toggleHeading':
                chain.toggleHeading({ level: spec.level || 2 }).run();
                break;
            case 'toggleBulletList':
                chain.toggleBulletList().run();
                break;
            case 'toggleOrderedList':
                chain.toggleOrderedList().run();
                break;
            case 'toggleBlockquote':
                chain.toggleBlockquote().run();
                break;
            case 'toggleCodeBlock':
                chain.toggleCodeBlock().run();
                break;
            case 'setHorizontalRule':
                chain.setHorizontalRule().run();
                break;
            case 'setLink': {
                const prev = editor.getAttributes('link').href;
                const url = window.prompt('Link URL', prev || 'https://');
                if (url === null) return;
                if (url === '') {
                    chain.extendMarkRange('link').unsetLink().run();
                } else {
                    chain.extendMarkRange('link').setLink({ href: url }).run();
                }
                break;
            }
            case 'insertImage': {
                const src = window.prompt('Image URL (https://…)', 'https://');
                if (!src) return;
                const alt = window.prompt('Alt text (optional)', '') || '';
                chain.setImage({ src: src.trim(), alt }).run();
                break;
            }
            case 'insertTable':
                chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                break;
            case 'toggleHighlight':
                chain.toggleHighlight().run();
                break;
            case 'toggleTaskList':
                chain.toggleTaskList().run();
                break;
            case 'setTextAlign':
                chain.setTextAlign(spec.align).run();
                break;
            case 'addRowBefore':
                chain.addRowBefore().run();
                break;
            case 'addRowAfter':
                chain.addRowAfter().run();
                break;
            case 'deleteRow':
                chain.deleteRow().run();
                break;
            case 'addColumnBefore':
                chain.addColumnBefore().run();
                break;
            case 'addColumnAfter':
                chain.addColumnAfter().run();
                break;
            case 'deleteColumn':
                chain.deleteColumn().run();
                break;
            case 'deleteTable':
                chain.deleteTable().run();
                break;
            case 'undo':
                chain.undo().run();
                break;
            case 'redo':
                chain.redo().run();
                break;
            default:
                break;
        }
    }

    dmx.Component('tipwap-editor', {
        attributes: {
            fieldName: { type: String, default: '' },
            placeholder: { type: String, default: 'Write here…' },
            minHeight: { type: Number, default: 200 },
            toolbar: { type: String, default: 'full' },
            headingLevels: { type: String, default: '2,3' },
            maxCharacters: { type: Number, default: 0 },
            enableTables: { type: Boolean, default: true },
            enableImages: { type: Boolean, default: true },
            enableSourceView: { type: Boolean, default: false },
            enableTextAlign: { type: Boolean, default: true },
            enableHighlight: { type: Boolean, default: true },
            enableTaskLists: { type: Boolean, default: true },
            enableTableTools: { type: Boolean, default: true },
            initialHtml: { type: String, default: '' },
        },

        methods: {
            getHtml() {
                return this._getHtml();
            },
            setHtml(html) {
                this._setHtml(html);
            },
            clear() {
                this._setHtml('');
            },
            focus() {
                if (this._editor) this._editor.commands.focus();
            },
        },

        events: {
            ready: Event,
            change: Event,
            blur: Event,
        },

        init(node) {
            this._node = node;
            this._editor = null;
            this._sourceMode = false;
            this._render();
        },

        performUpdate() {
            if (isDesignView()) {
                if (this._node && this._node.querySelector('.' + PLACEHOLDER_CLASS)) return;
            }
            this._render();
        },

        destroy() {
            this._destroyEditor();
        },

        _destroyEditor() {
            if (this._sourceMode) {
                const source = this._sourceTextarea();
                if (source) this._writeTextarea(source.value);
                this._sourceMode = false;
                const wrap = this._sourceWrapEl();
                const mount = this._mountEl();
                if (wrap) wrap.hidden = true;
                if (mount) mount.hidden = false;
                this._node.classList.remove('dmx-tipwap--source');
            }
            if (!this._editor) return;
            try {
                this._editor.destroy();
            } catch (e) {
                /* frame may already be gone */
            }
            this._editor = null;
        },

        _fieldName() {
            const compId = this._node.id || 'editor';
            return propString(this.props.fieldName, 'content_' + slugId(compId));
        },

        _textarea() {
            const name = this._fieldName();
            return (
                this._node.querySelector('textarea.dmx-tipwap-field') ||
                this._node.querySelector('textarea[name="' + name + '"]')
            );
        },

        _mountEl() {
            return this._node.querySelector('.dmx-tipwap-mount');
        },

        _toolbarEl() {
            return this._node.querySelector('[data-tipwap-toolbar]');
        },

        _counterEl() {
            return this._node.querySelector('[data-tipwap-counter]');
        },

        _sourceWrapEl() {
            return this._node.querySelector('[data-tipwap-source-wrap]');
        },

        _sourceTextarea() {
            return this._node.querySelector('[data-tipwap-source]');
        },

        _toolbarOptions() {
            const toolbarMode = propString(this.props.toolbar, 'full');
            return {
                toolbarMode,
                enableTables: propBool(this.props.enableTables, true),
                enableImages: propBool(this.props.enableImages, true),
                enableSourceView: propBool(this.props.enableSourceView, false),
                enableTextAlign: propBool(this.props.enableTextAlign, true),
                enableHighlight: propBool(this.props.enableHighlight, true),
                enableTaskLists: propBool(this.props.enableTaskLists, true),
                enableTableTools: propBool(this.props.enableTableTools, true),
            };
        },

        _readTextarea() {
            const ta = this._textarea();
            return ta ? ta.value : '';
        },

        _getHtml() {
            if (this._sourceMode) {
                const source = this._sourceTextarea();
                return source ? source.value : this._readTextarea();
            }
            return this._editor ? this._editor.getHTML() : this._readTextarea();
        },

        _setHtml(html) {
            const value = html == null ? '' : String(html);
            if (this._sourceMode) {
                const source = this._sourceTextarea();
                if (source) source.value = value;
            } else if (this._editor) {
                this._editor.commands.setContent(value, false);
            }
            this._writeTextarea(value);
        },

        _writeTextarea(html) {
            const ta = this._textarea();
            if (ta) ta.value = html == null ? '' : String(html);
        },

        _syncCounter() {
            const counter = this._counterEl();
            if (!counter || !this._editor) return;
            const max = propInt(this.props.maxCharacters, 0);
            const chars = this._editor.storage.characterCount.characters();
            counter.textContent =
                max > 0 ? chars + ' / ' + max + ' characters' : chars + ' characters';
            counter.hidden = false;
        },

        _syncTextarea() {
            if (this._sourceMode) {
                const source = this._sourceTextarea();
                if (source) this._writeTextarea(source.value);
                return;
            }
            if (!this._editor) return;
            const html = this._editor.getHTML();
            this._writeTextarea(html);
            this._syncCounter();
        },

        _exitSourceMode() {
            if (!this._sourceMode) return;
            const source = this._sourceTextarea();
            const wrap = this._sourceWrapEl();
            const mount = this._mountEl();
            const html = source ? source.value : this._readTextarea();
            this._sourceMode = false;
            if (wrap) wrap.hidden = true;
            if (mount) mount.hidden = false;
            this._node.classList.remove('dmx-tipwap--source');
            if (this._editor) {
                this._editor.commands.setContent(html, false);
            }
            this._writeTextarea(html);
            this._syncCounter();
        },

        _enterSourceMode() {
            if (this._sourceMode) return;
            this._syncTextarea();
            const html = this._editor ? this._editor.getHTML() : this._readTextarea();
            const source = this._sourceTextarea();
            const wrap = this._sourceWrapEl();
            const mount = this._mountEl();
            if (source) source.value = html;
            if (wrap) wrap.hidden = false;
            if (mount) mount.hidden = true;
            this._sourceMode = true;
            this._node.classList.add('dmx-tipwap--source');
            if (source) source.focus();
            this._writeTextarea(html);
        },

        _toggleSourceView() {
            if (this._sourceMode) {
                this._exitSourceMode();
            } else {
                this._enterSourceMode();
            }
            this._buildToolbar(this._toolbarOptions());
            this.dispatchEvent('change', null, { html: this._getHtml() });
        },

        _bindSourceInput() {
            const source = this._sourceTextarea();
            if (!source || source._tipwapBound) return;
            source._tipwapBound = true;
            const self = this;
            source.addEventListener('input', function () {
                if (!self._sourceMode) return;
                self._writeTextarea(source.value);
                self.dispatchEvent('change', null, { html: source.value });
            });
            source.addEventListener('blur', function () {
                if (!self._sourceMode) return;
                self._writeTextarea(source.value);
                self.dispatchEvent('blur', null, { html: source.value });
            });
        },

        _showDesignPlaceholder(fieldName) {
            this._node.classList.add('dmx-tipwap--design');
            let ph = this._node.querySelector('.' + PLACEHOLDER_CLASS);
            if (!ph) {
                ph = document.createElement('div');
                ph.className = PLACEHOLDER_CLASS;
                this._node.insertBefore(ph, this._node.firstChild);
            }
            ph.innerHTML =
                '<strong>TipWap Editor</strong> - field <code>' +
                fieldName +
                '</code><br><small>Rich text loads in browser preview. Textarea stays in the form for Import From Form.</small>';
            const mount = this._mountEl();
            if (mount) {
                mount.innerHTML = '';
                mount.classList.add('dmx-tipwap-mount--design-hidden');
            }
            const bar = this._toolbarEl();
            if (bar) bar.innerHTML = '';
        },

        _buildToolbar(opts) {
            const bar = this._toolbarEl();
            if (!bar) return;
            bar.innerHTML = '';

            const specs = opts.toolbarMode === 'minimal' ? MINIMAL_BUTTONS : FULL_BUTTONS;
            const self = this;

            function shouldShow(spec) {
                if (spec.needsTextAlign && !opts.enableTextAlign) return false;
                if (spec.needsHighlight && !opts.enableHighlight) return false;
                if (spec.needsTaskLists && !opts.enableTaskLists) return false;
                if (spec.sep && spec.needsTextAlign) return opts.enableTextAlign;
                return true;
            }

            function addButton(spec) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-sm btn-outline-secondary dmx-tipwap-tb-btn';
                btn.title = spec.title || '';
                btn.textContent = spec.icon;
                if (spec.cmd === 'toggleSource') {
                    btn.classList.toggle('active', self._sourceMode);
                    btn.setAttribute('data-tipwap-source-btn', '1');
                }
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (spec.cmd === 'toggleSource') {
                        self._toggleSourceView();
                        return;
                    }
                    if (self._sourceMode) return;
                    runCommand(self._editor, spec);
                });
                bar.appendChild(btn);
            }

            specs.forEach(function (spec) {
                if (!shouldShow(spec)) return;
                if (spec.sep) {
                    bar.appendChild(document.createElement('span')).className = 'dmx-tipwap-tb-sep';
                    return;
                }
                if (spec.cmd === 'insertTable' && !opts.enableTables) return;
                if (spec.cmd === 'insertImage' && !opts.enableImages) return;
                addButton(spec);
            });

            if (
                opts.toolbarMode === 'full' &&
                opts.enableTables &&
                opts.enableTableTools &&
                !this._sourceMode
            ) {
                bar.appendChild(document.createElement('span')).className = 'dmx-tipwap-tb-sep';
                TABLE_TOOL_BUTTONS.forEach(function (spec) {
                    addButton(spec);
                });
            }

            if (opts.enableSourceView) {
                bar.appendChild(document.createElement('span')).className = 'dmx-tipwap-tb-sep';
                addButton({
                    cmd: 'toggleSource',
                    icon: '</>',
                    title: this._sourceMode ? 'Visual editor' : 'HTML source',
                });
            }
        },

        _bindFormSubmit() {
            const form = this._node.closest('form');
            if (!form || form._tipwapSubmitBound) return;
            form._tipwapSubmitBound = true;
            form.addEventListener('submit', () => this._syncTextarea());
        },

        _initEditor() {
            if (isDesignView()) return;

            const self = this;
            loadTipWapBundle()
                .then(function () {
                    if (!self._node || isDesignView()) return;
                    self._mountEditor();
                })
                .catch(function () {
                    const mount = self._mountEl();
                    if (mount) {
                        mount.innerHTML =
                            '<p class="dmx-tipwap-error">TipWap: could not load dmx-tipwap-editor.bundle.js</p>';
                    }
                });
        },

        _mountEditor() {
            if (typeof TipWapBundle === 'undefined' || !TipWapBundle.createEditor) {
                const mount = this._mountEl();
                if (mount) {
                    mount.innerHTML =
                        '<p class="dmx-tipwap-error">TipWap: load dmx-tipwap-editor.bundle.js before dmx-tipwap-editor.js</p>';
                }
                return;
            }

            if (this._editor) {
                this._destroyEditor();
            }

            const mount = this._mountEl();
            if (!mount) return;
            mount.innerHTML = '';
            mount.hidden = false;
            mount.classList.remove('dmx-tipwap-mount--design-hidden');

            const minH = propInt(this.props.minHeight, 200);
            mount.style.minHeight = minH + 'px';

            const tbOpts = this._toolbarOptions();
            const maxCharacters = propInt(this.props.maxCharacters, 0);
            const initial =
                propString(this.props.initialHtml, '') || this._readTextarea();

            this._sourceMode = false;
            const wrap = this._sourceWrapEl();
            if (wrap) wrap.hidden = true;
            this._node.classList.remove('dmx-tipwap--source');

            this._buildToolbar(tbOpts);
            this._bindSourceInput();

            const self = this;
            this._editor = TipWapBundle.createEditor({
                element: mount,
                content: initial,
                placeholder: propString(this.props.placeholder, 'Write here…'),
                toolbar: tbOpts.toolbarMode,
                headingLevels: propString(this.props.headingLevels, '2,3'),
                enableTables: tbOpts.enableTables,
                enableImages: tbOpts.enableImages,
                enableTextAlign: tbOpts.enableTextAlign,
                enableHighlight: tbOpts.enableHighlight,
                enableTaskLists: tbOpts.enableTaskLists,
                maxCharacters,
                onUpdate() {
                    self._syncTextarea();
                    self.dispatchEvent('change', null, { html: self._getHtml() });
                },
                onBlur() {
                    self._syncTextarea();
                    self.dispatchEvent('blur', null, { html: self._getHtml() });
                },
            });

            this._syncTextarea();
            this._bindFormSubmit();
            this.dispatchEvent('ready', null, {});
        },

        _render() {
            const node = this._node;
            if (!node) return;

            const fieldName = this._fieldName();
            const ta = this._textarea();
            if (ta) {
                ta.name = fieldName;
                ta.id = fieldName + '_input';
            }

            if (isDesignView()) {
                this._destroyEditor();
                this._showDesignPlaceholder(fieldName);
                return;
            }

            this._node.classList.remove('dmx-tipwap--design');

            const ph = node.querySelector('.' + PLACEHOLDER_CLASS);
            if (ph && ph.parentNode) ph.parentNode.removeChild(ph);

            this._initEditor();
        },
    });
})();
