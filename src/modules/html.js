/**
 * HTML module.
 * @module html
 */

const FILE_PATTERN    = '\[\\w\\_\\.\]\+';
const STATICS_PATTERN = `\{\{\\s*statics\\((${FILE_PATTERN})\\)\\s*\}\}`;
const VAR_PATTERN     = /{{\s*(\w*)\s*(\|\s*(.*))?}}/g;

const statics_regex = new RegExp(STATICS_PATTERN, 'ig');

/**
 * Render an HTML template code.
 * @param {Object} params - Variables to add to the page.
 */
function render (html, params=null) {
	html = html.replace(statics_regex, (_, p1) => `statics/${p1}`);
	if (params) {
		return html.replace(/{{(\w*)}}/g, (_, p1) => params[p1] ?? '');
	}
	return html;
}

module.exports = {
	render
}