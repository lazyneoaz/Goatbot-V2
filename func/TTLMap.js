/**
 * TTLMap - A Map with automatic TTL (Time To Live) expiration
 * Automatically removes entries after specified time to prevent memory leaks
 * Shared between Goat.js and login.js to ensure consistent behaviour on re-login
 */
class TTLMap extends Map {
	constructor(options = {}) {
		super();
		this.ttl = options.ttl || 3600000; // Default 1 hour
		this.maxSize = options.maxSize || 1000;
		this.timestamps = new Map();
		this.cleanupInterval = setInterval(() => this._cleanup(), options.cleanupInterval || 60000);
	}

	set(key, value) {
		if (this.size >= this.maxSize && !this.has(key)) {
			const oldestKey = this.timestamps.keys().next().value;
			this.delete(oldestKey);
		}
		super.set(key, value);
		this.timestamps.set(key, Date.now());
		return this;
	}

	get(key) {
		const value = super.get(key);
		if (value !== undefined) {
			this.timestamps.set(key, Date.now());
		}
		return value;
	}

	delete(key) {
		this.timestamps.delete(key);
		return super.delete(key);
	}

	_cleanup() {
		const now = Date.now();
		const cutoff = now - this.ttl;
		let cleaned = 0;
		for (const [key, timestamp] of this.timestamps) {
			if (timestamp < cutoff) {
				this.delete(key);
				cleaned++;
			}
		}
		return cleaned;
	}

	destroy() {
		clearInterval(this.cleanupInterval);
		this.clear();
		this.timestamps.clear();
	}
}

module.exports = TTLMap;
