#!/usr/bin/env python3

import argparse
import contextlib
import datetime
import http.server
import io
import os
import pathlib
import shutil
import sys
import time

from PIL import Image, ImageFont, ImageDraw, ImageColor


class TestHandler(http.server.SimpleHTTPRequestHandler):

    _last_refresh_times = {}

    def _send_ok(self, data, length=None, content_type='text/html'):
        if isinstance(data, str):
            data = data.encode('utf-8')
        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Content-Length", str(length or len(data)))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(data)

    def _send_image(self, text: str):
        font = ImageFont.truetype(
           os.path.join(self.directory, 'FreeMono.ttf'),
           size=20,
        )
        img = Image.new("RGB", (300, 300), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.multiline_text(
            (10, 70),
            text,
            font=font,
            fill=(0, 0, 0),
        )
        png = io.BytesIO()
        img.save(png, format='png')
        png.seek(0)
        self.send_response(200)
        self.send_header("Content-type", 'image/png')
        self.send_header("Content-Length", str(png.getbuffer().nbytes))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.copyfile(png, self.wfile)

    def do_GET(self):
        path, *query = self.path.strip('/').split('?', 1)
        print('path', path)
        if 'refresh' in self.path or 'rotate' in self.path:
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            last = self._last_refresh_times.get(path, "never")
            if path.endswith('.png'):
                path_str = "\n  ".join(path.strip("\/").split("/"))
                text = (
                    f'{path_str}\n'
                    f'{query}\n\n'
                    f'{now}\n\n'
                    'Previously:\n'
                    f'{last}'  # nofmt
                )
                self._send_image(text)
            else:
                text = (
                    '<html><head><style>body {'
                    'background-color: black;'
                    'color: white;'
                    '}</style></head><body>'
                    f'<h1>{path}</h1><div>{query}</div>'
                    f'<h2>{now}</h2>'
                    f'<h3>Previously: {last}</h3>'
                    '</body></html>'# nofmt
                )
                self._send_ok(text)
            self._last_refresh_times[path] = now
        elif '404' in self.path:
            self.send_error(404, 'File Not Found')
        elif self.path.strip('/').startswith('show-text'):
            text = self.path.split('=', 1)[1]
            if self.path.split('?', 1)[0].endswith('.png'):
                self._send_image(text)
            else:
                self._send_ok(text)
        elif 'favicon' in self.path:
            self._send_ok('', content_type='image/png')
        elif 'sample-video' in self.path:
            video = open(os.path.join(self.directory, 'static/sample-video.mp4'), 'rb')
            try:
                stat = os.fstat(video.fileno())
                self._send_ok(video.read(), stat[6], content_type='video/mp4')
            finally:
                video.close()
        else:
            f = self.send_head()
            if f:
                with f:
                    self.copyfile(f, self.wfile)



def serve(
    HandlerClass=http.server.BaseHTTPRequestHandler,
    ServerClass=http.server.ThreadingHTTPServer,
    protocol="HTTP/1.0",
    port=8000,
    bind=None,
):
    """Test the HTTP request handler class.

    This runs an HTTP server on port 8000 (or the port argument).

    """
    ServerClass.address_family, addr = http.server._get_best_family(bind, port)
    HandlerClass.protocol_version = protocol
    with ServerClass(addr, HandlerClass) as httpd:
        host, port = httpd.socket.getsockname()[:2]
        url_host = f'[{host}]' if ':' in host else host
        print(f"Serving HTTP on {host} port {port} " f"(http://{url_host}:{port}/) ...")
        httpd.serve_forever()


def main():
    script_dir = pathlib.Path(sys.argv[0]).parent.absolute()
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-b',
        '--bind',
        metavar='ADDRESS',
        help='bind to this address (default: all interfaces)',
    )
    parser.add_argument(
        '-c',
        '--config',
        metavar='CONFIG',
        help='configuration file to test with',
    )
    parser.add_argument(
        '-d',
        '--directory',
        default=script_dir,
        help='serve this directory (default: current directory)',
    )
    parser.add_argument(
        '-p',
        '--protocol',
        metavar='VERSION',
        default='HTTP/1.0',
        help='conform to this HTTP version (default: %(default)s)',
    )
    parser.add_argument(
        'port',
        default=8000,
        type=int,
        nargs='?',
        help='bind to this port (default: %(default)s)',
    )
    args = parser.parse_args()

    # ensure dual-stack is not disabled; ref #38907
    class DualStackServer(http.server.ThreadingHTTPServer):

        def server_bind(self):
            # suppress exception when protocol is IPv4
            with contextlib.suppress(Exception):
                self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
            return super().server_bind()

        def finish_request(self, request, client_address):
            self.RequestHandlerClass(
                request, client_address, self, directory=args.directory
            )
    test_dir = pathlib.Path(args.directory)
    code_dir = test_dir.parent
    shutil.copy(code_dir.joinpath('index.html'), test_dir.joinpath('index.html'))
    shutil.copy(code_dir.joinpath('dashboard.css'), test_dir.joinpath('dashboard.css'))
    shutil.copy(code_dir.joinpath('lib.js'), test_dir.joinpath('lib.js'))
    shutil.copy(code_dir.joinpath('main.js'), test_dir.joinpath('main.js'))
    shutil.copy(code_dir.joinpath('wheelzoom.js'), test_dir.joinpath('wheelzoom.js'))
    shutil.copy(pathlib.Path(args.config).absolute(), test_dir.joinpath('config.js'))
    with contextlib.suppress(Exception):
        serve(
            HandlerClass=TestHandler,
            ServerClass=DualStackServer,
            port=args.port,
            bind=args.bind,
            protocol=args.protocol,
        )
    test_dir.joinpath('index.html').unlink()
    test_dir.joinpath('dashboard.css').unlink()
    test_dir.joinpath('lib.js').unlink()
    test_dir.joinpath('main.js').unlink()
    test_dir.joinpath('wheelzoom.js').unlink()
    test_dir.joinpath('config.js').unlink()


if __name__ == '__main__':
    print('Press Ctrl+C to reset the environment and restart the server.')
    while True:
        try:
            main()
        except KeyboardInterrupt:
            try:
                time.sleep(1)
            except KeyboardInterrupt:
                sys.exit(0)
