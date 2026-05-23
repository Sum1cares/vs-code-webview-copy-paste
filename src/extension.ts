import * as vs from 'vscode';
import * as http from 'http';

export async function activate(context: vs.ExtensionContext) {
	await vs.commands.executeCommand("workbench.action.closeAllEditors");

	// Create an editor with some text to copy/paste.
	const doc = await vs.workspace.openTextDocument({ language: "text", content: "Sample text to copy/paste\n\n".repeat(10) });
	await vs.window.showTextDocument(doc);


	// Set up a simple HTTP server to serve the app.
	const port = 3000;

	const keypressLogger = `
		<h2>Keypress Log</h2>
		<button onclick="document.getElementById('globalKeypressLog').textContent = '';">Clear</button>
		<div id="globalKeypressLog" style="white-space: pre; height: 200px; overflow: auto;"></div>

		<script>
		const logElement = document.getElementById('globalKeypressLog');

		function log(s) {
			console.log(s);
			logElement.textContent += \`\${s}\n\`;
		}

		document.addEventListener('keypress', function(event) {
			log(\`Key pressed: \${event.key}\`);
		});

		document.addEventListener('keydown', function(event) {
			log(\`KeyDown: \${event.key}\`);
		});

		document.addEventListener('keyup', function(event) {
			log(\`KeyUp: \${event.key}\`);
		});

		document.addEventListener('copy', function(event) {
			log(\`Copy triggered\`);
		});

		document.addEventListener('paste', function(event) {
			log(\`Paste triggered\`);
		});
		</script>
	`;

	const server = http.createServer((_req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(`
			<html>
			<head>
			</head>
			<body bgcolor="#999999">
				<h1>Inner Frame Content</h1>

				On macOS, try to use Cmd+A to Select All, Cmd+C to copy, Cmd+V to paste.

				<input type="text" width="400" />

				${keypressLogger}
			</body>
			</html>
			`);
	});

	server.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});

	context.subscriptions.push({
		dispose: () => {
			server.close();
		}
	});


	// Create a webview.
	const panel = vs.window.createWebviewPanel("myWebView", "My WebView", vs.ViewColumn.Beside, {
		enableScripts: true,
		localResourceRoots: [],
		retainContextWhenHidden: true,
	});
	panel.webview.html = `
			<html>
			<head>
			</head>
			<body bgcolor="#666666">
				<h1>WebView HTML Content</h1>
				<iframe id="myFrame" src="http://localhost:3000/" frameborder="0" width="600" height="400"></iframe>

				${keypressLogger}
			</body>
			</html>
			`;

}

export function deactivate() { }
