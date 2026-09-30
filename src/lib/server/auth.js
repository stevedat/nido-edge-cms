// @ts-check
import { core } from './core.js';

/**
 * Enhanced authentication middleware for SvelteKit
 */

/**
 * Extract token from request headers or cookies
 * @param {Request} request
 * @param {any} [cookies]
 * @returns {string|null}
 */
export function extractToken(request, cookies) {
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}

	const cookieToken = cookies?.get ? (cookies.get('sb-access-token') || cookies.get('auth-token')) : null;
	if (cookieToken) {
		return cookieToken;
	}

	return null;
}

/**
 * Get current user from request using JWT Auth
 * @param {Request} request
 * @param {any} [cookies]
 * @returns {Promise<any|null>}
 */
export async function getCurrentUser(request, cookies) {
	const token = extractToken(request, cookies);
	if (!token) return null;

	return await core.auth.getUserFromToken(token);
}

/**
 * Require authentication middleware
 * @param {Request} request
 * @param {any} cookies
 * @param {string[]} [allowedRoles] - Optional role restrictions
 * @returns {Promise<{user: any} | {redirect: string}>}
 */
export async function requireAuth(request, cookies, allowedRoles = []) {
	const user = await getCurrentUser(request, cookies);

	if (!user) {
		return { redirect: '/admin/login' };
	}

	// Check role permissions if specified
	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return { redirect: '/admin/unauthorized' };
	}

	return { user };
}

/**
 * Check if user has permission for specific action
 * @param {any} user
 * @param {string} action - CREATE, READ, UPDATE, DELETE
 * @param {string} resource - posts, videos, projects, users, etc.
 * @returns {boolean}
 */
export function hasPermission(user, action, resource) {
	if (!user) return false;

	const { role } = user;

	// Super admin can do everything
	if (role === 'SUPER_ADMIN') return true;

	// Admin permissions
	if (role === 'ADMIN') {
		if (resource === 'users') {
			return action === 'READ' || action === 'CREATE';
		}
		return true;
	}

	// Editor permissions
	if (role === 'EDITOR') {
		if (resource === 'users' || resource === 'settings') return action === 'READ';
		return ['posts', 'videos', 'projects', 'media', 'categories', 'tags'].includes(resource);
	}

	// Author permissions
	if (role === 'AUTHOR') {
		if (resource === 'users' || resource === 'categories' || resource === 'tags') return action === 'READ';
		return ['posts', 'videos', 'projects', 'media'].includes(resource);
	}

	// Viewer permissions
	if (role === 'VIEWER') {
		return action === 'READ';
	}

	return false;
}

/**
 * Create auth session cookie
 * @param {string} token
 * @returns {{name: string, value: string, options: any}}
 */
export function createAuthCookie(token) {
	return {
		name: 'sb-access-token',
		value: token,
		options: {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/'
		}
	};
}

/**
 * Clear auth session cookie
 * @returns {{name: string, value: string, options: any}}
 */
export function clearAuthCookie() {
	return {
		name: 'sb-access-token',
		value: '',
		options: {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: 0,
			path: '/'
		}
	};
}

/**
 * Logout and clear session
 * @param {Request} request
 * @param {any} [cookies]
 * @returns {Promise<boolean>}
 */
export async function logout(request, cookies) {
	return true;
}

/**
 * Get client IP address
 * @param {Request} request
 * @returns {string}
 */
export function getClientIP(request) {
	return request.headers.get('x-forwarded-for') || 
		   request.headers.get('x-real-ip') || 
		   request.headers.get('cf-connecting-ip') ||
		   'unknown';
}

/**
 * Get user agent
 * @param {Request} request
 * @returns {string}
 */
export function getUserAgent(request) {
	return request.headers.get('user-agent') || 'unknown';
}

/**
 * Generate JWT token
 * @param {Record<string, any>} user
 * @returns {Promise<string>}
 */
export async function generateToken(user) {
	return await core.auth.signToken(user);
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Promise<Object|null>}
 */
export async function verifyToken(token) {
	return await core.auth.verifyToken(token);
}

/**
 * Get user by token
 * @param {string} token
 * @returns {Promise<any|null>}
 */
export async function getUserByToken(token) {
	return await core.auth.getUserFromToken(token);
}

/**
 * Login user using tenant-specific password or system ADMIN_PASSWORD
 * @param {string} identifier - Email or username
 * @param {string} password
 * @param {string} [domain='default'] - Tenant domain
 * @param {string} [userAgent]
 * @param {string} [ipAddress]
 * @returns {Promise<{ success: boolean; user?: any; token?: string; message?: string }>}
 */
export async function loginUser(identifier, password, domain = 'default', userAgent, ipAddress) {
	try {
		const res = await core.auth.authenticate({ identifier, password, domain });
		if (res.success && res.user && res.token) {
			return {
				success: true,
				user: res.user,
				token: res.token
			};
		}
		return {
			success: false,
			message: res.error || 'Incorrect password'
		};
	} catch (error) {
		console.error('Login error:', error);
		return { success: false, message: 'System error, please try again' };
	}
}

/**
 * Logout user
 * @param {string} [token]
 * @param {string} [userAgent]
 * @param {string} [ipAddress]
 * @returns {Promise<boolean>}
 */
export async function logoutUser(token, userAgent, ipAddress) {
	return true;
}

export { hashPassword, verifyPassword, generateRandomPassword } from '$lib/core/index.js';

