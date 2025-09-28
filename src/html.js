/**
 * HTML module.
 * @module html
 */

const FILE_PATTERN    = '\[\\w\\_\\.\]\+';
const STATICS_PATTERN = `\{\{\\s*statics\\((${FILE_PATTERN})\\)\\s*\}\}`;
const VAR_PATTERN     = /{{\s*(\w*)\s*(\|\s*(.*))?}}/;

const statics_regex = new RegExp(STATICS_PATTERN, 'ig');
const var_regex     = new RegExp(VAR_PATTERN, 'g');
const foreach_regex = new RegExp(FOREACH_PATTERN, 'ig');

const TYPE_STRING = 'string';

function toText (data) {
	if (typeof data === TYPE_STRING) {
		return data;
	} else {
		return JSON.stringify(data);
	}
}

/**
 * Render an HTML template code.
 * @param {Object} params - Variables to add to the page.
 */
function render (html, params={}) {
	html = html.replace(statics_regex, (_, p1) => `statics/${p1}`);
	if (params) {
		return html.replace(var_regex, (_, p1, p2, p3) => {
			return toText(params[p1] ?? p3 ?? '');
		});
	}
	return html;
}

module.exports = {
	render
}