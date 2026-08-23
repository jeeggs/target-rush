#!/usr/bin/env python3
"""Serve Target Rush to phones and computers on the same local network."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse
import socket


def local_ip() -> str:
    """Return the address this computer normally uses on its local network."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # No packet is sent; connecting only asks the OS which interface it would use.
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        return "YOUR-COMPUTER-IP"
    finally:
        sock.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve Target Rush on your local network")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    server = ThreadingHTTPServer(("0.0.0.0", args.port), SimpleHTTPRequestHandler)
    path = "/simulator.html?v=7"
    print("Target Rush is ready.", flush=True)
    print(f"On this computer: http://127.0.0.1:{args.port}{path}", flush=True)
    print(f"On an iPhone:      http://{local_ip()}:{args.port}{path}", flush=True)
    print("Keep this window open and connect the iPhone to the same Wi-Fi.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()
