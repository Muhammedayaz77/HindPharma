from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
PORT = 5500

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', PORT), NoCacheHandler)
    server.RequestHandlerClass.directory = str(ROOT)
    url = f'http://127.0.0.1:{PORT}/index.html'
    print(f'Hind Pharma frontend: {url}')
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
