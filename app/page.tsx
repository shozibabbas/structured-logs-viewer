import Link from "next/link";

export default async function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">📊 Structured Logs Viewer</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        View and analyze your application logs in real-time
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Getting Started</h2>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li>Place your <code className="bg-gray-100 px-2 py-1 rounded text-sm">.log</code> files in the <code className="bg-gray-100 px-2 py-1 rounded text-sm">logs/</code> directory</li>
                            <li>Configure packet tracking patterns in Settings (optional)</li>
                            <li>Click the button below to view your logs</li>
                            <li>Use filters and search to find specific entries</li>
                        </ol>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/logs"
                            className="flex-1 text-center rounded-lg bg-blue-600 text-white px-6 py-3 text-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            View Logs
                        </Link>
                        <Link
                            href="/settings"
                            className="flex-1 text-center rounded-lg bg-gray-600 text-white px-6 py-3 text-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Settings
                        </Link>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📝 Log Format</h3>
                    <pre className="text-xs text-blue-800 overflow-x-auto">
                        YYYY-MM-DD HH:MM:SS,mmm | LEVEL | module | message
                    </pre>
                </div>
            </div>
        </div>
    );
}
