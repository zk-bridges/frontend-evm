/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	assetPrefix: process.env.NODE_ENV === 'production' ? '/frontend-evm/' : '', // update if your repo name changes for 'npm run deploy' to work successfully

};

module.exports = nextConfig;
