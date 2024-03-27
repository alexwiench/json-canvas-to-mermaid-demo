import { Inter } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'JSON Canvas to Mermaid Converter',
	description: 'Convert a JSON Canvas file to Mermaid in your browser.',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<GoogleTagManager gtmId="G-8XYNVDZJXN" />
			<body className={inter.className}>{children}</body>
		</html>
	);
}
