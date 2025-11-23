# Transport Template

A bare-mux transport template using native fetch and WebSocket implementations.

## Installation

```bash
npm install @yourorg/transport-template
```

## Usage

```javascript
import TransportTemplate from '@yourorg/transport-template';
import { BareMuxConnection } from '@mercuryworkshop/bare-mux';

const connection = new BareMuxConnection();

await connection.setTransport('/path/to/transport-template/dist/index.mjs', [
	{
		proxy: 'http://proxy.example.com',
		timeout: 30000
	}
]);
```

## Features

- Native fetch API for HTTP requests
- Native WebSocket API for WebSocket connections
- Configurable timeout
- Optional proxy support
- Full bare-mux compliance

## API

### Constructor Options

- `proxy` (optional): Proxy server URL
- `timeout` (optional): Request timeout in milliseconds (default: 30000)

### Methods

#### `async init()`
Initialize the transport. Must be called before making requests.

#### `async request(remote, method, body, headers, signal)`
Make an HTTP request.

#### `connect(url, protocols, requestHeaders, onopen, onmessage, onclose, onerror)`
Establish a WebSocket connection.

## Building

```bash
npm run build
```

## License

Apache-2.0
