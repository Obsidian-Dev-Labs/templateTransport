import type { BareHeaders, TransferrableResponse, BareTransport } from "@mercuryworkshop/bare-mux";

export interface TransportOptions {
	proxy?: string;
	timeout?: number;
	[key: string]: any;
}

export default class TemplateTransport implements BareTransport {
	ready = false;
	options: TransportOptions;

	constructor(options: TransportOptions = {}) {
		this.options = options;
	}

	async init(): Promise<void> {
		this.ready = true;
	}

	async meta() {
		return {};
	}

	async request(
		remote: URL,
		method: string,
		body: BodyInit | null,
		headers: BareHeaders,
		signal: AbortSignal | undefined
	): Promise<TransferrableResponse> {
		const controller = new AbortController();
		const timeout = this.options.timeout || 30000;
		
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		
		if (signal) {
			signal.addEventListener('abort', () => controller.abort());
		}

		try {
			const response = await fetch(remote.href, {
				method,
				headers: this.convertHeaders(headers),
				body,
				signal: controller.signal,
				redirect: 'manual'
			});

			clearTimeout(timeoutId);

			const rawHeaders: BareHeaders = {};
			response.headers.forEach((value, key) => {
				if (!rawHeaders[key]) {
					rawHeaders[key] = [value];
				} else if (Array.isArray(rawHeaders[key])) {
					(rawHeaders[key] as string[]).push(value);
				}
			});

			let responseBody: ReadableStream | ArrayBuffer | Blob | string;
			
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('text')) {
				responseBody = await response.text();
			} else {
				responseBody = await response.arrayBuffer();
			}

			return {
				body: responseBody,
				headers: rawHeaders,
				status: response.status,
				statusText: response.statusText
			};
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	}

	connect(
		url: URL,
		protocols: string[],
		requestHeaders: BareHeaders,
		onopen: (protocol: string) => void,
		onmessage: (data: Blob | ArrayBuffer | string) => void,
		onclose: (code: number, reason: string) => void,
		onerror: (error: string) => void,
	): [(data: Blob | ArrayBuffer | string) => void, (code: number, reason: string) => void] {
		const ws = new WebSocket(url.toString(), protocols);
		ws.binaryType = 'arraybuffer';

		ws.addEventListener('open', () => {
			onopen(ws.protocol);
		});

		ws.addEventListener('message', async (event: MessageEvent) => {
			const data = event.data;
			
			if (data instanceof Blob) {
				onmessage(data);
			} else if (data instanceof ArrayBuffer) {
				onmessage(data);
			} else if (typeof data === 'string') {
				onmessage(data);
			}
		});

		ws.addEventListener('close', (event: CloseEvent) => {
			onclose(event.code, event.reason);
		});

		ws.addEventListener('error', () => {
			onerror('WebSocket error occurred');
		});

		const send = async (data: Blob | ArrayBuffer | string) => {
			if (ws.readyState === WebSocket.OPEN) {
				if (data instanceof Blob) {
					const arrayBuffer = await data.arrayBuffer();
					ws.send(arrayBuffer);
				} else {
					ws.send(data);
				}
			}
		};

		const close = (code: number, reason: string) => {
			if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
				ws.close(code, reason);
			}
		};

		return [send, close];
	}

	private convertHeaders(headers: BareHeaders): HeadersInit {
		const result: Record<string, string> = {};
		
		for (const [key, value] of Object.entries(headers)) {
			if (Array.isArray(value)) {
				result[key] = value.join(', ');
			} else {
				result[key] = value as string;
			}
		}
		
		return result;
	}
}
