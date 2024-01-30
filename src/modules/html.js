/**
 * HTML module.
 * @module html
 */

const FILE_PATTERN    = '\[\\w\\_\\.\]\+';
const STATICS_PATTERN = `\{\{\\s*statics\\((${FILE_PATTERN})\\)\\s*\}\}`;
const VAR_PATTERN     = /{{\s*(\w*)\s*(\|\s*(.*))?}}/;

const statics_regex = new RegExp(STATICS_PATTERN, 'ig');
const var_regex     = new RegExp(VAR_PATTERN, 'g');

/**
 * Render an HTML template code.
 * @param {Object} params - Variables to add to the page.
 */
function render (html, params={}) {
	html = html.replace(statics_regex, (_, p1) => `statics/${p1}`);
	if (params) {
		// IDEA: We could use JSON.stringify on the returned result to also add
		//   quotes automatically.
		return html.replace(var_regex, (_, p1, p2, p3) => params[p1] ?? p3 ?? '');
	}
	return html;
}

module.exports = {
	render
}