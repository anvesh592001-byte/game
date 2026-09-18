#!/usr/bin/env python3
"""Game dev server — html/js/css always fresh (no-store), images cacheable."""
import http.server, socketserver

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        p = self.path.split('?')[0]
        if p.endswith(('.html', '.js', '.css')) or p == '/' or p == '':
            self.send_header('Cache-Control', 'no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        else:
            self.send_header('Cache-Control', 'public, max-age=300')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', 8000), H) as httpd:
    print('serving on 0.0.0.0:8000 with no-store for code files')
    httpd.serve_forever()
