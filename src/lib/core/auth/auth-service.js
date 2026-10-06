// @ts-check
import { verifyPassword } from '../crypto/password.js';
import { constantTimeEqual } from '../crypto/utils.js';
import { signToken, verifyToken } from './jwt.js';

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} name
 * @property {string} role
 * @property {string} avatar
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} AuthResult
 * @property {boolean} success
 * @property {AuthUser} [user]
 * @property {string} [token]
 * @property {string} [error]
 */

/**
 * Authenticate credentials against master admin password or tenant settings password hash.
 *
 * @param {{ password: string; identifier?: string; username?: string; domain?: string }} credentials
 * @param {{ jwtSecret: string; jwtExpiresIn?: string; adminPassword?: string }} config
 * @param {any} [tenantSettings]
 * @returns {Promise<AuthResult>}
 */
export async function authenticate(credentials, config, tenantSettings) {
	if (!credentials || typeof credentials.password !== 'string') {
		return { success: false, error: 'Password is required' };
	}

	const password = credentials.password;

	// 1. MASTER ADMIN OVERRIDE
	if (config.adminPassword && constantTimeEqual(password, config.adminPassword)) {
		/** @type {AuthUser} */
		const user = {
			id: 'admin',
			email: 'admin@system.local',
			username: 'admin',
			name: 'Master Admin',
			role: 'ADMIN',
			avatar: '',
			isActive: true
		};

		const token = await signToken(user, config.jwtSecret, config.jwtExpiresIn || '7d');
		return { success: true, user, token };
	}

	// 2. TENANT-SPECIFIC PASSWORD
	if (tenantSettings?.adminPasswordHash) {
		const isValid = await verifyPassword(password, tenantSettings.adminPasswordHash);
		if (isValid) {
			const domain = credentials.domain || tenantSettings.domain || 'default';
			/** @type {AuthUser} */
			const user = {
				id: `tenant_${domain}`,
				email: tenantSettings.contactEmail || `admin@${domain}`,
				username: domain,
				name: tenantSettings.siteName || domain,
				role: 'ADMIN',
				avatar: '',
				isActive: true
			};

			const token = await signToken(user, config.jwtSecret, config.jwtExpiresIn || '7d');
			return { success: true, user, token };
		}
	}

	return { success: false, error: 'Invalid credentials' };
}

/**
 * Retrieve user profile from signed JWT token
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<AuthUser | null>}
 */
export async function getUserFromToken(token, secret) {
	const result = await verifyToken(token, secret);
	if (!result.valid || !result.payload) {
		return null;
	}

	const payload = result.payload;
	return {
		id: String(payload.id || ''),
		email: String(payload.email || ''),
		username: String(payload.username || ''),
		name: String(payload.name || payload.username || 'Admin'),
		role: String(payload.role || 'ADMIN'),
		avatar: String(payload.avatar || ''),
		isActive: Boolean(payload.isActive ?? true)
	};
}
